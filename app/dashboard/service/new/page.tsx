'use client'

import { useRouter } from 'next/navigation'
import ServiceForm from '@/components/ServiceForm'

export default function NewServicePage() {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Jasa Renovasi</h1>
      <ServiceForm
        onSuccess={() => {
          router.push('/dashboard/services')
          router.refresh()
        }}
      />
    </div>
  )
}
