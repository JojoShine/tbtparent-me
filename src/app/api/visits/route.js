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
      todayPosition: todayVisit?.count || 0,
      total: totalResult._sum.count || 0,
    })
  } catch (error) {
    console.error('Failed to get visit stats:', error)
    return NextResponse.json({ todayCount: 0, todayPosition: 0, total: 0 })
  }
}

// POST - 记录一次访问，返回今日第几位（基于浏览器唯一标识）
export async function POST(request) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // 从请求头或 body 中获取 visitorId
    let visitorId = ''
    try {
      const body = await request.json()
      visitorId = body.visitorId || ''
    } catch (e) {
      // 如果没有 body，尝试从 headers 获取
    }
    
    if (!visitorId) {
      return NextResponse.json({ 
        error: 'visitorId required',
        todayCount: 0, 
        todayPosition: 0, 
        total: 0 
      }, { status: 400 })
    }

    // 查找或创建访客记录
    let visitor = await prisma.visitor.findUnique({
      where: { visitorId }
    })

    let isNewVisitorToday = false

    if (!visitor) {
      // 新访客
      visitor = await prisma.visitor.create({
        data: {
          visitorId,
          visitDates: [today]
        }
      })
      isNewVisitorToday = true
    } else {
      // 检查今天是否已经访问过
      if (!visitor.visitDates.includes(today)) {
        // 今天首次访问
        await prisma.visitor.update({
          where: { visitorId },
          data: {
            visitDates: [...visitor.visitDates, today]
          }
        })
        isNewVisitorToday = true
      }
    }

    // 如果是今天的新访客，增加计数
    let updatedVisit
    if (isNewVisitorToday) {
      updatedVisit = await prisma.siteVisit.upsert({
        where: { date: today },
        update: { count: { increment: 1 } },
        create: { date: today, count: 1 },
      })
    } else {
      // 不是新访客，只获取当前计数
      updatedVisit = await prisma.siteVisit.findUnique({
        where: { date: today }
      })
      if (!updatedVisit) {
        updatedVisit = await prisma.siteVisit.create({
          data: { date: today, count: 0 }
        })
      }
    }

    const totalResult = await prisma.siteVisit.aggregate({
      _sum: { count: true }
    })

    return NextResponse.json({
      todayCount: updatedVisit.count,    // 今日总访客数
      todayPosition: updatedVisit.count, // 当前是今日第几位
      total: totalResult._sum.count || 0,
      isNewVisitor: isNewVisitorToday,
    })
  } catch (error) {
    console.error('Failed to record visit:', error)
    return NextResponse.json({ todayCount: 0, todayPosition: 0, total: 0 })
  }
}
