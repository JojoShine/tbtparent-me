import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { isValidUrl } from '@/lib/validate-url'

export async function GET() {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return Response.json(links)
  } catch (error) {
    console.error('social-links GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { name, url, icon, sortOrder } = body
    if (url && !isValidUrl(url)) {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }
    const link = await prisma.socialLink.create({ data: { name, url, icon, sortOrder } })
    return Response.json(link)
  } catch (error) {
    console.error('social-links POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id, name, url, icon, sortOrder } = body
    if (url && !isValidUrl(url)) {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }
    const link = await prisma.socialLink.update({
      where: { id },
      data: { name, url, icon, sortOrder },
    })
    return Response.json(link)
  } catch (error) {
    console.error('social-links PUT error:', error)
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
    await prisma.socialLink.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('social-links DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
