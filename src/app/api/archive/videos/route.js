import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 获取所有视频（公开）
export async function GET() {
  try {
    const videos = await prisma.archiveVideo.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { published_at: 'desc' },
      ],
    })
    return Response.json(videos)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 创建视频
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json()
    const video = await prisma.archiveVideo.create({
      data: {
        title_zh: data.title_zh || '',
        title_en: data.title_en || data.title_zh || '',
        description_zh: data.description_zh || null,
        description_en: data.description_en || null,
        cover_url: data.cover_url || null,
        video_url: data.video_url || null,
        sortOrder: data.sortOrder || 0,
        published_at: data.published_at ? new Date(data.published_at) : null,
      },
    })
    return Response.json(video)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// 更新视频
export const PUT = withAuth(async (request) => {
  try {
    const { id, ...data } = await request.json()
    const video = await prisma.archiveVideo.update({
      where: { id },
      data: {
        title_zh: data.title_zh,
        title_en: data.title_en,
        description_zh: data.description_zh,
        description_en: data.description_en,
        cover_url: data.cover_url,
        video_url: data.video_url,
        sortOrder: data.sortOrder,
        published_at: data.published_at ? new Date(data.published_at) : null,
      },
    })
    return Response.json(video)
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// 删除视频
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    if (isNaN(id)) return Response.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.archiveVideo.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
