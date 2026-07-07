import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import type { Service } from '@/lib/types'
import DashboardServiceActions from './DashboardServiceActions'

function formatRupiah(angka: number) {
  if (angka >= 1_000_000_000) return `Rp ${(angka / 1_000_000_000).toFixed(1)} M`
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(0)} Jt`
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default async function DashboardServicesPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: services } = await supabase
    .from('services')
    .select('*, service_media(*)')
    .eq('agent_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Tab Listing Saya / Layanan Saya / Leads Masuk */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
        >
          🏠 Listing Saya
        </Link>
        <Link
          href="/dashboard/services"
          className="px-4 py-2 rounded-xl text-sm font-medium bg-navy-600 text-white"
        >
          🔨 Layanan Saya
        </Link>
        <Link
          href="/dashboard/leads"
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
        >
          📩 Leads Masuk
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Layanan Saya</h1>
          <p className="text-gray-500 text-sm">{services?.length || 0} jasa total</p>
        </div>
        <Link
          href="/dashboard/service/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition"
        >
          <Plus size={18} /> Tambah Jasa
        </Link>
      </div>

      {services && services.length > 0 ? (
        <div className="space-y-3">
          {(services as Service[]).map((service) => {
            const cover =
              service.service_media?.find((m) => m.type === 'after') ||
              service.service_media?.[0]
            return (
              <div
                key={service.id}
                className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {cover && (
                      <img src={cover.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{service.title}</p>
                    <p className="text-gold-600 font-bold text-sm">
                      Mulai {formatRupiah(service.price_min)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {service.city} ·{' '}
                      <span
                        className={
                          service.status === 'active' ? 'text-navy-600' : 'text-gray-400'
                        }
                      >
                        {service.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 justify-end sm:shrink-0">
                  <Link
                    href={`/dashboard/service/${service.id}/edit`}
                    className="p-2 text-gray-500 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <DashboardServiceActions serviceId={service.id} status={service.status} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Belum ada jasa. Tambahkan jasa renovasi pertama Anda!
        </div>
      )}
    </div>
  )
}
