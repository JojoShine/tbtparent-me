import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'visitor_session'
const MAX_DAILY_VISITS = 10000

function sign(value) {
  return crypto.createHmac('sha256', process.env.ADMIN_SECRET || '').update(`visitor:${value}`).digest('base64url')
}

function createVisitorToken(date, position) {
  const payload = Buffer.from(JSON.stringify({ id: crypto.randomUUID(), date, position })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function readVisitorToken(request) {
  const cookie = request.headers.get('cookie') || ''
  const raw = cookie.split(';').map(value => value.trim()).find(value => value.startsWith(`${COOKIE_NAME}=`))
  const token = raw?.slice(COOKIE_NAME.length + 1)
  if (!token || !process.env.ADMIN_SECRET) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = sign(payload)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof value.id === 'string' && typeof value.date === 'string' && Number.isInteger(value.position)
      ? value
      : null
  } catch {
    return null
  }
}

function json(data, init = {}) {
  return Response.json(data, init)
}

// GET - 获取今日访客数和总数
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [todayVisit, totalResult] = await Promise.all([
      prisma.siteVisit.findUnique({ where: { date: today } }),
      prisma.siteVisit.aggregate({ _sum: { count: true } }),
    ])
    return json({
      todayCount: todayVisit?.count || 0,
      todayPosition: 0,
      total: totalResult._sum.count || 0,
    })
  } catch (error) {
    console.error('Failed to get visit stats:', error)
    return json({ todayCount: 0, todayPosition: 0, total: 0 })
  }
}

// POST - 记录访问，访客身份由服务端签名 Cookie 管理
export async function POST(request) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const visitor = readVisitorToken(request)

    if (visitor?.date === today) {
      const [todayVisit, totalResult] = await Promise.all([
        prisma.siteVisit.findUnique({ where: { date: today } }),
        prisma.siteVisit.aggregate({ _sum: { count: true } }),
      ])
      return json({
        todayCount: todayVisit?.count || 0,
        todayPosition: visitor.position,
        total: totalResult._sum.count || 0,
        isNewVisitor: false,
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.siteVisit.findUnique({ where: { date: today } })
      if ((current?.count || 0) >= MAX_DAILY_VISITS) {
        return null
      }
      const updatedVisit = await tx.siteVisit.upsert({
        where: { date: today },
        update: { count: { increment: 1 } },
        create: { date: today, count: 1 },
      })
      const totalResult = await tx.siteVisit.aggregate({ _sum: { count: true } })
      return {
        todayCount: updatedVisit.count,
        todayPosition: updatedVisit.count,
        total: totalResult._sum.count || 0,
        isNewVisitor: true,
      }
    })

    if (!result) return json({ error: 'Visit limit reached' }, { status: 429 })

    const response = json(result)
    response.headers.append('Set-Cookie', [
      `${COOKIE_NAME}=${createVisitorToken(today, result.todayPosition)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=31536000',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ].filter(Boolean).join('; '))
    return response
  } catch (error) {
    console.error('Failed to record visit:', error)
    return json({ todayCount: 0, todayPosition: 0, total: 0 })
  }
}
