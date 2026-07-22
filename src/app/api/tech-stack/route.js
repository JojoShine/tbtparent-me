import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

export async function GET() {
  try {
    const techStack = await prisma.techStack.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(techStack)
  } catch (error) {
    console.error('tech-stack GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { name, sortOrder } = body
    const tech = await prisma.techStack.create({ data: { name, sortOrder } })
    return Response.json(tech)
  } catch (error) {
    console.error('tech-stack POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id'))
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid id' }, { status: 400 })
    }
    await prisma.techStack.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('tech-stack DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
