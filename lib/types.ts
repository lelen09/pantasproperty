export type Profile = {
  id: string
  full_name: string
  phone_whatsapp: string
  role: 'admin' | 'agent'
  avatar_url: string | null
  plan: 'free' | 'silver' | 'gold' | 'platinum'
  agent_badge: 'none' | 'verified' | 'top_agent' | 'super_agent'
  max_listings: number
  max_photos_per_listing: number
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
  property_type: 'Rumah' | 'Apartemen' | 'Tanah' | 'Ruko' | 'Gudang'
  certificate_type: string | null
  orientation: string | null
  is_flood_free: boolean | null
  road_access: string | null
  nearby_toll: string | null
  nearby_school: string | null
  nearby_minimarket: string | null
  badge: 'none' | 'hot' | 'exclusive'
  boosted_until: string | null
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

export type Service = {
  id: string
  agent_id: string
  title: string
  category: string
  description: string | null
  price_min: number
  price_max: number | null
  city: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  profiles?: Profile // joined
  service_media?: ServiceMedia[] // joined
}

export type ServiceMedia = {
  id: string
  service_id: string
  type: 'before' | 'after' | 'portfolio' | 'video'
  url: string
  storage_path: string
  sort_order: number
  created_at: string
}
