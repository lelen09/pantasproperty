-- =============================================
-- MIGRATION: Leads (pelacakan minat pembeli via klik WhatsApp)
-- Jalankan ini di Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('listing', 'service')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Siapapun (termasuk pengunjung yang belum login) boleh mencatat lead saat klik WhatsApp
CREATE POLICY "Publik bisa catat lead" ON leads
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Agent lihat lead sendiri, admin lihat semua" ON leads
  FOR SELECT USING (
    agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
