import { PrismaBunSqlite } from 'prisma-adapter-bun-sqlite'
import { PrismaClient } from '../../generated/prisma/client'
import { env } from '../config/env'

const adapter = new PrismaBunSqlite({ url: env.databaseUrl })

export const prisma = new PrismaClient({ adapter })
