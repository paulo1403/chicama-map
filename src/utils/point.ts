import { getCategoryLabel } from '../constants/categories'
import type { Language } from '../i18n/types'
import type { CategoryKey, MapPoint, PointTone } from '../types/map'

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function createId() {
  return crypto.randomUUID()
}

export function formatCategories(categories: CategoryKey[], language: Language = 'es') {
  return categories.map((category) => getCategoryLabel(category, language)).join(' · ')
}

export function getPointTone(point: MapPoint): PointTone {
  if (point.categories.includes('restaurante')) return 'food'
  if (point.categories.includes('tienda')) return 'shop'
  if (point.categories.includes('hospedaje')) return 'stay'
  if (
    point.categories.includes('escuela_surf') ||
    point.categories.includes('venta_tablas') ||
    point.categories.includes('alquiler_tablas')
  ) {
    return 'surf'
  }
  return 'local'
}