import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { isValidUrl } from '@/lib/validate-url'

const PROJECT_FIELDS = [
  'name_zh', 'name_en', 'description_zh', 'description_en',
  'tags_zh', 'tags_en', 'deadline_zh', 'deadline_en',
  'link', 'github', 'demo_url', 'project_type', 'sortOrder',
  'content_en', 'content_zh', 'recent_focus', 'video_url',
]

function pickProjectFields(body) {
  const data = {}
  for (const f of PROJECT_FIELDS) {
    if (f in body) data[f] = body[f]
  }
  return data
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
      })
      return Response.json(project)
    }

    const projects = await prisma.project.findMany({
      where: { deleted_at: null },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name_zh: true,
        name_en: true,
        description_zh: true,
        description_en: true,
        tags_zh: true,
        tags_en: true,
        deadline_zh: true,
        deadline_en: true,
        link: true,
        github: true,
        demo_url: true,
        project_type: true,
        recent_focus: true,
        video_url: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return Response.json(projects)
  } catch (error) {
    console.error('projects GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const data = pickProjectFields(body)
    for (const f of ['link', 'github', 'demo_url', 'video_url']) {
      if (data[f] && !isValidUrl(data[f])) {
        return Response.json({ error: `Invalid ${f}` }, { status: 400 })
      }
    }
    const project = await prisma.project.create({ data })
    return Response.json(project)
  } catch (error) {
    console.error('projects POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const { id } = body
    const data = pickProjectFields(body)
    for (const f of ['link', 'github', 'demo_url', 'video_url']) {
      if (data[f] && !isValidUrl(data[f])) {
        return Response.json({ error: `Invalid ${f}` }, { status: 400 })
      }
    }
    const project = await prisma.project.update({ where: { id }, data })
    return Response.json(project)
  } catch (error) {
    console.error('projects PUT error:', error)
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
    await prisma.project.update({ where: { id }, data: { deleted_at: new Date() } })
    return Response.json({ success: true })
  } catch (error) {
    console.error('projects DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
