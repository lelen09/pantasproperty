'use client'

import { useMemo, useState } from 'react'
import { Search, MapPin, Tag } from 'lucide-react'
import ServiceCard from './ServiceCard'
import ScrollToHash from './ScrollToHash'
import RenovationCalculator from './RenovationCalculator'
import type { Service } from '@/lib/types'

export default function ServiceBrowser({ services }: { services: Service[] }) {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('Semua Kota')
  const [category, setCategory] = useState('Semua Kategori')

  const cities = useMemo(() => {
    const unique = Array.from(new Set(services.map((s) => s.city)))
    return ['Semua Kota', ...unique]
  }, [services])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map((s) => s.category)))
    return ['Semua Kategori', ...unique]
  }, [services])

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchQuery =
        query.trim() === '' ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.city.toLowerCase().includes(query.toLowerCase())
      const matchCity = city === 'Semua Kota' || s.city === city
      const matchCategory = category === 'Semua Kategori' || s.category === category
      return matchQuery && matchCity && matchCategory
    })
  }, [services, query, city, category])

  return (
    <div>
      <ScrollToHash />

      <RenovationCalculator />

      {/* ── SEARCH & FILTER */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jasa, lokasi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
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
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-gray-500 mb-6 text-sm">{filtered.length} jasa ditemukan</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Tidak ada jasa yang cocok dengan pencarian.
        </div>
      )}
    </div>
  )
}
