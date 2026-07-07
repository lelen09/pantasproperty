'use client'

import { useRouter } from 'next/navigation'
import ListingForm from '@/components/ListingForm'
import type { Listing } from '@/lib/types'

export default function EditListingClient({ listing }: { listing: Listing }) {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Listing</h1>
      <ListingForm
        listingId={listing.id}
        defaultValues={{
          title: listing.title,
          price: String(listing.price),
          description: listing.description || '',
          land_area: String(listing.land_area),
          building_area: String(listing.building_area),
          bedrooms: String(listing.bedrooms),
          bathrooms: String(listing.bathrooms),
          floors: String(listing.floors),
          garage: String(listing.garage),
          address: listing.address,
          city: listing.city,
          province: listing.province,
          google_maps_url: listing.google_maps_url || '',
        }}
        onSuccess={() => {
          router.push('/dashboard')
          router.refresh()
        }}
      />
    </div>
  )
}
