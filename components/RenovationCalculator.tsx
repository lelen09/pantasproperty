'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default function RenovationCalculator() {
  const [luas, setLuas] = useState('')
  const m2 = parseInt(luas) || 0

  const tiers = [
    { label: 'Renovasi Ringan', rate: 300_000, desc: 'cat ulang, perbaikan minor' },
    { label: 'Renovasi Sedang', rate: 900_000, desc: 'ganti lantai/atap, sebagian struktur' },
    { label: 'Renovasi Total', rate: 1_800_000, desc: 'bongkar total & bangun ulang' },
  ]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <Calculator size={18} className="text-navy-600" /> Hitung Estimasi Biaya Renovasi
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Masukkan luas bangunan untuk lihat kisaran biaya renovasi.
      </p>

      <input
        type="number"
        value={luas}
        onChange={(e) => setLuas(e.target.value)}
        placeholder="Contoh: 100"
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none mb-4"
      />
      <p className="text-xs text-gray-400 mb-4">Luas bangunan dalam meter persegi (m²)</p>

      {m2 > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiers.map((t) => (
            <div key={t.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-1">{t.label}</p>
              <p className="text-gold-600 font-bold text-lg mb-1">
                {formatRupiah(m2 * t.rate)}
              </p>
              <p className="text-xs text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        *Estimasi kasar, harga aktual tergantung material & kondisi bangunan. Hubungi penyedia
        jasa untuk penawaran resmi.
      </p>
    </div>
  )
}
