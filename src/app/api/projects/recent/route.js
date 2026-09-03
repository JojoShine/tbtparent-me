import { prisma } from '@/lib/prisma'
import { sortProjectsByYearAndOrder } from '@/lib/project-showcase'

// 公开：获取近期聚焦项目列表
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { recent_focus: true, deleted_at: null },
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
      },
    })
    return Response.json(sortProjectsByYearAndOrder(projects), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('GET /api/projects/recent error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
