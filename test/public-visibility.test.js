import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const prismaModule = new URL('../src/lib/prisma.js', import.meta.url).href

mock.module(prismaModule, {
  namedExports: {
    prisma: {
      blog: { findMany: async () => [] },
      project: { findMany: async () => [] },
      chapter: { findMany: async () => [] },
    },
  },
})

test('temporarily hidden experiences are excluded from public discovery', async () => {
  const { default: sitemap } = await import('../src/app/sitemap.js')
  const entries = await sitemap()
  const paths = entries.map(entry => new URL(entry.url).pathname)

  assert.equal(paths.includes('/suwen'), false)
  assert.equal(paths.includes('/game/english'), false)
  assert.equal(paths.includes('/game/writing'), false)
})
