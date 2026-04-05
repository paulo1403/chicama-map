import { prisma } from './db/prisma'
import { seedPoints } from './modules/points/point.seed'

async function main() {
  console.log('Seeding database...')

  await prisma.point.deleteMany()
  console.log('Cleared existing points')

  for (const point of seedPoints) {
    await prisma.point.create({
      data: point,
    })
  }

  console.log(`✓ Seeded ${seedPoints.length} points`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
