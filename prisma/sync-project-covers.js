import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import { ensureBucket, minioClient, MINIO_BUCKET } from '../src/lib/minio.js'

const prisma = new PrismaClient()
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const coverDirectory = path.join(scriptDirectory, '../public/images/projects/covers')

const covers = [
  { aliases: ['AroundMe', 'Around Me'], filename: 'around-me.png', width: 1536, height: 1024, projectType: 'integrated' },
  { aliases: ['DataMesh'], filename: 'data-mesh.png', width: 1536, height: 1024 },
  { aliases: ['FlowCraft'], filename: 'flow-craft.png', width: 1536, height: 1024 },
  { aliases: ['Owl'], filename: 'owl.png', width: 1536, height: 1024 },
  { aliases: ['app-portfolio'], filename: 'app-portfolio.png', width: 1536, height: 1024 },
  { aliases: ['PasswordManager', 'password_manager'], filename: 'password-manager.png', width: 1672, height: 941 },
  { aliases: ['ant-eyes'], filename: 'ant-eyes.png', width: 1536, height: 1024 },
]

async function main() {
  await ensureBucket()

  for (const cover of covers) {
    const project = await prisma.project.findFirst({
      where: {
        deleted_at: null,
        OR: [
          { name_zh: { in: cover.aliases } },
          { name_en: { in: cover.aliases } },
        ],
      },
      select: { id: true, name_zh: true },
    })
    if (!project) throw new Error(`Project not found for ${cover.aliases.join(' / ')}`)

    const objectName = `projects/covers/${cover.filename}`
    const buffer = await fs.readFile(path.join(coverDirectory, cover.filename))
    await minioClient.putObject(MINIO_BUCKET, objectName, buffer, undefined, {
      'Content-Type': 'image/png',
    })

    const objectPath = `${MINIO_BUCKET}/${objectName}`
    await prisma.project.update({
      where: { id: project.id },
      data: {
        cover_url: `/api/archive/files?path=${encodeURIComponent(objectPath)}`,
        cover_width: cover.width,
        cover_height: cover.height,
        ...(cover.projectType ? { project_type: cover.projectType } : {}),
      },
    })
    console.log(`Synchronized cover: ${project.name_zh}`)
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
