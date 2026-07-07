'use client'

import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/types'

export default function WaContactButton({ listing }: { listing: Listing }) {
  const supabase = createClient()
  const agent = listing.profiles
  const waNumber = agent?.phone_whatsapp?.replace(/\D/g, '')
  const waMessage = encodeURIComponent(
    `Halo ${agent?.full_name}, saya tertarik dengan properti "${listing.title}" yang Anda tawarkan. Boleh info lebih lanjut?`
  )
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

  const handleClick = () => {
    supabase
      .from('leads')
      .insert({ agent_id: listing.agent_id, listing_id: listing.id, source: 'listing' })
      .then(() => {})
  }

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-xl transition shadow-sm shadow-green-200"
    >
      <MessageCircle size={18} />
      Chat di WhatsApp
    </a>
  )
}
