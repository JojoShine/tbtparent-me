import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取社交链接列表
export async function GET() {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(links)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 管理：新增社交链接
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const link = await prisma.socialLink.create({ data: body })
    return Response.json(link)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：更新社交链接
export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const link = await prisma.socialLink.update({ where: { id }, data })
    return Response.json(link)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：删除社交链接
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.socialLink.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
