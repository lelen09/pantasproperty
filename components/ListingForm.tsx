'use client'
// components/ListingForm.tsx
// Form tambah/edit listing rumah — termasuk upload foto & video

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Camera, Video, MapPin, Home, Upload, X,
  BedDouble, Bath, Layers, Car, FileText
} from 'lucide-react'

type FormData = {
  title: string
  price: string
  description: string
  land_area: string
  building_area: string
  bedrooms: string
  bathrooms: string
  floors: string
  garage: string
  address: string
  city: string
  province: string
  google_maps_url: string
  property_type: string
  certificate_type: string
  orientation: string
  is_flood_free: boolean
  road_access: string
  nearby_toll: string
  nearby_school: string
  nearby_minimarket: string
  badge: string
}

type MediaPreview = {
  file: File
  url: string
  type: 'photo' | 'video'
  is_cover: boolean
}

export default function ListingForm({
  onSuccess,
  listingId,
  defaultValues,
}: {
  onSuccess?: () => void
  /** Jika diisi, form akan mengupdate listing yang sudah ada (mode edit) */
  listingId?: string
  defaultValues?: Partial<FormData>
}) {
  const supabase = createClient()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ defaultValues })
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [maxPhotos, setMaxPhotos] = useState(10)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchLimit = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('max_photos_per_listing')
        .eq('id', user.id)
        .single()
      if (profile?.max_photos_per_listing) setMaxPhotos(profile.max_photos_per_listing)
    }
    fetchLimit()
  }, [supabase])

  const currentPhotoCount = mediaFiles.filter((m) => m.type === 'photo').length

  // ── Tambah foto dari galeri
  const handlePhotoGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = maxPhotos - currentPhotoCount
    if (remaining <= 0) {
      toast.error(`Batas maksimal ${maxPhotos} foto untuk paket Anda`)
      e.target.value = ''
      return
    }
    const filesToAdd = files.slice(0, remaining)
    if (files.length > remaining) {
      toast.error(`Hanya ${remaining} foto ditambahkan (batas paket: ${maxPhotos} foto)`)
    }
    const previews = filesToAdd.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      type: 'photo' as const,
      is_cover: mediaFiles.length === 0 && i === 0,
    }))
    setMediaFiles(prev => [...prev, ...previews])
    e.target.value = ''
  }

  // ── Ambil foto dari kamera
  const handleCamera = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (currentPhotoCount >= maxPhotos) {
      toast.error(`Batas maksimal ${maxPhotos} foto untuk paket Anda`)
      e.target.value = ''
      return
    }
    setMediaFiles(prev => [...prev, {
      file, url: URL.createObjectURL(file),
      type: 'photo',
      is_cover: prev.length === 0,
    }])
    e.target.value = ''
  }

  // ── Upload video (max ~150MB untuk 2 menit)
  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi ukuran: max 150MB
    if (file.size > 150 * 1024 * 1024) {
      toast.error('Video maksimal 150MB (~2 menit)')
      return
    }

    // Cek apakah sudah ada video
    const existingVideo = mediaFiles.find(m => m.type === 'video')
    if (existingVideo) {
      toast.error('Hanya 1 video per listing')
      return
    }

    setMediaFiles(prev => [...prev, {
      file, url: URL.createObjectURL(file),
      type: 'video',
      is_cover: false,
    }])
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // Jika yang dihapus adalah cover, set cover ke foto pertama
      if (prev[index].is_cover && updated.length > 0) {
        const firstPhoto = updated.findIndex(m => m.type === 'photo')
        if (firstPhoto !== -1) updated[firstPhoto].is_cover = true
      }
      return updated
    })
  }

  const setCover = (index: number) => {
    setMediaFiles(prev => prev.map((m, i) => ({
      ...m, is_cover: i === index && m.type === 'photo'
    })))
  }

  // ── Upload file ke Supabase Storage
  const uploadMedia = async (listingId: string, userId: string) => {
    const uploaded = []
    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i]
      const ext = media.file.name.split('.').pop()
      const bucket = media.type === 'photo' ? 'listing-photos' : 'listing-videos'
      const path = `${userId}/${listingId}/${Date.now()}-${i}.${ext}`

      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, media.file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      uploaded.push({
        listing_id: listingId,
        type: media.type,
        url: publicUrl,
        storage_path: path,
        is_cover: media.is_cover,
        sort_order: i,
      })
    }

    const { error } = await supabase.from('listing_media').insert(uploaded)
    if (error) throw error
  }

  // ── Submit form
  const onSubmit = async (data: FormData) => {
    setUploading(true)
    const toastId = toast.loading('Menyimpan listing...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Belum login')

      // FIX: kalau agent paste link tanpa "https://" di depan, browser akan
      // menganggapnya link internal (relatif ke domain sendiri) dan berujung
      // 404. Di sini kita normalisasi otomatis.
      const normalizeMapsUrl = (url: string) => {
        const trimmed = url.trim()
        if (!trimmed) return null
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      }

      const payload = {
        title: data.title,
        price: parseInt(data.price.replace(/\D/g, '')),
        description: data.description,
        land_area: parseInt(data.land_area),
        building_area: parseInt(data.building_area),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        floors: parseInt(data.floors),
        garage: parseInt(data.garage),
        address: data.address,
        city: data.city,
        province: data.province,
        google_maps_url: normalizeMapsUrl(data.google_maps_url),
        property_type: data.property_type || 'Rumah',
        certificate_type: data.certificate_type || null,
        orientation: data.orientation || null,
        is_flood_free: data.is_flood_free || false,
        road_access: data.road_access || null,
        nearby_toll: data.nearby_toll || null,
        nearby_school: data.nearby_school || null,
        nearby_minimarket: data.nearby_minimarket || null,
        badge: data.badge || 'none',
      }

      let listing
      if (listingId) {
        // ── Mode edit: update listing yang sudah ada
        const { data: updated, error } = await supabase
          .from('listings')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', listingId)
          .select()
          .single()
        if (error) throw error
        listing = updated
      } else {
        // ── Mode tambah: insert listing baru
        const { data: inserted, error } = await supabase
          .from('listings')
          .insert({ agent_id: user.id, ...payload })
          .select()
          .single()
        if (error) throw error
        listing = inserted
      }

      // 2. Upload media
      if (mediaFiles.length > 0) {
        toast.loading('Mengupload foto & video...', { id: toastId })
        await uploadMedia(listing.id, user.id)
      }

      toast.success(
        listingId ? 'Listing berhasil diperbarui! 🏠' : 'Listing berhasil ditambahkan! 🏠',
        { id: toastId }
      )
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto pb-16">

      {/* ── INFO DASAR */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Home size={18} className="text-navy-600" /> Informasi Dasar
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tipe Properti *</label>
              <select
                {...register('property_type', { required: true })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none bg-white"
              >
                <option value="Rumah">Rumah</option>
                <option value="Apartemen">Apartemen</option>
                <option value="Tanah">Tanah</option>
                <option value="Ruko">Ruko</option>
                <option value="Gudang">Gudang</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Badge Promosi</label>
              <select
                {...register('badge')}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none bg-white"
              >
                <option value="none">Tidak ada</option>
                <option value="hot">🔥 HOT</option>
                <option value="exclusive">⭐ EXCLUSIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Judul Iklan *</label>
            <input
              {...register('title', { required: 'Wajib diisi' })}
              placeholder="Rumah Minimalis 2 Lantai di Bandung"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Harga (Rp) *</label>
            <input
              {...register('price', { required: 'Wajib diisi' })}
              placeholder="850000000"
              type="number"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <FileText size={14} /> Keterangan
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Deskripsikan rumah ini... kondisi, fasilitas, keunggulan..."
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* ── SPESIFIKASI */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-navy-600" /> Spesifikasi Rumah
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Luas Tanah (m²) *</label>
            <input
              {...register('land_area', { required: true })}
              type="number" placeholder="120"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Luas Bangunan (m²) *</label>
            <input
              {...register('building_area', { required: true })}
              type="number" placeholder="90"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <BedDouble size={14} /> Kamar Tidur *
            </label>
            <input
              {...register('bedrooms', { required: true })}
              type="number" placeholder="3" min="0"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Bath size={14} /> Kamar Mandi *
            </label>
            <input
              {...register('bathrooms', { required: true })}
              type="number" placeholder="2" min="0"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Layers size={14} /> Jumlah Lantai *
            </label>
            <input
              {...register('floors', { required: true })}
              type="number" placeholder="2" min="1"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Car size={14} /> Garasi / Carport
            </label>
            <input
              {...register('garage')}
              type="number" placeholder="1" min="0"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* ── LOKASI */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-navy-600" /> Lokasi Rumah
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Alamat Lengkap *</label>
            <textarea
              {...register('address', { required: true })}
              rows={2}
              placeholder="Jl. Cihampelas No.123, RT 02/RW 05"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Kota *</label>
              <input
                {...register('city', { required: true })}
                placeholder="Bandung"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Provinsi *</label>
              <input
                {...register('province', { required: true })}
                placeholder="Jawa Barat"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Link Google Maps (opsional)</label>
            <input
              {...register('google_maps_url')}
              placeholder="https://maps.google.com/?q=..."
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Salin link dari Google Maps → Bagikan → Salin Link
            </p>
          </div>
        </div>
      </section>

      {/* ── INFO TAMBAHAN */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-navy-600" /> Info Tambahan (opsional)
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Jenis Sertifikat</label>
              <select
                {...register('certificate_type')}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none bg-white"
              >
                <option value="">Pilih</option>
                <option value="SHM">SHM</option>
                <option value="HGB">HGB</option>
                <option value="Girik">Girik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hadap Arah</label>
              <input
                {...register('orientation')}
                placeholder="Timur"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Akses Jalan</label>
            <input
              {...register('road_access')}
              placeholder="Muat 2 mobil"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              {...register('is_flood_free')}
              className="w-4 h-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
            />
            Bebas Banjir
          </label>
        </div>
      </section>

      {/* ── FASILITAS SEKITAR */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-navy-600" /> Fasilitas Sekitar (opsional)
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-700">Ke Tol</label>
            <input
              {...register('nearby_toll')}
              placeholder="1,2 km"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Ke Sekolah</label>
            <input
              {...register('nearby_school')}
              placeholder="300 m"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Ke Minimarket</label>
            <input
              {...register('nearby_minimarket')}
              placeholder="500 m"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500 outline-none text-sm"
            />
          </div>
        </div>
      </section>

      {/* ── FOTO & VIDEO */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Camera size={18} className="text-navy-600" /> Foto & Video
        </h2>

        {/* Tombol Upload */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Galeri */}
          <button type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-50 text-navy-700 rounded-xl border border-navy-200 hover:bg-navy-100 transition text-sm font-medium">
            <Upload size={16} /> Pilih dari Galeri
          </button>

          {/* Kamera */}
          <button type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 transition text-sm font-medium">
            <Camera size={16} /> Ambil dari Kamera
          </button>

          {/* Video */}
          <button type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 hover:bg-purple-100 transition text-sm font-medium">
            <Video size={16} /> Upload Video (~2 menit)
          </button>
        </div>

        {/* Hidden inputs */}
        <input ref={photoInputRef} type="file" accept="image/*" multiple
          onChange={handlePhotoGallery} className="hidden" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
          onChange={handleCamera} className="hidden" />
        <input ref={videoInputRef} type="file" accept="video/*"
          onChange={handleVideo} className="hidden" />

        <p className="text-xs text-gray-400 mb-1">
          {currentPhotoCount}/{maxPhotos} foto terpakai sesuai paket Anda
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Foto: JPG/PNG maks 10MB per file · Video: MP4 maks 150MB (~2 menit) · Tap foto untuk set sebagai cover
        </p>

        {/* Preview Grid */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {mediaFiles.map((media, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                {media.type === 'photo' ? (
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={media.url} className="w-full h-full object-cover" />
                )}

                {/* Badge cover */}
                {media.is_cover && (
                  <span className="absolute top-1 left-1 bg-navy-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Cover
                  </span>
                )}

                {/* Badge video */}
                {media.type === 'video' && (
                  <span className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Video
                  </span>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {media.type === 'photo' && !media.is_cover && (
                    <button type="button" onClick={() => setCover(i)}
                      className="text-white text-xs bg-navy-600 px-2 py-1 rounded-lg">
                      Set Cover
                    </button>
                  )}
                  <button type="button" onClick={() => removeMedia(i)}
                    className="text-white bg-red-600 p-1 rounded-lg">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full py-4 bg-navy-600 hover:bg-navy-700 disabled:bg-navy-300 text-white font-semibold rounded-2xl transition text-base shadow-lg shadow-navy-200">
        {uploading ? 'Menyimpan...' : '🏠 Simpan Listing'}
      </button>
    </form>
  )
}
