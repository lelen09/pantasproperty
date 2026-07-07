import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Profile, Plan, UpgradeRequest } from '@/lib/types'
import AgentRoleToggle from './agents/AgentRoleToggle'
import AgentPlanEditor from './agents/AgentPlanEditor'
import PlanPricingEditor from './PlanPricingEditor'
import UpgradeRequestsPanel from './UpgradeRequestsPanel'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: upgradeRequests } = await supabase
    .from('upgrade_requests')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Kelola Agent</h1>
      <p className="text-gray-500 text-sm mb-6">{profiles?.length || 0} agent terdaftar</p>

      {upgradeRequests && upgradeRequests.length > 0 && (
        <UpgradeRequestsPanel requests={upgradeRequests as UpgradeRequest[]} />
      )}

      {plans && plans.length > 0 && <PlanPricingEditor plans={plans as Plan[]} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {(profiles as Profile[] | null)?.map((profile) => (
          <div key={profile.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{profile.full_name}</p>
                <p className="text-sm text-gray-500">{profile.phone_whatsapp}</p>
              </div>
              <AgentRoleToggle profileId={profile.id} role={profile.role} />
            </div>
            <AgentPlanEditor profile={profile} />
          </div>
        ))}
        {(!profiles || profiles.length === 0) && (
          <p className="text-center text-gray-400 py-12">Belum ada agent terdaftar.</p>
        )}
      </div>
    </div>
  )
}
