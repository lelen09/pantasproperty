'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getFavoriteListingIds, getFavoriteServiceIds } from '@/lib/favorites'
import ListingCard from '@/components/ListingCard'
import ServiceCard from '@/components/ServiceCard'
import Navbar from '@/components/Navbar'
import type { Listing, Service } from '@/lib/types'
import { Heart } from 'lucide-react'

export default function FavoritPage() {
  const supabase = createClient()
  const [listings, setListings] = useState<Listing[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(profile?.role === 'admin')
      }

      const listingIds = getFavoriteListingIds()
      const serviceIds = getFavoriteServiceIds()

      if (listingIds.length > 0) {
        const { data } = await supabase
          .from('listings')
          .select('*, profiles(id, full_name, phone_whatsapp, avatar_url, agent_badge), listing_media(*)')
          .in('id', listingIds)
        setListings((data as Listing[]) || [])
      }

      if (serviceIds.length > 0) {
        const { data } = await supabase
          .from('services')
          .select('*, profiles(id, full_name, phone_whatsapp, avatar_url, agent_badge), service_media(*)')
          .in('id', serviceIds)
        setServices((data as Service[]) || [])
      }

      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Heart className="fill-red-500 text-red-500" size={28} /> Favorit Saya
          </h1>
          <p className="text-gray-500 mb-8">
            Tersimpan di perangkat ini saja. {listings.length + services.length} item favorit.
          </p>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Memuat...</div>
          ) : listings.length === 0 && services.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              Belum ada favorit. Tap ikon ❤️ di listing atau jasa untuk menyimpannya.
            </div>
          ) : (
            <>
              {listings.length > 0 && (
                <div className="mb-10">
                  <h2 className="font-semibold text-gray-700 mb-4">🏠 Properti Favorit</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((l) => (
                      <ListingCard key={l.id} listing={l} />
                    ))}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-700 mb-4">🔨 Jasa Favorit</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s) => (
                      <ServiceCard key={s.id} service={s} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
