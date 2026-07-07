'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Camera, User } from 'lucide-react'
import type { Profile } from '@/lib/types'
import ImageCropModal from '@/components/ImageCropModal'

export default function ProfileForm({
  profile,
  email,
}: {
  profile: Profile | null
  email: string
}) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone_whatsapp || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // ── Langkah 1: file dipilih, buka modal crop dulu (belum upload)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // supaya bisa pilih file yang sama lagi kalau mau ulang
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB')
      return
    }

    setCropSrc(URL.createObjectURL(file))
  }

  // ── Langkah 2: setelah crop dikonfirmasi, baru upload hasilnya
  const handleCropComplete = async (blob: Blob) => {
    setCropSrc(null)
    setUploadingAvatar(true)
    const toastId = toast.loading('Mengupload foto...')

    try {
      const fileName = `avatar-${Date.now()}.jpg`
      const path = `${profile!.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile!.id)
      if (updateError) throw updateError

      // Bersihkan avatar lama agar tidak menumpuk di storage
      const { data: oldFiles } = await supabase.storage.from('avatars').list(profile!.id)
      if (oldFiles && oldFiles.length > 0) {
        const staleFiles = oldFiles
          .filter((f) => f.name !== fileName)
          .map((f) => `${profile!.id}/${f.name}`)
        if (staleFiles.length > 0) {
          await supabase.storage.from('avatars').remove(staleFiles)
        }
      }

      setAvatarUrl(publicUrl)
      toast.success('Foto profil berhasil diperbarui', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Gagal upload foto', { id: toastId })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone_whatsapp: phone })
      .eq('id', profile!.id)

    if (error) {
      toast.error('Gagal menyimpan profil')
    } else {
      toast.success('Profil berhasil disimpan')
    }
    setSaving(false)
  }

  return (
    <form
      onSubmit={handleSave}
      className="max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
    >
      {/* ── FOTO PROFIL */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-gray-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-gray-300" />
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 bg-navy-600 hover:bg-navy-700 text-white p-2 rounded-full shadow-md transition disabled:bg-navy-300"
            title="Ganti foto"
          >
            <Camera size={14} />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <p className="text-xs text-gray-400">
          {uploadingAvatar ? 'Mengupload...' : 'Foto ini akan tampil ke customer'}
        </p>
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          value={email}
          disabled
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">No. WhatsApp</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="628xxxxxxxxx"
          required
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Format: 628xxxxxxxxx (dengan kode negara, tanpa tanda + atau spasi)
        </p>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition disabled:bg-navy-300"
      >
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  )
}
