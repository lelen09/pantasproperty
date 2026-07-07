-- =============================================
-- MIGRATION: Fitur Jasa Renovasi
-- Jalankan ini di Supabase SQL Editor (aman, tidak menyentuh tabel lama)
-- =============================================

-- =============================================
-- TABLE: services (jasa renovasi)
-- =============================================
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,                  -- "Renovasi Dapur Minimalis"
  category TEXT NOT NULL,               -- "Renovasi Total", "Cat Ulang", "Dapur", dst (bebas teks)
  description TEXT,
  price_min BIGINT NOT NULL,            -- estimasi harga mulai dari (Rupiah)
  price_max BIGINT,                     -- estimasi harga sampai (opsional)
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: service_media (foto before/after/portofolio)
-- =============================================
CREATE TABLE service_media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('before', 'after', 'portfolio')),
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_media ENABLE ROW LEVEL SECURITY;

-- SERVICES
CREATE POLICY "Semua orang bisa lihat jasa aktif" ON services
  FOR SELECT USING (status = 'active' OR agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Agent bisa buat jasa" ON services
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agent bisa edit jasa sendiri" ON services
  FOR UPDATE USING (auth.uid() = agent_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Agent/Admin bisa hapus jasa" ON services
  FOR DELETE USING (auth.uid() = agent_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SERVICE MEDIA
CREATE POLICY "Semua orang bisa lihat foto jasa" ON service_media
  FOR SELECT USING (TRUE);

CREATE POLICY "Agent bisa tambah foto ke jasa sendiri" ON service_media
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM services WHERE id = service_id AND agent_id = auth.uid())
  );

CREATE POLICY "Agent/Admin bisa hapus foto jasa" ON service_media
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM services WHERE id = service_id AND agent_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- STORAGE BUCKET: service-photos
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('service-photos', 'service-photos', true);

CREATE POLICY "Authenticated users bisa upload foto jasa" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public bisa lihat foto jasa" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-photos');

CREATE POLICY "Agent bisa hapus foto jasa sendiri" ON storage.objects
  FOR DELETE USING (bucket_id = 'service-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- INDEX untuk performa query
-- =============================================
CREATE INDEX idx_services_agent_id ON services(agent_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_service_media_service_id ON service_media(service_id);
