import { TrendingUp, TrendingDown, Users, Home, Hammer, MessageCircle } from 'lucide-react'

export type AdminStatsData = {
  totalAgents: number
  totalListings: number
  totalServices: number
  totalLeadsAllTime: number
  leadsThisWeek: number
  leadsLastWeek: number
  topListings: { title: string; count: number }[]
}

export default function AdminStats({ stats }: { stats: AdminStatsData }) {
  const trend = stats.leadsThisWeek - stats.leadsLastWeek
  const trendUp = trend >= 0

  const cards = [
    { label: 'Total Agent', value: stats.totalAgents, icon: Users },
    { label: 'Listing Aktif', value: stats.totalListings, icon: Home },
    { label: 'Jasa Aktif', value: stats.totalServices, icon: Hammer },
    { label: 'Leads (semua)', value: stats.totalLeadsAllTime, icon: MessageCircle },
  ]

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <c.icon size={18} className="text-navy-600 mb-2" />
            <p className="text-xl font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-1">Leads Minggu Ini</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-800">{stats.leadsThisWeek}</p>
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold ${
                trendUp ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(trend)} vs minggu lalu
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-2">🔥 Listing Terpopuler</p>
          {stats.topListings.length > 0 ? (
            <ul className="space-y-1">
              {stats.topListings.map((l, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{l.title}</span>
                  <span className="text-gray-400 shrink-0">{l.count} leads</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Belum ada data leads.</p>
          )}
        </div>
      </div>
    </div>
  )
}
