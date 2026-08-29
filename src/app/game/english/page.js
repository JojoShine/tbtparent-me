'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Volume2, Check, X, SkipForward, RotateCcw, Calendar } from 'lucide-react'
import { unitIds, loadAllUnits } from '@/data/english/index'

// 基于种子的伪随机数生成器（确保同一天结果一致）
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function dateSeed(dateStr) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i)
    hash |= 0
  }
  return hash
}

// 归一化：去掉首尾空格、句末标点（保留撇号）、转小写
function normalize(str) {
  return str.trim().toLowerCase().replace(/[.,!?;:"()\-–—]/g, '').replace(/\s+/g, ' ')
}

// 计算相似度（0~1），用于部分正确的判定
function similarity(a, b) {
  if (a === b) return 1
  const la = a.length, lb = b.length
  if (la === 0 || lb === 0) return 0
  const matrix = Array.from({ length: la + 1 }, (_, i) =>
    Array.from({ length: lb + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    }
  }
  const maxLen = Math.max(la, lb)
  return 1 - matrix[la][lb] / maxLen
}

export default function EnglishPractice() {
  const [phrasesData, setPhrasesData] = useState([])
  const [screen, setScreen] = useState('units') // units | game | result
  const [currentUnit, setCurrentUnit] = useState(null)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null) // null | 'correct' | 'wrong' | 'close'
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState([])
  const [speaking, setSpeaking] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isDailyMode, setIsDailyMode] = useState(false)
  const [dailyPhrases, setDailyPhrases] = useState([])
  const [answeredCorrectly, setAnsweredCorrectly] = useState(new Set()) // 记录已答对的题号
  const [cursorPos, setCursorPos] = useState(0) // 跟踪隐藏输入框的光标位置
  const inputRef = useRef(null)
  const compositionRef = useRef(false)

  const unit = currentUnit !== null ? phrasesData[currentUnit] : null
  const phrase = isDailyMode
    ? (dailyPhrases[phraseIdx]?.phrase || null)
    : (unit ? unit.phrases[phraseIdx] : null)
  const activePhrase = phrase
  const activeSpeechText = activePhrase?.en || ''
  const activeTotal = isDailyMode ? dailyPhrases.length : (unit ? unit.phrases.length : 0)
  const activeProgress = activeTotal > 0 ? (phraseIdx / activeTotal) * 100 : 0

  // 加载所有单元数据
  useEffect(() => {
    loadAllUnits().then(setPhrasesData)
  }, [])

  const speak = useCallback((text) => {
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-GB'
    utterance.rate = 0.9
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  // 获取单元进度
  const getUnitProgress = (unitIdx) => {
    try {
      const raw = localStorage.getItem(`english-progress-${phrasesData[unitIdx].id}`)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { bestScore: 0, total: phrasesData[unitIdx].phrases.length, completed: 0 }
  }

  // 保存单元进度
  const saveProgress = (unitIdx, correct, total) => {
    const key = `english-progress-${phrasesData[unitIdx].id}`
    const prev = getUnitProgress(unitIdx)
    const newScore = Math.max(prev.bestScore, Math.round((correct / total) * 100))
    localStorage.setItem(key, JSON.stringify({
      bestScore: newScore,
      total,
      completed: newScore >= 80 ? Math.max(prev.completed, 1) : prev.completed,
    }))
  }

  // 提交答案
  const handleSubmit = () => {
    if (!phrase || !input.trim() || compositionRef.current) return

    const userInput = normalize(input)
    const correctAnswer = normalize(phrase.en)

    if (userInput === correctAnswer) {
      setStatus('correct')
      setScore(s => s + 1)
      setResults(r => [...r, { phrase, correct: true, attempts: attempts + 1 }])
      setAnsweredCorrectly(prev => new Set([...prev, phraseIdx])) // 记录已答对
    } else {
      const sim = similarity(userInput, correctAnswer)
      if (sim >= 0.8) {
        setStatus('close')
        setAttempts(a => a + 1)
        return
      }
      setStatus('wrong')
      setAttempts(a => a + 1)
    }
  }

  // 正确后进入下一题
  const handleNext = () => {
    const nextIdx = phraseIdx + 1
    if (nextIdx >= activeTotal) {
      if (isDailyMode) {
        localStorage.setItem('english-daily-completed', JSON.stringify({ date: getTodayStr(), score, total: activeTotal }))
      } else {
        saveProgress(currentUnit, score, activeTotal)
      }
      setScreen('result')
    } else {
      setPhraseIdx(nextIdx)
      setInput('')
      setCursorPos(0)
      setStatus(null)
      setAttempts(0)
      setShowAnswer(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // 跳过当前题
  const handleSkip = () => {
    setResults(r => [...r, { phrase, correct: false, attempts }])
    const nextIdx = phraseIdx + 1
    if (nextIdx >= activeTotal) {
      if (isDailyMode) {
        localStorage.setItem('english-daily-completed', JSON.stringify({ date: getTodayStr(), score, total: activeTotal }))
      } else {
        saveProgress(currentUnit, score, activeTotal)
      }
      setScreen('result')
    } else {
      setPhraseIdx(nextIdx)
      setInput('')
      setCursorPos(0)
      setStatus(null)
      setAttempts(0)
      setShowAnswer(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // 显示答案（不跳题，先让用户看）
  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  // 看完答案后进入下一题
  const handleNextAfterAnswer = () => {
    setResults(r => [...r, { phrase, correct: false, attempts }])
    const nextIdx = phraseIdx + 1
    if (nextIdx >= activeTotal) {
      if (isDailyMode) {
        localStorage.setItem('english-daily-completed', JSON.stringify({ date: getTodayStr(), score, total: activeTotal }))
      } else {
        saveProgress(currentUnit, score, activeTotal)
      }
      setScreen('result')
    } else {
      setPhraseIdx(nextIdx)
      setInput('')
      setCursorPos(0)
      setStatus(null)
      setAttempts(0)
      setShowAnswer(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // 状态变化后自动进入下一题（正确时）
  useEffect(() => {
    if (status === 'correct') {
      const timer = setTimeout(() => handleNext(), 1200)
      return () => clearTimeout(timer)
    }
  }, [status])

  // 输入框自动聚焦
  useEffect(() => {
    if (screen === 'game' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [screen])

  // 获取今日日期字符串
  const getTodayStr = () => new Date().toISOString().split('T')[0]

  // 检查今日每日任务是否完成
  const isDailyCompleted = () => {
    try {
      const raw = localStorage.getItem('english-daily-completed')
      if (raw) {
        const data = JSON.parse(raw)
        return data.date === getTodayStr()
      }
    } catch {}
    return false
  }

  // 获取或生成用户专属种子（存储在 localStorage）
  const getUserSeed = () => {
    try {
      const raw = localStorage.getItem('english-user-seed')
      if (raw) return parseInt(raw, 10)
    } catch {}
    // 生成随机种子并保存
    const seed = Math.floor(Math.random() * 1000000)
    localStorage.setItem('english-user-seed', String(seed))
    return seed
  }

  // 从所有单元中随机挑选10句（基于日期+用户种子）
  const generateDailyPhrases = useCallback(() => {
    if (phrasesData.length === 0) return []
    const allPhrases = []
    phrasesData.forEach((u, ui) => {
      u.phrases.forEach((p, pi) => {
        allPhrases.push({ unitId: u.id, unitIdx: ui, phraseIdx: pi, phrase: p })
      })
    })
    const todayStr = getTodayStr()
    const userSeed = getUserSeed()
    const seed = dateSeed(todayStr) + userSeed
    // Fisher-Yates 洗牌
    const shuffled = [...allPhrases]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 10)
  }, [phrasesData])

  // 开始每日10句
  const startDaily = () => {
    const daily = generateDailyPhrases()
    if (daily.length === 0) return
    setIsDailyMode(true)
    setDailyPhrases(daily)
    setCurrentUnit(null)
    setPhraseIdx(0)
    setInput('')
    setCursorPos(0)
    setStatus(null)
    setAttempts(0)
    setShowAnswer(false)
    setScore(0)
    setResults([])
    setAnsweredCorrectly(new Set()) // 重置已答对记录
    setScreen('game')
  }

  // 开始游戏
  const startUnit = (unitIdx) => {
    setIsDailyMode(false)
    setCurrentUnit(unitIdx)
    setPhraseIdx(0)
    setInput('')
    setCursorPos(0)
    setStatus(null)
    setAttempts(0)
    setShowAnswer(false)
    setScore(0)
    setResults([])
    setAnsweredCorrectly(new Set()) // 重置已答对记录
    setScreen('game')
  }

  // 键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !compositionRef.current) {
      if (showAnswer) {
        handleNextAfterAnswer()
      } else if (status === 'correct') {
        handleNext()
      } else if (status === 'wrong' || status === 'close') {
        setInput('')
        setCursorPos(0)
        setStatus(null)
      } else {
        handleSubmit()
      }
    }
    if (e.key === 'Backspace' && !compositionRef.current && input.length > 0) {
      const pos = inputRef.current?.selectionStart ?? input.length
      if (pos > 0) {
        // 删除光标前的一个字符（而非总是删除末尾）
        const newInput = input.slice(0, pos - 1) + input.slice(pos)
        setInput(newInput)
        setCursorPos(pos - 1)
        // 阻止浏览器默认删除行为，因为我们已手动处理
        e.preventDefault()
      }
      if (status === 'wrong' || status === 'close') setStatus(null)
    }
  }

  // ===== 加载中 =====
  if (phrasesData.length === 0) {
    return (
      <div className="max-w-4xl pb-8" style={{ margin: '0 auto', textAlign: 'center', padding: '60px 20px', fontFamily: 'monospace', color: 'var(--muted)' }}>
        加载中...
      </div>
    )
  }

  // ===== 单元选择界面 =====
  if (screen === 'units') {
    return (
      <motion.div
        className="max-w-4xl pb-8"
        style={{ margin: '0 auto' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ marginBottom: '30px' }}>
          <Link
            href="/game"
            className="inline-flex items-center gap-2 font-mono text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted)', marginBottom: '24px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回游戏大厅
          </Link>
          <h1 className="font-mono font-bold text-2xl md:text-3xl" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
            常用英语练习
          </h1>
          <p className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            听发音、看中文、打出英文 · {phrasesData.length} 个单元 · {phrasesData.reduce((s, u) => s + u.phrases.length, 0)} 句常用英语
          </p>
        </div>

        {/* 每日10句入口 */}
        <button
          onClick={startDaily}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: isDailyCompleted() ? 'rgba(56, 161, 105, 0.05)' : 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color 0.2s',
            width: '100%',
            marginBottom: '16px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDailyCompleted() ? '#38a169' : 'var(--border)' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            border: `1px solid ${isDailyCompleted() ? '#38a169' : 'var(--border)'}`,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Calendar className="w-4 h-4" style={{ color: isDailyCompleted() ? '#38a169' : 'var(--fg)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.95rem', color: isDailyCompleted() ? '#38a169' : 'var(--fg)', marginBottom: '2px' }}>
              每日 10 句 {isDailyCompleted() ? '✓ 已完成' : ''}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
              从全部单元随机挑选 10 句，每天刷新
            </div>
          </div>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {phrasesData.map((u, idx) => {
            const prog = getUnitProgress(idx)
            return (
              <button
                key={u.id}
                onClick={() => startUnit(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.2s',
                  width: '100%',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--fg)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: prog.bestScore >= 80 ? '#38a169' : 'var(--fg)',
                }}>
                  {prog.bestScore >= 80 ? '✓' : idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.95rem', color: 'var(--fg)', marginBottom: '2px' }}>
                    {u.title}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {u.desc} · {u.phrases.length} 句
                  </div>
                </div>
                {prog.bestScore > 0 && (
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: prog.bestScore >= 80 ? '#38a169' : 'var(--muted)',
                    flexShrink: 0,
                  }}>
                    {prog.bestScore}%
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // ===== 结果界面 =====
  if (screen === 'result') {
    const correctCount = results.filter(r => r.correct).length
    const total = results.length
    const pct = Math.round((correctCount / total) * 100)
    return (
      <motion.div
        className="max-w-2xl pb-8"
        style={{ margin: '0 auto' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ marginBottom: '30px' }}>
          <h1 className="font-mono font-bold text-2xl" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
            {isDailyMode ? '每日 10 句 · 练习结果' : `${unit?.title} · 练习结果`}
          </h1>
        </div>

        <div style={{
          padding: '24px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 'bold', color: pct >= 80 ? '#38a169' : pct >= 50 ? '#d69e2e' : '#e53e3e', marginBottom: '8px' }}>
            {pct}%
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)' }}>
            正确 {correctCount} / {total} 句
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '8px' }}>
            {pct >= 80 ? '太棒了！继续保持！' : pct >= 50 ? '不错，再练练更好！' : '加油，多听多练！'}
          </div>
        </div>

        {/* 逐句回顾 */}
        <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
          {results.map((r, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: r.correct ? '#38a169' : '#e53e3e', flexShrink: 0 }}>
                {r.correct ? '✓' : '✗'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--fg)', fontWeight: 500 }}>{r.phrase.en}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{r.phrase.zh}</div>
              </div>
              {!r.correct && (
                <button
                  onClick={() => {
                    if (isDailyMode) {
                      speak(dailyPhrases[i]?.phrase?.en)
                    } else {
                      speak(phrasesData[currentUnit]?.phrases[i]?.en)
                    }
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isDailyMode ? (
            <button
              onClick={() => setScreen('units')}
              style={{
                flex: 1,
                padding: '10px',
                background: 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                fontFamily: 'monospace',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              返回单元选择
            </button>
          ) : (
            <>
              <button
                onClick={() => startUnit(currentUnit)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--fg)',
                  color: 'var(--bg)',
                  border: 'none',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <RotateCcw className="w-4 h-4" />
                再练一次
              </button>
              <button
                onClick={() => setScreen('units')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                选择单元
              </button>
            </>
          )}
        </div>
      </motion.div>
    )
  }

  // ===== 游戏界面 =====
  return (
    <motion.div
      className="max-w-2xl pb-8"
      style={{ margin: '0 auto' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 顶部导航 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => setScreen('units')}
          className="inline-flex items-center gap-2 font-mono text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft className="w-4 h-4" />
          选择单元
        </button>
      </div>

      {/* 进度条 */}
      <div style={{ height: '3px', backgroundColor: 'var(--border)', borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: 'var(--fg)', transition: 'width 0.3s ease', width: `${activeProgress}%` }} />
      </div>

      {/* 上一题/下一题导航 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => {
            if (phraseIdx > 0) {
              const prevIdx = phraseIdx - 1
              setPhraseIdx(prevIdx)
              setInput('')
              setCursorPos(0)
              setStatus(null)
              setAttempts(0)
              // 如果之前答对了，直接显示答案
              setShowAnswer(answeredCorrectly.has(prevIdx))
            }
          }}
          disabled={phraseIdx === 0}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            color: phraseIdx === 0 ? 'var(--border)' : 'var(--muted)',
            border: '1px solid var(--border)',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            cursor: phraseIdx === 0 ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
          }}
        >
          ← 上一题
        </button>
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
          {phraseIdx + 1} / {activeTotal}
        </span>
        <button
          onClick={() => {
            if (phraseIdx < activeTotal - 1 && answeredCorrectly.has(phraseIdx)) {
              const nextIdx = phraseIdx + 1
              setPhraseIdx(nextIdx)
              setInput('')
              setCursorPos(0)
              setStatus(null)
              setAttempts(0)
              // 如果之前答对了，直接显示答案
              setShowAnswer(answeredCorrectly.has(nextIdx))
            }
          }}
          disabled={phraseIdx >= activeTotal - 1 || !answeredCorrectly.has(phraseIdx)}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            color: (phraseIdx >= activeTotal - 1 || !answeredCorrectly.has(phraseIdx)) ? 'var(--border)' : 'var(--muted)',
            border: '1px solid var(--border)',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            cursor: (phraseIdx >= activeTotal - 1 || !answeredCorrectly.has(phraseIdx)) ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
          }}
        >
          下一题 →
        </button>
      </div>

      {/* 题目区域 */}
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '24px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        {/* 中文提示 */}
        <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--fg)', marginBottom: '20px', lineHeight: 1.6 }}>
          {phrase?.zh}
        </div>

        {/* 播放按钮 */}
        <button
          onClick={() => {
            speak(activeSpeechText)
            setTimeout(() => inputRef.current?.focus(), 150)
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: speaking ? 'var(--fg)' : 'none',
            color: speaking ? 'var(--bg)' : 'var(--fg)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Volume2 className="w-4 h-4" />
          {speaking ? '播放中...' : '播放发音'}
        </button>
      </div>

      {/* 单词下划线输入区域 */}
      <div style={{ marginBottom: '16px' }}>
        {/* 隐藏的真实输入框 */}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            // 过滤非 ASCII 字符（防止中文输入法残留）
            const filtered = e.target.value.replace(/[^\x00-\x7F]/g, '')
            setInput(filtered)
            // 使用浏览器原生光标位置
            setCursorPos(e.target.selectionStart ?? filtered.length)
            if (status === 'wrong' || status === 'close') setStatus(null)
            if (showAnswer) setShowAnswer(false)
          }}
          onCompositionStart={() => { compositionRef.current = true }}
          onCompositionEnd={() => {
            compositionRef.current = false
            // compositionEnd 后立即清理可能残留的非 ASCII 字符
            setInput(prev => prev.replace(/[^\x00-\x7F]/g, ''))
          }}
          onKeyDown={handleKeyDown}
          onSelect={(e) => {
            const pos = e.target.selectionStart
            if (pos !== null && pos !== undefined) setCursorPos(pos)
          }}
          placeholder=""
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="latin"
          lang="en"
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
        />
        {/* 下划线展示区 */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            padding: '16px 12px',
            border: `2px solid ${showAnswer ? '#38a169' : status === 'correct' ? '#38a169' : status === 'close' ? '#d69e2e' : status === 'wrong' ? '#e53e3e' : 'var(--border)'}`,
            borderRadius: '4px',
            minHeight: '56px',
            alignItems: 'center',
            cursor: 'text',
            transition: 'border-color 0.2s',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            letterSpacing: '0.05em',
          }}
        >
          {/* 清空按钮 */}
          {input && !showAnswer && status !== 'correct' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setInput('')
                setCursorPos(0)
                setStatus(null)
                setAttempts(0)
                inputRef.current?.focus()
              }}
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'var(--muted)',
                padding: '2px 8px',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                transition: 'all 0.15s',
              }}
              title="清空输入"
            >
              清空
            </button>
          )}
          {showAnswer
            ? phrase.en.replace(/[.,!?;:]+$/, '').split(/\s+/).map((word, wi) => (
                <span key={wi} style={{
                  borderBottom: '2px solid #38a169',
                  padding: '2px 4px',
                  color: '#38a169',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>{word}</span>
              ))
            : (() => {
                // 保留单词内撇号（it's/I'm等），只去句末标点和其他标点
                const answerWords = phrase.en.replace(/[.,!?;:]+$/, '').split(/\s+/)
                // 用于对比的标准化：保留撇号，只去掉其他标点和首尾标点
                const stripForCompare = (w) => w.toLowerCase().replace(/^[.,!?;:"()\-–—]+|[.,!?;:"()\-–—]+$/g, '')

                // 构建输入单词
                const inputWords = input.trim().split(/\s+/).filter(Boolean)
                // 是否正在输入新单词（输入以空格结尾）
                const trailingSpace = input.endsWith(' ') || input.endsWith('  ')

                // 计算光标在哪个单词的哪个位置
                const isActive = !showAnswer && status !== 'correct'
                let cursorWordIdx = -1
                let cursorCharPos = -1
                if (isActive) {
                  let charCount = 0
                  for (let i = 0; i < inputWords.length; i++) {
                    if (cursorPos <= charCount + inputWords[i].length) {
                      cursorWordIdx = i
                      cursorCharPos = cursorPos - charCount
                      break
                    }
                    charCount += inputWords[i].length + 1
                  }
                  if (cursorWordIdx === -1) {
                    cursorWordIdx = trailingSpace ? inputWords.length : inputWords.length - 1
                    cursorCharPos = trailingSpace ? 0 : (inputWords[cursorWordIdx] || '').length
                  }
                  if (cursorWordIdx < 0) { cursorWordIdx = 0; cursorCharPos = 0 }
                }

                return answerWords.map((answerWord, wi) => {
                  const typed = inputWords[wi] || ''
                  const isCorrect = stripForCompare(typed) === stripForCompare(answerWord)
                  const isPartial = typed.length > 0 && !isCorrect
                  const hasCursor = isActive && wi === cursorWordIdx
                  const cPos = hasCursor ? cursorCharPos : -1

                  return (
                    <span key={wi} style={{
                      borderBottom: `2px solid ${isCorrect ? '#38a169' : isPartial ? '#d69e2e' : 'var(--border)'}`,
                      padding: '2px 4px',
                      minWidth: `${answerWord.length * 0.6 + 0.8}em`,
                      textAlign: 'center',
                      color: isCorrect ? '#38a169' : isPartial ? '#d69e2e' : 'transparent',
                      fontWeight: isCorrect ? 600 : 400,
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s, border-color 0.15s',
                      position: 'relative',
                      display: 'inline-block',
                    }}>
                      {typed ? typed.split('').map((ch, ci) => (
                        <span key={ci} style={{ position: 'relative' }}>
                          {cPos === ci && (
                            <span style={{
                              position: 'absolute',
                              left: '-1px',
                              top: '5%',
                              bottom: '5%',
                              width: '2px',
                              backgroundColor: 'var(--fg)',
                              animation: 'cursor-blink 1s step-end infinite',
                            }} />
                          )}
                          {ch}
                        </span>
                      )) : (hasCursor && cPos === 0 && (
                        <span style={{
                          position: 'absolute',
                          left: '50%',
                          top: '5%',
                          bottom: '5%',
                          width: '2px',
                          backgroundColor: 'var(--fg)',
                          animation: 'cursor-blink 1s step-end infinite',
                          transform: 'translateX(-50%)',
                        }} />
                      ))}
                      {typed && cPos === typed.length && (
                        <span style={{
                          position: 'absolute',
                          right: '-1px',
                          top: '5%',
                          bottom: '5%',
                          width: '2px',
                          backgroundColor: 'var(--fg)',
                          animation: 'cursor-blink 1s step-end infinite',
                        }} />
                      )}
                      {typed ? '' : '\u00A0'}
                    </span>
                  )
                })
              })()
          }
        </div>
        {showAnswer && (
          <div style={{
            textAlign: 'center',
            marginTop: '8px',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: 'var(--muted)',
          }}>
            {phrase.zh}
          </div>
        )}
      </div>

      {/* 反馈信息 */}
      <AnimatePresence mode="wait">
        {status === 'correct' && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: 'rgba(56, 161, 105, 0.1)',
              border: '1px solid #38a169',
              borderRadius: '4px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#38a169',
            }}
          >
            <Check className="w-4 h-4" />
            正确！
          </motion.div>
        )}
        {status === 'close' && (
          <motion.div
            key="close"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(214, 158, 46, 0.1)',
              border: '1px solid #d69e2e',
              borderRadius: '4px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#d69e2e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              很接近了！再试试
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              你的输入: <span style={{ color: 'var(--fg)' }}>{input}</span>
            </div>
          </motion.div>
        )}
        {status === 'wrong' && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(229, 62, 62, 0.1)',
              border: '1px solid #e53e3e',
              borderRadius: '4px',
              marginBottom: '16px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#e53e3e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <X className="w-4 h-4" />
              不太对
              {attempts >= 2 && <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>（已尝试 {attempts} 次）</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              你的输入: <span style={{ color: 'var(--fg)' }}>{input}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {showAnswer ? (
          <button
            onClick={handleNextAfterAnswer}
            style={{
              flex: 1,
              padding: '10px',
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              fontFamily: 'monospace',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            下一句 →
          </button>
        ) : status === 'correct' ? (
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: '10px',
              background: '#38a169',
              color: '#fff',
              border: 'none',
              fontFamily: 'monospace',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            下一句 →
          </button>
        ) : (
          <>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              style={{
                flex: 1,
                padding: '10px',
                background: input.trim() ? 'var(--fg)' : 'var(--border)',
                color: input.trim() ? 'var(--bg)' : 'var(--muted)',
                border: 'none',
                fontFamily: 'monospace',
                fontWeight: 600,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              确认 (Enter)
            </button>
            {status && (
              <button
                onClick={() => { setInput(''); setStatus(null) }}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                }}
              >
                重试
              </button>
            )}
          </>
        )}
        {!showAnswer && status !== 'correct' && (
          <button
            onClick={status ? handleShowAnswer : handleSkip}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              fontFamily: 'monospace',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title={status ? '看答案' : '跳过'}
          >
            <SkipForward className="w-4 h-4" />
            {status ? '看答案' : '跳过'}
          </button>
        )}
      </div>

      {/* 得分 */}
      <div style={{
        marginTop: '20px',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        color: 'var(--muted)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>正确: {score} / {phraseIdx + (status === 'correct' ? 1 : 0)}</span>
        <span>Enter 提交</span>
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  )
}
