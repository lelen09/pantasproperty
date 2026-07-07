'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Listing } from '@/lib/types'

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`
}

// Muat gambar via canvas supaya bisa dimasukkan ke PDF (butuh CORS diizinkan bucket-nya,
// Supabase Storage bucket public sudah mendukung ini secara default)
function loadImageAsDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas tidak didukung'))
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Gagal memuat gambar'))
    img.src = url
  })
}

export default function BrosurButton({ listing }: { listing: Listing }) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    setGenerating(true)
    const toastId = toast.loading('Membuat brosur PDF...')

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      let y = 15

      // Foto cover
      const coverPhoto =
        listing.listing_media?.find((m) => m.is_cover && m.type === 'photo') ||
        listing.listing_media?.find((m) => m.type === 'photo')

      if (coverPhoto) {
        try {
          const dataUrl = await loadImageAsDataUrl(coverPhoto.url)
          const imgWidth = pageWidth - margin * 2
          const imgHeight = imgWidth * 0.65
          doc.addImage(dataUrl, 'JPEG', margin, y, imgWidth, imgHeight)
          y += imgHeight + 8
        } catch {
          // kalau gambar gagal dimuat (CORS dll), lanjut tanpa foto
        }
      }

      // Judul & harga
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(listing.title, margin, y)
      y += 8

      doc.setFontSize(14)
      doc.setTextColor(180, 130, 30)
      doc.text(formatRupiah(listing.price), margin, y)
      doc.setTextColor(0, 0, 0)
      y += 8

      // Lokasi
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`${listing.address}, ${listing.city}, ${listing.province}`, margin, y)
      y += 8

      // Spesifikasi
      doc.setFontSize(11)
      const specs = [
        `${listing.bedrooms} Kamar Tidur`,
        `${listing.bathrooms} Kamar Mandi`,
        `${listing.floors} Lantai`,
        listing.garage > 0 ? `${listing.garage} Garasi` : null,
        `LT ${listing.land_area} m²`,
        `LB ${listing.building_area} m²`,
      ]
        .filter(Boolean)
        .join('  •  ')
      doc.text(specs, margin, y)
      y += 10

      // Info tambahan
      const extras = [
        listing.certificate_type ? `Sertifikat: ${listing.certificate_type}` : null,
        listing.orientation ? `Hadap: ${listing.orientation}` : null,
        listing.is_flood_free ? 'Bebas Banjir' : null,
        listing.road_access ? `Akses: ${listing.road_access}` : null,
      ].filter(Boolean)
      if (extras.length > 0) {
        doc.setFontSize(10)
        doc.text(extras.join('  •  '), margin, y)
        y += 8
      }

      // Deskripsi
      if (listing.description) {
        y += 2
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Deskripsi', margin, y)
        y += 6
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(listing.description, pageWidth - margin * 2)
        doc.text(lines, margin, y)
        y += lines.length * 5 + 6
      }

      // Kontak agent di bagian bawah
      const agent = listing.profiles
      doc.setDrawColor(220)
      doc.line(margin, 270, pageWidth - margin, 270)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Hubungi: ${agent?.full_name || ''}`, margin, 278)
      doc.setFont('helvetica', 'normal')
      doc.text(`WhatsApp: ${agent?.phone_whatsapp || ''}`, margin, 285)

      doc.save(`Brosur - ${listing.title}.pdf`)
      toast.success('Brosur berhasil dibuat', { id: toastId })
    } catch (err: any) {
      toast.error('Gagal membuat brosur PDF', { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="w-full flex items-center justify-center gap-2 border border-navy-200 text-navy-700 hover:bg-navy-50 font-semibold px-4 py-3 rounded-xl transition disabled:opacity-50 mt-2"
    >
      <FileDown size={18} />
      {generating ? 'Membuat PDF...' : 'Download Brosur PDF'}
    </button>
  )
}
