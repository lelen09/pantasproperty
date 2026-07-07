import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users } from 'lucide-react'
import type { Listing } from '@/lib/types'
import AdminListingActions from './AdminListingActions'

function formatRupiah(angka: number) {
  if (angka >= 1_000_000_000) return `Rp ${(angka / 1_000_000_000).toFixed(1)} M`
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(0)} Jt`
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Semua Listing</h1>
          <p className="text-gray-500 text-sm">{listings?.length || 0} listing total</p>
        </div>
        <Link
          href="/admin/agents"
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition"
        >
          <Users size={18} /> Kelola Agent
        </Link>
      </div>

      {listings && listings.length > 0 ? (
        <div className="space-y-3">
          {(listings as Listing[]).map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{listing.title}</p>
                <p className="text-gold-600 font-bold text-sm">
                  {formatRupiah(listing.price)}
                </p>
                <p className="text-xs text-gray-400">
                  {listing.city} · Agent: {listing.profiles?.full_name} ·{' '}
                  <span
                    className={
                      listing.status === 'active'
                        ? 'text-navy-600'
                        : listing.status === 'sold'
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }
                  >
                    {listing.status}
                  </span>
                </p>
              </div>
              <div className="flex justify-end sm:shrink-0">
                <AdminListingActions listingId={listing.id} status={listing.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">Belum ada listing.</div>
      )}
    </div>
  )
}
