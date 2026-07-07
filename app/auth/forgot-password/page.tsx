'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
      toast.success('Link reset password sudah dikirim ke email kamu.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy-700 mb-2">Lupa Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan email akun kamu, kami kirim link untuk membuat password baru.
        </p>

        {sent ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Cek inbox (atau folder spam) email <strong>{email}</strong> untuk link reset
              password.
            </p>
            <a href="/auth/login" className="text-navy-600 font-medium text-sm">
              Kembali ke halaman Masuk
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-navy-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy-600 text-white rounded-xl font-semibold hover:bg-navy-700 transition disabled:bg-navy-300"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
            <p className="text-center text-sm text-gray-500">
              <a href="/auth/login" className="text-navy-600 font-medium">
                Kembali ke halaman Masuk
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
