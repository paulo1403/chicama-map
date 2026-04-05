import { Elysia, t } from 'elysia'
import { issueAdminToken } from './auth.service'

export const authRoutes = new Elysia({
  name: 'auth-routes',
  prefix: '/auth',
}).post(
  '/login',
  async ({ body, jwt, set }: any) => {
    const session = await issueAdminToken(body.username, body.password, jwt)

    if (!session) {
      set.status = 401
      return { error: 'Credenciales inválidas' }
    }

    return session
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
  },
)
