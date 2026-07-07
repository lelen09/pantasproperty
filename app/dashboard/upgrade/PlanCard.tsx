'use client'

import { useState } from 'react'
import { Check, Clock, CheckCircle2 } from 'lucide-react'
import UpgradeRequestForm from './UpgradeRequestForm'
import type { Plan } from '@/lib/types'

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`
}

export default function PlanCard({
  plan,
  isCurrent,
  waLink,
  pendingStatus,
}: {
  plan: Plan
  isCurrent: boolean
  waLink: string | null
  pendingStatus: 'pending' | 'approved' | 'rejected' | null
}) {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <div
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

      {plan.features && <p className="text-xs text-gray-400 mb-4">{plan.features}</p>}

      {isCurrent ? (
        <div className="w-full py-2.5 bg-gray-100 text-gray-400 text-center rounded-xl text-sm font-semibold">
          Sedang Digunakan
        </div>
      ) : submitted || pendingStatus === 'pending' ? (
        <div className="w-full py-2.5 bg-amber-50 text-amber-700 text-center rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
          <Clock size={14} /> Menunggu Konfirmasi Admin
        </div>
      ) : pendingStatus === 'approved' ? (
        <div className="w-full py-2.5 bg-green-50 text-green-700 text-center rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle2 size={14} /> Disetujui
        </div>
      ) : showForm ? (
        <UpgradeRequestForm
          planId={plan.id}
          planName={plan.name}
          onDone={() => {
            setSubmitted(true)
            setShowForm(false)
          }}
        />
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="block w-full py-2.5 bg-navy-600 hover:bg-navy-700 text-white text-center rounded-xl text-sm font-semibold transition"
          >
            Saya Sudah Transfer
          </button>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 text-navy-600 text-center rounded-xl text-xs font-medium hover:underline"
            >
              atau tanya dulu via WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  )
}
