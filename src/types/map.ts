export type CategoryKey =
  | 'playa'
  | 'restaurante'
  | 'cafeteria'
  | 'bar'
  | 'tienda'
  | 'venta_tablas'
  | 'alquiler_tablas'
  | 'escuela_surf'
  | 'deportes'
  | 'mirador'
  | 'transporte'
  | 'servicios'
  | 'salud'
  | 'hospedaje'
  | 'otros'

export type MapPoint = {
  id: string
  lat: number
  lng: number
  name: string
  categories: CategoryKey[]
  rating: number
  description: string
  contact: string
  keywords: string[]
  createdAt: number
  updatedAt: number
}

export type MapPointPin = Pick<MapPoint, 'id' | 'lat' | 'lng' | 'name' | 'categories' | 'rating'>

export type PointSortOption = 'distance' | 'rating' | 'recent'

export type MapViewportBounds = {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export type PointQueryParams = {
  q?: string
  categories?: CategoryKey[]
  ids?: string[]
  sort?: PointSortOption
  originLat?: number
  originLng?: number
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
}

export type PaginatedPointsResponse = {
  items: MapPoint[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export type AdminDraft = {
  mode: 'create' | 'edit'
  id?: string
  lat: number
  lng: number
  name: string
  categories: CategoryKey[]
  rating: number
  description: string
  contact: string
  keywords: string[]
}

export type PointTone = 'food' | 'shop' | 'stay' | 'surf' | 'local'