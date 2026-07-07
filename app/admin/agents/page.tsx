import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'
import AgentRoleToggle from './AgentRoleToggle'

export default async function AdminAgentsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Agent</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {(profiles as Profile[] | null)?.map((profile) => (
          <div key={profile.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-gray-800">{profile.full_name}</p>
              <p className="text-sm text-gray-500">{profile.phone_whatsapp}</p>
            </div>
            <AgentRoleToggle profileId={profile.id} role={profile.role} />
          </div>
        ))}
        {(!profiles || profiles.length === 0) && (
          <p className="text-center text-gray-400 py-12">Belum ada agent terdaftar.</p>
        )}
      </div>
    </div>
  )
}
