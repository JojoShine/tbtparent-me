import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'

import { withAuth } from '../src/lib/auth.js'

function createJwt(secret, payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

test('withAuth accepts a valid signed admin JWT', async () => {
  const previousSecret = process.env.ADMIN_SECRET
  process.env.ADMIN_SECRET = 'test-admin-secret'

  try {
    const token = createJwt(process.env.ADMIN_SECRET, {
      sub: 'admin',
      iat: 1_700_000_000,
      exp: 4_102_444_800,
    })
    const handler = withAuth(async () => Response.json({ success: true }))
    const response = await handler(new Request('http://localhost/api/home', {
      headers: { Authorization: `Bearer ${token}` },
    }))

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { success: true })
  } finally {
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET
    else process.env.ADMIN_SECRET = previousSecret
  }
})

test('withAuth rejects an expired admin JWT', async () => {
  const previousSecret = process.env.ADMIN_SECRET
  process.env.ADMIN_SECRET = 'test-admin-secret'

  try {
    const token = createJwt(process.env.ADMIN_SECRET, {
      sub: 'admin',
      iat: 1_600_000_000,
      exp: 1_600_000_001,
    })
    const handler = withAuth(async () => Response.json({ success: true }))
    const response = await handler(new Request('http://localhost/api/home', {
      headers: { Authorization: `Bearer ${token}` },
    }))

    assert.equal(response.status, 401)
  } finally {
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET
    else process.env.ADMIN_SECRET = previousSecret
  }
})

test('withAuth rejects the raw admin secret', async () => {
  const previousSecret = process.env.ADMIN_SECRET
  process.env.ADMIN_SECRET = 'test-admin-secret'

  try {
    const handler = withAuth(async () => Response.json({ success: true }))
    const response = await handler(new Request('http://localhost/api/home', {
      headers: { Authorization: `Bearer ${process.env.ADMIN_SECRET}` },
    }))

    assert.equal(response.status, 401)
  } finally {
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET
    else process.env.ADMIN_SECRET = previousSecret
  }
})
