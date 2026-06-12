import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取关于数据
export async function GET() {
  try {
    const about = await prisma.about.findFirst()
    return Response.json(about)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 管理：更新关于数据
export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const about = await prisma.about.upsert({
      where: { id: 1 },
      update: body,
      create: { id: 1, ...body },
    })
    return Response.json(about)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
