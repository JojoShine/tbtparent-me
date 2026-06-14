import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 获取章节列表（公开）
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const novelId = searchParams.get('novelId')
  const chapterId = searchParams.get('chapterId')
  
  try {
    if (chapterId) {
      // 根据章节ID获取
      const chapter = await prisma.novelChapter.findUnique({
        where: { id: parseInt(chapterId) },
      })
      return Response.json(chapter ? [chapter] : [])
    }
    
    if (novelId) {
      const chapters = await prisma.novelChapter.findMany({
        where: { novelId: parseInt(novelId) },
        orderBy: [{ sortOrder: 'asc' }, { published_at: 'desc' }],
      })
      return Response.json(chapters)
    }
    
    // 如果没有参数，返回所有章节
    const allChapters = await prisma.novelChapter.findMany({
      orderBy: [{ sortOrder: 'asc' }, { published_at: 'desc' }],
    })
    return Response.json(allChapters)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 创建章节
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json()
    const chapter = await prisma.novelChapter.create({
      data: {
        novelId: data.novelId,
        chapter_number: data.chapter_number || 0,
        title_zh: data.title_zh || '',
        title_en: data.title_en || data.title_zh || '',
        content_zh: data.content_zh || '',
        content_en: data.content_en || null,
        sortOrder: data.sortOrder || 0,
        published_at: data.published_at ? new Date(data.published_at) : null,
      },
    })
    return Response.json(chapter)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 更新章节
export const PUT = withAuth(async (request) => {
  try {
    const { id, ...data } = await request.json()
    const chapter = await prisma.novelChapter.update({
      where: { id },
      data: {
        chapter_number: data.chapter_number,
        title_zh: data.title_zh,
        title_en: data.title_en,
        content_zh: data.content_zh,
        content_en: data.content_en,
        sortOrder: data.sortOrder,
        published_at: data.published_at ? new Date(data.published_at) : null,
      },
    })
    return Response.json(chapter)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 删除章节
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.novelChapter.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
