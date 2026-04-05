export type { CategoryKey, MapPoint } from './types/map'
export { API_BASE as apiBase } from './services/http'
export { health, login } from './services/auth.service'
export {
  createPoint,
  deletePoint,
  getPoint,
  listMapPointPins,
  listPoints,
  listPointsPage,
  updatePoint,
} from './services/points.service'

import { health, login } from './services/auth.service'
import {
  createPoint,
  deletePoint,
  getPoint,
  listMapPointPins,
  listPoints,
  listPointsPage,
  updatePoint,
} from './services/points.service'
import { API_BASE } from './services/http'

export const API = {
  base: API_BASE,
  health,
  login,
  listPoints,
  listPointsPage,
  listMapPointPins,
  getPoint,
  createPoint,
  updatePoint,
  deletePoint,
}
