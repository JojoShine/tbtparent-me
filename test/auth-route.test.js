import assert from 'node:assert/strict'
import { test } from 'node:test'

const previousSecret = process.env.ADMIN_SECRET
process.env.ADMIN_SECRET = 'test-admin-secret'

const { POST } = await import('../src/app/api/auth/route.js')

test.after(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SECRET
  else process.env.ADMIN_SECRET = previousSecret
})

test('admin login blocks repeated secret guesses', async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await POST(new Request('http://localhost/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: `wrong-${attempt}` }),
    }))
    assert.equal(response.status, 401)
  }

  const blocked = await POST(new Request('http://localhost/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: 'another-guess' }),
  }))

  assert.equal(blocked.status, 429)
})
