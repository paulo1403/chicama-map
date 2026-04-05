import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import { env } from './config/env'
import { authRoutes } from './modules/auth/auth.routes'
import { pointsRoutes } from './modules/points/point.routes'

function isAllowedOrigin(origin: string) {
  if (!origin || env.corsOrigins.length === 0) {
    return true
  }

  return env.corsOrigins.includes(origin)
}

export function createApp() {
  return new Elysia({ name: 'chicama-api' })
    .use(
      cors({
        origin: (request) => {
          const origin = request.headers.get('Origin') || ''
          return isAllowedOrigin(origin)
        },
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      }),
    )
    .use(
      jwt({
        name: 'jwt',
        secret: env.jwtSecret,
        exp: '7d',
      }),
    )
    .get('/health', () => ({ ok: true }))
    .use(authRoutes)
    .use(pointsRoutes)
}
