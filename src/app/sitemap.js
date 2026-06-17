import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tbtparent.me'

// 静态页面
const staticPages = [
  { url: '/', priority: 1.0, changeFrequency: 'weekly' },
  { url: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { url: '/blog', priority: 0.9, changeFrequency: 'daily' },
  { url: '/projects', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/hobbies', priority: 0.7, changeFrequency: 'weekly' },
  { url: '/tools', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/qa', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/game', priority: 0.6, changeFrequency: 'monthly' },
  { url: '/game/guess-number', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/game/idiom', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/game/takuzu', priority: 0.5, changeFrequency: 'monthly' },
]

export default async function sitemap() {
  const now = new Date().toISOString()

  // 静态页面
  const staticEntries = staticPages.map(page => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 动态页面：博客文章
  let blogEntries = []
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    })
    blogEntries = blogs.map(blog => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: blog.updatedAt?.toISOString() || now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch (e) {}

  // 动态页面：项目
  let projectEntries = []
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, updatedAt: true },
    })
    projectEntries = projects.map(p => ({
      url: `${SITE_URL}/projects/${p.id}`,
      lastModified: p.updatedAt?.toISOString() || now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch (e) {}

  // 动态页面：小说章节
  let chapterEntries = []
  try {
    const chapters = await prisma.chapter.findMany({
      select: { id: true, updatedAt: true },
    })
    chapterEntries = chapters.map(ch => ({
      url: `${SITE_URL}/hobbies/${ch.id}`,
      lastModified: ch.updatedAt?.toISOString() || now,
      changeFrequency: 'monthly',
      priority: 0.5,
    }))
  } catch (e) {}

  return [...staticEntries, ...blogEntries, ...projectEntries, ...chapterEntries]
}
