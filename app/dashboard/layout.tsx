import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // FIX: sebelumnya isAdmin tidak pernah dicek/dikirim ke Navbar, jadi
  // menu "Admin" tidak pernah muncul walau role user sudah admin di database.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (
    <>
      <Navbar isLoggedIn isAdmin={profile?.role === 'admin'} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>
    </>
  )
}
