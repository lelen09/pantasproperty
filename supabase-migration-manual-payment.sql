-- =============================================
-- MIGRATION: Upgrade paket via transfer manual
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- Info rekening/QRIS admin (disimpan di profile admin)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_holder TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qris_image_url TEXT;

-- =============================================
-- TABLE: upgrade_requests
-- =============================================
CREATE TABLE IF NOT EXISTS upgrade_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url TEXT,
  proof_storage_path TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent bisa lihat request sendiri, admin lihat semua" ON upgrade_requests
  FOR SELECT USING (
    agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agent bisa buat request sendiri" ON upgrade_requests
  FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Admin bisa update status request" ON upgrade_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- STORAGE: bukti transfer & QRIS
-- =============================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('payment-proofs', 'payment-proofs', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated bisa upload bukti transfer" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Terkait bisa lihat bukti transfer" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs');

INSERT INTO storage.buckets (id, name, public)
  VALUES ('qris-images', 'qris-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated bisa upload QRIS" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'qris-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public bisa lihat QRIS" ON storage.objects
  FOR SELECT USING (bucket_id = 'qris-images');

CREATE POLICY "Authenticated bisa hapus QRIS" ON storage.objects
  FOR DELETE USING (bucket_id = 'qris-images' AND auth.role() = 'authenticated');
