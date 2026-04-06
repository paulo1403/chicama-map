import L, { type DivIcon } from 'leaflet'
import './pointMarkerIcon.css'
import {
  BedDouble,
  Building2,
  Coffee,
  GraduationCap,
  type IconNode,
  MapPin,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from 'lucide-react'

type LucideForwardRefIcon = LucideIcon & {
  render: (props: Record<string, unknown>, ref: null) => { props?: { iconNode?: IconNode } }
}

type MarkerAppearance = {
  key: string
  pinColor: string
  iconColor: string
  icon: LucideIcon
}

const markerCache = new Map<string, DivIcon>()

const markerByCategory: Record<string, MarkerAppearance> = {
  playa: {
    key: 'playa',
    pinColor: '#4d8c96',
    iconColor: '#f0fcff',
    icon: Waves,
  },
  restaurante: {
    key: 'restaurante',
    pinColor: '#c97856',
    iconColor: '#fff8f1',
    icon: UtensilsCrossed,
  },
  cafeteria: {
    key: 'cafeteria',
    pinColor: '#a0714a',
    iconColor: '#fffaf2',
    icon: Coffee,
  },
  bar: {
    key: 'bar',
    pinColor: '#8b5f73',
    iconColor: '#fff7fb',
    icon: UtensilsCrossed,
  },
  tienda: {
    key: 'tienda',
    pinColor: '#7f6a4a',
    iconColor: '#fffaf2',
    icon: Store,
  },
  venta_tablas: {
    key: 'venta_tablas',
    pinColor: '#87663f',
    iconColor: '#fffaf2',
    icon: ShoppingBag,
  },
  alquiler_tablas: {
    key: 'alquiler_tablas',
    pinColor: '#9a7248',
    iconColor: '#fffaf2',
    icon: ShoppingBag,
  },
  escuela_surf: {
    key: 'escuela_surf',
    pinColor: '#487764',
    iconColor: '#eef9f1',
    icon: GraduationCap,
  },
  deportes: {
    key: 'deportes',
    pinColor: '#4f7756',
    iconColor: '#f2fff2',
    icon: Waves,
  },
  mirador: {
    key: 'mirador',
    pinColor: '#5a7d93',
    iconColor: '#f3fbff',
    icon: MapPin,
  },
  transporte: {
    key: 'transporte',
    pinColor: '#6675a1',
    iconColor: '#f5f7ff',
    icon: MapPin,
  },
  servicios: {
    key: 'servicios',
    pinColor: '#69755f',
    iconColor: '#fbfff8',
    icon: Building2,
  },
  salud: {
    key: 'salud',
    pinColor: '#b0666e',
    iconColor: '#fff8f8',
    icon: Building2,
  },
  hospedaje: {
    key: 'hospedaje',
    pinColor: '#5f7c8f',
    iconColor: '#f5fbff',
    icon: BedDouble,
  },
  otros: {
    key: 'otros',
    pinColor: '#716b62',
    iconColor: '#fffaf2',
    icon: MapPin,
  },
}

const fallbackMarker = markerByCategory.otros

function resolveMarker(categories: readonly string[]): MarkerAppearance {
  for (const category of categories) {
    const match = markerByCategory[category]
    if (match) return match
  }

  return fallbackMarker
}

function serializeAttributes(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .filter(([key]) => key !== 'key')
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')
}

function buildIconMarkup(icon: LucideIcon) {
  const iconNode = (icon as LucideForwardRefIcon).render({}, null).props?.iconNode ?? []
  const children = iconNode
    .map(([tagName, attrs]) => `<${tagName} ${serializeAttributes(attrs)}></${tagName}>`)
    .join('')

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"',
    ' fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"',
    ' stroke-linejoin="round" aria-hidden="true">',
    children,
    '</svg>',
  ].join('')
}

export function getPointMarkerIcon(categories: readonly string[], selected: boolean) {
  const marker = resolveMarker(categories)
  const cacheKey = `${marker.key}:${selected ? 'selected' : 'default'}`
  const cached = markerCache.get(cacheKey)

  if (cached) {
    return cached
  }

  const icon = L.divIcon({
    className: 'MapPinMarkerRoot',
    iconSize: [36, 48],
    iconAnchor: [18, 46],
    popupAnchor: [0, -40],
    html: `
      <div
        class="MapPinMarker${selected ? ' is-selected' : ''}"
        style="--pin-color: ${marker.pinColor}; --pin-icon-color: ${marker.iconColor};"
      >
        <span class="MapPinMarkerInner">${buildIconMarkup(marker.icon)}</span>
      </div>
    `,
  })

  markerCache.set(cacheKey, icon)
  return icon
}