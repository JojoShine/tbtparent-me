import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { projectCapabilities } from './project-capabilities-data.js'
import { buildCapabilityInitialization } from '../src/lib/project-capability-initializer.js'

const prisma = new PrismaClient()

async function main() {
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name_zh: true,
      name_en: true,
      capabilities: { select: { id: true } },
    },
  })
  const operations = buildCapabilityInitialization(projects, projectCapabilities)

  if (operations.length === 0) {
    console.log('核心能力数据已存在，无需初始化。')
    return
  }

  await prisma.$transaction(
    operations.map(operation => prisma.projectCapability.createMany({
      data: operation.capabilities.map(capability => ({
        ...capability,
        projectId: operation.projectId,
      })),
    })),
  )

  for (const operation of operations) {
    console.log(`✓ ${operation.projectName}: ${operation.capabilities.length} 项核心能力`)
  }
  console.log(`初始化完成：${operations.length} 个作品。`)
}

main()
  .catch(error => {
    console.error('核心能力初始化失败:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

