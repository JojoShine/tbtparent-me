import assert from 'node:assert/strict'
import { mock, test } from 'node:test'

let databaseAvailable = true
mock.module(new URL('../src/lib/prisma.js', import.meta.url).href, {
  namedExports: {
    prisma: {
      async $queryRaw() {
        if (!databaseAvailable) throw new Error('private database connection details')
        return [{ ready: 1 }]
      },
    },
  },
})
const { GET } = await import('../src/app/healthz/route.js')

test('health is ready only when its database query succeeds', async () => {
  databaseAvailable = true
  const response = await GET()
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
})

test('health fails closed without exposing database details', async () => {
  databaseAvailable = false
  const response = await GET()
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { status: 'unavailable' })
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
})
