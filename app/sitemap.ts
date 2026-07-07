import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pantasproperty.vercel.app'
  const supabase = await createServerSupabaseClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/renovasi`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/favorit`, changeFrequency: 'weekly', priority: 0.3 },
  ]

  const listingRoutes: MetadataRoute.Sitemap = (listings || []).map((l) => ({
    url: `${baseUrl}/listing/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...listingRoutes]
}
