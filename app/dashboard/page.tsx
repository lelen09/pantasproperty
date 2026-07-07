import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Lock } from 'lucide-react'
import type { Listing } from '@/lib/types'
import DashboardListingActions from './DashboardListingActions'

function formatRupiah(angka: number) {
  if (angka >= 1_000_000_000) return `Rp ${(angka / 1_000_000_000).toFixed(1)} M`
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(0)} Jt`
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_media(*)')
    .eq('agent_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('max_listings')
    .eq('id', user!.id)
    .single()

  const totalListings = listings?.length || 0
  const maxListings = profile?.max_listings ?? 5
  const isUnlimitedListings = maxListings === -1
  const limitReached = !isUnlimitedListings && totalListings >= maxListings

  return (
    <div>
      {/* Tab Listing Saya / Layanan Saya */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl text-sm font-medium bg-navy-600 text-white"
        >
          🏠 Listing Saya
        </Link>
        <Link
          href="/dashboard/services"
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
        >
          🔨 Layanan Saya
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Listing Saya</h1>
          <p className="text-gray-500 text-sm">
            {isUnlimitedListings ? `${totalListings} listing (Unlimited)` : `${totalListings} dari ${maxListings} listing terpakai`}
          </p>
        </div>
        {limitReached ? (
          <div
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
            title="Kuota listing habis, hubungi admin untuk upgrade paket"
          >
            <Lock size={16} /> Kuota Penuh
          </div>
        ) : (
          <Link
            href="/dashboard/listing/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition"
          >
            <Plus size={18} /> Tambah Listing
          </Link>
        )}
      </div>

      {listings && listings.length > 0 ? (
        <div className="space-y-3">
          {(listings as Listing[]).map((listing) => {
            const cover = listing.listing_media?.find((m) => m.is_cover) || listing.listing_media?.[0]
            return (
              <div
                key={listing.id}
                className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {cover && (
                      <img src={cover.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{listing.title}</p>
                    <p className="text-gold-600 font-bold text-sm">
                      {formatRupiah(listing.price)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {listing.city} ·{' '}
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
                </div>
                <div className="flex items-center gap-1 justify-end sm:shrink-0">
                  <Link
                    href={`/dashboard/listing/${listing.id}/edit`}
                    className="p-2 text-gray-500 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <DashboardListingActions listingId={listing.id} status={listing.status} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Belum ada listing. Tambahkan listing pertama Anda!
        </div>
      )}
    </div>
  )
}
