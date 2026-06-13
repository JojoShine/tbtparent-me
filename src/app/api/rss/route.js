import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tbtparent.me'

    // 并行查询所有内容
    const [blogs, projects, tools] = await Promise.all([
      prisma.blog.findMany({
        where: { status: 'published' },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take: 20,
        select: {
          title_en: true,
          slug: true,
          excerpt_en: true,
          published_at: true,
          createdAt: true,
        },
      }),
      prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          name_en: true,
          description_en: true,
          link: true,
          createdAt: true,
        },
      }),
      prisma.tool.findMany({
        where: { available: true },
        orderBy: { createdAt: 'desc' },
        select: {
          name_en: true,
          description_en: true,
          link: true,
          createdAt: true,
        },
      }),
    ])

    // 博客 items
    const blogItems = blogs.map(blog => {
      const pubDate = blog.published_at || blog.createdAt
      return `    <item>
      <title><![CDATA[[Blog] ${blog.title_en}]]></title>
      <link>${siteUrl}/blog/${blog.slug}</link>
      <guid>${siteUrl}/blog/${blog.slug}</guid>
      <description><![CDATA[${blog.excerpt_en || ''}]]></description>
      <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
    </item>`
    })

    // 项目 items
    const projectItems = projects.map(p => `    <item>
      <title><![CDATA[[Project] ${p.name_en}]]></title>
      <link>${p.link || `${siteUrl}/projects`}</link>
      <guid>${siteUrl}/project-${p.name_en.replace(/\s+/g, '-')}</guid>
      <description><![CDATA[${p.description_en || ''}]]></description>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
    </item>`)

    // 工具 items
    const toolItems = tools.map(t => `    <item>
      <title><![CDATA[[Tool] ${t.name_en}]]></title>
      <link>${t.link || `${siteUrl}/tools`}</link>
      <guid>${siteUrl}/tool-${t.name_en.replace(/\s+/g, '-')}</guid>
      <description><![CDATA[${t.description_en || ''}]]></description>
      <pubDate>${new Date(t.createdAt).toUTCString()}</pubDate>
    </item>`)

    // 合并并按时间排序
    const items = [...blogItems, ...projectItems, ...toolItems].join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>tbtparent</title>
    <link>${siteUrl}</link>
    <description>Tech blog, projects and tools - ops, dev, AI, data</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    return new Response(`<?xml version="1.0"?><error>${error.message}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
