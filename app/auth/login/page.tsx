'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // FIX: sebelumnya semua error ditampilkan sebagai "Email atau password
      // salah" walau penyebabnya beda (misal email belum dikonfirmasi),
      // jadi user tidak pernah tahu penyebab sebenarnya.
      if (error.message.toLowerCase().includes('email not confirmed')) {
        toast.error('Email belum dikonfirmasi. Cek inbox/spam untuk link verifikasi.')
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        toast.error('Email atau password salah')
      } else {
        toast.error(error.message)
      }
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy-700 mb-6">Masuk ke AS REALTY</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition disabled:bg-navy-300"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun?{' '}
          <a href="/auth/register" className="text-navy-600 font-medium">
            Daftar sebagai Agent
          </a>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          <a href="/auth/forgot-password" className="text-navy-600 font-medium">
            Lupa password?
          </a>
        </p>
      </div>
    </div>
  )
}
