import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { minioClient, MINIO_BUCKET, ensureBucket } from '../src/lib/minio.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  // 读取图片文件
  const imagePath = path.join(__dirname, 'ten-leaves-flower.jpg')
  
  if (!fs.existsSync(imagePath)) {
    console.error('❌ 图片文件不存在:', imagePath)
    return
  }

  await ensureBucket()

  // 生成文件名
  const timestamp = Date.now()
  const filename = `archive/${timestamp}-ten-leaves-flower.jpg`

  // 读取文件为 Buffer
  const buffer = fs.readFileSync(imagePath)

  // 上传到 MinIO
  await minioClient.putObject(MINIO_BUCKET, filename, buffer, undefined, {
    'Content-Type': 'image/jpeg',
  })

  console.log('✅ 图片已上传到 MinIO')
  console.log(`   路径: ${MINIO_BUCKET}/${filename}`)
  console.log(`   URL: /api/archive/files?path=${encodeURIComponent(`${MINIO_BUCKET}/${filename}`)}`)

  // 更新小说封面
  const novel = await prisma.archiveNovel.findFirst({
    where: { title_zh: '十叶花' },
  })

  if (novel) {
    await prisma.archiveNovel.update({
      where: { id: novel.id },
      data: { cover_url: `${MINIO_BUCKET}/${filename}` },
    })
    console.log('✅ 小说封面已更新')
  } else {
    console.log('⚠️  未找到"十叶花"小说')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
