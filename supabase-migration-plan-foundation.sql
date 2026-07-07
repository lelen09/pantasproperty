-- =============================================
-- MIGRATION: Fondasi paket agent, badge, limit, boost listing
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- PROFILES: paket, badge, batas listing & foto (admin yang atur manual)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'silver', 'gold', 'platinum'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_badge TEXT NOT NULL DEFAULT 'none'
  CHECK (agent_badge IN ('none', 'verified', 'top_agent', 'super_agent'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_listings INTEGER NOT NULL DEFAULT 5;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_photos_per_listing INTEGER NOT NULL DEFAULT 10;

-- LISTINGS: boost (agent/listing dipin ke atas sampai tanggal tertentu)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ;

-- =============================================
-- TRIGGER: Tolak insert listing baru kalau kuota sudah penuh
-- (jaga-jaga kalau ada yang coba lewat tombol UI yang seharusnya disembunyikan)
-- =============================================
CREATE OR REPLACE FUNCTION check_listing_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  limit_count INTEGER;
BEGIN
  SELECT max_listings INTO limit_count FROM public.profiles WHERE id = NEW.agent_id;
  SELECT COUNT(*) INTO current_count FROM public.listings WHERE agent_id = NEW.agent_id;
  IF current_count >= limit_count THEN
    RAISE EXCEPTION 'Kuota listing sudah penuh (maksimal % listing untuk paket Anda)', limit_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_listing_limit ON listings;
CREATE TRIGGER enforce_listing_limit
  BEFORE INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION check_listing_limit();

-- RLS: admin sudah punya policy UPDATE untuk profiles & listings dari sebelumnya,
-- jadi kolom baru ini otomatis ikut ter-cover, tidak perlu policy baru.
