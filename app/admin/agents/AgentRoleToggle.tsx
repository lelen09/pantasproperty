'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AgentRoleToggle({
  profileId,
  role,
}: {
  profileId: string
  role: 'admin' | 'agent'
}) {
  const supabase = createClient()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const toggleRole = async () => {
    setBusy(true)
    const newRole = role === 'admin' ? 'agent' : 'admin'
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)

    if (error) {
      toast.error('Gagal mengubah role')
    } else {
      toast.success(`Role diubah menjadi ${newRole}`)
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <button
      onClick={toggleRole}
      disabled={busy}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition disabled:opacity-50 ${
        role === 'admin'
          ? 'bg-gray-800 text-white hover:bg-gray-900'
          : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
      }`}
    >
      {role === 'admin' ? 'Admin' : 'Agent'} · ubah
    </button>
  )
}
