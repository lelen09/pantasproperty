'use client'
// components/ServiceForm.tsx
// Form tambah/edit jasa renovasi — termasuk upload foto before/after

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Hammer, MapPin, Upload, X, FileText, Tag, Video } from 'lucide-react'

const CATEGORIES = [
  'Renovasi Total',
  'Cat Ulang',
  'Renovasi Dapur',
  'Renovasi Kamar Mandi',
  'Perbaikan Atap',
  'Renovasi Fasad',
  'Lainnya',
]

type FormData = {
  title: string
  category: string
  description: string
  price_min: string
  price_max: string
  city: string
}

type MediaPreview = {
  file: File
  url: string
  type: 'before' | 'after' | 'portfolio' | 'video'
}

export default function ServiceForm({
  onSuccess,
  serviceId,
  defaultValues,
}: {
  onSuccess?: () => void
  /** Jika diisi, form akan mengupdate jasa yang sudah ada (mode edit) */
  serviceId?: string
  defaultValues?: Partial<FormData>
}) {
  const supabase = createClient()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ defaultValues })
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleAddPhoto = (type: 'before' | 'after' | 'portfolio') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || [])
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type,
    }))
    setMediaFiles((prev) => [...prev, ...previews])
    e.target.value = ''
  }

  // ── Upload video (max ~150MB untuk 2 menit)
  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 150 * 1024 * 1024) {
      toast.error('Video maksimal 150MB (~2 menit)')
      return
    }

    const existingVideo = mediaFiles.find((m) => m.type === 'video')
    if (existingVideo) {
      toast.error('Hanya 1 video per jasa')
      return
    }

    setMediaFiles((prev) => [...prev, { file, url: URL.createObjectURL(file), type: 'video' }])
  }

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Upload file ke Supabase Storage
  const uploadMedia = async (serviceId: string, userId: string) => {
    const uploaded = []
    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i]
      const ext = media.file.name.split('.').pop()
      const bucket = media.type === 'video' ? 'service-videos' : 'service-photos'
      const path = `${userId}/${serviceId}/${Date.now()}-${i}.${ext}`

      const { error } = await supabase.storage.from(bucket).upload(path, media.file)
      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path)

      uploaded.push({
        service_id: serviceId,
        type: media.type,
        url: publicUrl,
        storage_path: path,
        sort_order: i,
      })
    }

    const { error } = await supabase.from('service_media').insert(uploaded)
    if (error) throw error
  }

  const onSubmit = async (data: FormData) => {
    setUploading(true)
    const toastId = toast.loading('Menyimpan jasa...')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Belum login')

      const payload = {
        title: data.title,
        category: data.category,
        description: data.description || null,
        price_min: parseInt(data.price_min.replace(/\D/g, '')),
        price_max: data.price_max ? parseInt(data.price_max.replace(/\D/g, '')) : null,
        city: data.city,
      }

      let service
      if (serviceId) {
        const { data: updated, error } = await supabase
          .from('services')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', serviceId)
          .select()
          .single()
        if (error) throw error
        service = updated
      } else {
        const { data: inserted, error } = await supabase
          .from('services')
          .insert({ agent_id: user.id, ...payload })
          .select()
          .single()
        if (error) throw error
        service = inserted
      }

      if (mediaFiles.length > 0) {
        toast.loading('Mengupload foto...', { id: toastId })
        await uploadMedia(service.id, user.id)
      }

      toast.success(
        serviceId ? 'Jasa berhasil diperbarui! 🔨' : 'Jasa berhasil ditambahkan! 🔨',
        { id: toastId }
      )
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const mediaLabel = { before: 'Sebelum', after: 'Sesudah', portfolio: 'Portofolio', video: 'Video' }
  const mediaColor = {
    before: 'bg-gray-500',
    after: 'bg-navy-500',
    portfolio: 'bg-gold-500',
    video: 'bg-purple-500',
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto pb-16">
      {/* ── INFO DASAR */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Hammer size={18} className="text-navy-600" /> Informasi Jasa
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Judul Jasa *</label>
            <input
              {...register('title', { required: 'Wajib diisi' })}
              placeholder="Renovasi Dapur Minimalis Modern"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Tag size={14} /> Kategori *
            </label>
            <select
              {...register('category', { required: 'Wajib dipilih' })}
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none bg-white"
            >
              <option value="">Pilih kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <FileText size={14} /> Deskripsi
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Jelaskan cakupan pekerjaan, material yang digunakan, estimasi waktu pengerjaan..."
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Harga Mulai Dari (Rp) *</label>
              <input
                {...register('price_min', { required: 'Wajib diisi' })}
                type="number"
                placeholder="15000000"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sampai (Rp, opsional)</label>
              <input
                {...register('price_max')}
                type="number"
                placeholder="50000000"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin size={14} /> Area/Kota yang Dilayani *
            </label>
            <input
              {...register('city', { required: 'Wajib diisi' })}
              placeholder="Bandung"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* ── FOTO BEFORE/AFTER/PORTOFOLIO */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-navy-600" /> Foto Portofolio
        </h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            onClick={() => beforeInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-200 transition text-sm font-medium"
          >
            <Upload size={16} /> Foto Sebelum
          </button>
          <button
            type="button"
            onClick={() => afterInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-50 text-navy-700 rounded-xl border border-navy-200 hover:bg-navy-100 transition text-sm font-medium"
          >
            <Upload size={16} /> Foto Sesudah
          </button>
          <button
            type="button"
            onClick={() => portfolioInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-50 text-gold-700 rounded-xl border border-gold-200 hover:bg-gold-100 transition text-sm font-medium"
          >
            <Upload size={16} /> Foto Portofolio Lain
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 hover:bg-purple-100 transition text-sm font-medium"
          >
            <Video size={16} /> Upload Video (~2 menit)
          </button>
        </div>

        <input
          ref={beforeInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddPhoto('before')}
          className="hidden"
        />
        <input
          ref={afterInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddPhoto('after')}
          className="hidden"
        />
        <input
          ref={portfolioInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddPhoto('portfolio')}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideo}
          className="hidden"
        />

        <p className="text-xs text-gray-400 mb-4">
          Foto "Sebelum" & "Sesudah" akan ditampilkan berdampingan di halaman publik. Foto: JPG/PNG
          maks 10MB per file · Video: MP4 maks 150MB (~2 menit).
        </p>

        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {mediaFiles.map((media, i) => (
              <div
                key={i}
                className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100"
              >
                {media.type === 'video' ? (
                  <video src={media.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                )}
                <span
                  className={`absolute top-1 left-1 text-white text-xs px-2 py-0.5 rounded-full ${mediaColor[media.type]}`}
                >
                  {mediaLabel[media.type]}
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="text-white bg-red-600 p-1 rounded-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={uploading}
        className="w-full py-4 bg-navy-600 hover:bg-navy-700 disabled:bg-navy-300 text-white font-semibold rounded-2xl transition text-base shadow-lg shadow-navy-200"
      >
        {uploading ? 'Menyimpan...' : '🔨 Simpan Jasa'}
      </button>
    </form>
  )
}
