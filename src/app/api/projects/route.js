import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取项目列表
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(projects)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 管理：新增项目
export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const project = await prisma.project.create({ data: body })
    return Response.json(project)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：更新项目
export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const project = await prisma.project.update({ where: { id }, data })
    return Response.json(project)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 管理：删除项目
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.project.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
