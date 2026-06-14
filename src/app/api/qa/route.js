import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 获取问题集列表（公开）
export async function GET() {
  try {
    const qas = await prisma.qA.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return Response.json(qas)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 创建问题
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json()
    const qa = await prisma.qA.create({
      data: {
        title_zh: data.title_zh || '',
        title_en: data.title_en || data.title_zh || '',
        tags_zh: data.tags_zh || [],
        tags_en: data.tags_en || [],
        content_zh: data.content_zh || '',
        content_en: data.content_en || null,
        sortOrder: data.sortOrder || 0,
      },
    })
    return Response.json(qa)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 更新问题
export const PUT = withAuth(async (request) => {
  try {
    const { id, ...data } = await request.json()
    const qa = await prisma.qA.update({
      where: { id },
      data: {
        title_zh: data.title_zh,
        title_en: data.title_en,
        tags_zh: data.tags_zh,
        tags_en: data.tags_en,
        content_zh: data.content_zh,
        content_en: data.content_en,
        sortOrder: data.sortOrder,
      },
    })
    return Response.json(qa)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

// 删除问题
export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    await prisma.qA.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
