'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'

export default function Footer() {
  const { lang } = useLang()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // 检查今天是否已经记录过访问
    const today = new Date().toISOString().split('T')[0]
    const lastVisitDate = localStorage.getItem('last-visit-date')
    
    // 只有今天首次访问才调用 API
    if (lastVisitDate !== today) {
      fetch('/api/visits', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          setStats(data)
          localStorage.setItem('last-visit-date', today)
        })
        .catch(() => {})
    } else {
      // 今天已经访问过,只获取统计数据
      fetch('/api/visits')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {})
    }
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
              ? `您是今天的第 ${stats.todayPosition} 位访客，当日总访客 ${stats.todayCount}`
              : `Visitor #${stats.todayPosition} today, ${stats.todayCount} total today`}
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
