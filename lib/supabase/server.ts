import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // FIX: parameter diberi tipe eksplisit karena TypeScript tidak bisa
        // menebak tipe lewat union type "cookies" milik createServerClient,
        // menyebabkan error "implicitly has an 'any' type" saat build.
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Dipanggil dari Server Component — boleh diabaikan jika ada middleware
            // yang me-refresh session.
          }
        },
      },
    }
  )
}
