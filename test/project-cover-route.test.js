import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { mock, test } from 'node:test'

const minioModule = new URL('../src/lib/minio.js', import.meta.url).href
const uploads = []

mock.module(minioModule, {
  namedExports: {
    MINIO_BUCKET: 'tbtparent-me',
    async ensureBucket() {},
    minioClient: {
      async putObject(...args) {
        uploads.push(args)
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

function uploadRequest(file) {
  const formData = new FormData()
  if (file) formData.set('file', file)
  return new Request('http://localhost/api/projects/cover', {
    method: 'POST',
    headers: { Authorization: `Bearer ${createJwt(process.env.ADMIN_SECRET)}` },
    body: formData,
  })
}

const previousSecret = process.env.ADMIN_SECRET
process.env.ADMIN_SECRET = 'test-admin-secret'
const { POST } = await import('../src/app/api/projects/cover/route.js')

test.after(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SECRET
  else process.env.ADMIN_SECRET = previousSecret
})

test.beforeEach(() => {
  uploads.length = 0
})

test('project cover upload rejects a missing file', async () => {
  const response = await POST(uploadRequest())
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'No image provided' })
  assert.equal(uploads.length, 0)
})

test('project cover upload rejects non-image content', async () => {
  const response = await POST(uploadRequest(new File(['not an image'], 'notes.txt', { type: 'text/plain' })))
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Unsupported image type' })
  assert.equal(uploads.length, 0)
})

test('project cover upload stores an image in the project cover prefix', async () => {
  const response = await POST(uploadRequest(new File([new Uint8Array([137, 80, 78, 71])], 'around-me.png', { type: 'image/png' })))
  const result = await response.json()

  assert.equal(response.status, 200)
  assert.equal(uploads.length, 1)
  assert.match(uploads[0][1], /^projects\/covers\/\d+-around-me\.png$/)
  assert.deepEqual(uploads[0][4], { 'Content-Type': 'image/png' })
  assert.equal(result.cover_url, `/api/archive/files?path=${encodeURIComponent(`tbtparent-me/${uploads[0][1]}`)}`)
})
