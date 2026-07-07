'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const { data, error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: {
        data: {
          full_name: formData.get('full_name'),
          phone_whatsapp: formData.get('phone_whatsapp'),
          role: 'agent',
        },
      },
    })

    if (error) {
      toast.error(error.message)
    } else if (data.session) {
      // Email confirmation nonaktif di Supabase Auth -> sudah ada sesi aktif
      toast.success('Pendaftaran berhasil!')
      router.push('/dashboard')
      router.refresh()
    } else {
      // FIX: sebelumnya langsung push ke /dashboard walau belum ada sesi
      // (kalau email confirmation aktif di Supabase Auth), middleware jadi
      // langsung mental balik ke /auth/login dan bikin bingung user.
      toast.success('Pendaftaran berhasil! Silakan cek email untuk verifikasi, lalu masuk.')
      router.push('/auth/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="max-w-sm w-full mx-auto p-8 space-y-4 bg-white rounded-2xl shadow-sm border"
      >
        <h1 className="text-2xl font-bold text-gray-800">Daftar sebagai Agent</h1>
        <input
          name="full_name"
          placeholder="Nama Lengkap"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
        />
        {/* Format: 628xxx (dengan kode negara) */}
        <input
          name="phone_whatsapp"
          placeholder="No. WhatsApp (628xxxxxxxx)"
          required
          pattern="62[0-9]{8,13}"
          title="Gunakan format 628xxxxxxxxx"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 karakter)"
          minLength={8}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition disabled:bg-navy-300"
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <a href="/auth/login" className="text-navy-600 font-medium">
            Masuk
          </a>
        </p>
      </form>
    </div>
  )
}
