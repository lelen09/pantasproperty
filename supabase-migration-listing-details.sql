-- =============================================
-- MIGRATION: Kategori properti, info tambahan, fasilitas sekitar, badge
-- Jalankan ini di Supabase SQL Editor (aman, cuma nambah kolom baru)
-- =============================================

ALTER TABLE listings ADD COLUMN IF NOT EXISTS property_type TEXT NOT NULL DEFAULT 'Rumah'
  CHECK (property_type IN ('Rumah', 'Apartemen', 'Tanah', 'Ruko', 'Gudang'));

ALTER TABLE listings ADD COLUMN IF NOT EXISTS certificate_type TEXT;      -- SHM, HGB, Girik, dst
ALTER TABLE listings ADD COLUMN IF NOT EXISTS orientation TEXT;          -- hadap arah, misal "Timur"
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_flood_free BOOLEAN;     -- bebas banjir
ALTER TABLE listings ADD COLUMN IF NOT EXISTS road_access TEXT;          -- misal "2 mobil"

ALTER TABLE listings ADD COLUMN IF NOT EXISTS nearby_toll TEXT;          -- misal "1,2 km"
ALTER TABLE listings ADD COLUMN IF NOT EXISTS nearby_school TEXT;        -- misal "300 m"
ALTER TABLE listings ADD COLUMN IF NOT EXISTS nearby_minimarket TEXT;    -- misal "500 m"

ALTER TABLE listings ADD COLUMN IF NOT EXISTS badge TEXT NOT NULL DEFAULT 'none'
  CHECK (badge IN ('none', 'hot', 'exclusive'));

CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
