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
  max_video_seconds: number
  bank_name: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  qris_image_url: string | null
  created_at: string
}

export type UpgradeRequest = {
  id: string
  agent_id: string
  plan_id: string
  status: 'pending' | 'approved' | 'rejected'
  proof_url: string | null
  proof_storage_path: string | null
  note: string | null
  created_at: string
  reviewed_at: string | null
  profiles?: Profile
  plans?: Plan
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

export type Plan = {
  id: 'free' | 'silver' | 'gold' | 'platinum'
  name: string
  price: number
  max_listings: number
  max_photos_per_listing: number
  max_video_seconds: number
  features: string | null
  sort_order: number
}

export type Banner = {
  id: string
  advertiser_name: string
  image_url: string
  storage_path: string
  link_url: string | null
  position: 'home' | 'renovasi'
  price: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export type Lead = {
  id: string
  agent_id: string
  listing_id: string | null
  service_id: string | null
  source: 'listing' | 'service'
  created_at: string
  listings?: { title: string } | null
  services?: { title: string } | null
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
