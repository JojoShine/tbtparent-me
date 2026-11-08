import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

const prismaModule = new URL('../src/lib/prisma.js', import.meta.url).href
let count = 0
let fail = false
let queriedDate

mock.module(prismaModule, {
  namedExports: {
    prisma: {
      siteVisit: {
        async findUnique({ where }) {
          if (fail) throw new Error('Database unavailable')
          queriedDate = where.date
          return count ? { count } : null
        },
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
const { GET, POST } = await import('../src/app/api/visits/route.js')

test.after(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SECRET
  else process.env.ADMIN_SECRET = previousSecret
})

test.beforeEach(() => { count = 0; fail = false; queriedDate = undefined })

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


test('GET uses the new Beijing date immediately after midnight', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-08T00:01:00+08:00') })
  const response = await GET()
  assert.equal(response.status, 200)
  assert.equal(queriedDate, '2026-11-08')
  assert.match(response.headers.get('cache-control'), /no-store/)
})

test('POST changes visitor day at Beijing midnight, not at 08:00', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-07T23:59:00+08:00') })
  const first = await POST(new Request('http://localhost/api/visits', { method: 'POST' }))
  const cookie = first.headers.get('set-cookie').split(';')[0]
  t.mock.timers.setTime(new Date('2026-11-08T00:01:00+08:00').getTime())
  const nextDay = await POST(new Request('http://localhost/api/visits', {
    method: 'POST', headers: { Cookie: cookie },
  }))
  assert.equal((await nextDay.json()).isNewVisitor, true)
  assert.equal(queriedDate, '2026-11-08')
  const newToken = nextDay.headers.get('set-cookie').split(';')[0]
  const repeated = await POST(new Request('http://localhost/api/visits', {
    method: 'POST', headers: { Cookie: newToken },
  }))
  assert.equal((await repeated.json()).isNewVisitor, false)
  assert.equal(count, 2)
})

for (const method of ['GET', 'POST']) {
  test(`${method} reports an outage rather than fabricated zero counts`, async (t) => {
    fail = true
    t.mock.method(console, 'error', () => {})
    const response = method === 'GET' ? await GET() : await POST(new Request('http://localhost/api/visits', { method: 'POST' }))
    assert.equal(response.status, 503)
    const data = await response.json()
    assert.ok(data.error)
    assert.equal(data.todayCount, undefined)
    assert.match(response.headers.get('cache-control'), /no-store/)
  })
}
