import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { isValidUrl } from '@/lib/validate-url'
import { revalidateTag } from 'next/cache.js'
import { getCachedProjects } from '@/lib/project-data'

const PROJECT_FIELDS = [
  'name_zh', 'name_en', 'description_zh', 'description_en',
  'tags_zh', 'tags_en', 'deadline_zh', 'deadline_en',
  'link', 'github', 'demo_url', 'project_type', 'sortOrder',
  'content_en', 'content_zh', 'recent_focus', 'video_url',
]

function pickProjectFields(body) {
  const data = {}
  for (const field of PROJECT_FIELDS) {
    if (!(field in body)) continue
    data[field] = typeof body[field] === 'string' ? body[field].trim() : body[field]
  }
  if (data.link === '#') data.link = ''
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

    const projects = await getCachedProjects()
    return Response.json(projects, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
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
    revalidateTag('home-page-data', { expire: 0 })
    revalidateTag('projects-data', { expire: 0 })
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
    revalidateTag('home-page-data', { expire: 0 })
    revalidateTag('projects-data', { expire: 0 })
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
    revalidateTag('home-page-data', { expire: 0 })
    revalidateTag('projects-data', { expire: 0 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('projects DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})
