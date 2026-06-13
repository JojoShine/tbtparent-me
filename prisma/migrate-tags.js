// 标签迁移脚本：根据标题前缀智能映射标签
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function detectTags(title) {
  const zh = []
  const en = []

  if (title.includes('运维篇') || title.includes('运维')) {
    zh.push('运维'); en.push('ops')
  }
  if (title.includes('产品篇') || title.includes('产品')) {
    zh.push('产品'); en.push('product')
  }
  if (title.includes('AI篇') || title.includes('AI') || title.includes('RAG')) {
    zh.push('AI'); en.push('AI')
  }
  if (title.includes('数据篇') || title.includes('数据')) {
    zh.push('数据'); en.push('data')
  }
  if (title.includes('curl') || title.includes('工具')) {
    zh.push('工具'); en.push('tools')
  }
  if (title.includes('Linux') || title.includes('linux')) {
    zh.push('Linux'); en.push('linux')
  }
  if (title.includes('Nginx') || title.includes('nginx')) {
    zh.push('Nginx'); en.push('nginx')
  }
  if (title.includes('MinIO') || title.includes('minio')) {
    zh.push('MinIO'); en.push('minio')
  }
  if (title.includes('SELinux') || title.includes('selinux')) {
    zh.push('SELinux'); en.push('selinux')
  }
  if (title.includes('HTTPS') || title.includes('https')) {
    zh.push('HTTPS'); en.push('https')
  }

  // 去重
  return { zh: [...new Set(zh)], en: [...new Set(en)] }
}

async function migrateTags() {
  console.log('🏷️  开始迁移标签...\n')

  const blogs = await prisma.blog.findMany({
    select: { id: true, title_zh: true, slug: true },
  })

  for (const blog of blogs) {
    const { zh, en } = detectTags(blog.title_zh)
    if (zh.length === 0) {
      zh.push('技术'); en.push('tech')
    }

    await prisma.blog.update({
      where: { id: blog.id },
      data: { tags_zh: zh, tags_en: en },
    })
    console.log(`🏷️  ${blog.slug.substring(0, 40)}... → zh:[${zh}] en:[${en}]`)
  }

  console.log(`\n✅ 完成！共更新 ${blogs.length} 篇文章标签`)
  await prisma.$disconnect()
}

migrateTags().catch(e => {
  console.error('标签迁移失败:', e)
  process.exit(1)
})
