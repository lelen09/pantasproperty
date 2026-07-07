import Navbar from '@/components/Navbar'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata = { title: 'Kebijakan Privasi — AS REALTY' }

export default async function PrivacyPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <>
      <Navbar isLoggedIn={!!user} isAdmin={isAdmin} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Kebijakan Privasi</h1>
          <p className="text-gray-400 text-xs mb-6">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-semibold text-gray-800 mb-1">1. Data yang Kami Kumpulkan</h2>
              <p>Saat menggunakan aplikasi ini, kami dapat mengumpulkan:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Nama, nomor WhatsApp, dan email — saat agent mendaftar akun</li>
                <li>Foto profil dan foto properti/jasa — diunggah agent secara sukarela</li>
                <li>Catatan aktivitas (leads) — saat pengunjung menekan tombol WhatsApp pada suatu listing/jasa, waktu klik dicatat untuk keperluan statistik agent</li>
                <li>Bukti transfer pembayaran — saat agent mengajukan upgrade paket</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">2. Cara Kami Menggunakan Data</h2>
              <p>Data digunakan semata untuk mengoperasikan layanan: menampilkan listing ke publik, menghubungkan calon pembeli dengan agent lewat WhatsApp, memverifikasi pembayaran upgrade paket, dan menyediakan statistik kepada agent/admin.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">3. Berbagi Data</h2>
              <p>Kami tidak menjual atau menyewakan data pribadi kepada pihak ketiga. Nomor WhatsApp agent ditampilkan secara terbuka di listing karena memang menjadi sarana komunikasi utama dengan calon pembeli.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">4. Penyimpanan & Keamanan</h2>
              <p>Data disimpan menggunakan layanan Supabase dengan kontrol akses (Row Level Security), sehingga setiap agent hanya dapat mengakses datanya sendiri, kecuali admin yang berwenang mengelola platform.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">5. Hak Anda</h2>
              <p>Anda berhak meminta salinan, koreksi, atau penghapusan data pribadi Anda. Hubungi admin melalui WhatsApp yang tertera di aplikasi untuk permintaan ini.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">6. Perubahan Kebijakan</h2>
              <p>Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan berlaku sejak dipublikasikan di halaman ini.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
