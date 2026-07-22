import { prisma } from '@/lib/prisma'

// 公开：获取近期聚焦项目列表
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { recent_focus: true, deleted_at: null },
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(projects)
  } catch (error) {
    console.error('GET /api/projects/recent error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
