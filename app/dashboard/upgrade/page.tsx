import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Plan, Profile } from '@/lib/types'
import { Check } from 'lucide-react'

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
    .select('phone_whatsapp')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()

  const adminWaNumber = adminProfile?.phone_whatsapp?.replace(/\D/g, '')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Upgrade Paket</h1>
      <p className="text-gray-500 text-sm mb-6">
        Paket kamu saat ini: <span className="font-semibold capitalize">{myProfile?.plan || 'free'}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(plans as Plan[] | null)?.map((plan) => {
          const isCurrent = plan.id === myProfile?.plan
          const message = encodeURIComponent(
            `Halo Admin, saya ${myProfile?.full_name || ''} ingin upgrade ke paket ${plan.name} (${formatRupiah(plan.price)}/bulan).`
          )
          const waLink = adminWaNumber ? `https://wa.me/${adminWaNumber}?text=${message}` : null

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm relative ${
                isCurrent ? 'border-navy-500 ring-2 ring-navy-100' : 'border-gray-100'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-4 bg-navy-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Paket Aktif
                </span>
              )}
              <h2 className="font-bold text-lg text-gray-800 capitalize mb-1">{plan.name}</h2>
              <p className="text-2xl font-bold text-gold-600 mb-3">
                {plan.price === 0 ? 'Gratis' : formatRupiah(plan.price)}
                {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/bulan</span>}
              </p>

              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-navy-600 shrink-0" />
                  {plan.max_listings === -1 ? 'Unlimited listing' : `${plan.max_listings} listing`}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-navy-600 shrink-0" />
                  {plan.max_photos_per_listing === -1
                    ? 'Unlimited foto'
                    : `${plan.max_photos_per_listing} foto`}{' '}
                  per listing
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-navy-600 shrink-0" />
                  Video {plan.max_video_seconds === -1 ? 'unlimited' : `${plan.max_video_seconds} detik`}
                </li>
              </ul>

              {plan.features && (
                <p className="text-xs text-gray-400 mb-4">{plan.features}</p>
              )}

              {isCurrent ? (
                <div className="w-full py-2.5 bg-gray-100 text-gray-400 text-center rounded-xl text-sm font-semibold">
                  Sedang Digunakan
                </div>
              ) : waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-navy-600 hover:bg-navy-700 text-white text-center rounded-xl text-sm font-semibold transition"
                >
                  Pilih Paket Ini
                </a>
              ) : (
                <div className="w-full py-2.5 bg-gray-100 text-gray-400 text-center rounded-xl text-sm">
                  Hubungi admin langsung
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Pembayaran saat ini dilakukan manual via transfer — admin akan memproses upgrade setelah
        konfirmasi lewat WhatsApp.
      </p>
    </div>
  )
}
