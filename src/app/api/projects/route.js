import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取项目列表或单个项目详情
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // 获取单个项目详情
      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
      })
      return Response.json(project)
    }

    // 列表：排除 content 字段以提升性能
    const projects = await prisma.project.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name_zh: true,
        name_en: true,
        description_zh: true,
        description_en: true,
        tags_zh: true,
        tags_en: true,
        deadline_zh: true,
        deadline_en: true,
        link: true,
        github: true,
        demo_url: true,
        project_type: true,
        recent_focus: true,
        video_url: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
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
