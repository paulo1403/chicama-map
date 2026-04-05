import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import { DEFAULT_ZOOM } from '../../utils/location'
import type { MapPoint } from '../../types/map'

type MapFocusProps = {
  point: MapPoint | null
}

export function MapFocus({ point }: MapFocusProps) {
  const map = useMap()

  useEffect(() => {
    if (!point) return

    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), DEFAULT_ZOOM), {
      animate: true,
      duration: 0.7,
    })
  }, [map, point])

  return null
}