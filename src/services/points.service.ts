import type { MapPoint, MapPointPin, PaginatedPointsResponse, PointQueryParams } from '../types/map'
import { requestJson } from './http'

type ListPointsParams = PointQueryParams & {
  page?: number
  limit?: number
}

function buildPointsQuery(params: ListPointsParams = {}) {
  const query = new URLSearchParams()

  if (typeof params.page === 'number') query.set('page', String(params.page))
  if (typeof params.limit === 'number') query.set('limit', String(params.limit))

  const normalizedQuery = params.q?.trim()
  if (normalizedQuery) query.set('q', normalizedQuery)

  if (params.categories && params.categories.length > 0) {
    query.set('categories', params.categories.join(','))
  }

  if (params.ids && params.ids.length > 0) {
    query.set('ids', params.ids.join(','))
  }

  if (params.sort) query.set('sort', params.sort)
  if (typeof params.originLat === 'number') query.set('originLat', String(params.originLat))
  if (typeof params.originLng === 'number') query.set('originLng', String(params.originLng))
  if (typeof params.minLat === 'number') query.set('minLat', String(params.minLat))
  if (typeof params.maxLat === 'number') query.set('maxLat', String(params.maxLat))
  if (typeof params.minLng === 'number') query.set('minLng', String(params.minLng))
  if (typeof params.maxLng === 'number') query.set('maxLng', String(params.maxLng))

  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

export async function listPoints() {
  const response = await listPointsPage({ page: 1, limit: 1000 })
  return response.items
}

export function listPointsPage(params: ListPointsParams = {}) {
  return requestJson<PaginatedPointsResponse>(`/points${buildPointsQuery(params)}`)
}

export function listMapPointPins(params: PointQueryParams = {}) {
  return requestJson<{ items: MapPointPin[]; total: number }>(`/points/map${buildPointsQuery(params)}`)
}

export function getPoint(id: string) {
  return requestJson<MapPoint>(`/points/${id}`)
}

export function createPoint(point: MapPoint, token: string) {
  return requestJson<MapPoint>('/points', {
    method: 'POST',
    body: JSON.stringify(point),
    token,
  })
}

export function updatePoint(id: string, patch: Partial<MapPoint>, token: string) {
  return requestJson<MapPoint>(`/points/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    token,
  })
}

export async function deletePoint(id: string, token: string) {
  await requestJson<unknown>(`/points/${id}`, {
    method: 'DELETE',
    token,
  })
}

export type { ListPointsParams }