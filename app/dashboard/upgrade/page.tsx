import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Plan, UpgradeRequest } from '@/lib/types'
import PlanCard from './PlanCard'
import { Landmark, QrCode } from 'lucide-react'

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default async function UpgradePlanPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('plan, full_name')
    .eq('id', user!.id)
    .single()

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('phone_whatsapp, bank_name, bank_account_number, bank_account_holder, qris_image_url')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()

  const { data: myRequests } = await supabase
    .from('upgrade_requests')
    .select('plan_id, status')
    .eq('agent_id', user!.id)
    .order('created_at', { ascending: false })

  const adminWaNumber = adminProfile?.phone_whatsapp?.replace(/\D/g, '')

  const getPendingStatus = (planId: string) => {
    const req = (myRequests as { plan_id: string; status: string }[] | null)?.find(
      (r) => r.plan_id === planId
    )
    return (req?.status as 'pending' | 'approved' | 'rejected' | undefined) || null
  }

  const hasBankInfo = adminProfile?.bank_name && adminProfile?.bank_account_number

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Upgrade Paket</h1>
      <p className="text-gray-500 text-sm mb-6">
        Paket kamu saat ini:{' '}
        <span className="font-semibold capitalize">{myProfile?.plan || 'free'}</span>
      </p>

      {(hasBankInfo || adminProfile?.qris_image_url) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Cara Pembayaran</h2>
          <div className="flex flex-wrap gap-6">
            {hasBankInfo && (
              <div className="flex items-start gap-3">
                <Landmark size={20} className="text-navy-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">{adminProfile?.bank_name}</p>
                  <p className="text-gray-600">{adminProfile?.bank_account_number}</p>
                  <p className="text-gray-400 text-xs">a.n. {adminProfile?.bank_account_holder}</p>
                </div>
              </div>
            )}
            {adminProfile?.qris_image_url && (
              <div className="flex items-start gap-3">
                <QrCode size={20} className="text-navy-600 shrink-0 mt-0.5" />
                <img
                  src={adminProfile.qris_image_url}
                  alt="QRIS"
                  className="w-32 h-32 object-contain rounded-lg border border-gray-100"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Transfer sesuai harga paket, lalu tap "Saya Sudah Transfer" di paket pilihanmu dan
            upload screenshot bukti transfer.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(plans as Plan[] | null)?.map((plan) => {
          const isCurrent = plan.id === myProfile?.plan
          const message = encodeURIComponent(
            `Halo Admin, saya ${myProfile?.full_name || ''} mau tanya soal paket ${plan.name} (${formatRupiah(plan.price)}/bulan).`
          )
          const waLink = adminWaNumber ? `https://wa.me/${adminWaNumber}?text=${message}` : null

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={isCurrent}
              waLink={waLink}
              pendingStatus={getPendingStatus(plan.id)}
            />
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Setelah bukti transfer dikirim, admin akan memverifikasi dan mengaktifkan paket kamu
        secara manual. Proses biasanya memakan waktu beberapa jam.
      </p>
    </div>
  )
}
