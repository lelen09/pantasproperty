import type { SupabaseClient } from '@supabase/supabase-js'

const DEBOUNCE_MS = 30_000 // 30 detik

/**
 * Catat lead (klik WhatsApp) dengan debounce sisi browser: kalau listing/jasa
 * yang sama baru saja tercatat dalam 30 detik terakhir di browser ini, tidak
 * dikirim ulang. Ini cuma pencegahan ringan (bukan pengganti proteksi server),
 * pelengkap dari rate-limit trigger di database.
 */
export function logLead(
  supabase: SupabaseClient,
  params: { agentId: string; listingId?: string; serviceId?: string; source: 'listing' | 'service' }
) {
  const key = `lead_sent_${params.source}_${params.listingId || params.serviceId}`
  const last = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  if (last && Date.now() - parseInt(last) < DEBOUNCE_MS) return

  if (typeof window !== 'undefined') localStorage.setItem(key, String(Date.now()))

  supabase
    .from('leads')
    .insert({
      agent_id: params.agentId,
      listing_id: params.listingId || null,
      service_id: params.serviceId || null,
      source: params.source,
    })
    .then(({ error }: any) => {
      // Diamkan error rate-limit dari server — ini cuma pencatatan analitik,
      // tidak boleh mengganggu pengalaman user membuka WhatsApp.
      if (error) console.debug('Lead tidak tercatat:', error.message)
    })
}
