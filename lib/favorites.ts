// lib/favorites.ts
// Favorit disimpan di localStorage per device — tidak perlu login.

const LISTING_KEY = 'fav_listings'
const SERVICE_KEY = 'fav_services'

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeIds(key: string, ids: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(ids))
}

export function getFavoriteListingIds(): string[] {
  return readIds(LISTING_KEY)
}

export function getFavoriteServiceIds(): string[] {
  return readIds(SERVICE_KEY)
}

export function isFavoriteListing(id: string): boolean {
  return readIds(LISTING_KEY).includes(id)
}

export function isFavoriteService(id: string): boolean {
  return readIds(SERVICE_KEY).includes(id)
}

export function toggleFavoriteListing(id: string): boolean {
  const ids = readIds(LISTING_KEY)
  const exists = ids.includes(id)
  const updated = exists ? ids.filter((i) => i !== id) : [...ids, id]
  writeIds(LISTING_KEY, updated)
  return !exists // true jika baru ditambahkan
}

export function toggleFavoriteService(id: string): boolean {
  const ids = readIds(SERVICE_KEY)
  const exists = ids.includes(id)
  const updated = exists ? ids.filter((i) => i !== id) : [...ids, id]
  writeIds(SERVICE_KEY, updated)
  return !exists
}
