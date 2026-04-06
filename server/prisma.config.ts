import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const fallbackDatabaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/chicama_map?schema=public'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: fallbackDatabaseUrl,
  },
})
