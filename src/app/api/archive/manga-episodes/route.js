import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 获取漫剧集数列表（公开）
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const mangaId = searchParams.get('mangaId')
  const episodeId = searchParams.get('episodeId')

  try {
    if (episodeId) {
      const episode = await prisma.mangaEpisode.findUnique({
        where: { id: parseInt(episodeId) },
      })
      return Response.json(episode ? [episode] : [])
    }

    if (mangaId) {
      const episodes = await prisma.mangaEpisode.findMany({
        where: { mangaId: parseInt(mangaId) },
        orderBy: [{ sortOrder: 'asc' }, { episode_number: 'asc' }],
      })
      return Response.json(episodes)
    }

    // 没有参数，返回所有集数
    const allEpisodes = await prisma.mangaEpisode.findMany({
      orderBy: [{ sortOrder: 'asc' }, { episode_number: 'asc' }],
    })
    return Response.json(allEpisodes)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建漫剧集数
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json()
    const episode = await prisma.mangaEpisode.create({
      data: {
        mangaId: data.mangaId,
        episode_number: data.episode_number || 0,
        title_zh: data.title_zh || '',
        title_en: data.title_en || data.title_zh || '',
        cover_url: data.cover_url || null,
        video_url: data.video_url || null,
        aspect_ratio: data.aspect_ratio || 'landscape',
        sortOrder: data.sortOrder || 0,
      },
    })
    return Response.json(episode)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// 更新漫剧集数
export const PUT = withAuth(async (request) => {
  try {
    const { id, ...data } = await request.json()
    const episode = await prisma.mangaEpisode.update({
      where: { id },
      data: {
        episode_number: data.episode_number,
        title_zh: data.title_zh,
        title_en: data.title_en,
        cover_url: data.cover_url,
        video_url: data.video_url,
        aspect_ratio: data.aspect_ratio,
        sortOrder: data.sortOrder,
      },
    })
    return Response.json(episode)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// 删除漫剧集数
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    if (isNaN(id)) return Response.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.mangaEpisode.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
