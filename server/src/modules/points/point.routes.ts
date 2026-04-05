import { Elysia } from 'elysia'
import { requireAdminAccess } from '../auth/auth.service'
import {
  pointCreateBodySchema,
  pointListQuerySchema,
  pointMapQuerySchema,
  pointUpdateBodySchema,
} from './point.schemas'
import {
  createPoint,
  deletePoint,
  getPointById,
  listMapPoints,
  listPoints,
  updatePoint,
} from './point.service'

export const pointsRoutes = new Elysia({
  name: 'points-routes',
  prefix: '/points',
})
  .get('/', ({ query }) => listPoints(query), {
    query: pointListQuerySchema,
  })
  .get('/map', ({ query }) => listMapPoints(query), {
    query: pointMapQuerySchema,
  })
  .get('/:id', async ({ params, set }) => {
    const point = await getPointById(params.id)

    if (!point) {
      set.status = 404
      return { error: 'No encontrado' }
    }

    return point
  })
  .post(
    '/',
    async ({ body, request, jwt, set }: any) => {
      const admin = await requireAdminAccess(request, jwt, set)

      if (!admin) {
        return { error: 'No autorizado' }
      }

      return createPoint(body)
    },
    {
      body: pointCreateBodySchema,
    },
  )
  .patch(
    '/:id',
    async ({ params, body, request, jwt, set }: any) => {
      const admin = await requireAdminAccess(request, jwt, set)

      if (!admin) {
        return { error: 'No autorizado' }
      }

      const point = await updatePoint(params.id, body)

      if (!point) {
        set.status = 404
        return { error: 'No encontrado' }
      }

      return point
    },
    {
      body: pointUpdateBodySchema,
    },
  )
  .delete('/:id', async ({ params, request, jwt, set }: any) => {
    const admin = await requireAdminAccess(request, jwt, set)

    if (!admin) {
      return { error: 'No autorizado' }
    }

    const deleted = await deletePoint(params.id)

    if (!deleted) {
      set.status = 404
      return { error: 'No encontrado' }
    }

    return { ok: true }
  })
