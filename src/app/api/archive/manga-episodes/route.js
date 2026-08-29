import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { revalidateTag, unstable_cache } from 'next/cache.js'

const getCachedEpisodes = unstable_cache(
  async (mangaId, episodeId) => {
    if (episodeId) {
      const episode = await prisma.mangaEpisode.findUnique({ where: { id: episodeId } })
      return episode ? [episode] : []
    }
    return prisma.mangaEpisode.findMany({
      ...(mangaId ? { where: { mangaId } } : {}),
      orderBy: [{ sortOrder: 'asc' }, { episode_number: 'asc' }],
    })
  },
  ['archive-manga-episodes'],
  { revalidate: 300, tags: ['archive-data'] },
)

// 获取漫剧集数列表（公开）
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const mangaId = searchParams.get('mangaId')
  const episodeId = searchParams.get('episodeId')

  try {
    return Response.json(await getCachedEpisodes(
      mangaId ? parseInt(mangaId) : 0,
      episodeId ? parseInt(episodeId) : 0,
    ))
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
    revalidateTag('archive-data', { expire: 0 })
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
    revalidateTag('archive-data', { expire: 0 })
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
    revalidateTag('archive-data', { expire: 0 })
    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
