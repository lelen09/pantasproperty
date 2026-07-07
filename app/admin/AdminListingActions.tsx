'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Rocket } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const STATUS_LABEL: Record<string, string> = {
  active: 'Aktif',
  sold: 'Terjual',
  inactive: 'Nonaktif',
}

export default function AdminListingActions({
  listingId,
  status,
  boostedUntil,
}: {
  listingId: string
  status: 'active' | 'sold' | 'inactive'
  boostedUntil: string | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const isBoosted = boostedUntil && new Date(boostedUntil) > new Date()

  const changeStatus = async (newStatus: string) => {
    if (newStatus === status) return
    setBusy(true)
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listingId)
    if (error) {
      toast.error('Gagal mengubah status')
    } else {
      toast.success(`Status diubah menjadi ${STATUS_LABEL[newStatus]}`)
      router.refresh()
    }
    setBusy(false)
  }

  const handleBoost = async (days: number) => {
    setBusy(true)
    const until =
      days === 0 ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await supabase
      .from('listings')
      .update({ boosted_until: until })
      .eq('id', listingId)
    if (error) {
      toast.error('Gagal mengatur boost')
    } else {
      toast.success(days === 0 ? 'Boost dibatalkan' : `Listing di-boost ${days} hari`)
      router.refresh()
    }
    setBusy(false)
  }

  const handleDelete = async () => {
    if (!confirm('Hapus listing ini sebagai admin?')) return
    setBusy(true)
    try {
      const { data: mediaList } = await supabase
        .from('listing_media')
        .select('storage_path, type')
        .eq('listing_id', listingId)

      if (mediaList && mediaList.length > 0) {
        const photoPaths = mediaList.filter((m) => m.type === 'photo').map((m) => m.storage_path)
        const videoPaths = mediaList.filter((m) => m.type === 'video').map((m) => m.storage_path)
        if (photoPaths.length > 0) {
          await supabase.storage.from('listing-photos').remove(photoPaths)
        }
        if (videoPaths.length > 0) {
          await supabase.storage.from('listing-videos').remove(videoPaths)
        }
      }

      const { error } = await supabase.from('listings').delete().eq('id', listingId)
      if (error) throw error
      toast.success('Listing dihapus')
      router.refresh()
    } catch (err: any) {
      toast.error('Gagal menghapus listing')
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
        <option value="sold">Terjual</option>
        <option value="inactive">Nonaktif</option>
      </select>
      <select
        value={isBoosted ? 'boosted' : 'none'}
        disabled={busy}
        onChange={(e) => {
          if (e.target.value === '7') handleBoost(7)
          else if (e.target.value === '30') handleBoost(30)
          else handleBoost(0)
        }}
        className={`text-xs font-medium border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-navy-500 disabled:opacity-50 ${
          isBoosted ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600'
        }`}
        title="Boost listing ke urutan atas"
      >
        <option value="none">🚀 Tidak boost</option>
        <option value="7">🚀 Boost 7 hari</option>
        <option value="30">🚀 Boost 30 hari</option>
        {isBoosted && <option value="boosted">🚀 Aktif sampai {new Date(boostedUntil!).toLocaleDateString('id-ID')}</option>}
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
