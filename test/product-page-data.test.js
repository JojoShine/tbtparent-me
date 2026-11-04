import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

mock.module('../src/lib/prisma.js', {
  namedExports: {
    prisma: { project: { findFirst: async () => { throw new Error('Database connection pool unavailable') } } },
  },
})

const { getProductPageData } = await import('../src/lib/product-page-data.js')

test('standalone product pages remain available without the catalog database', async () => {
  const flow = await getProductPageData('flowcraft')
  assert.equal(flow.profile.name, 'FlowCraft')
  assert.equal(flow.project.pc_url, 'https://tbtparent.me/flowcraft/login')
  assert.equal(flow.project.github, 'https://github.com/JojoShine/FlowCraft')
  for (const slug of ['custom-wechat-app', 'custom-app']) {
    const data = await getProductPageData(slug)
    assert.ok(data.project.demo_qr_url.startsWith('/api/archive/files?path='))
    assert.ok(data.project.github.startsWith('https://github.com/JojoShine/'))
  }
  const portfolio = await getProductPageData('app-portfolio')
  assert.equal(portfolio.project.mobile_url, 'https://tbtparent.me/app-portfolio/')
  const qingwen = await getProductPageData('qingwen')
  assert.equal(qingwen.project.pc_url, 'https://tbtparent.me/surveys/login')
  assert.equal(qingwen.project.github, 'https://github.com/JojoShine/qingwen.git')
  const owl = await getProductPageData('owl')
  assert.equal(owl.project.pc_url, 'https://tbtparent.me/owl')
  assert.equal(owl.project.github, 'https://github.com/JojoShine/owl')
  const mesh = await getProductPageData('data-mesh')
  assert.equal(mesh.project.github, 'https://github.com/JojoShine/DataMesh')
  assert.equal(mesh.project.status, 'in_progress')
  assert.equal(mesh.project.pc_url, undefined)
})

test('unknown and unbuilt product pages still return no page data', async () => {
  assert.equal(await getProductPageData('missing'), null)
  assert.equal(await getProductPageData('around-me'), null)
})
