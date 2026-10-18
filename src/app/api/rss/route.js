import { prisma } from '@/lib/prisma'
import { BUILTIN_TOOLS, getToolPath } from '@/lib/tool-catalog'
import { isValidUrl } from '@/lib/validate-url'

export const dynamic = 'force-dynamic'

function escapeXml(value) {
  return String(value ?? '').replace(/[<>&"']/g, char => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[char])
}

export async function GET() {
  try {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tbtparent.me').replace(/\/$/, '')
    const [projects, tools] = await Promise.all([
      prisma.project.findMany({
        where: { deleted_at: null },
        select: { id: true, name_zh: true, name_en: true, description_zh: true, description_en: true, createdAt: true },
      }),
      prisma.tool.findMany({
        where: { available: true },
        select: { id: true, name_zh: true, name_en: true, description_zh: true, description_en: true, link: true, createdAt: true },
      }),
    ])

    const entries = [
      ...projects.map(project => ({
        title: `[作品] ${project.name_zh || project.name_en}`,
        description: project.description_zh || project.description_en,
        link: `${siteUrl}/projects/${project.id}`,
        guid: `${siteUrl}/projects/${project.id}`,
        date: project.createdAt,
      })),
      ...tools.map(tool => ({
        title: `[工具] ${tool.name_zh || tool.name_en}`,
        description: tool.description_zh || tool.description_en,
        link: isValidUrl(tool.link) ? tool.link : `${siteUrl}/tools`,
        guid: `${siteUrl}/tool-${tool.id}`,
        date: tool.createdAt,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))

    // These tools are implemented in code; no publication date is stored for them.
    entries.push(...BUILTIN_TOOLS.map(tool => ({
      title: `[工具] ${tool.label_zh}`,
      description: `${tool.category_zh} · ${tool.label_zh}`,
      link: `${siteUrl}${getToolPath(tool.key)}`,
      guid: `${siteUrl}${getToolPath(tool.key)}`,
    })))

    const items = entries.map(entry => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(entry.link)}</link>
      <guid isPermaLink="false">${escapeXml(entry.guid)}</guid>
      <description>${escapeXml(entry.description)}</description>${entry.date ? `
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>` : ''}
    </item>`).join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>甜宝塔家长 | tbtparent</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>公开作品与实用工具</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl)}/api/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error(error)
    return new Response('<?xml version="1.0"?><error>Internal server error</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
