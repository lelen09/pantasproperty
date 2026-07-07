'use client'

import { useEffect, useState } from 'react'
import type { Banner } from '@/lib/types'

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  const banner = banners[index]

  const content = (
    <img
      src={banner.image_url}
      alt={banner.advertiser_name}
      className="w-full h-full object-cover"
    />
  )

  return (
    <div className="mb-6">
      <div className="relative w-full aspect-[4/1] sm:aspect-[6/1] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
        {banner.link_url ? (
          <a href={banner.link_url} target="_blank" rel="noopener noreferrer sponsored">
            {content}
          </a>
        ) : (
          content
        )}
        <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
          Iklan
        </span>

        {banners.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition ${
                  i === index ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
