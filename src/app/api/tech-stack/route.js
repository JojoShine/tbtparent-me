import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取技术栈列表
export async function GET() {
  try {
    const techStack = await prisma.techStack.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(techStack)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 管理：新增技术栈
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const tech = await prisma.techStack.create({ data: body })
    return Response.json(tech)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：删除技术栈
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.techStack.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
