'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Link dari email membawa kode recovery di URL. @supabase/ssr otomatis
    // menukarnya jadi sesi sementara saat halaman ini dimuat di browser.
    // Kita tunggu event PASSWORD_RECOVERY (atau sesi aktif) sebelum
    // menampilkan form, supaya tidak submit sebelum sesi siap.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Password dan konfirmasi tidak sama')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password berhasil diubah! Silakan masuk kembali.')
      await supabase.auth.signOut()
      router.push('/auth/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy-700 mb-6">Buat Password Baru</h1>

        {!ready ? (
          <p className="text-sm text-gray-500">
            Memverifikasi link reset password... Kalau ini tidak berubah dalam beberapa detik,
            link mungkin sudah kedaluwarsa — coba minta link baru dari halaman{' '}
            <a href="/auth/forgot-password" className="text-navy-600 font-medium">
              Lupa Password
            </a>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password baru (min 8 karakter)"
              minLength={8}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              minLength={8}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition disabled:bg-navy-300"
            >
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
