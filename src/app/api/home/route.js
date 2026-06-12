import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

// 公开：获取首页数据
export async function GET() {
  try {
    const home = await prisma.home.findFirst()
    return Response.json(home)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// 管理：更新首页数据
export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const home = await prisma.home.upsert({
      where: { id: 1 },
      update: body,
      create: { id: 1, ...body },
    })
    return Response.json(home)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
