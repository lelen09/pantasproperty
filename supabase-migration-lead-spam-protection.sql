-- =============================================
-- MIGRATION: Proteksi spam pada leads
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- Tolak insert lead baru kalau agent yang sama baru saja dapat lead
-- dalam 10 detik terakhir (mencegah flood dari klik berulang/bot sederhana)
CREATE OR REPLACE FUNCTION check_lead_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.leads
  WHERE agent_id = NEW.agent_id
    AND created_at > NOW() - INTERVAL '10 seconds';

  IF recent_count > 0 THEN
    RAISE EXCEPTION 'Terlalu banyak permintaan, coba lagi sebentar';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_lead_rate_limit ON leads;
CREATE TRIGGER enforce_lead_rate_limit
  BEFORE INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION check_lead_rate_limit();
