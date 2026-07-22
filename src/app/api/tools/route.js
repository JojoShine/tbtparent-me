import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(tools)
  } catch (error) {
    console.error('tools GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { name_zh, name_en, description_zh, description_en, link, available, sortOrder } = body
    const tool = await prisma.tool.create({
      data: { name_zh, name_en, description_zh, description_en, link, available, sortOrder },
    })
    return Response.json(tool)
  } catch (error) {
    console.error('tools POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id, name_zh, name_en, description_zh, description_en, link, available, sortOrder } = body
    const tool = await prisma.tool.update({
      where: { id },
      data: { name_zh, name_en, description_zh, description_en, link, available, sortOrder },
    })
    return Response.json(tool)
  } catch (error) {
    console.error('tools PUT error:', error)
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
    await prisma.tool.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('tools DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
