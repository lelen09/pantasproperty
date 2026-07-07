'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, ZoomIn } from 'lucide-react'

const VIEWPORT = 280 // ukuran area crop di layar (px)
const OUTPUT = 500 // ukuran foto hasil crop (px)

export default function ImageCropModal({
  imageSrc,
  onCancel,
  onCropComplete,
}: {
  imageSrc: string
  onCancel: () => void
  onCropComplete: (blob: Blob) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const imgRef = useRef<HTMLImageElement>(null)
  const dragging = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })

  useEffect(() => setMounted(true), [])

  const handleImageLoad = () => {
    const img = imgRef.current
    if (img) {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    }
  }

  const baseScale =
    natural.w > 0 ? Math.max(VIEWPORT / natural.w, VIEWPORT / natural.h) : 1
  const effectiveScale = baseScale * zoom
  const displayedW = natural.w * effectiveScale
  const displayedH = natural.h * effectiveScale

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

  const centerOffsetX = (VIEWPORT - displayedW) / 2
  const centerOffsetY = (VIEWPORT - displayedH) / 2

  const posX = clamp(centerOffsetX + pan.x, VIEWPORT - displayedW, 0)
  const posY = clamp(centerOffsetY + pan.y, VIEWPORT - displayedH, 0)

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    lastPoint.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPoint.current.x
    const dy = e.clientY - lastPoint.current.y
    lastPoint.current = { x: e.clientX, y: e.clientY }
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
  }

  const handlePointerUp = () => {
    dragging.current = false
  }

  const handleConfirm = () => {
    const img = imgRef.current
    if (!img || natural.w === 0) return

    const sx = -posX / effectiveScale
    const sy = -posY / effectiveScale
    const sSize = VIEWPORT / effectiveScale

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT)

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob)
      },
      'image/jpeg',
      0.9
    )
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Atur Foto Profil</h3>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-400 mb-3 text-center">
            Geser untuk atur posisi, gunakan slider untuk zoom
          </p>

          {/* Area crop */}
          <div
            className="relative mx-auto overflow-hidden bg-gray-900 rounded-xl touch-none select-none"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt=""
              onLoad={handleImageLoad}
              draggable={false}
              className="absolute pointer-events-none"
              style={{
                width: displayedW,
                height: displayedH,
                left: posX,
                top: posY,
              }}
            />
            {/* Guide lingkaran */}
            <div className="absolute inset-0 pointer-events-none border-2 border-white/70 rounded-full m-3" />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-2 mt-4">
            <ZoomIn size={16} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-navy-600"
            />
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full mt-4 py-3 bg-navy-600 hover:bg-navy-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Check size={18} /> Gunakan Foto Ini
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
