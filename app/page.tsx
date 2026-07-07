import { createServerSupabaseClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import Navbar from '@/components/Navbar'
import type { Listing } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const { data: listings } = await supabase
    .from('listings')
    .select(
      `
      *,
      profiles (id, full_name, phone_whatsapp),
      listing_media (*)
    `
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar isLoggedIn={!!user} isAdmin={isAdmin} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏠 Properti Pilihan
          </h1>
          <p className="text-gray-500 mb-8">
            {listings?.length || 0} rumah tersedia
          </p>

          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(listings as Listing[]).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              Belum ada listing yang tersedia.
            </div>
          )}
        </div>
      </main>
    </>
  )
}
