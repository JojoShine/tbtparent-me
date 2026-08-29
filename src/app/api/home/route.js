import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { revalidateTag } from 'next/cache.js'

export async function GET() {
  try {
    const home = await prisma.home.findFirst()
    return Response.json(home)
  } catch (error) {
    console.error('home GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { name_zh, name_en, nameZh, title_zh, title_en, bio_zh, bio_en } = body
    const data = { name_zh, name_en, nameZh, title_zh, title_en, bio_zh, bio_en }
    const home = await prisma.home.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    })
    revalidateTag('home-page-data', { expire: 0 })
    return Response.json(home)
  } catch (error) {
    console.error('home PUT error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
