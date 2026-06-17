'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'

// 生成或获取浏览器唯一标识
function getVisitorId() {
  let id = localStorage.getItem('visitor-id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
    localStorage.setItem('visitor-id', id)
  }
  return id
}

export default function Footer() {
  const { lang } = useLang()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const visitorId = getVisitorId()
    
    // 始终调用 POST，服务端基于 visitorId 判断是否今日首次
    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setStats(data)
      })
      .catch(() => {})
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
