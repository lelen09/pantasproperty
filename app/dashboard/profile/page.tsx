import { createServerSupabaseClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>
      <ProfileForm profile={profile} email={user!.email!} />
    </div>
  )
}
