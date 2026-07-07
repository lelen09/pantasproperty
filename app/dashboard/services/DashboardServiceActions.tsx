'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const STATUS_LABEL: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
}

export default function DashboardServiceActions({
  serviceId,
  status,
}: {
  serviceId: string
  status: 'active' | 'inactive'
}) {
  const supabase = createClient()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const changeStatus = async (newStatus: string) => {
    if (newStatus === status) return
    setBusy(true)
    const { error } = await supabase
      .from('services')
      .update({ status: newStatus })
      .eq('id', serviceId)
    if (error) {
      toast.error('Gagal mengubah status')
    } else {
      toast.success(`Status diubah menjadi ${STATUS_LABEL[newStatus]}`)
      router.refresh()
    }
    setBusy(false)
  }

  const handleDelete = async () => {
    if (!confirm('Hapus jasa ini? Tindakan ini tidak bisa dibatalkan.')) return
    setBusy(true)
    try {
      const { data: mediaList } = await supabase
        .from('service_media')
        .select('storage_path')
        .eq('service_id', serviceId)

      if (mediaList && mediaList.length > 0) {
        const paths = mediaList.map((m) => m.storage_path)
        await supabase.storage.from('service-photos').remove(paths)
      }

      const { error } = await supabase.from('services').delete().eq('id', serviceId)
      if (error) throw error
      toast.success('Jasa dihapus')
      router.refresh()
    } catch (err: any) {
      toast.error('Gagal menghapus jasa')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <select
        value={status}
        disabled={busy}
        onChange={(e) => changeStatus(e.target.value)}
        className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 disabled:opacity-50 outline-none focus:ring-2 focus:ring-navy-500"
      >
        <option value="active">Aktif</option>
        <option value="inactive">Nonaktif</option>
      </select>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        title="Hapus"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
