import { unstable_cache } from 'next/cache.js'
import HomeClient from '@/components/home/HomeClient'
import { prisma } from '@/lib/prisma'
import { sortProjectsByYearAndOrder } from '@/lib/project-showcase'

const getHomePageData = unstable_cache(
  async () => {
    const [home, socialLinks, projects] = await Promise.all([
      prisma.home.findFirst(),
      prisma.socialLink.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.project.findMany({
        where: { recent_focus: true, deleted_at: null },
        select: {
          id: true,
          name_zh: true,
          name_en: true,
          description_zh: true,
          description_en: true,
          tags_zh: true,
          tags_en: true,
          github: true,
          demo_url: true,
          project_type: true,
          sortOrder: true,
          createdAt: true,
        },
      }),
    ])
    return [home, socialLinks, sortProjectsByYearAndOrder(projects)]
  },
  ['home-page-data'],
  { revalidate: 60, tags: ['home-page-data'] },
)

export default async function HomePage() {
  const [home, socialLinks, projects] = await getHomePageData()

  return <HomeClient home={home} socialLinks={socialLinks} projects={projects} />
}
