'use client'
// components/ListingCard.tsx
// Card rumah untuk halaman publik — dengan tombol WhatsApp agent

import { useState } from 'react'
import { MapPin, BedDouble, Bath, Layers, Car, MessageCircle, Play, User, X } from 'lucide-react'
import type { Listing } from '@/lib/types'

function formatRupiah(angka: number) {
  if (angka >= 1_000_000_000) return `Rp ${(angka / 1_000_000_000).toFixed(1)} M`
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(0)} Jt`
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [showVideo, setShowVideo] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)

  const coverPhoto = listing.listing_media?.find(m => m.is_cover && m.type === 'photo')
  const video = listing.listing_media?.find(m => m.type === 'video')
  const photos = listing.listing_media?.filter(m => m.type === 'photo') || []
  const coverUrl = coverPhoto?.url || photos[0]?.url

  const agent = listing.profiles
  const waNumber = agent?.phone_whatsapp?.replace(/\D/g, '') // hapus karakter non-angka
  const waMessage = encodeURIComponent(
    `Halo ${agent?.full_name}, saya tertarik dengan properti "${listing.title}" yang Anda tawarkan. Boleh info lebih lanjut?`
  )
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

      {/* ── FOTO / VIDEO */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {showVideo && video ? (
          <video
            src={video.url}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {coverUrl ? (
              <img src={coverUrl} alt={listing.title}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Layers size={48} />
              </div>
            )}

            {/* Badge jumlah foto */}
            {photos.length > 1 && (
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                📷 {photos.length} foto
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
          </>
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
        <div className="text-gold-600 font-bold text-xl mb-1">
          {formatRupiah(listing.price)}
        </div>

        {/* Judul */}
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

        <div className="flex gap-2 text-xs text-gray-500 mb-4">
          <span className="bg-gray-100 px-2 py-1 rounded-lg">LT: {listing.land_area} m²</span>
          <span className="bg-gray-100 px-2 py-1 rounded-lg">LB: {listing.building_area} m²</span>
        </div>

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
                <p className="text-sm font-medium text-gray-700 truncate">{agent?.full_name}</p>
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
          {listing.google_maps_url && (
            <a
              href={listing.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-blue-500 flex items-center gap-1 hover:underline">
              <MapPin size={12} /> Lihat di Google Maps
            </a>
          )}
        </div>
      </div>

      {/* ── MODAL DETAIL AGENT (foto besar, nama, nomor WA) */}
      {showAgentModal && (
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
        </div>
      )}
    </div>
  )
}
