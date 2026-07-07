'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'

export default function UpgradeRequestForm({
  planId,
  planName,
  onDone,
}: {
  planId: string
  planName: string
  onDone: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Upload dulu screenshot bukti transfer')
      return
    }
    setSubmitting(true)
    const toastId = toast.loading('Mengirim bukti transfer...')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Belum login')

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(path, file)
      if (uploadError) throw uploadError

      // Catatan: bucket "payment-proofs" sekarang private (bukan public),
      // jadi kita tidak simpan public URL lagi (tidak akan bisa diakses).
      // Admin akan generate signed URL saat review lewat proof_storage_path.
      const { error } = await supabase.from('upgrade_requests').insert({
        agent_id: user.id,
        plan_id: planId,
        proof_storage_path: path,
      })
      if (error) throw error

      toast.success('Bukti transfer terkirim! Menunggu konfirmasi admin.', { id: toastId })
      onDone()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim bukti transfer', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-3">
      <p className="text-xs text-gray-600">
        Upload screenshot bukti transfer untuk paket <strong>{planName}</strong>
      </p>

      {preview ? (
        <img src={preview} alt="Bukti transfer" className="w-full max-h-48 object-contain rounded-lg border border-gray-200" />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <Upload size={16} /> Pilih Screenshot
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !file}
        className="w-full py-2.5 bg-navy-600 hover:bg-navy-700 disabled:bg-navy-300 text-white text-sm font-semibold rounded-xl transition"
      >
        {submitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
      </button>
    </div>
  )
}
