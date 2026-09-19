import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { aroundMeProjectData } from './around-me-data.js'
import { projectCapabilities } from './project-capabilities-data.js'

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async tx => {
    await tx.project.deleteMany({
      where: {
        OR: [
          { name_zh: { in: ['custom-app', 'custom_app'] } },
          { name_en: { in: ['custom-app', 'custom_app'] } },
        ],
      },
    })

    const existing = await tx.project.findFirst({
      where: {
        OR: [
          { name_zh: { in: ['AroundMe', 'Around Me'] } },
          { name_en: { in: ['AroundMe', 'Around Me'] } },
        ],
      },
      select: { id: true },
    })

    const project = existing
      ? await tx.project.update({ where: { id: existing.id }, data: aroundMeProjectData })
      : await tx.project.create({ data: aroundMeProjectData })

    await tx.projectCapability.deleteMany({ where: { projectId: project.id } })
    await tx.projectCapability.createMany({
      data: projectCapabilities.AroundMe.map((capability, sortOrder) => ({
        ...capability,
        projectId: project.id,
        sortOrder,
      })),
    })
  })

  console.log('AroundMe synchronized and custom_app removed.')
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
