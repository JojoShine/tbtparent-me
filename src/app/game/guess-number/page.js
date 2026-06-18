'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react'

const LEVELS = [
  { digits: 4, name_zh: '4位数', name_en: '4 Digits' },
  { digits: 5, name_zh: '5位数', name_en: '5 Digits' },
  { digits: 6, name_zh: '6位数', name_en: '6 Digits' },
]

// 生成无重复数字的随机数
function generateSecretNumber(digits) {
  const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  // 打乱数组
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[nums[i], nums[j]] = [nums[j], nums[i]]
  }
  return nums.slice(0, digits).join('')
}

// 计算 xAyB
function calculateFeedback(guess, secret) {
  let bulls = 0 // A: 位置和数字都正确
  let cows = 0  // B: 数字正确但位置错误
  
  // 先计算 A (位置和数字都正确)
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) {
      bulls++
    }
  }
  
  // 再计算 B (数字正确但位置错误)
  // 统计每个数字在 secret 和 guess 中出现的次数
  const secretCount = {}
  const guessCount = {}
  
  for (let i = 0; i < secret.length; i++) {
    secretCount[secret[i]] = (secretCount[secret[i]] || 0) + 1
    guessCount[guess[i]] = (guessCount[guess[i]] || 0) + 1
  }
  
  // 计算共同数字的总数（包括位置正确的）
  let commonDigits = 0
  for (const digit in secretCount) {
    if (guessCount[digit]) {
      commonDigits += Math.min(secretCount[digit], guessCount[digit])
    }
  }
  
  // B = 共同数字总数 - A的数量
  cows = commonDigits - bulls
  
  return `${bulls}A${cows}B`
}

export default function GuessNumberPage() {
  const { lang } = useLang()
  const [level, setLevel] = useState(0)
  const [secretNumber, setSecretNumber] = useState('')
  const [userInput, setUserInput] = useState('')
  const [guessHistory, setGuessHistory] = useState([])
  const [gameStatus, setGameStatus] = useState('playing') // playing, won
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [dailyLimit, setDailyLimit] = useState({ date: '', counts: {} }) // 每日限制
  const DAILY_MAX = 1
  const digits = LEVELS[level].digits

  // 计时器
  useEffect(() => {
    if (!isRunning || gameStatus === 'won') return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning, gameStatus])

  // 初始化游戏
  useEffect(() => {
    // 加载每日限制
    try {
      const raw = localStorage.getItem('guess-number-daily')
      if (raw) {
        const parsed = JSON.parse(raw)
        const today = new Date().toISOString().split('T')[0]
        if (parsed.date === today) {
          setDailyLimit(parsed)
        }
      }
    } catch (e) {}
    startNewGame(0)
  }, [])

  // 开始新游戏
  const startNewGame = (lvl) => {
    const targetLevel = lvl !== undefined ? lvl : level
    const d = LEVELS[targetLevel].digits
    const today = new Date().toISOString().split('T')[0]
    const counts = dailyLimit.date === today ? dailyLimit.counts : {}
    const usedToday = counts[d] || 0
    if (usedToday >= DAILY_MAX) return
    const newSecret = generateSecretNumber(d)
    setLevel(targetLevel)
    setSecretNumber(newSecret)
    setUserInput('')
    setGuessHistory([])
    setGameStatus('playing')
    setTimer(0)
    setIsRunning(true)
  }

  // 处理提交
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (userInput.length !== digits) {
      return
    }

    // 检查是否有重复数字
    if (new Set(userInput.split('')).size !== digits) {
      return
    }

    // 检查是否已猜过
    if (guessHistory.some(h => h.guess === userInput)) {
      alert(lang === 'zh' ? '这个数字已经猜过了！' : 'Already guessed this number!')
      return
    }

    const feedback = calculateFeedback(userInput, secretNumber)
    const newHistory = [...guessHistory, { guess: userInput, feedback }]
    setGuessHistory(newHistory)

    // 检查是否猜中
    if (feedback === `${digits}A0B`) {
      setGameStatus('won')
      setIsRunning(false)
      // 增加每日计数
      const today = new Date().toISOString().split('T')[0]
      setDailyLimit(prev => {
        const counts = prev.date === today ? { ...prev.counts } : {}
        counts[digits] = (counts[digits] || 0) + 1
        const updated = { date: today, counts }
        localStorage.setItem('guess-number-daily', JSON.stringify(updated))
        return updated
      })
    }

    setUserInput('')
  }

  // 格式化时间
  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div
      className="max-w-3xl"
      style={{ margin: '0 auto', minHeight: '100vh', padding: '0 16px 32px' }}
    >
      {/* 头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/game"
          className="inline-flex items-center gap-2 font-mono text-sm relative hover:opacity-70 transition-opacity social-link"
          style={{ color: 'var(--muted)', marginBottom: '24px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'zh' ? '返回游戏' : 'Back'}
          <span className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline" style={{ backgroundColor: 'var(--muted)' }} />
        </Link>

        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
          {lang === 'zh' ? '猜数字' : 'Guess Number'}
        </h1>
        <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          {gameStatus === 'won'
            ? (lang === 'zh' ? `恭喜！用时 ${formatTime(timer)}` : `Done in ${formatTime(timer)}`)
            : (lang === 'zh' ? '猜出系统生成的无重复数字' : 'Guess the secret number')}
        </div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginTop: '4px' }}>
          {(() => {
            const today = new Date().toISOString().split('T')[0]
            const counts = dailyLimit.date === today ? dailyLimit.counts : {}
            const used = counts[digits] || 0
            return `${LEVELS[level].name_zh}: ${used}/${DAILY_MAX}`
          })()}
        </div>
      </div>

      {/* 关卡选择 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {LEVELS.map((lvl, idx) => (
          <button
            key={idx}
            onClick={() => startNewGame(idx)}
            className="font-mono text-xs"
            style={{
              padding: '6px 12px',
              border: '1px solid',
              borderColor: level === idx ? 'var(--fg)' : 'var(--border)',
              borderRadius: '3px',
              backgroundColor: level === idx ? 'var(--fg)' : 'transparent',
              color: level === idx ? 'var(--bg)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'none',
            }}
          >
            {lang === 'zh' ? lvl.name_zh : lvl.name_en}
          </button>
        ))}
      </div>

      {/* 计时器 */}
      <div className="font-mono text-sm" style={{ color: 'var(--muted)', marginBottom: '16px' }}>
        {formatTime(timer)}
      </div>

      {/* 操作提示 */}
      <div className="font-mono text-xs md:text-sm" style={{ color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.6 }}>
        {lang === 'zh' 
          ? `从 0-9 中选择${digits}个不重复数字，系统会反馈 xAyB（A=位置和数字都对，B=仅数字对但位置错，A优先于B）` 
          : `Select ${digits} unique digits from 0-9, system returns xAyB (A=correct position & digit, B=digit only but wrong position, A takes priority)`}
      </div>

      {/* 猜测历史 */}
      {guessHistory.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div className="font-mono text-sm font-bold" style={{ color: 'var(--fg)', marginBottom: '12px' }}>
            {lang === 'zh' ? '猜测记录' : 'Guess History'}
          </div>
          
          {guessHistory.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              marginBottom: '8px',
            }}>
              <div className="font-mono text-xs md:text-sm" style={{ color: 'var(--muted)' }}>
                #{index + 1}
              </div>
              <div className="font-mono text-base md:text-lg font-bold" style={{ color: 'var(--fg)', letterSpacing: '2px' }}>
                {item.guess}
              </div>
              <div className="font-mono text-xs md:text-sm font-bold" style={{ color: 'var(--fg)' }}>
                {item.feedback}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 胜利提示 */}
      {gameStatus === 'won' && (
        <div style={{
          padding: '20px',
          border: '1px solid var(--fg)',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          <div className="text-xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
            {lang === 'zh' ? '恭喜你猜对了！' : 'Congratulations!'}
          </div>
          <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
            {lang === 'zh' 
              ? `用了 ${guessHistory.length} 次猜中 "${secretNumber}"` 
              : `Guessed "${secretNumber}" in ${guessHistory.length} tries`}
          </div>
        </div>
      )}

      {/* 每日限额提示 */}
      {(() => {
        const today = new Date().toISOString().split('T')[0]
        const counts = dailyLimit.date === today ? dailyLimit.counts : {}
        const used = counts[digits] || 0
        if (used >= DAILY_MAX && gameStatus !== 'won') {
          return (
            <div style={{
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              <div className="font-mono text-sm" style={{ color: '#ef4444' }}>
                {lang === 'zh' ? `${LEVELS[level].name_zh} 今日已通关 ${DAILY_MAX} 关，请明天再来或切换其他难度` : `${LEVELS[level].name_zh} daily limit reached (${DAILY_MAX}/${DAILY_MAX})`}
              </div>
            </div>
          )
        }
        return null
      })()}

      {/* 输入区域 */}
      {gameStatus === 'playing' && (
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="mb-5">
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, digits)
                setUserInput(val)
              }}
              placeholder={lang === 'zh' ? `输入${digits}位无重复数字...` : `Enter ${digits} unique digits...`}
              maxLength={digits}
              className="font-mono text-lg"
              style={{
                width: '100%',
                maxWidth: '320px',
                margin: '0 auto',
                display: 'block',
                padding: '0',
                border: 'none',
                outline: 'none',
                textAlign: 'center',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                fontSize: '1.5rem',
                letterSpacing: '8px',
                fontFamily: 'monospace',
              }}
            />
            
            {/* 底部横线 */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginTop: '8px',
            }}>
              {Array.from({ length: digits }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '60px',
                    height: '2px',
                    backgroundColor: userInput[index] ? 'var(--fg)' : 'var(--border)',
                    transition: 'background-color 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={!userInput || userInput.length !== digits || new Set(userInput.split('')).size !== digits}
              className="inline-flex items-center gap-2 font-mono text-sm"
              style={{
                padding: '8px 16px',
                border: '1px solid var(--fg)',
                borderRadius: '3px',
                backgroundColor: 'var(--fg)',
                color: 'var(--bg)',
                cursor: !userInput || userInput.length !== digits || new Set(userInput.split('')).size !== digits ? 'not-allowed' : 'pointer',
                opacity: !userInput || userInput.length !== digits || new Set(userInput.split('')).size !== digits ? 0.5 : 1,
              }}
            >
              <CheckCircle className="w-4 h-4" />
              {lang === 'zh' ? '猜！' : 'Guess!'}
            </button>

            <button
              type="button"
              onClick={() => startNewGame(level)}
              className="inline-flex items-center gap-2 font-mono text-sm"
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                backgroundColor: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              {lang === 'zh' ? '重置' : 'Reset'}
            </button>
          </div>
        </form>
      )}

      {/* 游戏规则 */}
      <div className="mt-10 p-4 border rounded" style={{ borderColor: 'var(--border)' }}>
        <div className="font-mono text-sm font-bold" style={{ color: 'var(--fg)', marginBottom: '12px' }}>
          {lang === 'zh' ? '游戏规则' : 'How to Play'}
        </div>
        <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
          <li className="font-mono text-xs md:text-sm" style={{ color: 'var(--muted)', marginBottom: '6px', lineHeight: 1.5 }}>
            {lang === 'zh' ? `系统从 0-9 中生成${digits}位无重复数字（如 1928）` : `System generates ${digits}-digit number from 0-9 with no repeats (e.g., 1928)`}
          </li>
          <li className="font-mono text-xs md:text-sm" style={{ color: 'var(--muted)', marginBottom: '6px', lineHeight: 1.5 }}>
            {lang === 'zh' ? 'xA：x个数字的位置和数值都正确（优先判断）' : 'xA: x digits are correct in both position and value (checked first)'}
          </li>
          <li className="font-mono text-xs md:text-sm" style={{ color: 'var(--muted)', marginBottom: '6px', lineHeight: 1.5 }}>
            {lang === 'zh' ? 'yB：y个数字的数值正确但位置错误（排除A后统计）' : 'yB: y digits have correct value but wrong position (counted after excluding A)'}
          </li>
          <li className="font-mono text-xs md:text-sm" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
            {lang === 'zh' ? `目标：猜出 ${digits}A0B（全部正确）` : `Goal: Guess until you get ${digits}A0B (all correct)`}
          </li>
          <li className="font-mono text-xs md:text-sm" style={{ color: 'var(--muted)', marginTop: '6px', lineHeight: 1.5 }}>
            {lang === 'zh' ? `每个难度每天可玩 ${DAILY_MAX} 局` : `${DAILY_MAX} game/size/day`}
          </li>
        </ul>
      </div>

      <style jsx>{`
        .social-link:hover .social-link-underline {
          width: 100% !important;
        }
      `}</style>
    </div>
  )
}
