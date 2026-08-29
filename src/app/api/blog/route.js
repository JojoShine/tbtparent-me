import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { revalidateTag, unstable_cache } from 'next/cache.js'

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

const getCachedBlogBySlug = unstable_cache(
  slug => prisma.blog.findUnique({ where: { slug }, include: { images: true } }),
  ['blog-by-slug'],
  { revalidate: 300, tags: ['blog-data'] },
)

const getCachedBlogList = unstable_cache(
  async (status, tag, page, pageSize) => {
    const where = { deleted_at: null }
    if (status) where.status = status
    if (tag) {
      where.OR = [
        { tags_zh: { has: tag } },
        { tags_en: { has: tag } },
      ]
    }

    const [tagBlogs, total, blogs] = await Promise.all([
      prisma.blog.findMany({
        where: { status: 'published', deleted_at: null },
        select: { tags_zh: true, tags_en: true },
      }),
      prisma.blog.count({ where }),
      prisma.blog.findMany({
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
      }),
    ])

    const tagSet = new Set()
    tagBlogs.forEach(blog => {
      blog.tags_zh?.forEach(tagName => tagSet.add(tagName))
      blog.tags_en?.forEach(tagName => tagSet.add(tagName))
    })

    return { blogs, total, page, pageSize, allTags: [...tagSet] }
  },
  ['blog-list'],
  { revalidate: 300, tags: ['blog-data'] },
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const blog = await getCachedBlogBySlug(slug)
      return Response.json(blog)
    }

    const status = searchParams.get('status')
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '10'), 1), 100)

    return Response.json(await getCachedBlogList(status || '', tag || '', page, pageSize))
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
    revalidateTag('blog-data', { expire: 0 })
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
    revalidateTag('blog-data', { expire: 0 })
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
    revalidateTag('blog-data', { expire: 0 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('blog DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
