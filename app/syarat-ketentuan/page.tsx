import Navbar from '@/components/Navbar'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata = { title: 'Syarat & Ketentuan — AS REALTY' }

export default async function TermsPage() {
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
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Syarat & Ketentuan</h1>
          <p className="text-gray-400 text-xs mb-6">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-semibold text-gray-800 mb-1">1. Tentang Layanan</h2>
              <p>Aplikasi ini adalah platform pemasaran properti dan jasa renovasi yang mempertemukan agent/penyedia jasa dengan calon pembeli. Kami bukan pihak dalam transaksi jual-beli properti atau jasa renovasi — segala kesepakatan terjadi langsung antara agent dan pembeli.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">2. Akun Agent</h2>
              <p>Agent bertanggung jawab penuh atas kebenaran informasi listing/jasa yang diunggah, termasuk foto, harga, dan deskripsi. Kami berhak menghapus konten yang menyesatkan, melanggar hukum, atau melanggar hak pihak lain tanpa pemberitahuan sebelumnya.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">3. Konten Terlarang</h2>
              <p>Dilarang mengunggah konten yang: melanggar hukum, menipu, mengandung SARA, kekerasan, atau bukan milik/kewenangan Anda untuk memasarkan.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">4. Paket & Pembayaran</h2>
              <p>Upgrade paket dilakukan melalui transfer manual dan diverifikasi oleh admin. Kami berhak menolak permintaan upgrade yang tidak dapat diverifikasi. Harga paket dapat berubah sewaktu-waktu dan akan diinformasikan sebelum berlaku.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">5. Batasan Tanggung Jawab</h2>
              <p>Kami tidak menjamin keakuratan, kelengkapan, atau ketersediaan listing/jasa yang ditampilkan. Segala risiko transaksi antara pembeli dan agent menjadi tanggung jawab masing-masing pihak. Estimasi cicilan KPR dan biaya renovasi yang ditampilkan bersifat perkiraan kasar, bukan simulasi resmi bank/kontraktor.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">6. Perubahan Layanan</h2>
              <p>Kami dapat mengubah, menangguhkan, atau menghentikan sebagian/seluruh layanan sewaktu-waktu untuk pemeliharaan atau pengembangan.</p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-1">7. Kontak</h2>
              <p>Pertanyaan mengenai syarat ini dapat disampaikan melalui WhatsApp admin yang tertera di aplikasi.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
