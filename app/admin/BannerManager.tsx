'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, Trash2, Upload } from 'lucide-react'
import type { Banner } from '@/lib/types'

function formatRupiah(angka: number) {
  return `Rp ${angka.toLocaleString('id-ID')}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function plusDaysStr(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function BannerManager({ banners }: { banners: Banner[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [advertiserName, setAdvertiserName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [position, setPosition] = useState<'home' | 'renovasi'>('home')
  const [price, setPrice] = useState('')
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState(plusDaysStr(30))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const resetForm = () => {
    setAdvertiserName('')
    setLinkUrl('')
    setPosition('home')
    setPrice('')
    setStartDate(todayStr())
    setEndDate(plusDaysStr(30))
    setFile(null)
    setPreview(null)
    setShowForm(false)
  }

  const handleCreate = async () => {
    if (!advertiserName || !file) {
      toast.error('Nama pengiklan dan gambar banner wajib diisi')
      return
    }
    setBusy(true)
    const toastId = toast.loading('Mengupload banner...')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Belum login')

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('banner-images')
        .upload(path, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('banner-images').getPublicUrl(path)

      const { error } = await supabase.from('banners').insert({
        advertiser_name: advertiserName,
        image_url: publicUrl,
        storage_path: path,
        link_url: linkUrl || null,
        position,
        price: parseInt(price) || 0,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate + 'T23:59:59').toISOString(),
        is_active: true,
      })
      if (error) throw error

      toast.success('Banner berhasil ditambahkan', { id: toastId })
      resetForm()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambah banner', { id: toastId })
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (banner: Banner) => {
    setBusy(true)
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id)
    if (error) {
      toast.error('Gagal mengubah status banner')
    } else {
      toast.success(banner.is_active ? 'Banner dinonaktifkan' : 'Banner diaktifkan')
      router.refresh()
    }
    setBusy(false)
  }

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Hapus banner "${banner.advertiser_name}"?`)) return
    setBusy(true)
    try {
      await supabase.storage.from('banner-images').remove([banner.storage_path])
      const { error } = await supabase.from('banners').delete().eq('id', banner.id)
      if (error) throw error
      toast.success('Banner dihapus')
      router.refresh()
    } catch {
      toast.error('Gagal menghapus banner')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-navy-600 transition"
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        📢 Kelola Iklan Banner
        <span className="text-xs text-gray-400 font-normal">({banners.length})</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {banners.map((banner) => {
            const isExpired = new Date(banner.end_date) < new Date()
            return (
              <div key={banner.id} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                <img
                  src={banner.image_url}
                  alt={banner.advertiser_name}
                  className="w-20 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {banner.advertiser_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {banner.position === 'home' ? 'Halaman Properti' : 'Halaman Renovasi'} ·{' '}
                    {formatRupiah(banner.price)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(banner.start_date).toLocaleDateString('id-ID')} -{' '}
                    {new Date(banner.end_date).toLocaleDateString('id-ID')}
                    {isExpired && <span className="text-red-500 ml-1">(kedaluwarsa)</span>}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => toggleActive(banner)}
                      disabled={busy}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition disabled:opacity-50 ${
                        banner.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {banner.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      onClick={() => handleDelete(banner)}
                      disabled={busy}
                      className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {banners.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Belum ada banner.</p>
          )}

          {showForm ? (
            <div className="bg-gray-50 rounded-xl p-3 space-y-3">
              {preview ? (
                <img src={preview} alt="" className="w-full h-24 object-cover rounded-lg" />
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 flex items-center justify-center gap-2"
                >
                  <Upload size={16} /> Pilih Gambar Banner
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

              <input
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="Nama pengiklan (misal: Bank XYZ)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
              />
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Link tujuan (opsional)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as 'home' | 'renovasi')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none bg-white"
                >
                  <option value="home">Halaman Properti</option>
                  <option value="renovasi">Halaman Renovasi</option>
                </select>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Harga (Rp)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={busy}
                  className="flex-1 py-2 bg-navy-600 hover:bg-navy-700 disabled:bg-navy-300 text-white text-sm font-semibold rounded-lg transition"
                >
                  {busy ? 'Menyimpan...' : 'Simpan Banner'}
                </button>
                <button
                  onClick={resetForm}
                  disabled={busy}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              + Tambah Banner Baru
            </button>
          )}
        </div>
      )}
    </div>
  )
}
