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
      total: totalResult._sum.count || 0,
    })
  } catch (error) {
    console.error('Failed to get visit stats:', error)
    return NextResponse.json({ todayCount: 0, total: 0 })
  }
}

// POST - 记录一次访问，返回今日第几位
export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const updated = await prisma.siteVisit.upsert({
      where: { date: today },
      update: { count: { increment: 1 } },
      create: { date: today, count: 1 },
    })

    const totalResult = await prisma.siteVisit.aggregate({
      _sum: { count: true }
    })

    return NextResponse.json({
      todayCount: updated.count,    // 今日总访客数
      todayPosition: updated.count, // 当前是今日第几位
      total: totalResult._sum.count || 0,
    })
  } catch (error) {
    console.error('Failed to record visit:', error)
    return NextResponse.json({ todayCount: 0, todayPosition: 0, total: 0 })
  }
}
