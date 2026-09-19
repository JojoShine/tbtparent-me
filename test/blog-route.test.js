import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { mock, test } from 'node:test'

const prismaModule = new URL('../src/lib/prisma.js', import.meta.url).href
const nextCacheModule = new URL('../node_modules/next/cache.js', import.meta.url).href
const calls = []

mock.module(nextCacheModule, {
  namedExports: {
    revalidateTag() {},
    unstable_cache(fn) { return fn },
  },
})

mock.module(prismaModule, {
  namedExports: {
    prisma: {
      blog: {
        async findFirst(args) {
          calls.push(['findFirst', args])
          return { id: 1, slug: 'draft-post', status: 'draft' }
        },
        async findMany(args) {
          calls.push(['findMany', args])
          return []
        },
        async count(args) {
          calls.push(['count', args])
          return 0
        },
      },
    },
  },
})

function createJwt(secret) {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ sub: 'admin', iat: now, exp: now + 60 })).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}

const previousSecret = process.env.ADMIN_SECRET
process.env.ADMIN_SECRET = 'test-admin-secret'
const { GET } = await import('../src/app/api/blog/route.js')

test.after(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SECRET
  else process.env.ADMIN_SECRET = previousSecret
})

test.beforeEach(() => { calls.length = 0 })

test('public blog detail only queries published, non-deleted posts', async () => {
  const response = await GET(new Request('http://localhost/api/blog?slug=draft-post'))

  assert.equal(response.status, 200)
  assert.deepEqual(calls[0][1].where, {
    slug: 'draft-post',
    status: 'published',
    deleted_at: null,
  })
})

test('public blog list ignores a caller-provided draft status', async () => {
  await GET(new Request('http://localhost/api/blog?status=draft'))

  const countCall = calls.find(([method]) => method === 'count')
  assert.deepEqual(countCall[1].where, {
    status: 'published',
    deleted_at: null,
  })
})

test('authenticated admin blog list can query drafts', async () => {
  await GET(new Request('http://localhost/api/blog?status=draft', {
    headers: { Authorization: `Bearer ${createJwt(process.env.ADMIN_SECRET)}` },
  }))

  const countCall = calls.find(([method]) => method === 'count')
  assert.deepEqual(countCall[1].where, {
    status: 'draft',
    deleted_at: null,
  })
})
