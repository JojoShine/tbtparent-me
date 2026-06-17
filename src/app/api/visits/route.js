import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取今日访客数和总数
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [todayVisit, totalResult] = await Promise.all([
      prisma.siteVisit.findUnique({ where: { date: today } }),
      prisma.siteVisit.aggregate({ _sum: { count: true } }),
    ])
    return NextResponse.json({
      todayCount: todayVisit?.count || 0,
      todayPosition: 0,
      total: totalResult._sum.count || 0,
    })
  } catch (error) {
    console.error('Failed to get visit stats:', error)
    return NextResponse.json({ todayCount: 0, todayPosition: 0, total: 0 })
  }
}

// POST - 记录访问，基于浏览器指纹分配今日次序（事务保证并发安全）
export async function POST(request) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    let visitorId = ''
    try {
      const body = await request.json()
      visitorId = body.visitorId || ''
    } catch (e) {}
    
    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId required' }, { status: 400 })
    }

    // 事务：原子性地检查 + 分配次序，防止并发竞争
    const result = await prisma.$transaction(async (tx) => {
      const visitor = await tx.visitor.findUnique({ where: { visitor_id: visitorId } })

      // 今天已访问过 → 直接返回之前分配的次序
      if (visitor && visitor.last_visit_date === today) {
        const todayVisit = await tx.siteVisit.findUnique({ where: { date: today } })
        const totalResult = await tx.siteVisit.aggregate({ _sum: { count: true } })
        return {
          todayCount: todayVisit?.count || 0,
          todayPosition: visitor.position || 0,
          total: totalResult._sum.count || 0,
          isNewVisitor: false,
        }
      }

      // 今日首次访问 → 原子递增计数并分配新次序
      const updatedVisit = await tx.siteVisit.upsert({
        where: { date: today },
        update: { count: { increment: 1 } },
        create: { date: today, count: 1 },
      })
      const myPosition = updatedVisit.count

      if (!visitor) {
        // 全新访客
        await tx.visitor.create({
          data: {
            visitor_id: visitorId,
            visit_dates: [today],
            first_visit_date: today,
            last_visit_date: today,
            total_visits: 1,
            position: myPosition,
          }
        })
      } else {
        // 老访客，更新访问信息
        await tx.visitor.update({
          where: { visitor_id: visitorId },
          data: {
            visit_dates: [...visitor.visit_dates, today],
            last_visit_date: today,
            total_visits: (visitor.total_visits || visitor.visit_dates.length) + 1,
            position: myPosition,
          }
        })
      }

      const totalResult = await tx.siteVisit.aggregate({ _sum: { count: true } })
      return {
        todayCount: myPosition,
        todayPosition: myPosition,
        total: totalResult._sum.count || 0,
        isNewVisitor: true,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to record visit:', error)
    return NextResponse.json({ todayCount: 0, todayPosition: 0, total: 0 })
  }
}
