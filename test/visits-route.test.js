import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const prismaModule = new URL('../src/lib/prisma.js', import.meta.url).href
let count = 0

mock.module(prismaModule, {
  namedExports: {
    prisma: {
      siteVisit: {
        async findUnique() { return count ? { count } : null },
        async aggregate() { return { _sum: { count } } },
        async upsert() {
          count += 1
          return { count }
        },
      },
      visitor: new Proxy({}, {
        get() { throw new Error('visitor rows must not be used') },
      }),
      async $transaction(callback) { return callback(this) },
    },
  },
})

const previousSecret = process.env.ADMIN_SECRET
process.env.ADMIN_SECRET = 'test-admin-secret'
const { POST } = await import('../src/app/api/visits/route.js')

test.after(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SECRET
  else process.env.ADMIN_SECRET = previousSecret
})

test.beforeEach(() => { count = 0 })

test('visit identity is server-issued and repeat requests are idempotent', async () => {
  const first = await POST(new Request('http://localhost/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId: 'attacker-controlled' }),
  }))
  const firstBody = await first.json()
  const cookie = first.headers.get('set-cookie')

  assert.equal(firstBody.todayPosition, 1)
  assert.match(cookie, /^visitor_session=/)
  assert.match(cookie, /HttpOnly/i)

  const second = await POST(new Request('http://localhost/api/visits', {
    method: 'POST',
    headers: { Cookie: cookie.split(';')[0] },
  }))
  const secondBody = await second.json()

  assert.equal(secondBody.todayPosition, 1)
  assert.equal(secondBody.todayCount, 1)
  assert.equal(count, 1)
})
