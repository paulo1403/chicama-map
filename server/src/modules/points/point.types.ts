export type PointSortOption = 'distance' | 'rating' | 'recent'

export type PointRow = {
  id: string
  lat: number
  lng: number
  name: string
  categories: unknown
  rating: number
  description: string
  contact: string
  keywords?: unknown
  createdAt: Date
  updatedAt: Date
}

export type PointQuery = {
  page?: number
  limit?: number
  q?: string
  categories?: string
  ids?: string
  sort?: string
  originLat?: number
  originLng?: number
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
}

export type PointFilters = {
  q?: string
  categories: string[]
  ids: string[]
  sort: PointSortOption
  origin?: { lat: number; lng: number }
  bbox?: {
    minLat: number
    maxLat: number
    minLng: number
    maxLng: number
  }
}

export type PointWriteInput = {
  id: string
  lat: number
  lng: number
  name: string
  categories: string[]
  rating: number
  description: string
  contact: string
  keywords: string[]
}

export type PointUpdateInput = Partial<Omit<PointWriteInput, 'id'>>
