import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} AS REALTY. Semua hak dilindungi.</p>
        <div className="flex gap-4">
          <Link href="/privasi" className="hover:text-navy-600 transition">
            Kebijakan Privasi
          </Link>
          <Link href="/syarat-ketentuan" className="hover:text-navy-600 transition">
            Syarat & Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  )
}
