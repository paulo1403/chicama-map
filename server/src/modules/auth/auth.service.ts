import { env } from '../../config/env'

type JwtService = {
  sign(payload: { sub: string; role: string }): Promise<string>
  verify(token: string): Promise<{ role?: string } | false | null>
}

type RouteSet = {
  status?: number
}

export async function issueAdminToken(username: string, password: string, jwt: JwtService) {
  if (username !== env.adminUser || password !== env.adminPass) {
    return null
  }

  const token = await jwt.sign({ sub: 'admin', role: 'admin' })
  return { token }
}

export async function requireAdminAccess(request: Request, jwt: JwtService, set: RouteSet) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ')
    ? auth.slice(7)
    : ''

  if (!token) {
    set.status = 401
    return null
  }

  const payload = await jwt.verify(token)

  if (!payload || payload.role !== 'admin') {
    set.status = 401
    return null
  }

  return payload
}
