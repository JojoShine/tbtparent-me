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
      async putObject(...args) { uploads.push(args) },
      async statObject() { return { metaData: { 'content-type': 'image/svg+xml' } } },
      async getObject() { return new ReadableStream({ start(controller) { controller.close() } }) },
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
  formData.set('file', file)
  return new Request('http://localhost/api/archive/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${createJwt(process.env.ADMIN_SECRET)}` },
    body: formData,
  })
}

const previousSecret = process.env.ADMIN_SECRET
process.env.ADMIN_SECRET = 'test-admin-secret'
const { POST } = await import('../src/app/api/archive/upload/route.js')
const { GET } = await import('../src/app/api/archive/files/route.js')

test.after(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SECRET
  else process.env.ADMIN_SECRET = previousSecret
})

test.beforeEach(() => { uploads.length = 0 })

test('archive upload rejects active SVG content', async () => {
  const response = await POST(uploadRequest(new File([
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  ], 'cover.svg', { type: 'image/svg+xml' })))

  assert.equal(response.status, 400)
  assert.equal(uploads.length, 0)
})

test('archive upload rejects a forged raster MIME type', async () => {
  const response = await POST(uploadRequest(new File([
    '<html><script>alert(1)</script></html>',
  ], 'cover.png', { type: 'image/png' })))

  assert.equal(response.status, 400)
  assert.equal(uploads.length, 0)
})

test('legacy active objects are downloaded instead of rendered inline', async () => {
  const response = await GET(new Request(
    'http://localhost/api/archive/files?path=tbtparent-me%2Farchive%2Flegacy.svg',
  ))

  assert.equal(response.headers.get('content-type'), 'application/octet-stream')
  assert.match(response.headers.get('content-disposition'), /^attachment;/)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
})
