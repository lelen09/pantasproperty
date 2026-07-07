'use client'
// components/ServiceCard.tsx
// Card jasa renovasi untuk halaman publik — dengan tombol WhatsApp agent

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, MessageCircle, User, X, Hammer, ImageOff, Heart, Share2, Play } from 'lucide-react'
import type { Service } from '@/lib/types'
import { isFavoriteService, toggleFavoriteService } from '@/lib/favorites'
import AgentBadge from '@/components/AgentBadge'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function formatRupiah(angka: number) {
  if (angka >= 1_000_000_000) return `Rp ${(angka / 1_000_000_000).toFixed(1)} M`
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(0)} Jt`
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default function ServiceCard({ service }: { service: Service }) {
  const supabase = createClient()
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsFav(isFavoriteService(service.id))
  }, [service.id])

  const handleToggleFavorite = () => {
    const added = toggleFavoriteService(service.id)
    setIsFav(added)
    toast.success(added ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit')
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/renovasi#service-${service.id}`
    const shareData = {
      title: service.title,
      text: `Lihat jasa "${service.title}"`,
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // dibatalkan user
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link disalin ke clipboard')
    }
  }

  const before = service.service_media?.find((m) => m.type === 'before')
  const after = service.service_media?.find((m) => m.type === 'after')
  const portfolio = service.service_media?.find((m) => m.type === 'portfolio')
  const video = service.service_media?.find((m) => m.type === 'video')
  const mainPhoto = after || portfolio || before

  const handleWaClick = () => {
    supabase
      .from('leads')
      .insert({ agent_id: service.agent_id, service_id: service.id, source: 'service' })
      .then(() => {})
  }

  const agent = service.profiles
  const waNumber = agent?.phone_whatsapp?.replace(/\D/g, '')
  const waMessage = encodeURIComponent(
    `Halo ${agent?.full_name}, saya tertarik dengan jasa "${service.title}" yang Anda tawarkan. Boleh info lebih lanjut?`
  )
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

  return (
    <div id={`service-${service.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow scroll-mt-20 relative">
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

      {/* ── FOTO / VIDEO */}
      {showVideo && video ? (
        <div className="relative aspect-[4/3] bg-gray-100">
          <video src={video.url} controls autoPlay className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="relative">
          {before && after ? (
            <div className="grid grid-cols-2 gap-0.5 bg-gray-100">
              <div className="relative aspect-square">
                <img src={before.url} alt="Sebelum" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Sebelum
                </span>
              </div>
              <div className="relative aspect-square">
                <img src={after.url} alt="Sesudah" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-navy-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Sesudah
                </span>
              </div>
            </div>
          ) : mainPhoto ? (
            <div className="aspect-[4/3] bg-gray-100">
              <img src={mainPhoto.url} alt={service.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-300">
              <ImageOff size={48} />
            </div>
          )}

          {/* Tombol play video */}
          {video && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/90 transition"
            >
              <Play size={12} fill="white" /> Video
            </button>
          )}
        </div>
      )}

      {/* ── KONTEN */}
      <div className="p-4">
        <span className="inline-flex items-center gap-1 bg-navy-50 text-navy-700 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
          <Hammer size={12} /> {service.category}
        </span>

        <h3 className="font-semibold text-gray-800 text-base leading-snug mb-1 line-clamp-2">
          {service.title}
        </h3>

        <div className="text-gold-600 font-bold text-lg mb-2">
          Mulai {formatRupiah(service.price_min)}
          {service.price_max && ` - ${formatRupiah(service.price_max)}`}
        </div>

        {service.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{service.description}</p>
        )}

        <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
          <MapPin size={13} className="shrink-0" />
          {service.city}
        </p>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-gray-200">
                {agent?.avatar_url ? (
                  <img
                    src={agent.avatar_url}
                    alt={agent.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-gray-300" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Penyedia Jasa</p>
                <p className="text-sm font-medium text-gray-700 truncate flex items-center gap-1">
                  {agent?.full_name} <AgentBadge badge={(agent as any)?.agent_badge} />
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAgentModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm shadow-green-200 shrink-0"
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL DETAIL AGENT — via portal */}
      {mounted && showAgentModal && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowAgentModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowAgentModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center ring-4 ring-navy-50 mb-4">
                {agent?.avatar_url ? (
                  <img
                    src={agent.avatar_url}
                    alt={agent.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-gray-300" />
                )}
              </div>

              <p className="font-semibold text-gray-800 text-lg">{agent?.full_name}</p>
              <p className="text-sm text-gray-500 mb-1">Penyedia Jasa Renovasi</p>
              <p className="text-navy-600 font-medium text-sm mb-5">+{waNumber}</p>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWaClick}
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
