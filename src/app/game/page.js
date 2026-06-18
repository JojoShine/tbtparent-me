'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { ArrowLeft, BookOpen, Grid3x3, Calculator } from 'lucide-react'

const GAMES = [
  {
    id: 'idiom',
    href: '/game/idiom',
    icon: BookOpen,
    title_zh: '成语闯关',
    title_en: 'Idiom Quest',
    desc_zh: '根据拼音线索猜出四字成语，最多8次机会',
    desc_en: 'Guess the 4-character idiom from pinyin clues, max 8 attempts',
    limit_zh: '每日3题',
    limit_en: '3/day',
    statsKey: 'idiom-game-stats',
    dailyKey: 'idiom-game-stats-daily',
    action_zh: '已答',
    unit_zh: '题',
    maxDaily: 3,
  },
  {
    id: 'takuzu',
    href: '/game/takuzu',
    icon: Grid3x3,
    title_zh: 'XXOO',
    title_en: 'Takuzu',
    desc_zh: '填满棋盘，遵守三条规则：数量均分、无三连、无重复',
    desc_en: 'Fill the board: equal X/O, no 3-in-a-row, no duplicate lines',
    limit_zh: '每阵列每日3局',
    limit_en: '3/size/day',
    statsKey: 'takuzu-daily',
    dailyKey: 'takuzu-daily',
    action_zh: '已通关',
    unit_zh: '关',
    maxDaily: 15, // 5 sizes * 3
  },
  {
    id: 'guess-number',
    href: '/game/guess-number',
    icon: Calculator,
    title_zh: '猜数字',
    title_en: 'Guess Number',
    desc_zh: '猜出系统生成的无重复数字，反馈xAyB提示',
    desc_en: 'Guess secret number with xAyB feedback (A=position, B=digit)',
    limit_zh: '每阵列每日1局',
    limit_en: '1/size/day',
    statsKey: 'guess-number-daily',
    dailyKey: 'guess-number-daily',
    action_zh: '已通关',
    unit_zh: '关',
    maxDaily: 3, // 3 sizes * 1
  },
]

export default function GameHubPage() {
  const { lang } = useLang()
  const [todayStats, setTodayStats] = useState({})
  const [countdowns, setCountdowns] = useState({})

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const stats = {}
    GAMES.forEach(game => {
      try {
        const raw = localStorage.getItem(game.dailyKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.date === today) {
            // 支持两种格式: { count } 或 { counts: { size: count } }
            if (parsed.counts) {
              const totalCount = Object.values(parsed.counts).reduce((a, b) => a + b, 0)
              stats[game.id] = { count: totalCount }
            } else {
              stats[game.id] = parsed
            }
          }
        }
      } catch (e) {}
    })
    setTodayStats(stats)
  }, [])

  // 倒计时逻辑
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      if (diff <= 0) return
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      const timeStr = `${h}:${m}:${s}`
      
      const newCountdowns = {}
      GAMES.forEach(game => {
        const daily = todayStats[game.id]
        const maxDaily = game.maxDaily
        const usedToday = daily?.count || 0
        if (usedToday >= maxDaily) {
          newCountdowns[game.id] = timeStr
        }
      })
      setCountdowns(newCountdowns)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [todayStats])

  return (
    <motion.div
      className="max-w-3xl pb-8 md:pb-12"
      style={{ margin: '0 auto' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 头部 */}
      <div style={{ marginBottom: '40px' }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm relative hover:opacity-70 transition-opacity social-link"
          style={{ color: 'var(--muted)', marginBottom: '30px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'zh' ? '返回首页' : 'Back to Home'}
          <span className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline" style={{ backgroundColor: 'var(--muted)' }} />
        </Link>

        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
          {lang === 'zh' ? '益智趣味小游戏' : 'Puzzle Games'}
        </h1>
        <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          {lang === 'zh' ? '选择一个游戏开始挑战' : 'Choose a game to play'}
        </div>
      </div>

      {/* 游戏列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {GAMES.map((game) => {
          const Icon = game.icon
          const daily = todayStats[game.id]
          const maxDaily = game.maxDaily
          const usedToday = daily?.count || 0
          const exhausted = usedToday >= maxDaily

          return (
            <Link
              key={game.id}
              href={game.href}
              style={{
                display: 'block',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '24px',
                textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fg)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--fg)' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className="font-mono font-bold text-lg" style={{ color: 'var(--fg)' }}>
                      {lang === 'zh' ? game.title_zh : game.title_en}
                    </span>
                    <span className="font-mono text-xs" style={{
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderRadius: '2px',
                      padding: '2px 6px',
                    }}>
                      {lang === 'zh' ? game.limit_zh : game.limit_en}
                    </span>
                  </div>

                  <div className="font-mono text-sm" style={{ color: 'var(--muted)', marginBottom: '8px', lineHeight: 1.5 }}>
                    {lang === 'zh' ? game.desc_zh : game.desc_en}
                  </div>

                  {maxDaily !== Infinity && (
                    <>
                      <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: countdowns[game.id] ? '8px' : '0' }}>
                        {exhausted
                          ? (lang === 'zh' ? `今日${game.action_zh} ${maxDaily} ${game.unit_zh}` : `Done today (${maxDaily}/${maxDaily})`)
                          : (lang === 'zh' ? `今日${game.action_zh} ${usedToday} / ${maxDaily} ${game.unit_zh}` : `Today: ${usedToday}/${maxDaily}`)}
                      </div>
                      {countdowns[game.id] && (
                        <div className="font-mono text-lg font-bold" style={{ color: 'var(--fg)', letterSpacing: '3px' }}>
                          {countdowns[game.id]}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <style jsx>{`
        .social-link:hover .social-link-underline {
          width: 100% !important;
        }
      `}</style>
    </motion.div>
  )
}
