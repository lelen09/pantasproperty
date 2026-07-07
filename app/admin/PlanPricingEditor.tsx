'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Plan } from '@/lib/types'

export default function PlanPricingEditor({ plans }: { plans: Plan[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, { price: string; features: string }>>(
    Object.fromEntries(
      plans.map((p) => [p.id, { price: String(p.price), features: p.features || '' }])
    )
  )

  const handleSave = async (planId: string) => {
    setSaving(planId)
    const { error } = await supabase
      .from('plans')
      .update({
        price: parseInt(values[planId].price) || 0,
        features: values[planId].features,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)

    if (error) {
      toast.error('Gagal menyimpan harga paket')
    } else {
      toast.success(`Harga paket ${planId} disimpan`)
      router.refresh()
    }
    setSaving(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-navy-600 transition"
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        💰 Kelola Harga Paket
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-gray-50 rounded-xl p-3">
              <p className="font-medium text-gray-800 capitalize mb-2">{plan.name}</p>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Harga per bulan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={values[plan.id].price}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [plan.id]: { ...prev[plan.id], price: e.target.value },
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Deskripsi singkat</label>
                  <input
                    value={values[plan.id].features}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [plan.id]: { ...prev[plan.id], features: e.target.value },
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => handleSave(plan.id)}
                disabled={saving === plan.id}
                className="mt-2 w-full py-2 bg-navy-600 hover:bg-navy-700 disabled:bg-navy-300 text-white text-sm font-semibold rounded-lg transition"
              >
                {saving === plan.id ? 'Menyimpan...' : `Simpan Paket ${plan.name}`}
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400">
            Catatan: limit listing/foto/video tiap agent tetap diatur per-agent di bawah, terpisah
            dari harga ini.
          </p>
        </div>
      )}
    </div>
  )
}
