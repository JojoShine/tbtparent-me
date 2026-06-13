// 数据迁移脚本：blog.posts → tbtparent.Blog
// 用法: node prisma/migrate-blog.js

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'

const prisma = new PrismaClient()
const blogDb = new pg.Client({
  host: '121.196.245.95',
  port: 5432,
  user: 'admin',
  password: 'Xiaz123579...',
  database: 'blog',
})

async function migrate() {
  console.log('📦 开始迁移 blog.posts → Blog...\n')

  await blogDb.connect()
  const { rows: posts } = await blogDb.query(
    'SELECT id, title, slug, content, excerpt, featured_image, published, published_at, created_at, updated_at FROM posts ORDER BY id'
  )
  await blogDb.end()

  console.log(`找到 ${posts.length} 篇文章\n`)

  let inserted = 0
  let skipped = 0

  for (const post of posts) {
    const slug = post.slug

    // 检查是否已存在
    const existing = await prisma.blog.findUnique({ where: { slug } })
    if (existing) {
      // 更新已有记录的新字段
      await prisma.blog.update({
        where: { slug },
        data: {
          cover_image: post.featured_image || null,
          published_at: post.published_at || null,
          tags_zh: [],
          tags_en: [],
        },
      })
      console.log(`🔄 更新: ${slug}`)
      skipped++
      continue
    }

    try {
      await prisma.blog.create({
        data: {
          title_zh: post.title || '',
          title_en: post.title || '',  // 英文暂用中文填充
          slug: slug,
          excerpt_zh: post.excerpt || '',
          excerpt_en: post.excerpt || '',
          content_zh: post.content || '',
          content_en: post.content || '',
          cover_image: post.featured_image || null,
          status: post.published ? 'published' : 'draft',
          published_at: post.published_at || null,
          pinned: false,
          createdAt: post.created_at || new Date(),
          updatedAt: post.updated_at || new Date(),
        },
      })
      console.log(`✅ 迁移: ${slug} [${post.published ? '已发布' : '草稿'}]`)
      inserted++
    } catch (e) {
      console.error(`❌ 失败: ${slug} - ${e.message}`)
    }
  }

  console.log(`\n🎉 迁移完成！新增 ${inserted} 篇，跳过 ${skipped} 篇`)
  await prisma.$disconnect()
}

migrate().catch(e => {
  console.error('迁移失败:', e)
  process.exit(1)
})
