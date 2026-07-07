-- =============================================
-- MIGRATION: Tabel harga & fitur paket (untuk halaman upgrade)
-- Jalankan ini di Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY, -- 'free' | 'silver' | 'gold' | 'platinum'
  name TEXT NOT NULL,
  price BIGINT NOT NULL DEFAULT 0, -- per bulan, dalam Rupiah
  max_listings INTEGER NOT NULL,          -- -1 = unlimited (hanya untuk ditampilkan)
  max_photos_per_listing INTEGER NOT NULL,
  max_video_seconds INTEGER NOT NULL,
  features TEXT, -- deskripsi bebas, satu baris per fitur (pisahkan dengan \n)
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua orang bisa lihat harga paket" ON plans
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin bisa ubah harga paket" ON plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin bisa tambah paket baru" ON plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Data awal (aman dijalankan ulang, tidak menimpa kalau admin sudah pernah edit)
INSERT INTO plans (id, name, price, max_listings, max_photos_per_listing, max_video_seconds, features, sort_order)
VALUES
  ('free', 'Gratis', 0, 5, 10, 30, 'Cocok untuk mulai jualan properti', 1),
  ('silver', 'Silver', 99000, 30, 10, 60, 'Listing lebih banyak untuk agent aktif', 2),
  ('gold', 'Gold', 199000, 100, 20, 120, 'Foto & video lebih leluasa, cocok untuk tim kecil', 3),
  ('platinum', 'Platinum', 399000, -1, -1, -1, 'Unlimited listing, foto, dan video', 4)
ON CONFLICT (id) DO NOTHING;
