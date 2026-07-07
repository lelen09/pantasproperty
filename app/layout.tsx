import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pantasproperty.vercel.app'),
  title: 'AS REALTY — Properti Pilihan',
  description: 'Aplikasi pemasaran perumahan AS Realty',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/icon-192.png',
  },
}

export const viewport = {
  themeColor: '#1e2a4f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Toaster position="top-center" />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
