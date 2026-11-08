'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import { recordVisit } from '@/lib/visit-stats-client'

export default function Footer() {
  const { lang } = useLang()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let active = true
    recordVisit()
      .then(data => {
        if (active) setStats(data)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <footer className="font-mono text-xs text-center" style={{
      color: 'var(--muted)',
      padding: '20px 16px 24px',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ marginBottom: '6px' }}>
        {stats && (
          <span>
            {lang === 'zh'
              ? `今日访客 ${stats.todayCount} · 累计访问人次 ${stats.total}`
              : `Visitors today: ${stats.todayCount} · Total daily visits: ${stats.total}`}
          </span>
        )}
      </div>
      <div>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--muted)' }}
          className="hover:opacity-70"
        >
          苏ICP备2023047566号-2
        </a>
        <span style={{ margin: '0 8px' }}>|</span>
        <span>&copy; 2025-present tbtparent.me</span>
      </div>
    </footer>
  )
}
