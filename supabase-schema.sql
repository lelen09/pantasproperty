-- =============================================
-- AS REALTY — Supabase Database Schema
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: profiles (extend auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_whatsapp TEXT NOT NULL,         -- nomor WA agent
  role TEXT NOT NULL DEFAULT 'agent'    -- 'admin' | 'agent'
    CHECK (role IN ('admin', 'agent')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: listings (rumah yang dijual)
-- =============================================
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Info Dasar
  title TEXT NOT NULL,
  price BIGINT NOT NULL,                -- harga dalam Rupiah
  description TEXT,                     -- keterangan bebas

  -- Spesifikasi Rumah
  land_area INTEGER NOT NULL,           -- luas tanah (m²)
  building_area INTEGER NOT NULL,       -- luas bangunan (m²)
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  floors INTEGER NOT NULL DEFAULT 1,
  garage INTEGER DEFAULT 0,             -- jumlah garasi/carport

  -- Lokasi
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_maps_url TEXT,

  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'sold', 'inactive')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: listing_media (foto & video)
-- =============================================
CREATE TABLE listing_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,                    -- URL dari Supabase Storage
  storage_path TEXT NOT NULL,           -- path di bucket untuk delete
  is_cover BOOLEAN DEFAULT FALSE,       -- foto utama/thumbnail
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Semua user bisa lihat profil" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "User bisa update profil sendiri" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- FIX: sebelumnya tidak ada policy untuk admin update profil orang lain,
-- sehingga fitur "Kelola Agent" (ubah role) selalu gagal karena RLS.
CREATE POLICY "Admin bisa update profil agent" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin bisa hapus agent" ON profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LISTINGS
CREATE POLICY "Semua orang bisa lihat listing aktif" ON listings
  FOR SELECT USING (status = 'active' OR agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Agent bisa buat listing" ON listings
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agent bisa edit listing sendiri" ON listings
  FOR UPDATE USING (auth.uid() = agent_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Agent/Admin bisa hapus listing" ON listings
  FOR DELETE USING (auth.uid() = agent_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- LISTING MEDIA
CREATE POLICY "Semua orang bisa lihat media" ON listing_media
  FOR SELECT USING (TRUE);

CREATE POLICY "Agent bisa tambah media ke listing sendiri" ON listing_media
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND agent_id = auth.uid())
  );

CREATE POLICY "Agent/Admin bisa hapus media" ON listing_media
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND agent_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Buat bucket di Supabase Dashboard > Storage:
-- 1. Bucket: "listing-photos"  → Public: YES, Max size: 10MB
-- 2. Bucket: "listing-videos"  → Public: YES, Max size: 150MB
-- 3. Bucket: "avatars"         → Public: YES, Max size: 5MB

-- Storage Policy untuk listing-photos
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-videos', 'listing-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Authenticated users bisa upload foto" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listing-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public bisa lihat foto" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');

CREATE POLICY "Agent bisa hapus foto sendiri" ON storage.objects
  FOR DELETE USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users bisa upload video" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listing-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Public bisa lihat video" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-videos');

CREATE POLICY "Agent bisa hapus video sendiri" ON storage.objects
  FOR DELETE USING (bucket_id = 'listing-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policy untuk avatars (foto profil agent)
CREATE POLICY "Authenticated users bisa upload avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public bisa lihat avatar" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "User bisa update avatar sendiri" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User bisa hapus avatar sendiri" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- TRIGGER: Auto-create profile saat user register
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone_whatsapp, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Agent Baru'),
    COALESCE(NEW.raw_user_meta_data->>'phone_whatsapp', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- =============================================
-- FUNCTION: Updated_at otomatis
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- =============================================
-- SEED: Buat akun admin pertama
-- Jalankan SETELAH mendaftar via UI dengan email admin
-- Ganti 'email-admin@example.com' dengan email kamu
-- =============================================
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'email-admin@example.com');
