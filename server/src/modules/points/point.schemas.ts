import { t } from 'elysia'

export const pointListQuerySchema = t.Object({
  page: t.Optional(t.Numeric()),
  limit: t.Optional(t.Numeric()),
  q: t.Optional(t.String()),
  categories: t.Optional(t.String()),
  ids: t.Optional(t.String()),
  sort: t.Optional(t.String()),
  originLat: t.Optional(t.Numeric()),
  originLng: t.Optional(t.Numeric()),
})

export const pointMapQuerySchema = t.Object({
  q: t.Optional(t.String()),
  categories: t.Optional(t.String()),
  ids: t.Optional(t.String()),
  sort: t.Optional(t.String()),
  originLat: t.Optional(t.Numeric()),
  originLng: t.Optional(t.Numeric()),
  minLat: t.Optional(t.Numeric()),
  maxLat: t.Optional(t.Numeric()),
  minLng: t.Optional(t.Numeric()),
  maxLng: t.Optional(t.Numeric()),
})

export const pointCreateBodySchema = t.Object({
  id: t.String(),
  lat: t.Number(),
  lng: t.Number(),
  name: t.String(),
  categories: t.Array(t.String()),
  rating: t.Number(),
  description: t.String(),
  contact: t.String(),
  keywords: t.Array(t.String()),
})

export const pointUpdateBodySchema = t.Partial(
  t.Object({
    name: t.String(),
    lat: t.Number(),
    lng: t.Number(),
    categories: t.Array(t.String()),
    rating: t.Number(),
    description: t.String(),
    contact: t.String(),
    keywords: t.Array(t.String()),
  }),
)
