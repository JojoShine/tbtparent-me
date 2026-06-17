import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 获取所有小说及章节元信息（公开，列表不含章节正文）
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // 单个小说详情（含章节正文）
      const novel = await prisma.archiveNovel.findUnique({
        where: { id: parseInt(id) },
        include: {
          chapters: {
            orderBy: [{ sortOrder: 'asc' }, { published_at: 'desc' }],
          },
        },
      })
      return Response.json(novel)
    }

    // 列表：章节只返回元信息，不包含 content 字段
    const novels = await prisma.archiveNovel.findMany({
      include: {
        chapters: {
          select: {
            id: true,
            novelId: true,
            chapter_number: true,
            title_zh: true,
            title_en: true,
            sortOrder: true,
            published_at: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { published_at: 'desc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return Response.json(novels)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 创建小说
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json()
    const novel = await prisma.archiveNovel.create({
      data: {
        title_zh: data.title_zh || '',
        title_en: data.title_en || data.title_zh || '',
        description_zh: data.description_zh || null,
        description_en: data.description_en || null,
        cover_url: data.cover_url || null,
        external_link: data.external_link || null,
        status: data.status || 'ongoing',
        sortOrder: data.sortOrder || 0,
      },
    })
    return Response.json(novel)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 更新小说
export const PUT = withAuth(async (request) => {
  try {
    const { id, ...data } = await request.json()
    const novel = await prisma.archiveNovel.update({
      where: { id },
      data: {
        title_zh: data.title_zh,
        title_en: data.title_en,
        description_zh: data.description_zh,
        description_en: data.description_en,
        cover_url: data.cover_url,
        external_link: data.external_link,
        status: data.status,
        sortOrder: data.sortOrder,
      },
    })
    return Response.json(novel)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 删除小说
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.archiveNovel.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
