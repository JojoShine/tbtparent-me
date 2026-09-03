import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { mock, test } from 'node:test'

const prismaModule = new URL('../src/lib/prisma.js', import.meta.url).href
const nextCacheModule = new URL('../node_modules/next/cache.js', import.meta.url).href
const projectDataModule = new URL('../src/lib/project-data.js', import.meta.url).href

const calls = {
  transactions: 0,
  creates: [],
  updates: [],
  deletes: [],
  capabilityCreates: [],
  detailQueries: [],
}

function resetCalls() {
  calls.transactions = 0
  calls.creates.length = 0
  calls.updates.length = 0
  calls.deletes.length = 0
  calls.capabilityCreates.length = 0
  calls.detailQueries.length = 0
}

const storedCapabilities = [{
  id: 9,
  projectId: 1,
  title_zh: '数据治理',
  title_en: 'Data Governance',
  description_zh: '统一标准与质量规则。',
  description_en: 'Unifies standards and quality rules.',
  icon: 'shield',
  sortOrder: 0,
}]

const tx = {
  project: {
    async create(args) {
      calls.creates.push(args)
      return {
        id: 1,
        ...args.data,
        capabilities: args.data.capabilities?.create || [],
      }
    },
    async update(args) {
      calls.updates.push(args)
      return { id: args.where.id, ...args.data }
    },
    async findUnique() {
      return { id: 1, name_zh: 'DataMesh', capabilities: storedCapabilities }
    },
  },
  projectCapability: {
    async deleteMany(args) {
      calls.deletes.push(args)
      return { count: 1 }
    },
    async createMany(args) {
      calls.capabilityCreates.push(args)
      return { count: args.data.length }
    },
  },
}

mock.module(nextCacheModule, {
  namedExports: {
    revalidateTag() {},
    unstable_cache(fn) { return fn },
  },
})

mock.module(projectDataModule, {
  namedExports: {
    async getCachedProjects() {
      return [{ id: 1, name_zh: 'DataMesh', capabilities: storedCapabilities }]
    },
  },
})

mock.module(prismaModule, {
  namedExports: {
    prisma: {
      async $transaction(callback) {
        calls.transactions += 1
        return callback(tx)
      },
      project: {
        async create(args) {
          calls.creates.push(args)
          return { id: 1, ...args.data }
        },
        async update(args) {
          calls.updates.push(args)
          return { id: args.where.id, ...args.data }
        },
        async findUnique(args) {
          calls.detailQueries.push(args)
          return { id: 1, name_zh: 'DataMesh', capabilities: storedCapabilities }
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

function projectBody(overrides = {}) {
  return {
    name_zh: 'DataMesh',
    name_en: 'DataMesh',
    description_zh: '数据服务体系',
    description_en: 'Data service system',
    tags_zh: ['数据治理'],
    tags_en: ['Data Governance'],
    deadline_zh: '已发布',
    deadline_en: 'Published',
    link: '',
    project_type: 'pc',
    sortOrder: 1,
    capabilities: [{
      title_zh: ' 数据治理 ',
      title_en: ' Data Governance ',
      description_zh: ' 统一标准与质量规则。 ',
      description_en: ' Unifies standards and quality rules. ',
      icon: 'shield',
    }],
    ...overrides,
  }
}

async function authenticatedRequest(method, body) {
  return new Request('http://localhost/api/projects', {
    method,
    headers: {
      Authorization: `Bearer ${createJwt(process.env.ADMIN_SECRET)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

const previousSecret = process.env.ADMIN_SECRET
process.env.ADMIN_SECRET = 'test-admin-secret'
const { GET, POST, PUT } = await import('../src/app/api/projects/route.js')

test.after(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SECRET
  else process.env.ADMIN_SECRET = previousSecret
})

test.beforeEach(resetCalls)

test('POST /api/projects rejects an invalid capability payload before writing', async () => {
  const response = await POST(await authenticatedRequest('POST', projectBody({
    capabilities: new Array(5).fill(projectBody().capabilities[0]),
  })))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: '最多只能添加 4 项核心能力' })
  assert.equal(calls.transactions, 0)
  assert.equal(calls.creates.length, 0)
})

test('POST /api/projects creates normalized capabilities in one transaction', async () => {
  const response = await POST(await authenticatedRequest('POST', projectBody()))
  const result = await response.json()

  assert.equal(response.status, 200)
  assert.equal(calls.transactions, 1)
  assert.equal(calls.creates.length, 1)
  assert.deepEqual(calls.creates[0].data.capabilities.create, [{
    title_zh: '数据治理',
    title_en: 'Data Governance',
    description_zh: '统一标准与质量规则。',
    description_en: 'Unifies standards and quality rules.',
    icon: 'shield',
    sortOrder: 0,
  }])
  assert.deepEqual(result.capabilities, calls.creates[0].data.capabilities.create)
})

test('PUT /api/projects preserves capabilities when the field is omitted', async () => {
  const body = projectBody({ id: 1 })
  delete body.capabilities
  const response = await PUT(await authenticatedRequest('PUT', body))

  assert.equal(response.status, 200)
  assert.equal(calls.transactions, 1)
  assert.equal(calls.deletes.length, 0)
  assert.equal(calls.capabilityCreates.length, 0)
})

test('PUT /api/projects clears capabilities only for an explicit empty array', async () => {
  const response = await PUT(await authenticatedRequest('PUT', projectBody({ id: 1, capabilities: [] })))

  assert.equal(response.status, 200)
  assert.deepEqual(calls.deletes, [{ where: { projectId: 1 } }])
  assert.equal(calls.capabilityCreates.length, 0)
})

test('GET /api/projects detail requests ordered capabilities', async () => {
  const response = await GET(new Request('http://localhost/api/projects?id=1'))
  const result = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(result.capabilities, storedCapabilities)
  assert.deepEqual(calls.detailQueries[0].include, {
    capabilities: { orderBy: { sortOrder: 'asc' } },
  })
})

test('POST /api/projects retains existing URL validation', async () => {
  const response = await POST(await authenticatedRequest('POST', projectBody({ github: 'javascript:alert(1)' })))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Invalid github' })
  assert.equal(calls.transactions, 0)
})
