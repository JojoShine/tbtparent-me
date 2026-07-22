import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

export async function GET() {
  try {
    const about = await prisma.about.findFirst()
    return Response.json(about)
  } catch (error) {
    console.error('about GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { bio_zh, bio_en } = body
    const about = await prisma.about.upsert({
      where: { id: 1 },
      update: { bio_zh, bio_en },
      create: { id: 1, bio_zh, bio_en },
    })
    return Response.json(about)
  } catch (error) {
    console.error('about PUT error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
