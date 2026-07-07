'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import type { UpgradeRequest } from '@/lib/types'

export default function UpgradeRequestsPanel({ requests }: { requests: UpgradeRequest[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  // Bucket "payment-proofs" sekarang private, jadi URL publik lama tidak
  // berlaku lagi — kita generate signed URL sementara (1 jam) per request.
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  const pending = requests.filter((r) => r.status === 'pending')

  useEffect(() => {
    const loadSignedUrls = async () => {
      const entries = await Promise.all(
        pending
          .filter((r) => r.proof_storage_path)
          .map(async (r) => {
            const { data } = await supabase.storage
              .from('payment-proofs')
              .createSignedUrl(r.proof_storage_path as string, 60 * 60)
            return [r.id, data?.signedUrl || ''] as const
          })
      )
      setSignedUrls(Object.fromEntries(entries))
    }
    if (pending.length > 0) loadSignedUrls()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests])

  const handleApprove = async (req: UpgradeRequest) => {
    setBusyId(req.id)
    try {
      // Ambil detail limit dari paket yang diminta
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', req.plan_id)
        .single()
      if (planError || !plan) throw new Error('Paket tidak ditemukan')

      // Aktifkan paket ke profil agent
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: plan.id,
          max_listings: plan.max_listings,
          max_photos_per_listing: plan.max_photos_per_listing,
          max_video_seconds: plan.max_video_seconds,
        })
        .eq('id', req.agent_id)
      if (profileError) throw profileError

      // Tandai request selesai
      const { error: reqError } = await supabase
        .from('upgrade_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', req.id)
      if (reqError) throw reqError

      toast.success(`Paket ${plan.name} berhasil diaktifkan untuk agent ini`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Gagal approve permintaan')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (req: UpgradeRequest) => {
    setBusyId(req.id)
    const { error } = await supabase
      .from('upgrade_requests')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', req.id)

    if (error) {
      toast.error('Gagal menolak permintaan')
    } else {
      toast.success('Permintaan ditolak')
      router.refresh()
    }
    setBusyId(null)
  }

  if (pending.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-navy-600 transition"
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        🧾 Permintaan Upgrade Paket
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {pending.length}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {pending.map((req) => (
            <div key={req.id} className="bg-gray-50 rounded-xl p-3 flex gap-3">
              {signedUrls[req.id] && (
                <a href={signedUrls[req.id]} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <img
                    src={signedUrls[req.id]}
                    alt="Bukti transfer"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                </a>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">
                  {req.profiles?.full_name || 'Agent'}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Minta paket <span className="font-semibold capitalize">{req.plan_id}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req)}
                    disabled={busyId === req.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <Check size={12} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    disabled={busyId === req.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 text-xs font-semibold rounded-lg transition"
                  >
                    <X size={12} /> Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
