-- =============================================
-- MIGRATION: Iklan Banner
-- Jalankan ini di Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  advertiser_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'home' CHECK (position IN ('home', 'renovasi')),
  price BIGINT NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publik lihat banner aktif, admin lihat semua" ON banners
  FOR SELECT USING (
    (is_active = TRUE AND NOW() BETWEEN start_date AND end_date)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin bisa tambah banner" ON banners
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin bisa update banner" ON banners
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin bisa hapus banner" ON banners
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage untuk gambar banner
INSERT INTO storage.buckets (id, name, public)
  VALUES ('banner-images', 'banner-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin bisa upload banner" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

CREATE POLICY "Publik bisa lihat gambar banner" ON storage.objects
  FOR SELECT USING (bucket_id = 'banner-images');

CREATE POLICY "Admin bisa hapus gambar banner" ON storage.objects
  FOR DELETE USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
