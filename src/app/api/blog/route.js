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

    // 获取列表
    const status = searchParams.get('status')
    const where = status ? { status } : {}
    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    })
    return Response.json(blogs)
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
        publishedAt: body.status === 'published' ? new Date() : null,
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
    const { id, ...data } = body
    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = new Date()
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
