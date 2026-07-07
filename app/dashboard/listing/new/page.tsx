'use client'

import { useRouter } from 'next/navigation'
import ListingForm from '@/components/ListingForm'

export default function NewListingPage() {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Listing Baru</h1>
      <ListingForm
        onSuccess={() => {
          router.push('/dashboard')
          router.refresh()
        }}
      />
    </div>
  )
}
