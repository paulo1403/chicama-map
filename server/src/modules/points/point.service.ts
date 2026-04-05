import { prisma } from '../../db/prisma'
import type {
  PointFilters,
  PointQuery,
  PointRow,
  PointSortOption,
  PointUpdateInput,
  PointWriteInput,
} from './point.types'

function jsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function parseCsvParam(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function distanceInKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function normalizeSort(sort?: string): PointSortOption {
  return sort === 'rating' || sort === 'recent' || sort === 'distance'
    ? sort
    : 'distance'
}

function buildFilters(query: PointQuery): PointFilters {
  return {
    q: query.q?.trim().toLowerCase() || undefined,
    categories: parseCsvParam(query.categories),
    ids: parseCsvParam(query.ids),
    sort: normalizeSort(query.sort),
    origin:
      typeof query.originLat === 'number' && typeof query.originLng === 'number'
        ? { lat: query.originLat, lng: query.originLng }
        : undefined,
    bbox:
      typeof query.minLat === 'number' &&
      typeof query.maxLat === 'number' &&
      typeof query.minLng === 'number' &&
      typeof query.maxLng === 'number'
        ? {
            minLat: query.minLat,
            maxLat: query.maxLat,
            minLng: query.minLng,
            maxLng: query.maxLng,
          }
        : undefined,
  }
}

function matchesPointFilters(row: PointRow, filters: PointFilters) {
  const categories = jsonStringArray(row.categories)
  const keywords = jsonStringArray(row.keywords)

  if (filters.ids.length > 0 && !filters.ids.includes(row.id)) {
    return false
  }

  if (filters.categories.length > 0 && !categories.some((category) => filters.categories.includes(category))) {
    return false
  }

  if (filters.bbox) {
    if (
      row.lat < filters.bbox.minLat ||
      row.lat > filters.bbox.maxLat ||
      row.lng < filters.bbox.minLng ||
      row.lng > filters.bbox.maxLng
    ) {
      return false
    }
  }

  if (!filters.q) {
    return true
  }

  const haystack = [row.name, row.description, row.contact, ...categories, ...keywords]
    .join(' ')
    .toLowerCase()

  return haystack.includes(filters.q)
}

function sortPointRows(rows: PointRow[], filters: PointFilters) {
  return [...rows].sort((a, b) => {
    if (filters.sort === 'rating') {
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    }

    if (filters.sort === 'distance' && filters.origin) {
      const distanceA = distanceInKm(filters.origin, { lat: a.lat, lng: a.lng })
      const distanceB = distanceInKm(filters.origin, { lat: b.lat, lng: b.lng })

      if (distanceA !== distanceB) return distanceA - distanceB
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    }

    const recentDiff = b.updatedAt.getTime() - a.updatedAt.getTime()
    if (recentDiff !== 0) return recentDiff
    return b.rating - a.rating
  })
}

export function toPoint(row: PointRow) {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    name: row.name,
    categories: jsonStringArray(row.categories),
    rating: row.rating,
    description: row.description,
    contact: row.contact,
    keywords: jsonStringArray(row.keywords),
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  }
}

export function toPointPin(row: PointRow) {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    name: row.name,
    categories: jsonStringArray(row.categories),
    rating: row.rating,
  }
}

export async function listFilteredPointRows(query: PointQuery) {
  const filters = buildFilters(query)
  const rows = await prisma.point.findMany({
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
  }) as PointRow[]

  return sortPointRows(rows.filter((row) => matchesPointFilters(row, filters)), filters)
}

export async function listPoints(query: PointQuery) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(100, Math.max(1, query.limit ?? 20))
  const filteredRows = await listFilteredPointRows(query)
  const total = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const items = filteredRows.slice(start, start + limit).map(toPoint)

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasMore: start + limit < total,
  }
}

export async function listMapPoints(query: PointQuery) {
  const filteredRows = await listFilteredPointRows(query)

  return {
    items: filteredRows.map(toPointPin),
    total: filteredRows.length,
  }
}

export async function getPointById(id: string) {
  const row = await prisma.point.findUnique({ where: { id } }) as PointRow | null
  return row ? toPoint(row) : null
}

export async function createPoint(input: PointWriteInput) {
  const row = await prisma.point.create({
    data: {
      id: input.id,
      lat: input.lat,
      lng: input.lng,
      name: input.name,
      categories: input.categories,
      rating: input.rating,
      description: input.description,
      contact: input.contact,
      keywords: input.keywords,
    },
  }) as PointRow

  return toPoint(row)
}

export async function updatePoint(id: string, input: PointUpdateInput) {
  try {
    const row = await prisma.point.update({
      where: { id },
      data: input,
    }) as PointRow

    return toPoint(row)
  } catch {
    return null
  }
}

export async function deletePoint(id: string) {
  try {
    await prisma.point.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}
