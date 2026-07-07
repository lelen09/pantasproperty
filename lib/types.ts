export type Profile = {
  id: string
  full_name: string
  phone_whatsapp: string
  role: 'admin' | 'agent'
  avatar_url: string | null
  created_at: string
}

export type Listing = {
  id: string
  agent_id: string
  title: string
  price: number
  description: string | null
  land_area: number
  building_area: number
  bedrooms: number
  bathrooms: number
  floors: number
  garage: number
  address: string
  city: string
  province: string
  latitude: number | null
  longitude: number | null
  google_maps_url: string | null
  status: 'active' | 'sold' | 'inactive'
  created_at: string
  updated_at: string
  profiles?: Profile // joined
  listing_media?: ListingMedia[] // joined
}

export type ListingMedia = {
  id: string
  listing_id: string
  type: 'photo' | 'video'
  url: string
  storage_path: string
  is_cover: boolean
  sort_order: number
  created_at: string
}
