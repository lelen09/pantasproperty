import { createServerSupabaseClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
        {profile?.role === 'agent' && (
          <Link
            href="/dashboard/upgrade"
            className="flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline"
          >
            <Sparkles size={15} /> Lihat Paket & Upgrade
          </Link>
        )}
      </div>
      <ProfileForm profile={profile} email={user!.email!} />
    </div>
  )
}
