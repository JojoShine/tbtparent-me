import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 获取所有漫剧系列及集数元信息（公开）
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // 单个漫剧系列详情（含集数）
      const manga = await prisma.archiveManga.findUnique({
        where: { id: parseInt(id) },
        include: {
          episodes: {
            orderBy: [{ sortOrder: 'asc' }, { episode_number: 'asc' }],
          },
        },
      })
      return Response.json(manga)
    }

    // 列表：集数只返回元信息
    const mangas = await prisma.archiveManga.findMany({
      include: {
        episodes: {
          select: {
            id: true,
            mangaId: true,
            episode_number: true,
            title_zh: true,
            title_en: true,
            cover_url: true,
            video_url: true,
            aspect_ratio: true,
            sortOrder: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { episode_number: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return Response.json(mangas)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 创建漫剧系列
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json()
    const manga = await prisma.archiveManga.create({
      data: {
        title_zh: data.title_zh || '',
        title_en: data.title_en || data.title_zh || '',
        description_zh: data.description_zh || null,
        description_en: data.description_en || null,
        status: data.status || 'ongoing',
        sortOrder: data.sortOrder || 0,
      },
    })
    return Response.json(manga)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 更新漫剧系列
export const PUT = withAuth(async (request) => {
  try {
    const { id, ...data } = await request.json()
    const manga = await prisma.archiveManga.update({
      where: { id },
      data: {
        title_zh: data.title_zh,
        title_en: data.title_en,
        description_zh: data.description_zh,
        description_en: data.description_en,
        status: data.status,
        sortOrder: data.sortOrder,
      },
    })
    return Response.json(manga)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 删除漫剧系列（级联删除集数）
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.archiveManga.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
