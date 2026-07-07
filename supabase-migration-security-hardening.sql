-- =============================================
-- MIGRATION: Security Hardening
-- Jalankan ini di Supabase SQL Editor SETELAH semua migration lain.
-- Menutup celah: privilege escalation via profiles update,
-- role injection saat signup, storage banner tidak admin-only,
-- storage listing/service tidak scoped per-user,
-- payment-proofs bisa dilihat publik.
-- =============================================

-- =============================================
-- 1) FIX KRITIS: cegah user upgrade role/plan/badge/kuota sendiri
--    lewat UPDATE profiles langsung dari client.
--
--    Sebelumnya: policy "User bisa update profil sendiri" cuma punya
--    USING (auth.uid() = id) tanpa WITH CHECK, jadi kolom apa pun
--    (termasuk role, plan, max_listings, agent_badge) bisa diubah
--    sendiri oleh agent lewat supabase.from('profiles').update(...).
--
--    Solusi paling aman: pindahkan validasi ke trigger BEFORE UPDATE
--    yang mengunci kolom-kolom sensitif kalau yang melakukan update
--    BUKAN admin. Ini lebih robust daripada WITH CHECK biasa karena
--    WITH CHECK di Postgres RLS tidak bisa membandingkan NEW vs OLD
--    dengan mudah dalam satu ekspresi USING/WITH CHECK yang bersih.
-- =============================================

CREATE OR REPLACE FUNCTION protect_sensitive_profile_columns()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;

  -- Kalau yang update BUKAN admin (agent update profil sendiri),
  -- paksa kolom-kolom sensitif tetap sama seperti sebelumnya.
  IF NOT is_admin THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Tidak diizinkan mengubah role sendiri';
    END IF;
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'Tidak diizinkan mengubah plan sendiri';
    END IF;
    IF NEW.agent_badge IS DISTINCT FROM OLD.agent_badge THEN
      RAISE EXCEPTION 'Tidak diizinkan mengubah badge sendiri';
    END IF;
    IF NEW.max_listings IS DISTINCT FROM OLD.max_listings THEN
      RAISE EXCEPTION 'Tidak diizinkan mengubah kuota listing sendiri';
    END IF;
    IF NEW.max_photos_per_listing IS DISTINCT FROM OLD.max_photos_per_listing THEN
      RAISE EXCEPTION 'Tidak diizinkan mengubah kuota foto sendiri';
    END IF;
    IF NEW.max_video_seconds IS DISTINCT FROM OLD.max_video_seconds THEN
      RAISE EXCEPTION 'Tidak diizinkan mengubah kuota video sendiri';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_profile_column_protection ON profiles;
CREATE TRIGGER enforce_profile_column_protection
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_sensitive_profile_columns();


-- =============================================
-- 2) FIX KRITIS: role tidak lagi dipercaya dari raw_user_meta_data
--    saat signup. Sebelumnya kalau ada yang panggil Supabase Auth
--    signUp() langsung (bypass UI) dengan options.data.role = 'admin',
--    trigger ini akan bikin akun admin baru begitu saja.
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_whatsapp, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Agent Baru'),
    COALESCE(NEW.raw_user_meta_data->>'phone_whatsapp', ''),
    'agent'  -- selalu 'agent', role admin cuma diubah manual oleh admin lain
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Trigger on_auth_user_created sudah ada, cuma fungsinya yang di-replace di atas.


-- =============================================
-- 3) FIX TINGGI: storage banner-images bukan admin-only
--    Sebelumnya "Admin bisa upload/hapus banner" cuma cek
--    auth.role() = 'authenticated', jadi semua agent bisa
--    upload/hapus gambar banner iklan siapa saja.
-- =============================================

DROP POLICY IF EXISTS "Admin bisa upload banner" ON storage.objects;
CREATE POLICY "Admin bisa upload banner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banner-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin bisa hapus gambar banner" ON storage.objects;
CREATE POLICY "Admin bisa hapus gambar banner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'banner-images' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- =============================================
-- 4) FIX SEDANG: scoping folder untuk listing/service photo & video
--    Sebelumnya upload cuma cek auth.role() = 'authenticated', tanpa
--    cek folder = uid, jadi agent bisa upload ke folder milik agent
--    lain. Path yang dipakai app selalu "{userId}/{listingId}/...",
--    jadi aman untuk dikunci ke foldername[1] = auth.uid() seperti
--    kebijakan avatars.
-- =============================================

DROP POLICY IF EXISTS "Authenticated users bisa upload foto" ON storage.objects;
CREATE POLICY "Authenticated users bisa upload foto" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Authenticated users bisa upload video" ON storage.objects;
CREATE POLICY "Authenticated users bisa upload video" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Authenticated users bisa upload foto jasa" ON storage.objects;
CREATE POLICY "Authenticated users bisa upload foto jasa" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'service-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Authenticated users bisa upload video jasa" ON storage.objects;
CREATE POLICY "Authenticated users bisa upload video jasa" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'service-videos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Catatan: kalau admin juga perlu upload/hapus ke folder listing/jasa
-- agent lain (misal moderasi), tambahkan OR EXISTS(...role='admin')
-- ke masing-masing policy di atas.


-- =============================================
-- 5) FIX SEDANG: bukti transfer pembayaran jangan bisa dilihat publik.
--    Sebelumnya SELECT policy cuma cek bucket_id, siapa saja yang
--    tahu/nebak URL bisa lihat bukti transfer bank agent lain.
--    Bucket tetap public=true (dibutuhkan untuk generate public URL),
--    tapi kita ganti jadi private (public=false) supaya publicUrl
--    tidak bisa diakses tanpa signed URL, dan SELECT dibatasi ke
--    pemilik + admin.
-- =============================================

UPDATE storage.buckets SET public = false WHERE id = 'payment-proofs';

DROP POLICY IF EXISTS "Terkait bisa lihat bukti transfer" ON storage.objects;
CREATE POLICY "Terkait bisa lihat bukti transfer" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- PENTING: karena bucket sekarang private, kode yang generate URL bukti
-- transfer (upload bukti di halaman upgrade) HARUS diganti dari
-- getPublicUrl() ke createSignedUrl() supaya admin tetap bisa melihatnya
-- di panel review. Lihat catatan perubahan kode di bawah.
