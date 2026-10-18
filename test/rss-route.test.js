import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const calls = []
mock.module(new URL('../src/lib/prisma.js', import.meta.url).href, {
  namedExports: { prisma: {
    blog: { async findMany() { calls.push('blog'); return [{ title_en: 'Hidden blog', slug: 'hidden' }] } },
    project: { async findMany(args) {
      calls.push(['projects', args.where])
      return [{ id: 42, name_zh: '作品 & 测试', name_en: 'Project', description_zh: '说明 ]]> & <内容>', description_en: '', link: 'https://demo.example.com', createdAt: new Date('2026-10-10') }]
    } },
    tool: { async findMany(args) {
      calls.push(['tools', args.where])
      return [{ id: 8, name_zh: '公开工具', name_en: '', description_zh: '说明', description_en: '', link: 'https://example.com/?a=1&b=2', createdAt: new Date('2026-10-11') }]
    } },
  } },
})
const { GET } = await import('../src/app/api/rss/route.js')

test('RSS contains public projects and tools, links to actual pages and escapes XML', async () => {
  const response = await GET()
  const xml = await response.text()
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /application\/rss\+xml/)
  assert.ok(!calls.includes('blog'))
  assert.deepEqual(calls.find(c => c[0] === 'projects')[1], { deleted_at: null })
  assert.deepEqual(calls.find(c => c[0] === 'tools')[1], { available: true })
  assert.match(xml, /<link>https:\/\/tbtparent.me\/projects\/42<\/link>/)
  assert.doesNotMatch(xml, /demo.example.com|Hidden blog|\/blog\//)
  assert.match(xml, /作品 &amp; 测试/)
  assert.match(xml, /说明 ]]&gt; &amp; &lt;内容&gt;/)
  assert.match(xml, /https:\/\/example.com\/\?a=1&amp;b=2/)
  assert.match(xml, /<guid isPermaLink="false">https:\/\/tbtparent.me\/tool-8<\/guid>/)
  assert.ok(xml.indexOf('公开工具') < xml.indexOf('作品 &amp; 测试'))
})

test('RSS includes the nine built-in public tools with deep links, without inventing publication dates', async () => {
  const xml = await (await GET()).text()
  for (const key of ['image-compressor', 'qrcode-generator', 'photo-tool', 'background-remover', 'ip-query', 'ip-calculator', 'network-planning', 'network-latency', 'dns-lookup']) {
    const item = xml.match(new RegExp('<item>(?:(?!<item>)[\\s\\S])*?<link>https://tbtparent.me/tools\\?tool=' + key + '</link>[\\s\\S]*?</item>'))?.[0]
    assert.ok(item, key)
    assert.doesNotMatch(item, /<pubDate>/)
  }
})
