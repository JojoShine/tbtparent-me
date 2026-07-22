import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

const BLOG_FIELDS = [
  'title_zh', 'title_en', 'slug', 'excerpt_zh', 'excerpt_en',
  'content_zh', 'content_en', 'status', 'pinned', 'cover_image',
  'published_at', 'tags_zh', 'tags_en',
]

function pickBlogFields(body) {
  const data = {}
  for (const f of BLOG_FIELDS) {
    if (f in body) data[f] = body[f]
  }
  return data
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: { images: true },
      })
      return Response.json(blog)
    }

    const status = searchParams.get('status')
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10'), 1), 100)

    const where = { deleted_at: null }
    if (status) where.status = status
    if (tag) {
      where.OR = [
        { tags_zh: { has: tag } },
        { tags_en: { has: tag } },
      ]
    }

    const tagBlogs = await prisma.blog.findMany({
      where: { status: 'published', deleted_at: null },
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
    console.error('blog GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const data = pickBlogFields(body)
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date()
    }
    const blog = await prisma.blog.create({ data })
    return Response.json(blog)
  } catch (error) {
    console.error('blog POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id } = body
    const data = pickBlogFields(body)
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date()
    }
    const blog = await prisma.blog.update({ where: { id }, data })
    return Response.json(blog)
  } catch (error) {
    console.error('blog PUT error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }
    await prisma.blog.update({ where: { id }, data: { deleted_at: new Date() } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('blog DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
