'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function Navbar({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn?: boolean
  isAdmin?: boolean
}) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Berhasil logout')
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-navy-700">
          <img src="/logo.png" alt="AS REALTY" className="h-9 w-9 object-contain" />
          <span className="tracking-wide">AS REALTY</span>
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-navy-600 rounded-xl transition"
                >
                  <Users size={16} /> Admin
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-navy-600 rounded-xl transition"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 rounded-xl transition"
              >
                <LogOut size={16} /> Keluar
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold bg-navy-600 text-white rounded-xl hover:bg-navy-700 transition"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
