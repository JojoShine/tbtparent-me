'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Send, Loader2 } from 'lucide-react'
import { useLang } from '@/hooks/useLang'
import { CATEGORIES, PROMPTS } from '@/data/writing-prompts'

const DAILY_LIMIT = 10
const DAILY_KEY = 'writing-stats-daily'

function getDailyUsage() {
  const today = new Date().toISOString().split('T')[0]
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.date === today) return data.count
    }
  } catch {}
  return 0
}

function incrementDaily() {
  const today = new Date().toISOString().split('T')[0]
  const current = getDailyUsage()
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, count: current + 1 }))
  return current + 1
}

function getMidnightCountdown() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight - now
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function pickRandomPrompt(category) {
  const pool = category === 'all' ? PROMPTS : PROMPTS.filter(p => p.category === category)
  return pool[Math.floor(Math.random() * pool.length)]
}

function SimpleMarkdown({ text }) {
  const lines = text.split('\n')
  const elements = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) continue

    if (trimmed.startsWith('|')) continue

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="font-mono" style={{
          color: 'var(--fg)',
          fontWeight: 700,
          fontSize: '0.95rem',
          marginTop: '16px',
          marginBottom: '8px',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--border)',
        }}>{line.slice(3)}</h3>
      )
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={i} className="font-mono" style={{
          color: 'var(--fg)',
          fontWeight: 700,
          fontSize: '0.9rem',
          margin: '8px 0',
        }}>{trimmed.slice(2, -2)}</p>
      )
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={i} className="font-mono" style={{
          color: 'var(--fg)',
          fontSize: '0.85rem',
          padding: '2px 0 2px 12px',
          lineHeight: 1.6,
        }}>
          <span style={{ color: 'var(--muted)' }}>- </span>{trimmed.slice(2)}
        </div>
      )
    } else {
      elements.push(
        <p key={i} className="font-mono" style={{
          color: 'var(--fg)',
          fontSize: '0.85rem',
          lineHeight: 1.7,
          margin: '4px 0',
        }}>{line}</p>
      )
    }
  }

  return <>{elements}</>
}

export default function WritingGame() {
  const { lang } = useLang()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPrompt, setCurrentPrompt] = useState(null)
  const [writing, setWriting] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [promptLoading, setPromptLoading] = useState(false)
  const [remaining, setRemaining] = useState(DAILY_LIMIT)
  const [countdown, setCountdown] = useState('')
  const [error, setError] = useState('')
  const resultRef = useRef(null)

  const fetchPrompt = async (category) => {
    setPromptLoading(true)
    try {
      const res = await fetch(`/api/writing/prompt?category=${category}&lang=${lang}`)
      if (res.ok) {
        const data = await res.json()
        const prompt = {
          category: data.category,
          zh: data.zh,
          en: data.en,
          hint_zh: data.hint_zh,
          hint_en: data.hint_en,
        }
        setPromptLoading(false)
        return prompt
      }
    } catch {}
    const fallback = pickRandomPrompt(category)
    setPromptLoading(false)
    return fallback
  }

  useEffect(() => {
    fetchPrompt('all').then(p => {
      setCurrentPrompt(p)
      setRemaining(DAILY_LIMIT - getDailyUsage())
    })
  }, [])

  useEffect(() => {
    const tick = () => setCountdown(getMidnightCountdown())
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight
    }
  }, [result])

  const handleCategoryChange = async (cat) => {
    setSelectedCategory(cat)
    setWriting('')
    setResult('')
    setError('')
    const p = await fetchPrompt(cat)
    setCurrentPrompt(p)
  }

  const handleRefresh = async () => {
    setWriting('')
    setResult('')
    setError('')
    const p = await fetchPrompt(selectedCategory)
    setCurrentPrompt(p)
  }

  const handleSubmit = async () => {
    if (!writing.trim() || writing.trim().length < 10) {
      setError(lang === 'zh' ? '请至少写 10 个字' : 'Please write at least 10 characters')
      return
    }
    if (remaining <= 0) {
      setError(lang === 'zh' ? '今日评分次数已用完' : 'Daily limit reached')
      return
    }

    setLoading(true)
    setResult('')
    setError('')

    try {
      const response = await fetch('/api/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lang === 'zh' ? currentPrompt.zh : currentPrompt.en,
          writing,
          lang,
        }),
      })

      if (response.status === 429) {
        setError(lang === 'zh' ? '今日评分次数已用完，明日再试' : 'Daily limit reached, try again tomorrow')
        setRemaining(0)
        setLoading(false)
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || (lang === 'zh' ? '评分失败，请稍后重试' : 'Scoring failed, please try again'))
        setLoading(false)
        return
      }

      const newRemaining = response.headers.get('X-Remaining')
      if (newRemaining !== null) {
        setRemaining(parseInt(newRemaining))
        incrementDaily()
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const content = JSON.parse(data)
              accumulated += content
              setResult(accumulated)
            } catch {}
          }
        }
      }
    } catch {
      setError(lang === 'zh' ? '网络错误，请检查连接后重试' : 'Network error, please check your connection')
    } finally {
      setLoading(false)
    }
  }

  const exhausted = remaining <= 0

  return (
    <motion.div
      className="max-w-3xl pb-8 md:pb-12"
      style={{ margin: '0 auto' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 返回链接 */}
      <Link
        href="/game"
        className="inline-flex items-center gap-2 font-mono text-sm relative hover:opacity-70 transition-opacity"
        style={{ color: 'var(--muted)', marginBottom: '30px' }}
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === 'zh' ? '返回游戏' : 'Back to Games'}
      </Link>

      {/* 标题 */}
      <h1 className="text-2xl md:text-3xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
        {lang === 'zh' ? '文笔训练机' : 'Writing Trainer'}
      </h1>
      <div className="font-mono text-sm" style={{ color: 'var(--muted)', marginBottom: '24px' }}>
        {lang === 'zh' ? '选一个方向，写一段短片段，由 AI 对片段表达能力评分' : 'Pick a direction, write a short passage, AI scores your writing expression'}
      </div>

      {/* 剩余次数 */}
      <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>
          {lang === 'zh' ? '今日剩余：' : 'Remaining today: '}
          <strong style={{ color: exhausted ? '#e53e3e' : '#38a169' }}>{remaining}/{DAILY_LIMIT}</strong>
        </span>
        {exhausted && <span style={{ color: '#e53e3e' }}>{countdown}</span>}
      </div>

      {/* 分类标签 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {[{ key: 'all', label_zh: '全部', label_en: 'All' }, ...CATEGORIES].map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className="font-mono"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              border: '1px solid',
              borderColor: selectedCategory === cat.key ? 'var(--fg)' : 'var(--border)',
              borderRadius: '4px',
              backgroundColor: selectedCategory === cat.key ? 'var(--fg)' : 'transparent',
              color: selectedCategory === cat.key ? 'var(--bg)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {lang === 'zh' ? cat.label_zh : cat.label_en}
          </button>
        ))}
      </div>

      {/* 提示词卡片 */}
      {currentPrompt && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '16px',
          opacity: promptLoading ? 0.6 : 1,
          transition: 'opacity 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span className="font-mono text-xs" style={{
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                padding: '2px 8px',
                marginRight: '8px',
              }}>
                {lang === 'zh'
                  ? CATEGORIES.find(c => c.key === currentPrompt.category)?.label_zh
                  : CATEGORIES.find(c => c.key === currentPrompt.category)?.label_en}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={promptLoading}
              className="font-mono"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: 'var(--muted)',
                cursor: promptLoading ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!promptLoading) { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.color = 'var(--fg)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              <RefreshCw className="w-3 h-3" style={promptLoading ? { animation: 'spin 1s linear infinite' } : {}} />
              {lang === 'zh' ? (promptLoading ? '生成中...' : '换一题') : (promptLoading ? 'Generating...' : 'Next')}
            </button>
          </div>

          <div className="font-mono" style={{
            color: 'var(--fg)',
            fontSize: '1.2rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            {lang === 'zh' ? currentPrompt.zh : currentPrompt.en}
          </div>

          <div className="font-mono" style={{
            color: 'var(--muted)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
          }}>
            {lang === 'zh' ? currentPrompt.hint_zh : currentPrompt.hint_en}
          </div>
        </div>
      )}

      {/* 写作区域 */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <textarea
          value={writing}
          onChange={e => setWriting(e.target.value)}
          placeholder={lang === 'zh' ? '在这里写下你的片段...' : 'Write your passage here...'}
          disabled={exhausted || loading}
          style={{
            width: '100%',
            minHeight: '160px',
            padding: '16px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: 1.8,
            backgroundColor: 'transparent',
            color: 'var(--fg)',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.15s ease',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--fg)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <div className="font-mono" style={{
          position: 'absolute',
          bottom: '8px',
          right: '12px',
          fontSize: '0.7rem',
          color: writing.length < 10 ? '#e53e3e' : 'var(--muted)',
        }}>
          {writing.length} {lang === 'zh' ? '字' : 'chars'}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="font-mono" style={{
          color: '#e53e3e',
          fontSize: '0.8rem',
          marginBottom: '12px',
          padding: '8px 12px',
          border: '1px solid #e53e3e',
          borderRadius: '4px',
        }}>
          {error}
        </div>
      )}

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={exhausted || loading || writing.trim().length < 10}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: exhausted || loading || writing.trim().length < 10 ? 'var(--border)' : 'var(--fg)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: exhausted || loading || writing.trim().length < 10 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'opacity 0.15s ease',
          marginBottom: '20px',
        }}
        onMouseEnter={e => { if (!exhausted && !loading && writing.trim().length >= 10) e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} />
            {lang === 'zh' ? 'AI 评分中...' : 'Scoring...'}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {lang === 'zh' ? '提交评分' : 'Submit for Scoring'}
          </>
        )}
      </button>

      {/* 评分结果 */}
      {result && (
        <div
          ref={resultRef}
          style={{
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '20px',
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          <SimpleMarkdown text={result} />
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
