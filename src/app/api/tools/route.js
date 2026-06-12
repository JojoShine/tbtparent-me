import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取工具列表
export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(tools)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 管理：新增工具
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const tool = await prisma.tool.create({ data: body })
    return Response.json(tool)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：更新工具
export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const tool = await prisma.tool.update({ where: { id }, data })
    return Response.json(tool)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：删除工具
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.tool.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
