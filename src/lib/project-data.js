import { unstable_cache } from 'next/cache.js'
import { prisma } from '@/lib/prisma'
import { sortProjectsByYearAndOrder } from '@/lib/project-showcase'

export const getCachedProjects = unstable_cache(
  async () => {
    const projects = await prisma.project.findMany({
      where: { deleted_at: null },
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
        capabilities: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title_zh: true,
            title_en: true,
            description_zh: true,
            description_en: true,
            icon: true,
            sortOrder: true,
          },
        },
      },
    })
    return sortProjectsByYearAndOrder(projects)
  },
  ['projects-data'],
  { revalidate: 300, tags: ['projects-data'] },
)
