import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { mock, test } from 'node:test'

const prismaModule = new URL('../src/lib/prisma.js', import.meta.url).href
const nextCacheModule = new URL('../node_modules/next/cache.js', import.meta.url).href
let receivedUpsert

mock.module(nextCacheModule, {
  namedExports: {
    revalidateTag() {},
  },
})

mock.module(prismaModule, {
  namedExports: {
    prisma: {
      home: {
        async upsert(args) {
          receivedUpsert = args
          if (args.create.nameZh === undefined) {
            throw new Error('Argument `nameZh` is missing.')
          }
          return args.create
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

test('PUT /api/home passes nameZh to both upsert branches', async () => {
  const previousSecret = process.env.ADMIN_SECRET
  process.env.ADMIN_SECRET = 'test-admin-secret'

  try {
    const { PUT } = await import('../src/app/api/home/route.js')
    const body = {
      name_zh: 'tbtparent',
      name_en: 'tbtparent',
      nameZh: '甜宝塔家长',
      title_zh: '开发者',
      title_en: 'Developer',
      bio_zh: '简介',
      bio_en: 'Bio',
    }
    const response = await PUT(new Request('http://localhost/api/home', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${createJwt(process.env.ADMIN_SECRET)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }))

    assert.equal(response.status, 200)
    assert.equal(receivedUpsert.update.nameZh, '甜宝塔家长')
    assert.equal(receivedUpsert.create.nameZh, '甜宝塔家长')
  } finally {
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET
    else process.env.ADMIN_SECRET = previousSecret
  }
})
