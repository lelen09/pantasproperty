import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageCircle, Sparkles } from 'lucide-react'
import type { Lead } from '@/lib/types'

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

export default async function LeadsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single()

  const isPremium = profile?.plan && profile.plan !== 'free'

  const { data: leads } = await supabase
    .from('leads')
    .select('*, listings(title), services(title)')
    .eq('agent_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const totalLeads = leads?.length || 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const leadsToday = (leads as Lead[] | null)?.filter(
    (l) => new Date(l.created_at) >= today
  ).length || 0

  return (
    <div>
      {/* Tab navigasi */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
        >
          🏠 Listing Saya
        </Link>
        <Link
          href="/dashboard/services"
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
        >
          🔨 Layanan Saya
        </Link>
        <Link
          href="/dashboard/leads"
          className="px-4 py-2 rounded-xl text-sm font-medium bg-navy-600 text-white"
        >
          📩 Leads Masuk
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Leads Masuk</h1>
      <p className="text-gray-500 text-sm mb-6">
        {totalLeads} total · {leadsToday} hari ini
      </p>

      {isPremium && (
        <div className="flex items-center gap-2 bg-gold-50 text-gold-700 border border-gold-200 rounded-xl px-4 py-2.5 text-sm mb-6">
          <Sparkles size={15} />
          Sebagai agent paket <span className="font-semibold capitalize">{profile!.plan}</span>,
          leads kamu ditandai prioritas ⭐
        </div>
      )}

      {leads && leads.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {(leads as Lead[]).map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <MessageCircle size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-1">
                  {isPremium && <Sparkles size={12} className="text-gold-500 shrink-0" />}
                  {lead.source === 'listing'
                    ? lead.listings?.title || 'Listing'
                    : lead.services?.title || 'Jasa'}
                </p>
                <p className="text-xs text-gray-400">
                  Seseorang tertarik & buka WhatsApp ·{' '}
                  {lead.source === 'listing' ? 'Properti' : 'Jasa Renovasi'}
                </p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">{timeAgo(lead.created_at)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Belum ada leads masuk. Leads muncul otomatis saat pengunjung tap tombol WhatsApp di
          listing/jasa kamu.
        </div>
      )}
    </div>
  )
}
