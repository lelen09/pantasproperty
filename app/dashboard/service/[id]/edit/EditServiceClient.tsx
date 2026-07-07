'use client'

import { useRouter } from 'next/navigation'
import ServiceForm from '@/components/ServiceForm'
import type { Service } from '@/lib/types'

export default function EditServiceClient({ service }: { service: Service }) {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Jasa</h1>
      <ServiceForm
        serviceId={service.id}
        defaultValues={{
          title: service.title,
          category: service.category,
          description: service.description || '',
          price_min: String(service.price_min),
          price_max: service.price_max ? String(service.price_max) : '',
          city: service.city,
        }}
        onSuccess={() => {
          router.push('/dashboard/services')
          router.refresh()
        }}
      />
    </div>
  )
}
