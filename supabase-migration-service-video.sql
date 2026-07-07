-- =============================================
-- MIGRATION: Dukungan video di jasa renovasi
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- Izinkan type 'video' di service_media (sebelumnya hanya before/after/portfolio)
ALTER TABLE service_media DROP CONSTRAINT IF EXISTS service_media_type_check;
ALTER TABLE service_media ADD CONSTRAINT service_media_type_check
  CHECK (type IN ('before', 'after', 'portfolio', 'video'));

-- Bucket baru untuk video jasa
INSERT INTO storage.buckets (id, name, public)
  VALUES ('service-videos', 'service-videos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users bisa upload video jasa" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Public bisa lihat video jasa" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-videos');

CREATE POLICY "Agent bisa hapus video jasa sendiri" ON storage.objects
  FOR DELETE USING (bucket_id = 'service-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
