'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { castHexagram, manualCast, installHexagram, getDayStem, getDayZhi } from '@/lib/liuyao'
import { divineByTime, divineByNumbers, divineByText, divineByRandom, deriveHexagram, getGuaQiWangShuai } from '@/lib/meihua'

const S = {
  wrap: { padding: '12px 24px 24px' },
  title: { color: 'var(--fg)', marginBottom: '20px', fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' },
  label: { color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block', fontFamily: 'monospace' },
  input: {
    width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px',
    fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'transparent', color: 'var(--fg)',
    outline: 'none', transition: 'border-color 0.15s ease', boxSizing: 'border-box',
  },
  select: {
    padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px',
    fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'transparent', color: 'var(--fg)',
    outline: 'none', cursor: 'pointer',
  },
  btn: {
    padding: '10px 20px', border: '1px solid var(--fg)', borderRadius: '4px',
    fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'var(--fg)', color: 'var(--bg)',
    cursor: 'pointer', transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease', fontWeight: 'bold',
  },
  btnOutline: {
    padding: '10px 20px', border: '1px solid var(--border)', borderRadius: '4px',
    fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'transparent', color: 'var(--fg)',
    cursor: 'pointer', transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  },
  card: {
    border: '1px solid var(--border)', borderRadius: '8px', padding: '16px',
    marginBottom: '16px', backgroundColor: 'transparent',
  },
  tabs: { display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid var(--border)' },
  tab: {
    padding: '10px 20px', fontFamily: 'monospace', fontSize: '0.85rem', cursor: 'pointer',
    color: 'var(--muted)', transition: 'color 0.15s ease, border-color 0.15s ease',
    backgroundColor: 'transparent',
    borderTop: 'none', borderRight: 'none', borderLeft: 'none',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    padding: '10px 20px', fontFamily: 'monospace', fontSize: '0.85rem', cursor: 'pointer',
    color: 'var(--fg)', fontWeight: 'bold', backgroundColor: 'transparent',
    borderTop: 'none', borderRight: 'none', borderLeft: 'none',
    borderBottom: '2px solid var(--fg)',
  },
  subTab: {
    padding: '6px 14px', fontFamily: 'monospace', fontSize: '0.75rem', cursor: 'pointer',
    borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--muted)',
    backgroundColor: 'transparent', transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  },
  subTabActive: {
    padding: '6px 14px', fontFamily: 'monospace', fontSize: '0.75rem', cursor: 'pointer',
    borderRadius: '4px', border: '1px solid var(--fg)', color: 'var(--fg)',
    backgroundColor: 'transparent', fontWeight: 'bold',
  },
  source: { color: 'var(--muted)', fontSize: '0.7rem', fontStyle: 'italic', marginTop: '4px' },
  ancient: { color: 'var(--fg)', fontSize: '0.9rem', lineHeight: '1.8', letterSpacing: '0.05em' },
  yao: { display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', fontFamily: 'monospace', fontSize: '0.8rem' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' },
  col: { flex: '1', minWidth: '0' },
  tag: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '3px', fontSize: '0.7rem',
    fontFamily: 'monospace', border: '1px solid var(--border)', color: 'var(--muted)',
  },
  tagActive: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '3px', fontSize: '0.7rem',
    fontFamily: 'monospace', border: '1px solid var(--fg)', color: 'var(--fg)', fontWeight: 'bold',
  },
  streamText: { color: 'var(--fg)', fontSize: '0.9rem', lineHeight: '1.8' },
  remaining: { color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'monospace' },
  coinRow: { display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 },
  castItem: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
    border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '8px',
    fontFamily: 'monospace', fontSize: '0.8rem', flexWrap: 'nowrap',
  },
  castLabel: { width: '32px', color: 'var(--muted)', fontSize: '0.75rem', flexShrink: 0 },
  castResult: { marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 },
  castFinal: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    border: '1px solid var(--fg)', borderRadius: '6px', marginTop: '12px',
    fontFamily: 'monospace', fontSize: '0.85rem', flexWrap: 'nowrap',
  },
  coinGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
    marginBottom: '16px',
  },
  coinGridItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    padding: '8px 4px', border: '1px solid var(--border)', borderRadius: '6px',
    fontFamily: 'monospace', fontSize: '0.7rem',
  },
}

// Markdown 自定义组件
const mdComponents = {
  h1: ({ children }) => <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--fg)', margin: '16px 0 8px', fontFamily: 'monospace' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--fg)', margin: '14px 0 6px', fontFamily: 'monospace' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--fg)', margin: '12px 0 4px', fontFamily: 'monospace' }}>{children}</h3>,
  p: ({ children }) => <p style={{ margin: '6px 0', lineHeight: '1.8' }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: 'var(--fg)', fontWeight: 'bold' }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>{children}</em>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--border)', paddingLeft: '12px', margin: '8px 0', color: 'var(--muted)', fontStyle: 'italic' }}>{children}</blockquote>,
  ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '6px 0' }}>{children}</ol>,
  li: ({ children }) => <li style={{ margin: '2px 0', lineHeight: '1.8' }}>{children}</li>,
  code: ({ children }) => <code style={{ fontFamily: 'monospace', fontSize: '0.85em', padding: '1px 4px', backgroundColor: 'var(--border)', borderRadius: '3px' }}>{children}</code>,
  pre: ({ children }) => <pre style={{ backgroundColor: 'var(--border)', borderRadius: '4px', padding: '10px', margin: '8px 0', overflowX: 'auto' }}>{children}</pre>,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />,
}

// 爻线可视化组件
function YaoLine({ yao, idx, total }) {
  const isTop = idx === total - 1
  const lineColor = yao.changing ? 'var(--fg)' : 'var(--fg)'
  return (
    <div style={S.yao}>
      <span style={{ width: '40px', color: 'var(--muted)', fontSize: '0.75rem' }}>
        {yao.liuShen}
      </span>
      <span style={{ width: '40px', color: yao.isYongShen ? '#c0392b' : 'var(--muted)', fontSize: '0.75rem' }}>
        {yao.liuQin}
      </span>
      <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {yao.yang ? (
          <div style={{ width: '120px', height: '3px', backgroundColor: lineColor, borderRadius: '1px' }} />
        ) : (
          <div style={{ width: '120px', display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, height: '3px', backgroundColor: lineColor, borderRadius: '1px' }} />
            <div style={{ flex: 1, height: '3px', backgroundColor: lineColor, borderRadius: '1px' }} />
          </div>
        )}
      </div>
      <span style={{ width: '40px', color: 'var(--muted)', fontSize: '0.75rem' }}>
        {yao.zhi}
      </span>
      <span style={{
        width: '60px', color: 'var(--fg)', fontSize: '0.8rem',
        fontWeight: (yao.isShi || yao.isYing) ? 'bold' : 'normal',
      }}>
        {yao.name}
        {yao.isShi && ' 世'}
        {yao.isYing && ' 应'}
      </span>
      {yao.changing && <span style={{ color: '#c0392b', fontSize: '0.75rem' }}>→ {yao.bianZhi}</span>}
      {yao.isYongShen && <span style={{ color: '#c0392b', fontSize: '0.7rem' }}>用神</span>}
    </div>
  )
}

// 铜钱 SVG 组件
function Coin({ isBack, size = 44, uid }) {
  const r = size / 2
  const hole = size * 0.13
  const gid = `cg${uid}`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id={gid} cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor={isBack ? '#d4a84b' : '#a07020'} />
          <stop offset="100%" stopColor={isBack ? '#b08530' : '#6b4c0a'} />
        </radialGradient>
      </defs>
      {/* 外圆 */}
      <circle cx={r} cy={r} r={r - 1} fill={`url(#${gid})`} stroke={isBack ? '#8b6914' : '#4a3508'} strokeWidth="1.5" />
      {/* 内圈 */}
      <circle cx={r} cy={r} r={r * 0.72} fill="none" stroke={isBack ? '#8b6914' : '#4a3508'} strokeWidth="0.6" opacity="0.5" />
      {/* 方孔 */}
      <rect x={r - hole} y={r - hole} width={hole * 2} height={hole * 2}
        fill={isBack ? 'rgba(139,105,20,0.15)' : 'rgba(74,53,8,0.25)'}
        stroke={isBack ? '#8b6914' : '#4a3508'} strokeWidth="1" />
      {isBack ? (
        /* 背面：四角标记线 */
        <>
          <line x1={r} y1={3} x2={r} y2={r - hole - 1} stroke="#8b6914" strokeWidth="0.8" opacity="0.5" />
          <line x1={r} y1={r + hole + 1} x2={r} y2={size - 3} stroke="#8b6914" strokeWidth="0.8" opacity="0.5" />
          <line x1={3} y1={r} x2={r - hole - 1} y2={r} stroke="#8b6914" strokeWidth="0.8" opacity="0.5" />
          <line x1={r + hole + 1} y1={r} x2={size - 3} y2={r} stroke="#8b6914" strokeWidth="0.8" opacity="0.5" />
        </>
      ) : (
        /* 正面："文" 字 */
        <text x={r} y={r + 0.5} textAnchor="middle" dominantBaseline="middle"
          fill="#3a2505" fontSize={size * 0.32} fontWeight="bold" fontFamily="serif">
          文
        </text>
      )}
    </svg>
  )
}

// 卦象可视化（梅花）
function MeihuaGuaDisplay({ guaName, upperName, lowerName, movingLine, lines }) {
  if (!guaName) return null
  const allLines = lines || []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px' }}>
      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--fg)', fontWeight: 'bold', marginBottom: '4px' }}>
        {guaName}
      </div>
      {allLines.length > 0 ? allLines.map((yang, i) => {
        const isMoving = movingLine && (i + 1) === movingLine
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {yang ? (
              <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--fg)', borderRadius: '1px' }} />
            ) : (
              <div style={{ width: '60px', display: 'flex', gap: '6px' }}>
                <div style={{ flex: 1, height: '3px', backgroundColor: 'var(--fg)', borderRadius: '1px' }} />
                <div style={{ flex: 1, height: '3px', backgroundColor: 'var(--fg)', borderRadius: '1px' }} />
              </div>
            )}
            {isMoving && <span style={{ color: '#c0392b', fontSize: '0.7rem' }}>← 动</span>}
          </div>
        )
      }) : null}
    </div>
  )
}

export default function Suwen() {
  const [method, setMethod] = useState('liuyao') // liuyao | meihua
  const [subMethod, setSubMethod] = useState('coin') // coin | manual | time | number | text | random
  const [result, setResult] = useState(null)
  const [style, setStyle] = useState('jingshi') // jingshi | yinshi
  const [category, setCategory] = useState('')
  const [question, setQuestion] = useState('')
  const [aiText, setAiText] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiRemaining, setAiRemaining] = useState(null)
  const [casting, setCasting] = useState(null) // 摇卦动画状态
  const [coinRecord, setCoinRecord] = useState(null) // 摇卦铜钱记录
  const abortRef = useRef(null)
  const castingRef = useRef(null)
  const charTimerRef = useRef(null)
  const aiTextRef = useRef('')
  const displayedLenRef = useRef(0)

  // 六爻手动输入
  const [manualLines, setManualLines] = useState(
    Array(6).fill(null).map(() => ({ yang: true, changing: false }))
  )

  // 梅花数字
  const [num1, setNum1] = useState('')
  const [num2, setNum2] = useState('')
  const [text, setText] = useState('')

  // 获取剩余次数
  useEffect(() => {
    fetch('/api/suwen?action=remaining')
      .then(r => r.json())
      .then(d => setAiRemaining(d.remaining))
      .catch(() => {})
  }, [])

  // 六爻摇卦（带铜钱动画）
  const handleCastCoins = () => {
    const lines = castHexagram()
    const dayStem = getDayStem()
    const data = installHexagram(lines, dayStem, category)
    if (!data) { alert('起卦失败：未找到对应卦象，请重试'); return }

    setAiText('')
    setResult(null)
    setCasting({ casts: [], current: 0, done: false })

    let idx = 0
    const tick = () => {
      if (idx >= 6) {
        setCasting(prev => prev ? { ...prev, done: true } : null)
        setTimeout(() => {
          setCasting(null)
          setCoinRecord(lines.map(l => ({ coins: l.coins, type: l.type, yang: l.yang, changing: l.changing })))
          setResult({ type: 'liuyao', data, lines })
        }, 1200)
        return
      }
      const line = lines[idx]
      setCasting(prev => prev ? {
        ...prev,
        casts: [...prev.casts, { coins: line.coins, type: line.type, yang: line.yang, changing: line.changing }],
        current: idx + 1,
      } : null)
      idx++
      castingRef.current = setTimeout(tick, 700)
    }
    castingRef.current = setTimeout(tick, 300)
  }

  // 六爻手动
  const handleManualCast = () => {
    const lines = manualCast(manualLines)
    const dayStem = getDayStem()
    const data = installHexagram(lines, dayStem, category)
    if (!data) { alert('起卦失败：未找到对应卦象，请重试'); return }
    setResult({ type: 'liuyao', data, lines })
    setAiText('')
  }

  // 梅花时间
  const handleMeihuaTime = () => {
    const d = divineByTime()
    const data = deriveHexagram(d.upper, d.lower, d.moving)
    setResult({ type: 'meihua', data, lunar: d.lunar })
    setAiText('')
  }

  // 梅花数字
  const handleMeihuaNumber = () => {
    if (!num1 || !num2) return
    const d = divineByNumbers(parseInt(num1), parseInt(num2))
    const data = deriveHexagram(d.upper, d.lower, d.moving)
    setResult({ type: 'meihua', data })
    setAiText('')
  }

  // 梅花文字
  const handleMeihuaText = () => {
    if (!text.trim()) return
    const d = divineByText(text)
    const data = deriveHexagram(d.upper, d.lower, d.moving)
    setResult({ type: 'meihua', data })
    setAiText('')
  }

  // 梅花随机
  const handleMeihuaRandom = () => {
    const d = divineByRandom()
    const data = deriveHexagram(d.upper, d.lower, d.moving)
    setResult({ type: 'meihua', data })
    setAiText('')
  }

  // 逐字输出调度器
  const scheduleCharDisplay = () => {
    if (charTimerRef.current) clearInterval(charTimerRef.current)
    charTimerRef.current = setInterval(() => {
      const full = aiTextRef.current
      const curLen = displayedLenRef.current
      if (curLen >= full.length) {
        // 全部输出完毕，停止调度
        clearInterval(charTimerRef.current)
        charTimerRef.current = null
        return
      }
      // 每次输出1-2个字符，速度更快时输出更多
      const step = full.length - curLen > 50 ? 2 : 1
      const newLen = Math.min(curLen + step, full.length)
      displayedLenRef.current = newLen
      setDisplayedText(full.slice(0, newLen))
    }, 30)
  }

  // AI 解读（流式）
  const handleAI = async () => {
    if (!result) return
    setAiLoading(true)
    setAiText('')
    setDisplayedText('')
    aiTextRef.current = ''
    displayedLenRef.current = 0
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    // 启动逐字输出
    scheduleCharDisplay()

    try {
      const payload = {
        method: result.type,
        data: result.data,
        style,
        category,
        question,
      }
      const res = await fetch('/api/suwen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const errText = `❌ ${err.error || '请求失败'}`
        setAiText(errText)
        aiTextRef.current = errText
        setAiLoading(false)
        return
      }

      // 更新剩余次数
      const rem = res.headers.get('X-Remaining')
      if (rem) setAiRemaining(parseInt(rem))

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const msgs = buffer.split('\n\n')
        buffer = msgs.pop() || ''
        for (const msg of msgs) {
          const dataLine = msg.split('\n').find(l => l.startsWith('data: '))
          if (!dataLine) continue
          const raw = dataLine.slice(6)
          if (raw === '[DONE]') continue
          try {
            full += JSON.parse(raw)
          } catch {
            full += raw
          }
        }
        setAiText(full)
        aiTextRef.current = full
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        const errText = `❌ ${e.message}`
        setAiText(errText)
        aiTextRef.current = errText
      }
    }
    setAiLoading(false)
  }

  const stopAI = () => {
    if (abortRef.current) abortRef.current.abort()
    if (charTimerRef.current) clearInterval(charTimerRef.current)
    setAiLoading(false)
  }

  const reset = () => {
    setResult(null)
    setAiText('')
    setDisplayedText('')
    aiTextRef.current = ''
    displayedLenRef.current = 0
    setQuestion('')
    setCasting(null)
    setCoinRecord(null)
    if (castingRef.current) clearTimeout(castingRef.current)
    if (charTimerRef.current) clearInterval(charTimerRef.current)
  }

  const categories = ['财运', '感情', '事业', '考试', '父母', '健康', '子女', '出行']

  return (
    <div style={S.wrap} className="suwen-wrap">
      {/* 方式切换 */}
      <div style={S.tabs}>
        <button style={method === 'liuyao' ? S.tabActive : S.tab} onClick={() => { setMethod('liuyao'); setSubMethod('coin'); reset() }}>
          六爻
        </button>
        <button style={method === 'meihua' ? S.tabActive : S.tab} onClick={() => { setMethod('meihua'); setSubMethod('time'); reset() }}>
          梅花易数
        </button>
      </div>

      {/* 子方式 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {method === 'liuyao' ? (
          <>
            <button style={subMethod === 'coin' ? S.subTabActive : S.subTab} onClick={() => { setSubMethod('coin'); reset() }}>铜钱摇卦</button>
            <button style={subMethod === 'manual' ? S.subTabActive : S.subTab} onClick={() => { setSubMethod('manual'); reset() }}>手动输入</button>
          </>
        ) : (
          <>
            <button style={subMethod === 'time' ? S.subTabActive : S.subTab} onClick={() => { setSubMethod('time'); reset() }}>时间起卦</button>
            <button style={subMethod === 'number' ? S.subTabActive : S.subTab} onClick={() => { setSubMethod('number'); reset() }}>数字起卦</button>
            <button style={subMethod === 'text' ? S.subTabActive : S.subTab} onClick={() => { setSubMethod('text'); reset() }}>文字起卦</button>
            <button style={subMethod === 'random' ? S.subTabActive : S.subTab} onClick={() => { setSubMethod('random'); reset() }}>随机起卦</button>
          </>
        )}
      </div>

      {/* 占事类别 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={S.label}>占事类别（可选）</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} style={category === c ? S.subTabActive : S.subTab}
              onClick={() => setCategory(category === c ? '' : c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 输入区域 */}
      {subMethod === 'coin' && !casting && (
        <button style={S.btn} onClick={handleCastCoins}>摇卦</button>
      )}

      {subMethod === 'coin' && casting && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '12px' }}>
            第 {Math.min(casting.current, 6)} / 6 爻
          </div>
          {casting.casts.map((c, i) => (
            <div key={i} style={S.castItem}>
              <span style={S.castLabel}>{['初', '二', '三', '四', '五', '上'][i]}爻</span>
              <div style={S.coinRow}>
                {c.coins.map((isBack, j) => (
                  <div key={j} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <Coin isBack={isBack} size={28} uid={`${i}_${j}`} />
                    <span style={{ fontSize: '0.55rem', color: isBack ? 'var(--muted)' : 'var(--fg)', fontFamily: 'monospace' }}>
                      {isBack ? '背' : '正'}
                    </span>
                  </div>
                ))}
              </div>
              <span style={S.castResult}>
                {c.type}{c.changing && <span style={{ color: '#c0392b' }}> · 动</span>}
              </span>
            </div>
          ))}
          {casting.done && casting.casts.length === 6 && (
            <div style={S.castFinal}>
              <span style={{ color: 'var(--fg)', fontWeight: 'bold' }}>成卦</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>装卦中...</span>
            </div>
          )}
        </div>
      )}

      {subMethod === 'manual' && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={S.label}>从初爻到上爻（点击切换阴阳，双击切换变爻）</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[5, 4, 3, 2, 1, 0].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '40px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {['初', '二', '三', '四', '五', '上'][i]}爻
                  </span>
                  <button
                    onClick={() => {
                      const newLines = [...manualLines]
                      newLines[i] = { ...newLines[i], yang: !newLines[i].yang }
                      setManualLines(newLines)
                    }}
                    onDoubleClick={() => {
                      const newLines = [...manualLines]
                      newLines[i] = { ...newLines[i], changing: !newLines[i].changing }
                      setManualLines(newLines)
                    }}
                    style={{
                      width: '120px', height: '20px', cursor: 'pointer', background: 'none', border: 'none', padding: 0,
                    }}
                  >
                    {manualLines[i].yang ? (
                      <div style={{ width: '120px', height: '3px', backgroundColor: 'var(--fg)', borderRadius: '1px' }} />
                    ) : (
                      <div style={{ width: '120px', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, height: '3px', backgroundColor: 'var(--fg)', borderRadius: '1px' }} />
                        <div style={{ flex: 1, height: '3px', backgroundColor: 'var(--fg)', borderRadius: '1px' }} />
                      </div>
                    )}
                  </button>
                  {manualLines[i].changing && <span style={{ color: '#c0392b', fontSize: '0.7rem' }}>变</span>}
                </div>
              ))}
            </div>
          </div>
          <button style={S.btn} onClick={handleManualCast}>装卦</button>
        </div>
      )}

      {subMethod === 'time' && (
        <button style={S.btn} onClick={handleMeihuaTime}>以当前时间起卦</button>
      )}

      {subMethod === 'number' && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ ...S.col, minWidth: '80px' }}>
            <label style={S.label}>数一（上卦）</label>
            <input type="number" style={S.input} value={num1} onChange={e => setNum1(e.target.value)} placeholder="如：5" />
          </div>
          <div style={{ ...S.col, minWidth: '80px' }}>
            <label style={S.label}>数二（下卦）</label>
            <input type="number" style={S.input} value={num2} onChange={e => setNum2(e.target.value)} placeholder="如：3" />
          </div>
          <button style={{ ...S.btn, flexShrink: 0 }} onClick={handleMeihuaNumber}>起卦</button>
        </div>
      )}

      {subMethod === 'text' && (
        <div>
          <input style={S.input} value={text} onChange={e => setText(e.target.value)} placeholder="输入文字，按字数起卦..." />
          <button style={{ ...S.btn, marginTop: '12px' }} onClick={handleMeihuaText}>起卦</button>
        </div>
      )}

      {subMethod === 'random' && (
        <button style={S.btn} onClick={handleMeihuaRandom}>随机起卦</button>
      )}

      {/* 结果展示 */}
      {result && (
        <div style={{ marginTop: '24px' }}>
          {/* 六爻结果 */}
          {result.type === 'liuyao' && result.data && (
            <div>
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--fg)', fontWeight: 'bold' }}>
                      {result.data.benGua?.fullName}
                    </span>
                    <span style={{ ...S.tag, marginLeft: '8px' }}>
                      {result.data.gong}宫 · {result.data.gongElement} · {result.data.gongType}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    日干：{getDayStem()} · 日支：{getDayZhi()}
                  </div>
                </div>

                {/* 六爻盘面 */}
                <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '12px' }}>
                  {(result.data.yaoData || []).map((yao, i) => (
                    <YaoLine key={i} yao={yao} idx={i} total={6} />
                  ))}
                </div>

                {/* 变卦 */}
                {result.data.bianGua && result.data.dongYao.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--fg)' }}>
                      变卦：{result.data.bianGua.fullName}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: '8px' }}>
                      动爻：{(result.data.dongYao || []).map(y => y.name).join('、')}
                    </span>
                  </div>
                )}
              </div>

              {/* 古籍原文 */}
              <div style={S.card}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '8px' }}>卦辞</div>
                <div style={S.ancient}>{result.data.judgement}</div>
                <div style={S.source}>{result.data.judgementSource}</div>
                <div style={{ ...S.ancient, marginTop: '12px' }}>{result.data.xiang}</div>
                <div style={S.source}>{result.data.xiangSource}</div>
              </div>
            </div>
          )}

          {/* 梅花结果 */}
          {result.type === 'meihua' && result.data && (
            <div>
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    体卦：{result.data.tiGua}（{result.data.tiElement}）
                    {' '}· 用卦：{result.data.yongGua}（{result.data.yongElement}）
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '4px' }}>本卦</div>
                    <MeihuaGuaDisplay
                      guaName={result.data.benGua?.fullName}
                      lines={result.data.lines}
                      movingLine={result.data.movingLine}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '4px' }}>互卦</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--fg)', padding: '20px' }}>
                      {result.data.huGua?.fullName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '4px' }}>变卦</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--fg)', padding: '20px' }}>
                      {result.data.bianGua?.fullName}
                    </div>
                  </div>
                </div>

                {/* 体用关系 */}
                <div style={{ marginTop: '12px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {result.data.wuxingRelation.relation}：{result.data.wuxingRelation.desc}
                    <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>（{result.data.wuxingRelation.luck}）</span>
                  </span>
                </div>
              </div>

              {/* 古籍原文 */}
              {result.data.benGua && (
                <div style={S.card}>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '8px' }}>卦辞</div>
                  <div style={S.ancient}>{result.data.benGua.judgement}</div>
                  <div style={S.source}>{result.data.benGua.judgement_source}</div>
                  {result.data.movingLineData && (
                    <>
                      <div style={{ ...S.ancient, marginTop: '12px' }}>{result.data.movingLineData.text}</div>
                      <div style={S.source}>{result.data.movingLineData.source}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 铜钱记录（3x2 网格） */}
          {coinRecord && coinRecord.length === 6 && (
            <div style={{ ...S.card, marginBottom: '16px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '10px' }}>摇卦记录</div>
              <div style={S.coinGrid}>
              {coinRecord.map((c, i) => (
                <div key={i} style={S.coinGridItem}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>
                    {['初', '二', '三', '四', '五', '上'][i]}爻
                  </span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {c.coins.map((isBack, j) => (
                      <div key={j} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                        <Coin isBack={isBack} size={28} uid={`r${i}_${j}`} />
                        <span style={{ fontSize: '0.5rem', color: isBack ? 'var(--muted)' : 'var(--fg)', fontFamily: 'monospace' }}>
                          {isBack ? '背' : '正'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span style={{ color: c.changing ? '#c0392b' : 'var(--muted)', fontSize: '0.65rem' }}>
                    {c.type}{c.changing && ' · 动'}
                  </span>
                </div>
              ))}
              </div>
            </div>
          )}

          {/* AI 解读区 */}
          <div style={S.card}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '10px', lineHeight: '1.6' }}>
              {style === 'jingshi'
                ? '经师：精通经学、传道授业，以学问济世。解读风格严谨正统，引经据典，注重卦理推演。'
                : '隐士：有才德而隐居不仕，追求精神自由。解读风格超脱洒脱，不拘一格，侧重直觉感悟与象意联想。'
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button style={style === 'jingshi' ? S.subTabActive : S.subTab}
                  onClick={() => setStyle('jingshi')}>经师</button>
                <button style={style === 'yinshi' ? S.subTabActive : S.subTab}
                  onClick={() => setStyle('yinshi')}>隐士</button>
              </div>
              {aiRemaining !== null && (
                <span style={S.remaining}>今日剩余 {aiRemaining} 次</span>
              )}
            </div>

            <input style={{ ...S.input, marginBottom: '12px' }} value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="补充你的问题（可选）..." />

            <div style={{ display: 'flex', gap: '8px' }}>
              {aiLoading ? (
                <button style={S.btnOutline} onClick={stopAI}>停止</button>
              ) : (
                <button style={S.btn} onClick={handleAI}>AI 解读</button>
              )}
            </div>

            {aiText && (
              <div style={{ marginTop: '16px', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <div style={S.streamText}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {displayedText || aiText}
                  </ReactMarkdown>
                  {aiLoading && <span style={{ animation: 'blink 1s infinite' }}>▌</span>}
                </div>
              </div>
            )}
          </div>

          {/* 再摇一卦 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button style={S.btn} onClick={reset}>
              再摇一卦
            </button>
          </div>
        </div>
      )}

      {/* 说明区域 */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
        <span><b style={{ color: 'var(--fg)' }}>六爻</b> 铜钱摇卦 · 京房易学</span>
        <span><b style={{ color: 'var(--fg)' }}>梅花易数</b> 邵雍所传 · 体用生克</span>
        <span><b style={{ color: 'var(--fg)' }}>AI 解读</b> {aiRemaining !== null ? `今日剩余 ${aiRemaining} 次` : '每日 5 次'} · 经师/隐士</span>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .suwen-wrap {
            overflow-x: hidden !important;
            max-width: 100% !important;
            padding-left: 4px !important;
            padding-right: 4px !important;
          }
          .suwen-wrap input,
          .suwen-wrap select,
          .suwen-wrap textarea {
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
          .suwen-wrap button {
            white-space: nowrap !important;
          }
        }
      `}</style>
    </div>
  )
}
