import 'dotenv/config'

const fallbackPort = Number(process.env.PORT || 3000)
const port = Number.isFinite(fallbackPort) && fallbackPort > 0 ? fallbackPort : 3000
const isProduction = process.env.NODE_ENV === 'production'
const defaultPostgresUrl = 'postgresql://postgres:postgres@localhost:5432/chicama_map?schema=public'

function readConfigValue(name: string, fallback: string) {
  const value = process.env[name] || (isProduction ? '' : fallback)

  if (isProduction && !value) {
    throw new Error(`Missing production env var: ${name}`)
  }

  return value
}

export const env = {
  port,
  isProduction,
  jwtSecret: readConfigValue('JWT_SECRET', 'change-me'),
  adminUser: readConfigValue('ADMIN_USER', 'admin'),
  adminPass: readConfigValue('ADMIN_PASS', 'admin'),
  databaseUrl: process.env.DATABASE_URL || defaultPostgresUrl,
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((item: string) => item.trim())
    .filter(Boolean),
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.databaseUrl
}

