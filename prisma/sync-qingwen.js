import 'dotenv/config'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import { minioClient, MINIO_BUCKET } from '../src/lib/minio.js'
import { qingwenProjectData, qingwenCapabilities } from './qingwen-data.js'

const prisma = new PrismaClient()
const filename = 'qingwen-20261017.png'
const objectName = `projects/covers/${filename}`

async function main() {
  const cover = await fs.readFile(fileURLToPath(new URL(`../public/images/projects/covers/${filename}`, import.meta.url)))
  await minioClient.putObject(MINIO_BUCKET, objectName, cover, undefined, { 'Content-Type': 'image/png' })

  const project = await prisma.$transaction(async tx => {
    const owl = await tx.project.findFirstOrThrow({
      where: { deleted_at: null, OR: [{ name_zh: 'Owl' }, { name_en: 'Owl' }] },
      select: { id: true, sortOrder: true },
    })
    const existing = await tx.project.findFirst({
      where: { deleted_at: null, OR: [{ name_zh: '轻问' }, { name_en: 'Qingwen' }] },
      select: { id: true },
    })
    const data = {
      ...qingwenProjectData,
      cover_url: `/api/archive/files?path=${encodeURIComponent(`${MINIO_BUCKET}/${objectName}`)}`,
      cover_width: 1536,
      cover_height: 1024,
    }

    // Only a new entry shifts the list; reruns preserve its links, date, and position.
    if (!existing) {
      await tx.project.updateMany({
        where: { deleted_at: null, sortOrder: { gte: owl.sortOrder } },
        data: { sortOrder: { increment: 1 } },
      })
    }
    const saved = existing
      ? await tx.project.update({ where: { id: existing.id }, data })
      : await tx.project.create({
        data: { ...data, sortOrder: owl.sortOrder, link: '', github: null, demo_url: null },
      })

    await tx.projectCapability.deleteMany({ where: { projectId: saved.id } })
    await tx.projectCapability.createMany({
      data: qingwenCapabilities.map((capability, sortOrder) => ({
        ...capability, projectId: saved.id, sortOrder,
      })),
    })
    return saved
  })

  console.log(`轻问 synchronized: id=${project.id}, sortOrder=${project.sortOrder}`)
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
