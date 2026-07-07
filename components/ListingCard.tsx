'use client'
// components/ListingCard.tsx
// Card rumah untuk halaman publik — dengan tombol WhatsApp agent

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, BedDouble, Bath, Layers, Car, MessageCircle, Play, User, X, Heart, Share2, FileCheck, Compass, ShieldCheck, Route, TrafficCone, School, Store, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { isFavoriteListing, toggleFavoriteListing } from '@/lib/favorites'
import { estimateKprMonthly, formatRupiahShort } from '@/lib/kpr'
import GoogleMapsIcon from '@/components/icons/GoogleMapsIcon'
import AgentBadge from '@/components/AgentBadge'
import toast from 'react-hot-toast'

function formatRupiah(angka: number) {
  if (angka >= 1_000_000_000) return `Rp ${(angka / 1_000_000_000).toFixed(1)} M`
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(0)} Jt`
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [showVideo, setShowVideo] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsFav(isFavoriteListing(listing.id))
  }, [listing.id])

  const handleToggleFavorite = () => {
    const added = toggleFavoriteListing(listing.id)
    setIsFav(added)
    toast.success(added ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit')
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/#listing-${listing.id}`
    const shareData = {
      title: listing.title,
      text: `Lihat properti "${listing.title}" - ${formatRupiahShort(listing.price)}`,
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // user membatalkan share, tidak perlu ditangani
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link disalin ke clipboard')
    }
  }

  const coverPhoto = listing.listing_media?.find(m => m.is_cover && m.type === 'photo')
  const video = listing.listing_media?.find(m => m.type === 'video')
  const rawPhotos = listing.listing_media?.filter(m => m.type === 'photo') || []
  // Urutkan supaya foto cover selalu tampil pertama di galeri
  const photos = coverPhoto
    ? [coverPhoto, ...rawPhotos.filter(p => p.id !== coverPhoto.id)]
    : rawPhotos
  const activeUrl = photos[photoIndex]?.url

  const goToPhoto = (index: number) => {
    if (photos.length === 0) return
    const wrapped = (index + photos.length) % photos.length
    setPhotoIndex(wrapped)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > 40) {
      goToPhoto(photoIndex + (deltaX < 0 ? 1 : -1))
    }
    touchStartX.current = null
  }

  const agent = listing.profiles
  const waNumber = agent?.phone_whatsapp?.replace(/\D/g, '') // hapus karakter non-angka
  const waMessage = encodeURIComponent(
    `Halo ${agent?.full_name}, saya tertarik dengan properti "${listing.title}" yang Anda tawarkan. Boleh info lebih lanjut?`
  )
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

  // Jaga-jaga kalau ada listing lama yang URL Maps-nya tersimpan tanpa https://
  const mapsUrl = listing.google_maps_url
    ? /^https?:\/\//i.test(listing.google_maps_url)
      ? listing.google_maps_url
      : `https://${listing.google_maps_url}`
    : null

  return (
    <div id={`listing-${listing.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow scroll-mt-20">

      {/* ── FOTO / VIDEO */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {/* Badge boost (prioritas tertinggi) atau promosi */}
        {listing.boosted_until && new Date(listing.boosted_until) > new Date() ? (
          <span className="absolute top-2 left-2 z-10 text-xs font-bold px-2.5 py-1 rounded-full text-white bg-purple-600">
            🚀 Promoted
          </span>
        ) : (
          listing.badge !== 'none' && (
            <span
              className={`absolute top-2 left-2 z-10 text-xs font-bold px-2.5 py-1 rounded-full text-white ${
                listing.badge === 'hot' ? 'bg-red-500' : 'bg-gold-500'
              }`}
            >
              {listing.badge === 'hot' ? '🔥 HOT' : '⭐ EXCLUSIVE'}
            </span>
          )
        )}
        {/* Favorit & Share */}
        <div className="absolute top-2 right-2 z-10 flex gap-1.5">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition"
            title="Favorit"
          >
            <Heart size={15} className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition"
            title="Bagikan"
          >
            <Share2 size={14} className="text-gray-500" />
          </button>
        </div>
        {showVideo && video ? (
          <video
            src={video.url}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeUrl ? (
              <img src={activeUrl} alt={listing.title}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Layers size={48} />
              </div>
            )}

            {/* Panah navigasi galeri */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToPhoto(photoIndex - 1)}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => goToPhoto(photoIndex + 1)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Dot indikator */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                  {photos.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition ${
                        i === photoIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badge jumlah foto */}
            {photos.length > 1 && (
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                📷 {photoIndex + 1}/{photos.length}
              </span>
            )}

            {/* Tombol play video */}
            {video && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/90 transition">
                <Play size={12} fill="white" /> Video
              </button>
            )}
          </div>
        )}

        {/* Status badge */}
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold text-xl px-6 py-2 rounded-xl rotate-[-15deg]">
              TERJUAL
            </span>
          </div>
        )}
      </div>

      {/* ── KONTEN */}
      <div className="p-4">
        {/* Harga */}
        <div className="text-gold-600 font-bold text-xl mb-0.5">
          {formatRupiah(listing.price)}
        </div>
        <p className="text-xs text-gray-400 mb-2">
          Bisa KPR mulai ~{formatRupiahShort(estimateKprMonthly(listing.price))}/bulan*
        </p>

        {/* Judul */}
        <span className="inline-block bg-navy-50 text-navy-700 text-xs font-medium px-2 py-0.5 rounded-full mb-1.5">
          {listing.property_type}
        </span>
        <h3 className="font-semibold text-gray-800 text-base leading-snug mb-2 line-clamp-2">
          {listing.title}
        </h3>

        {/* Lokasi */}
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin size={13} className="shrink-0" />
          {listing.city}, {listing.province}
        </p>

        {/* Spesifikasi */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <BedDouble size={14} className="text-gray-400" /> {listing.bedrooms} KT
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} className="text-gray-400" /> {listing.bathrooms} KM
          </span>
          <span className="flex items-center gap-1">
            <Layers size={14} className="text-gray-400" /> {listing.floors} Lt
          </span>
          {listing.garage > 0 && (
            <span className="flex items-center gap-1">
              <Car size={14} className="text-gray-400" /> {listing.garage} Garasi
            </span>
          )}
        </div>

        <div className="flex gap-2 text-xs text-gray-500 mb-3 flex-wrap">
          <span className="bg-gray-100 px-2 py-1 rounded-lg">LT: {listing.land_area} m²</span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">LB: {listing.building_area} m²</span>
        </div>

        {/* Info tambahan */}
        {(listing.certificate_type || listing.orientation || listing.is_flood_free || listing.road_access) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
            {listing.certificate_type && (
              <span className="flex items-center gap-1">
                <FileCheck size={12} className="text-gray-400" /> {listing.certificate_type}
              </span>
            )}
            {listing.orientation && (
              <span className="flex items-center gap-1">
                <Compass size={12} className="text-gray-400" /> Hadap {listing.orientation}
              </span>
            )}
            {listing.is_flood_free && (
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-gray-400" /> Bebas Banjir
              </span>
            )}
            {listing.road_access && (
              <span className="flex items-center gap-1">
                <Route size={12} className="text-gray-400" /> {listing.road_access}
              </span>
            )}
          </div>
        )}

        {/* Fasilitas sekitar */}
        {(listing.nearby_toll || listing.nearby_school || listing.nearby_minimarket) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-4">
            {listing.nearby_toll && (
              <span className="flex items-center gap-1">
                <TrafficCone size={12} className="text-gray-400" /> {listing.nearby_toll} ke Tol
              </span>
            )}
            {listing.nearby_school && (
              <span className="flex items-center gap-1">
                <School size={12} className="text-gray-400" /> {listing.nearby_school} ke Sekolah
              </span>
            )}
            {listing.nearby_minimarket && (
              <span className="flex items-center gap-1">
                <Store size={12} className="text-gray-400" /> {listing.nearby_minimarket} ke
                Minimarket
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-3">
          {/* Info Agent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-gray-200">
                {agent?.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-gray-300" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Agent</p>
                <p className="text-sm font-medium text-gray-700 truncate flex items-center gap-1">
                  {agent?.full_name} <AgentBadge badge={(agent as any)?.agent_badge} />
                </p>
              </div>
            </div>

            {/* Tombol WhatsApp — buka modal detail agent dulu */}
            <button
              type="button"
              onClick={() => setShowAgentModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm shadow-green-200 shrink-0">
              <MessageCircle size={16} />
              WhatsApp
            </button>
          </div>

          {/* Link Google Maps */}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-blue-500 flex items-center gap-1.5 hover:underline">
              <GoogleMapsIcon size={14} /> Lihat di Google Maps
            </a>
          )}
        </div>
      </div>

      {/* ── MODAL DETAIL AGENT (foto besar, nama, nomor WA) — via portal */}
      {mounted && showAgentModal && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowAgentModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol tutup */}
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowAgentModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col items-center text-center">
              {/* Foto besar */}
              <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center ring-4 ring-navy-50 mb-4">
                {agent?.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-300" />
                )}
              </div>

              <p className="font-semibold text-gray-800 text-lg">{agent?.full_name}</p>
              <p className="text-sm text-gray-500 mb-1">Agent Properti</p>
              <p className="text-navy-600 font-medium text-sm mb-5">
                +{waNumber}
              </p>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-xl transition shadow-sm shadow-green-200"
              >
                <MessageCircle size={18} />
                Chat di WhatsApp
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
