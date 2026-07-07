'use client'

import { useMemo, useState } from 'react'
import { Search, MapPin, DollarSign, ArrowUpDown, Home } from 'lucide-react'
import ListingCard from './ListingCard'
import ScrollToHash from './ScrollToHash'
import type { Listing } from '@/lib/types'

const PROPERTY_TYPES = ['Semua Tipe', 'Rumah', 'Apartemen', 'Tanah', 'Ruko', 'Gudang']

const PRICE_RANGES = [
  { label: 'Semua Harga', min: 0, max: Infinity },
  { label: '< Rp 500 Jt', min: 0, max: 500_000_000 },
  { label: 'Rp 500 Jt - 1 M', min: 500_000_000, max: 1_000_000_000 },
  { label: 'Rp 1 M - 2 M', min: 1_000_000_000, max: 2_000_000_000 },
  { label: '> Rp 2 M', min: 2_000_000_000, max: Infinity },
]

const SORT_OPTIONS = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Harga Termurah', value: 'price_asc' },
  { label: 'Harga Tertinggi', value: 'price_desc' },
  { label: 'Luas Terbesar', value: 'area_desc' },
]

export default function PropertyBrowser({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('Semua Kota')
  const [propertyType, setPropertyType] = useState('Semua Tipe')
  const [priceRangeIdx, setPriceRangeIdx] = useState(0)
  const [sortBy, setSortBy] = useState('newest')

  const cities = useMemo(() => {
    const unique = Array.from(new Set(listings.map((l) => l.city)))
    return ['Semua Kota', ...unique]
  }, [listings])

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceRangeIdx]
    let result = listings.filter((l) => {
      const matchQuery =
        query.trim() === '' ||
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.city.toLowerCase().includes(query.toLowerCase())
      const matchCity = city === 'Semua Kota' || l.city === city
      const matchType = propertyType === 'Semua Tipe' || l.property_type === propertyType
      const matchPrice = l.price >= range.min && l.price < range.max
      return matchQuery && matchCity && matchType && matchPrice
    })

    switch (sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'area_desc':
        result = [...result].sort((a, b) => b.building_area - a.building_area)
        break
      default:
        result = [...result].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }

    // Listing yang sedang di-boost admin selalu didahulukan, apapun urutannya
    const isBoosted = (l: Listing) => !!l.boosted_until && new Date(l.boosted_until) > new Date()
    result = [...result].sort((a, b) => Number(isBoosted(b)) - Number(isBoosted(a)))

    return result
  }, [listings, query, city, propertyType, priceRangeIdx, sortBy])

  return (
    <div>
      <ScrollToHash />

      {/* ── SEARCH & FILTER */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari rumah, lokasi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[140px]">
            <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[140px]">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[140px]">
            <DollarSign
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={priceRangeIdx}
              onChange={(e) => setPriceRangeIdx(Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            >
              {PRICE_RANGES.map((r, i) => (
                <option key={r.label} value={i}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[140px]">
            <ArrowUpDown
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-gray-500 mb-6 text-sm">{filtered.length} rumah ditemukan</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Tidak ada properti yang cocok dengan pencarian.
        </div>
      )}
    </div>
  )
}
