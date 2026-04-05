import type { Language } from '../i18n/types'
import type { CategoryKey } from '../types/map'

type CategoryDefinition = {
  key: CategoryKey
  label: string
  labelEn: string
}

export const CATEGORIES: ReadonlyArray<CategoryDefinition> = [
  { key: 'restaurante', label: 'Restaurante', labelEn: 'Restaurant' },
  { key: 'tienda', label: 'Tienda', labelEn: 'Shop' },
  { key: 'venta_tablas', label: 'Venta de tablas', labelEn: 'Board sales' },
  { key: 'alquiler_tablas', label: 'Alquiler de tablas', labelEn: 'Board rental' },
  { key: 'escuela_surf', label: 'Escuela de surf', labelEn: 'Surf school' },
  { key: 'hospedaje', label: 'Hospedaje', labelEn: 'Lodging' },
  { key: 'otros', label: 'Otros', labelEn: 'Other' },
] as const

export function getCategoryLabel(key: CategoryKey, language: Language = 'es') {
  const item = CATEGORIES.find((category) => category.key === key)

  if (!item) return key

  return language === 'en' ? item.labelEn : item.label
}