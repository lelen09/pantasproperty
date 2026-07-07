'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Profile } from '@/lib/types'

const PLAN_LABEL: Record<string, string> = {
  free: 'Gratis',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

const BADGE_LABEL: Record<string, string> = {
  none: 'Tidak ada',
  verified: '✔️ Terverifikasi',
  top_agent: '⭐ Top Agent',
  super_agent: '🏆 Super Agent',
}

export default function AgentPlanEditor({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState(profile.plan)
  const [badge, setBadge] = useState(profile.agent_badge)
  const [maxListings, setMaxListings] = useState(String(profile.max_listings))
  const [maxPhotos, setMaxPhotos] = useState(String(profile.max_photos_per_listing))

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        plan,
        agent_badge: badge,
        max_listings: parseInt(maxListings) || 0,
        max_photos_per_listing: parseInt(maxPhotos) || 0,
      })
      .eq('id', profile.id)

    if (error) {
      toast.error('Gagal menyimpan pengaturan')
    } else {
      toast.success('Pengaturan agent disimpan')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="border-t border-gray-100 mt-2 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-navy-600 transition"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Kelola Paket & Badge — saat ini:{' '}
        <span className="font-semibold">{PLAN_LABEL[profile.plan]}</span>
        {profile.agent_badge !== 'none' && ` · ${BADGE_LABEL[profile.agent_badge]}`}
      </button>

      {open && (
        <div className="mt-3 space-y-3 bg-gray-50 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Paket</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as Profile['plan'])}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              >
                {Object.entries(PLAN_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Badge</label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value as Profile['agent_badge'])}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
              >
                {Object.entries(BADGE_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Maks. Listing</label>
              <input
                type="number"
                min="0"
                value={maxListings}
                onChange={(e) => setMaxListings(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Maks. Foto/Listing</label>
              <input
                type="number"
                min="0"
                value={maxPhotos}
                onChange={(e) => setMaxPhotos(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 bg-navy-600 hover:bg-navy-700 disabled:bg-navy-300 text-white text-sm font-semibold rounded-lg transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      )}
    </div>
  )
}
