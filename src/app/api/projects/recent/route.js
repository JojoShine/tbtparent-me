import { prisma } from '@/lib/prisma'

// 公开：获取近期聚焦项目列表
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { recent_focus: true },
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(projects)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
