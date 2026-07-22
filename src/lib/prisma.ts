import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

declare global {
  var prismaGlobal13: undefined | PrismaClient
  var pgPoolGlobal: undefined | Pool
}

// In development, restrict pool size drastically so hot-reloads don't consume all 15 max connections
const pool = globalThis.pgPoolGlobal ?? new Pool({ 
  connectionString, 
  max: process.env.NODE_ENV === 'production' ? 10 : 2,
  idleTimeoutMillis: 10000 
})
if (process.env.NODE_ENV !== 'production') globalThis.pgPoolGlobal = pool

const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

const prisma = globalThis.prismaGlobal13 ?? prismaClientSingleton()
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal13 = prisma

export default prisma
