import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Profile, Plan, UpgradeRequest, Banner } from '@/lib/types'
import AgentRoleToggle from './agents/AgentRoleToggle'
import AgentPlanEditor from './agents/AgentPlanEditor'
import PlanPricingEditor from './PlanPricingEditor'
import UpgradeRequestsPanel from './UpgradeRequestsPanel'
import BannerManager from './BannerManager'
import AdminStats, { type AdminStatsData } from './AdminStats'

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

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false })

  // ── Statistik ringkas
  const totalAgents = profiles?.filter((p) => p.role === 'agent').length || 0

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: totalServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: allLeads } = await supabase
    .from('leads')
    .select('created_at, listing_id, listings(title)')

  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const leadsThisWeek =
    allLeads?.filter((l) => now - new Date(l.created_at).getTime() < weekMs).length || 0
  const leadsLastWeek =
    allLeads?.filter((l) => {
      const age = now - new Date(l.created_at).getTime()
      return age >= weekMs && age < weekMs * 2
    }).length || 0

  const leadCountByListing = new Map<string, { title: string; count: number }>()
  allLeads
    ?.filter((l) => l.listing_id)
    .forEach((l: any) => {
      const key = l.listing_id
      const title = l.listings?.title || 'Listing'
      const existing = leadCountByListing.get(key)
      leadCountByListing.set(key, { title, count: (existing?.count || 0) + 1 })
    })
  const topListings = Array.from(leadCountByListing.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const statsData: AdminStatsData = {
    totalAgents,
    totalListings: totalListings || 0,
    totalServices: totalServices || 0,
    totalLeadsAllTime: allLeads?.length || 0,
    leadsThisWeek,
    leadsLastWeek,
    topListings,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Kelola Agent</h1>
      <p className="text-gray-500 text-sm mb-6">{profiles?.length || 0} agent terdaftar</p>

      <AdminStats stats={statsData} />

      {upgradeRequests && upgradeRequests.length > 0 && (
        <UpgradeRequestsPanel requests={upgradeRequests as UpgradeRequest[]} />
      )}

      {plans && plans.length > 0 && <PlanPricingEditor plans={plans as Plan[]} />}

      <BannerManager banners={(banners as Banner[]) || []} />

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
