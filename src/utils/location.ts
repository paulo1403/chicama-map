import type { LatLngLiteral } from 'leaflet'

export const DEFAULT_CENTER: LatLngLiteral = { lat: -7.7, lng: -79.4333333333 }
export const DEFAULT_ZOOM = 15

export function distanceInKm(from: LatLngLiteral, to: LatLngLiteral) {
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

export function formatDistanceLabel(distanceKm: number) {
  if (distanceKm < 1) return `${Math.max(50, Math.round((distanceKm * 1000) / 10) * 10)} m`
  return `${distanceKm.toFixed(distanceKm < 2 ? 1 : 0)} km`
}