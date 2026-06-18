import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取博客列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      // 获取单篇文章
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: { images: true },
      })
      return Response.json(blog)
    }

    // 获取列表（支持分页 + 标签筛选）
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const where = {}
    if (status) where.status = status
    if (tag) {
      where.OR = [
        { tags_zh: { has: tag } },
        { tags_en: { has: tag } },
      ]
    }

    // 查询所有标签（仅已发布）
    const tagBlogs = await prisma.blog.findMany({
      where: { status: 'published' },
      select: { tags_zh: true, tags_en: true },
    })
    const tagSet = new Set()
    tagBlogs.forEach(b => {
      if (Array.isArray(b.tags_zh)) b.tags_zh.forEach(t => tagSet.add(t))
      if (Array.isArray(b.tags_en)) b.tags_en.forEach(t => tagSet.add(t))
    })
    const allTags = [...tagSet]

    const total = await prisma.blog.count({ where })
    const blogs = await prisma.blog.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title_zh: true,
        title_en: true,
        slug: true,
        excerpt_zh: true,
        excerpt_en: true,
        tags_zh: true,
        tags_en: true,
        cover_image: true,
        published_at: true,
        status: true,
        pinned: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return Response.json({ blogs, total, page, pageSize, allTags })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 管理：创建博客
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const blog = await prisma.blog.create({
      data: {
        ...body,
        published_at: body.status === 'published' ? new Date() : null,
      },
    })
    return Response.json(blog)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：更新博客
export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id, images, ...data } = body
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date()
    }
    const blog = await prisma.blog.update({ where: { id }, data })
    return Response.json(blog)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：删除博客
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.blog.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
