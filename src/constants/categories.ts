import type { Language } from '../i18n/types'
import type { CategoryKey } from '../types/map'

type CategoryDefinition = {
  key: CategoryKey
  label: string
  labelEn: string
}

export const CATEGORIES: ReadonlyArray<CategoryDefinition> = [
  { key: 'playa', label: 'Playa', labelEn: 'Beach' },
  { key: 'restaurante', label: 'Restaurante', labelEn: 'Restaurant' },
  { key: 'cafeteria', label: 'Cafetería', labelEn: 'Coffee shop' },
  { key: 'bar', label: 'Bar', labelEn: 'Bar' },
  { key: 'hospedaje', label: 'Hospedaje', labelEn: 'Lodging' },
  { key: 'tienda', label: 'Tienda', labelEn: 'Shop' },
  { key: 'escuela_surf', label: 'Escuela de surf', labelEn: 'Surf school' },
  { key: 'alquiler_tablas', label: 'Alquiler de tablas', labelEn: 'Board rental' },
  { key: 'venta_tablas', label: 'Venta de tablas', labelEn: 'Board sales' },
  { key: 'deportes', label: 'Deportes', labelEn: 'Sports' },
  { key: 'mirador', label: 'Mirador', labelEn: 'Viewpoint' },
  { key: 'transporte', label: 'Transporte', labelEn: 'Transport' },
  { key: 'servicios', label: 'Servicios', labelEn: 'Services' },
  { key: 'salud', label: 'Salud', labelEn: 'Health' },
  { key: 'otros', label: 'Otros', labelEn: 'Other' },
] as const

export function getCategoryLabel(key: CategoryKey, language: Language = 'es') {
  const item = CATEGORIES.find((category) => category.key === key)

  if (!item) return key

  return language === 'en' ? item.labelEn : item.label
}