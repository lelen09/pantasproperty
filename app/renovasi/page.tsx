import { createServerSupabaseClient } from '@/lib/supabase/server'
import ServiceCard from '@/components/ServiceCard'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Service } from '@/lib/types'

export default async function RenovasiPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const { data: services } = await supabase
    .from('services')
    .select(
      `
      *,
      profiles (id, full_name, phone_whatsapp, avatar_url),
      service_media (*)
    `
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar isLoggedIn={!!user} isAdmin={isAdmin} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Properti / Jasa Renovasi */}
          <div className="flex gap-2 mb-6">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
            >
              🏠 Properti
            </Link>
            <Link
              href="/renovasi"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-navy-600 text-white"
            >
              🔨 Jasa Renovasi
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔨 Jasa Renovasi</h1>
          <p className="text-gray-500 mb-8">{services?.length || 0} jasa tersedia</p>

          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(services as Service[]).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              Belum ada jasa renovasi yang tersedia.
            </div>
          )}
        </div>
      </main>
    </>
  )
}
