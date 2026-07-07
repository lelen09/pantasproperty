import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ListingDetailGallery from './ListingDetailGallery'
import AgentBadge from '@/components/AgentBadge'
import GoogleMapsIcon from '@/components/icons/GoogleMapsIcon'
import WaContactButton from './WaContactButton'
import {
  MapPin, BedDouble, Bath, Layers, Car, FileCheck, Compass,
  ShieldCheck, Route, TrafficCone, School, Store, User,
} from 'lucide-react'
import type { Listing } from '@/lib/types'
import { estimateKprMonthly, formatRupiahShort } from '@/lib/kpr'

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`
}

async function getListing(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('listings')
    .select(
      `*, profiles (id, full_name, phone_whatsapp, avatar_url, agent_badge), listing_media (*)`
    )
    .eq('id', id)
    .single()
  return data as Listing | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const listing = await getListing(id)

  if (!listing) {
    return { title: 'Listing Tidak Ditemukan — AS REALTY' }
  }

  const cover =
    listing.listing_media?.find((m) => m.is_cover && m.type === 'photo')?.url ||
    listing.listing_media?.find((m) => m.type === 'photo')?.url

  const description = `${formatRupiah(listing.price)} · ${listing.city}, ${listing.province} · ${listing.bedrooms} KT, ${listing.bathrooms} KM, LT ${listing.land_area}m², LB ${listing.building_area}m²`

  return {
    title: `${listing.title} — AS REALTY`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: cover ? [{ url: cover, width: 1200, height: 900 }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description,
      images: cover ? [cover] : undefined,
    },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const listing = await getListing(id)

  if (!listing) notFound()
  // Listing nonaktif/terjual/inactive tetap boleh dilihat kalau ada link langsung,
  // RLS sudah membatasi: publik hanya bisa lihat yang aktif, pemilik/admin bisa lihat semua.

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const agent = listing.profiles
  const photos = listing.listing_media?.filter((m) => m.type === 'photo') || []
  const video = listing.listing_media?.find((m) => m.type === 'video')
  const coverPhoto = listing.listing_media?.find((m) => m.is_cover && m.type === 'photo')
  const orderedPhotos = coverPhoto
    ? [coverPhoto, ...photos.filter((p) => p.id !== coverPhoto.id)]
    : photos

  const mapsUrl = listing.google_maps_url
    ? /^https?:\/\//i.test(listing.google_maps_url)
      ? listing.google_maps_url
      : `https://${listing.google_maps_url}`
    : null

  return (
    <>
      <Navbar isLoggedIn={!!user} isAdmin={isAdmin} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ListingDetailGallery photos={orderedPhotos} video={video} title={listing.title} />

          {listing.status === 'sold' && (
            <div className="bg-red-500 text-white text-center font-bold py-2 rounded-xl mt-4">
              TERJUAL
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-4">
            <span className="inline-block bg-navy-50 text-navy-700 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
              {listing.property_type}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{listing.title}</h1>
            <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
              <MapPin size={14} className="shrink-0" />
              {listing.address}, {listing.city}, {listing.province}
            </p>

            <div className="text-gold-600 font-bold text-2xl mb-1">
              {formatRupiah(listing.price)}
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Bisa KPR mulai ~{formatRupiahShort(estimateKprMonthly(listing.price))}/bulan*
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-y border-gray-100 py-4 mb-4">
              <span className="flex items-center gap-1.5">
                <BedDouble size={16} className="text-gray-400" /> {listing.bedrooms} Kamar Tidur
              </span>
              <span className="flex items-center gap-1.5">
                <Bath size={16} className="text-gray-400" /> {listing.bathrooms} Kamar Mandi
              </span>
              <span className="flex items-center gap-1.5">
                <Layers size={16} className="text-gray-400" /> {listing.floors} Lantai
              </span>
              {listing.garage > 0 && (
                <span className="flex items-center gap-1.5">
                  <Car size={16} className="text-gray-400" /> {listing.garage} Garasi
                </span>
              )}
            </div>

            <div className="flex gap-2 text-xs text-gray-500 mb-4">
              <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
                LT: {listing.land_area} m²
              </span>
              <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
                LB: {listing.building_area} m²
              </span>
            </div>

            {(listing.certificate_type || listing.orientation || listing.is_flood_free || listing.road_access) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600 mb-4">
                {listing.certificate_type && (
                  <span className="flex items-center gap-1.5">
                    <FileCheck size={14} className="text-gray-400" /> {listing.certificate_type}
                  </span>
                )}
                {listing.orientation && (
                  <span className="flex items-center gap-1.5">
                    <Compass size={14} className="text-gray-400" /> Hadap {listing.orientation}
                  </span>
                )}
                {listing.is_flood_free && (
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-gray-400" /> Bebas Banjir
                  </span>
                )}
                {listing.road_access && (
                  <span className="flex items-center gap-1.5">
                    <Route size={14} className="text-gray-400" /> {listing.road_access}
                  </span>
                )}
              </div>
            )}

            {(listing.nearby_toll || listing.nearby_school || listing.nearby_minimarket) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600 mb-4">
                {listing.nearby_toll && (
                  <span className="flex items-center gap-1.5">
                    <TrafficCone size={14} className="text-gray-400" /> {listing.nearby_toll} ke Tol
                  </span>
                )}
                {listing.nearby_school && (
                  <span className="flex items-center gap-1.5">
                    <School size={14} className="text-gray-400" /> {listing.nearby_school} ke Sekolah
                  </span>
                )}
                {listing.nearby_minimarket && (
                  <span className="flex items-center gap-1.5">
                    <Store size={14} className="text-gray-400" /> {listing.nearby_minimarket} ke Minimarket
                  </span>
                )}
              </div>
            )}

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline mb-4"
              >
                <GoogleMapsIcon size={16} /> Lihat di Google Maps
              </a>
            )}

            {listing.description && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h2 className="font-semibold text-gray-800 mb-2">Deskripsi</h2>
                <p className="text-gray-600 text-sm whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-gray-200">
                  {agent?.avatar_url ? (
                    <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-gray-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Agent</p>
                  <p className="font-medium text-gray-700 flex items-center gap-1">
                    {agent?.full_name} <AgentBadge badge={agent?.agent_badge} />
                  </p>
                </div>
              </div>

              <WaContactButton listing={listing} />
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            *Estimasi cicilan KPR bersifat kasar, bukan simulasi resmi bank.
          </p>
        </div>
      </main>
    </>
  )
}
