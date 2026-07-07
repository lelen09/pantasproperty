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
          property_type: listing.property_type || 'Rumah',
          certificate_type: listing.certificate_type || '',
          orientation: listing.orientation || '',
          is_flood_free: listing.is_flood_free || false,
          road_access: listing.road_access || '',
          nearby_toll: listing.nearby_toll || '',
          nearby_school: listing.nearby_school || '',
          nearby_minimarket: listing.nearby_minimarket || '',
          badge: listing.badge || 'none',
        }}
        onSuccess={() => {
          router.push('/dashboard')
          router.refresh()
        }}
      />
    </div>
  )
}
