'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Play, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import type { ListingMedia } from '@/lib/types'

export default function ListingDetailGallery({
  photos,
  video,
  title,
}: {
  photos: ListingMedia[]
  video?: ListingMedia
  title: string
}) {
  const [index, setIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const goTo = (i: number) => {
    if (photos.length === 0) return
    setIndex((i + photos.length) % photos.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > 40) goTo(index + (deltaX < 0 ? 1 : -1))
    touchStartX.current = null
  }

  const activeUrl = photos[index]?.url

  return (
    <div className="rounded-2xl overflow-hidden bg-gray-100">
      <div className="relative aspect-[4/3] sm:aspect-[16/10]">
        {showVideo && video ? (
          <video src={video.url} controls autoPlay className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {activeUrl ? (
              <Image
                src={activeUrl}
                alt={title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Layers size={64} />
              </div>
            )}

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => goTo(index - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => goTo(index + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                >
                  <ChevronRight size={20} />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                  {index + 1}/{photos.length}
                </span>
              </>
            )}

            {video && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/90 transition"
              >
                <Play size={12} fill="white" /> Video
              </button>
            )}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-2 bg-white">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setShowVideo(false)
                setIndex(i)
              }}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                i === index && !showVideo ? 'border-navy-600' : 'border-transparent'
              }`}
            >
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
