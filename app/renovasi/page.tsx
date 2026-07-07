import { createServerSupabaseClient } from '@/lib/supabase/server'
import ServiceBrowser from '@/components/ServiceBrowser'
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
      profiles (id, full_name, phone_whatsapp, avatar_url, agent_badge),
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

          <ServiceBrowser services={(services as Service[]) || []} />
        </div>
      </main>
    </>
  )
}
