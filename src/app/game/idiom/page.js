'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { pinyin } from 'pinyin-pro'
import { ArrowLeft } from 'lucide-react'

import COMMON_IDIOMS from '@/data/common-idioms.json'
import IDIOM_PINYIN_MAP from '@/data/idiom-pinyin.json'

export default function IdiomGamePage() {
  const { lang } = useLang()
  const [currentLevel, setCurrentLevel] = useState(0)
  const [targetIdiom, setTargetIdiom] = useState('')
  const [userInput, setUserInput] = useState('')
  const [guessCount, setGuessCount] = useState(0)
  const [gameHistory, setGameHistory] = useState([])
  const [showHint, setShowHint] = useState(false)
  const [hintChar, setHintChar] = useState('')
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost
  const [stats, setStats] = useState({ 
    total: 0,     // 总游戏数
    won: 0,       // 获胜次数
    totalGuesses: 0  // 猜题总次数
  })
  const [inlineMsg, setInlineMsg] = useState('') // 按钮下方提示信息
  const [usedIdioms, setUsedIdioms] = useState({}) // 记录每关已使用的成语
  const [isComposing, setIsComposing] = useState(false) // 跟踪输入法状态
  const [dailyLimit, setDailyLimit] = useState({ date: '', count: 0 }) // 每日限制
  const DAILY_MAX = 10
  const [countdown, setCountdown] = useState('')
  const [devModeClicks, setDevModeClicks] = useState(0) // 开发者模式点击计数
  const [isDevMode, setIsDevMode] = useState(false) // 开发者模式状态

  // 初始化游戏
  useEffect(() => {
    loadDailyLimit()
    loadStats()
    loadDevMode() // 加载开发者模式状态
    // 只有在未达到限额时才生成新题目
    const today = new Date().toISOString().split('T')[0]
    const raw = localStorage.getItem('idiom-game-stats-daily')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.date === today && parsed.count < DAILY_MAX) {
          startNewGame()
        }
      } catch (e) {
        startNewGame()
      }
    } else {
      startNewGame()
    }
  }, [])

  // 倒计时到第二天0点
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const usedToday = dailyLimit.date === today ? dailyLimit.count : 0
    if (usedToday < DAILY_MAX) return

    const tick = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      if (diff <= 0) { window.location.reload(); return }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setCountdown(`${h}:${m}:${s}`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [dailyLimit])

  // 加载每日限制
  const loadDailyLimit = () => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const raw = localStorage.getItem('idiom-game-stats-daily')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.date === today) {
          setDailyLimit(parsed)
          return
        }
      }
    } catch (e) {}
    const fresh = { date: today, count: 0 }
    localStorage.setItem('idiom-game-stats-daily', JSON.stringify(fresh))
    setDailyLimit(fresh)
  }

  // 加载开发者模式状态
  const loadDevMode = () => {
    try {
      const saved = localStorage.getItem('idiom-dev-mode')
      if (saved === 'true') {
        setIsDevMode(true)
      }
    } catch (e) {
      console.error('Failed to load dev mode:', e)
    }
  }

  // 增加今日答题数
  const incrementDaily = () => {
    const today = new Date().toISOString().split('T')[0]
    const newCount = (dailyLimit.date === today ? dailyLimit.count : 0) + 1
    const updated = { date: today, count: newCount }
    localStorage.setItem('idiom-game-stats-daily', JSON.stringify(updated))
    setDailyLimit(updated)
  }

  // 加载统计数据
  const loadStats = () => {
    const saved = localStorage.getItem('idiom-game-stats')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 确保数据结构兼容
        setStats({
          total: parsed.total || 0,
          won: parsed.won || 0,
          totalGuesses: parsed.totalGuesses || 0
        })
      } catch (e) {
        console.error('Failed to load stats:', e)
      }
    }
  }

  // 保存统计数据
  const saveStats = (newStats) => {
    localStorage.setItem('idiom-game-stats', JSON.stringify(newStats))
    setStats(newStats)
  }

  // 开始新游戏
  const startNewGame = (level) => {
    const targetLevel = level !== undefined ? level : currentLevel
    
    // 从常用成语库中随机选择，避免本关重复
    const usedInLevel = usedIdioms[targetLevel] || []
    const available = COMMON_IDIOMS.filter(idiom => !usedInLevel.includes(idiom))
    const pool = available.length > 0 ? available : COMMON_IDIOMS
    const randomIdiom = pool[Math.floor(Math.random() * pool.length)]
    
    setTargetIdiom(randomIdiom)
    setUsedIdioms({
      ...usedIdioms,
      [targetLevel]: [...(usedIdioms[targetLevel] || []), randomIdiom]
    })
    
    setUserInput('')
    setGuessCount(0)
    setGameHistory([])
    setShowHint(false)
    setHintChar('')
    setGameStatus('playing')
  }

  // 处理标题点击（开发者模式触发）
  const handleTitleClick = () => {
    if (isDevMode) return // 已解锁则不处理
    
    const newClicks = devModeClicks + 1
    setDevModeClicks(newClicks)
    
    if (newClicks >= 7) {
      setIsDevMode(true)
      localStorage.setItem('idiom-dev-mode', 'true') // 持久化保存
      setInlineMsg(lang === 'zh' ? '🎮 开发者模式已激活！无限答题' : '🎮 Developer mode activated! Unlimited questions')
      setTimeout(() => setInlineMsg(''), 3000)
    }
  }

  // 获取成语每个字的拼音（优先查预计算映射表，回退 pinyin-pro）
  const getIdiomPinyins = (idiom) => {
    // 先查预计算的成语级拼音映射
    if (IDIOM_PINYIN_MAP[idiom]) {
      return IDIOM_PINYIN_MAP[idiom]
    }
    // 回退：逐字用 pinyin-pro 转换
    return idiom.split('').map(char => pinyin(char, { toneType: 'symbol' }))
  }

  // 获取猜测的拼音（始终用 pinyin-pro 逐字生成，避免 JSON 数据损坏影响用户输入）
  const getGuessPinyins = (guess) => {
    return guess.split('').map(char => pinyin(char, { toneType: 'symbol' }))
  }

  // 检查猜测结果
  const checkGuess = (guess) => {
    if (guess.length !== 4) return null

    const result = []
    const targetPinyins = getIdiomPinyins(targetIdiom)
    const guessPinyins = getGuessPinyins(guess)

    for (let i = 0; i < 4; i++) {
      const targetChar = targetIdiom[i]
      const guessChar = guess[i]
      const targetPy = targetPinyins[i]
      const guessPy = guessPinyins[i]

      let status = 'wrong' // 错误
      let feedback = '' // 反馈信息
      let letterMatchesData = { matches: {}, hasMatch: false, allMatch: false } // 默认值
      
      if (guessChar === targetChar) {
        status = 'correct' // 正确
        feedback = lang === 'zh' ? '正确' : 'Correct'
        // 完全正确时，所有字母都匹配
        const cleanPy = guessPy.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
          const map = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 
                       'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                       'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                       'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                       'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                       'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' }
          return map[match] || match
        })
        letterMatchesData = {
          matches: Object.fromEntries(cleanPy.split('').map(c => [c, true])),
          hasMatch: true,
          allMatch: true
        }
      } else {
        // 检查声调和声母韵母（按位置比较）
        const toneMatch = checkToneMatch(guessPy, targetPy)
        const letterMatches = checkLetterMatches(guessPy, targetPy) // 返回每个字母的匹配情况
        letterMatchesData = letterMatches
        
        if (toneMatch && letterMatches.allMatch) {
          status = 'partial'
          feedback = lang === 'zh' ? '音调+拼音匹配' : 'Tone + Pinyin match'
        } else if (toneMatch) {
          status = 'partial'
          feedback = lang === 'zh' ? '音调正确' : 'Tone correct'
        } else if (letterMatches.hasMatch) {
          status = 'partial'
          feedback = lang === 'zh' ? '拼音部分匹配' : 'Pinyin partial match'
        } else {
          status = 'wrong'
          feedback = lang === 'zh' ? '不匹配' : 'No match'
        }
      }

      result.push({
        char: guessChar,
        pinyin: guessPy,
        status,
        feedback,
        targetPinyin: targetPy, // 保存目标拼音用于对比
        letterMatches: letterMatchesData.matches, // 保存每个字母的匹配情况
        toneMatch: checkToneMatch(guessPy, targetPy), // 保存声调是否匹配
      })
    }

    return result
  }

  // 检查是否有共同的字母
  const checkCommonLetters = (py1, py2) => {
    if (!py1 || !py2) return false
    
    // 移除声调符号进行比较
    const clean1 = py1.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
      const map = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 
                   'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                   'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                   'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                   'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                   'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' }
      return map[match] || match
    })
    
    const clean2 = py2.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
      const map = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 
                   'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                   'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                   'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                   'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                   'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' }
      return map[match] || match
    })

    // 检查是否有共同字符
    for (let char of clean1) {
      if (clean2.includes(char)) return true
    }
    
    return false
  }

  // 检查每个字母的匹配情况（按位置比较）
  const checkLetterMatches = (py1, py2) => {
    if (!py1 || !py2) return { matches: {}, hasMatch: false, allMatch: false }
    
    // 移除声调符号
    const clean1 = py1.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
      const map = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 
                   'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                   'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                   'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                   'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                   'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' }
      return map[match] || match
    })
    
    const clean2 = py2.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
      const map = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 
                   'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                   'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                   'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                   'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                   'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' }
      return map[match] || match
    })
    
    // 使用数组存储每个位置的匹配情况，避免同字母覆盖
    const minLength = Math.min(clean1.length, clean2.length)
    const positionMatches = []
    let hasMatch = false
    let allMatch = true
    
    for (let i = 0; i < minLength; i++) {
      const char1 = clean1[i]
      const char2 = clean2[i]
      const isMatch = char1 === char2
      positionMatches.push({ char: char1, isMatch, position: i })
      if (isMatch) hasMatch = true
      if (!isMatch) allMatch = false
    }
    
    // 如果长度不同，不可能全部匹配
    if (clean1.length !== clean2.length) allMatch = false
    
    // 构建 matches 对象：key 为 "char@position" 格式，确保唯一性
    const matches = {}
    positionMatches.forEach(item => {
      matches[`${item.char}@${item.position}`] = item.isMatch
    })
    
    return { matches, hasMatch, allMatch }
  }

  // 检查音调是否匹配
  const checkToneMatch = (py1, py2) => {
    if (!py1 || !py2) return false
    
    // 提取音调数字（1-4）
    const getTone = (py) => {
      const toneMap = {
        'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4,
        'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
        'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
        'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
        'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4,
        'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4,
      }
      
      for (let char of py) {
        if (toneMap[char]) return toneMap[char]
      }
      return 0 // 无声调
    }
    
    return getTone(py1) === getTone(py2) && getTone(py1) !== 0
  }

  // 处理提交
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (userInput.length !== 4) {
      setInlineMsg(lang === 'zh' ? '请输入四字成语' : 'Please enter a 4-character idiom')
      return
    }

    if (new Set(userInput.split('')).size === 1) {
      setInlineMsg(lang === 'zh' ? '四字一样的成语为无效输入，请重新输入' : 'Invalid input: all 4 characters are the same')
      return
    }

    if (guessCount >= 8) {
      return
    }

    // 检查是否已猜过
    if (gameHistory.some(h => h.guess === userInput)) {
      setInlineMsg(lang === 'zh' ? `“${userInput}”已经猜过了，请换一个` : `"${userInput}" already guessed, try another`)
      return
    }

    const result = checkGuess(userInput)
    setGameHistory([...gameHistory, { guess: userInput, result }])
    setGuessCount(guessCount + 1)

    // 首次猜测后可以提示
    if (guessCount === 0 && !showHint) {
      const chars = targetIdiom.split('')
      const randomChar = chars[Math.floor(Math.random() * chars.length)]
      setHintChar(randomChar)
    }

    // 检查是否猜中
    if (userInput === targetIdiom) {
      setGameStatus('won')
      const newStats = { 
        total: stats.total + 1,
        won: stats.won + 1,
        totalGuesses: stats.totalGuesses + (guessCount + 1)
      }
      saveStats(newStats)
      incrementDaily()
    } else if (guessCount + 1 >= 8) {
      setGameStatus('lost')
      const newStats = { 
        total: stats.total + 1,
        won: stats.won,
        totalGuesses: stats.totalGuesses + 8
      }
      saveStats(newStats)
      incrementDaily()
    }

    setUserInput('')
  }

  // 下一关
  const nextLevel = () => {
    if (!isDevMode) {
      const today = new Date().toISOString().split('T')[0]
      const usedToday = dailyLimit.date === today ? dailyLimit.count : 0
      if (usedToday >= DAILY_MAX) return
    }

    if (currentLevel < 9) {
      const newLevel = currentLevel + 1
      setCurrentLevel(newLevel)
      // 直接传入新的关卡数
      startNewGame(newLevel)
    } else {
      // 通关
      setInlineMsg(lang === 'zh' ? '恭喜通关！' : 'Congratulations! You cleared all levels!')
      setCurrentLevel(0)
      startNewGame(0)
    }
  }

  // 重新开始当前关卡
  const restartLevel = () => {
    startNewGame()
  }

  // 使用提示
  const useHint = () => {
    if (!showHint && guessCount > 0) {
      const chars = targetIdiom.split('')
      const randomChar = chars[Math.floor(Math.random() * chars.length)]
      setHintChar(randomChar)
      setShowHint(true)
    }
  }

  return (
    <motion.div
      className="max-w-3xl pb-8 md:pb-20"
      style={{ margin: '0 auto', minHeight: '100vh', paddingBottom: '60px' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 头部 */}
      <div style={{ marginBottom: '40px' }}>
        <Link 
          href="/game" 
          className="inline-flex items-center gap-2 font-mono text-sm relative hover:opacity-70 transition-opacity social-link"
          style={{ color: 'var(--muted)', marginBottom: '30px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'zh' ? '返回游戏中心' : 'Back to Games'}
          <span
            className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
            style={{ backgroundColor: 'var(--muted)' }}
          />
        </Link>
        
        <h1 
          className="text-3xl md:text-4xl font-mono font-bold" 
          style={{ color: 'var(--fg)', marginBottom: '8px', cursor: isDevMode ? 'default' : 'pointer' }}
          onClick={handleTitleClick}
          title={!isDevMode ? '' : 'Developer Mode Active'}
        >
          {lang === 'zh' ? '成语闯关' : 'Idiom Quest'}
          {isDevMode && (
            <span style={{ fontSize: '0.5em', marginLeft: '8px', opacity: 0.6 }}>
              [DEV]
            </span>
          )}
        </h1>
        
        <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginTop: '8px' }}>
          {isDevMode 
            ? (lang === 'zh' ? '∞ 无限模式' : '∞ Unlimited')
            : `${dailyLimit.count >= DAILY_MAX ? DAILY_MAX : dailyLimit.count + 1} / ${DAILY_MAX}`
          }
        </div>


      </div>

      {/* 游戏主区域 */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '20px' }}>
        {/* 超限提示条 */}
        {!isDevMode && dailyLimit.count >= DAILY_MAX && (
          <div style={{
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <div className="font-mono text-sm" style={{ color: '#ef4444', marginBottom: '8px' }}>
              {lang === 'zh' ? `今日已答 ${DAILY_MAX} 题，请明天再来` : `Done today (${DAILY_MAX}/${DAILY_MAX}), come back tomorrow`}
            </div>
            {countdown && (
              <div className="font-mono text-xl md:text-2xl font-bold" style={{ color: 'var(--fg)', letterSpacing: '4px' }}>
                {countdown}
              </div>
            )}
          </div>
        )}
        {/* 游戏状态 */}
        {gameStatus === 'won' && (
          <div style={{
            padding: '30px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <div className="text-xl md:text-2xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '10px' }}>
              {lang === 'zh' ? '恭喜你猜对了！' : 'Congratulations!'}
            </div>
            <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
              {lang === 'zh' 
                ? `用了 ${guessCount} 次猜中 "${targetIdiom}"` 
                : `Guessed "${targetIdiom}" in ${guessCount} tries`}
            </div>
            <button
              onClick={() => {
                if (!isDevMode) {
                  const today = new Date().toISOString().split('T')[0]
                  const usedToday = dailyLimit.date === today ? dailyLimit.count : 0
                  if (usedToday >= DAILY_MAX) {
                    window.location.href = '/game'
                    return
                  }
                }
                nextLevel()
              }}
              className="font-mono text-sm inline-block relative hover:opacity-70 transition-opacity social-link"
              style={{ 
                color: 'var(--fg)', 
                border: '1px solid var(--fg)',
                padding: '12px 32px',
                height: '48px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              {(() => {
                if (isDevMode) {
                  return lang === 'zh' ? '下一关' : 'Next Level'
                }
                const today = new Date().toISOString().split('T')[0]
                const usedToday = dailyLimit.date === today ? dailyLimit.count : 0
                if (usedToday >= DAILY_MAX) {
                  return lang === 'zh' ? '今日已达上限，返回游戏中心' : 'Daily limit reached, back to games'
                }
                return lang === 'zh' ? '下一关' : 'Next Level'
              })()}
              <span
                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
                style={{ backgroundColor: 'var(--fg)' }}
              />
            </button>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div style={{
            padding: '30px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <div className="text-xl md:text-2xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '10px' }}>
              {lang === 'zh' ? '挑战失败' : 'Game Over'}
            </div>
            <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
              {lang === 'zh' 
                ? `正确答案是：${targetIdiom}` 
                : `The answer was: ${targetIdiom}`}
            </div>
            <button
              onClick={() => {
                if (!isDevMode) {
                  const today = new Date().toISOString().split('T')[0]
                  const usedToday = dailyLimit.date === today ? dailyLimit.count : 0
                  if (usedToday >= DAILY_MAX) {
                    window.location.href = '/game'
                    return
                  }
                }
                restartLevel()
              }}
              className="font-mono text-sm inline-block relative hover:opacity-70 transition-opacity social-link"
              style={{ 
                color: 'var(--fg)', 
                border: '1px solid var(--fg)',
                padding: '12px 32px',
                height: '48px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              {(() => {
                if (isDevMode) {
                  return lang === 'zh' ? '重新挑战' : 'Try Again'
                }
                const today = new Date().toISOString().split('T')[0]
                const usedToday = dailyLimit.date === today ? dailyLimit.count : 0
                if (usedToday >= DAILY_MAX) {
                  return lang === 'zh' ? '今日已达上限，返回游戏中心' : 'Daily limit reached'
                }
                return lang === 'zh' ? '重新挑战' : 'Try Again'
              })()}
              <span
                className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
                style={{ backgroundColor: 'var(--fg)' }}
              />
            </button>
          </div>
        )}

        {/* 提示信息 */}
        {showHint && hintChar && gameStatus === 'playing' && (
          <div style={{
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
              {lang === 'zh' 
                ? `提示：成语中包含字「${hintChar}」` 
                : `Hint: The idiom contains the character "${hintChar}"`}
            </span>
          </div>
        )}

        {/* 猜测历史 */}
        {gameHistory.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div className="font-mono text-sm font-bold" style={{ color: 'var(--fg)', marginBottom: '15px' }}>
              {lang === 'zh' ? '猜测记录' : 'Guess History'}
            </div>
            
            {gameHistory.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
              }}>
                <div className="font-mono text-xs" style={{
                  minWidth: '30px',
                  color: 'var(--muted)',
                  paddingTop: '8px',
                }}>
                  #{index + 1}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                  {item.result.map((charData, charIndex) => (
                    <div key={charIndex} style={{ flex: 1 }}>
                      {/* 田字格外层容器 */}
                      <div style={{ 
                        position: 'relative',
                        width: '60px',
                        height: '60px',
                        margin: '0 auto',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        {/* 对角线虚线和横竖线 */}
                        <svg 
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%',
                            pointerEvents: 'none',
                          }}
                        >
                          {/* 横线 */}
                          <line 
                            x1="0" y1="50%" 
                            x2="100%" y2="50%" 
                            stroke="var(--border)" 
                            strokeWidth="1" 
                            strokeDasharray="4,4"
                          />
                          {/* 竖线 */}
                          <line 
                            x1="50%" y1="0" 
                            x2="50%" y2="100%" 
                            stroke="var(--border)" 
                            strokeWidth="1" 
                            strokeDasharray="4,4"
                          />
                          {/* 对角线 */}
                          <line 
                            x1="0" y1="0" 
                            x2="100%" y2="100%" 
                            stroke="var(--border)" 
                            strokeWidth="1" 
                            strokeDasharray="4,4"
                          />
                          <line 
                            x1="100%" y1="0" 
                            x2="0" y2="100%" 
                            stroke="var(--border)" 
                            strokeWidth="1" 
                            strokeDasharray="4,4"
                          />
                        </svg>
                        
                        {/* 汉字 */}
                        <div
                          title={`${lang === 'zh' ? '目标' : 'Target'}: ${charData.targetPinyin}`}
                          className="font-mono text-2xl font-bold"
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: charData.status === 'correct' ? 'var(--fg)' : 'transparent',
                            color: charData.status === 'correct' ? 'var(--bg)' : 'var(--muted)',
                            fontFamily: "'STKaiti', 'KaiTi', '楷体', serif",
                          }}
                        >
                          {charData.char}
                        </div>
                      </div>
                      
                      {/* 拼音显示 - 在田字格下方 */}
                      <div className="font-mono" style={{
                        textAlign: 'center',
                        marginTop: '8px',
                        fontSize: '15px',
                        fontWeight: 'bold',
                      }}>
                        {(() => {
                          const pinyin = charData.pinyin
                          const targetPinyin = charData.targetPinyin
                          
                          // 如果完全正确，全部显示绿色
                          if (charData.status === 'correct') {
                            return (
                              <>
                                {pinyin.split('').map((char, idx) => (
                                  <span key={idx} style={{ color: '#22c55e' }}>
                                    {char}
                                  </span>
                                ))}
                              </>
                            )
                          }
                          
                          // 去除声调符号，获取纯字母
                          const cleanPinyin = pinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
                            const map = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 
                                         'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                                         'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                                         'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                                         'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                                         'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' }
                            return map[match] || match
                          })
                          const cleanTarget = targetPinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
                            const map = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 
                                         'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                                         'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                                         'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                                         'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                                         'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v' }
                            return map[match] || match
                          })
                          
                          // 使用保存的声调匹配结果
                          const isToneCorrect = charData.toneMatch === true
                          
                          // 将带声调字符拆分为基础字母 + 声调类型
                          const splitToneChar = (char) => {
                            const toneMap = { 
                              'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
                              'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
                              'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
                              'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
                              'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
                              'ǖ': ['v', 1], 'ǘ': ['v', 2], 'ǚ': ['v', 3], 'ǜ': ['v', 4]
                            }
                            return toneMap[char] || [char, null]
                          }
                          
                          // 获取声调符号的文本表示
                          const getToneMarkText = (toneNumber) => {
                            const marks = {
                              1: '¯',  // 一声
                              2: '´',  // 二声
                              3: 'ˇ',  // 三声
                              4: '`',  // 四声
                            }
                            return marks[toneNumber] || ''
                          }
                          
                          // 逐个字符渲染，判断每个字母是否按位置匹配
                          return (
                            <>
                              {pinyin.split('').map((char, idx) => {
                                // 判断是否是声调字符
                                const isToneChar = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(char)
                                
                                if (isToneChar) {
                                  // 带声调的字符：拆分为基础字母 + 声调类型
                                  const [baseLetter, toneNumber] = splitToneChar(char)
                                  const isLetterMatch = charData.letterMatches?.[`${baseLetter}@${idx}`] || false
                                  
                                  // 基础字母颜色：根据字母匹配情况
                                  const letterColor = isLetterMatch ? '#22c55e' : 'var(--fg)'
                                  
                                  // 声调符号颜色：根据声调匹配情况
                                  const toneColor = isToneCorrect ? '#22c55e' : '#f97316'
                                  
                                  // 获取声调符号文本
                                  const toneMarkText = getToneMarkText(toneNumber)
                                  
                                  return (
                                    <span key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                                      {/* 基础字母 */}
                                      <span style={{ color: letterColor }}>{baseLetter}</span>
                                      {/* 声调符号 */}
                                      {toneMarkText && (
                                        <span style={{ 
                                          color: toneColor,
                                          position: 'absolute',
                                          left: '50%',
                                          transform: 'translateX(-50%)',
                                          top: '-0.25em',
                                          fontSize: '1.3em',
                                          lineHeight: 1,
                                          fontWeight: 'bold',
                                        }}>
                                          {toneMarkText}
                                        </span>
                                      )}
                                    </span>
                                  )
                                } else {
                                  // 普通字母字符：根据字母匹配情况显示颜色
                                  const isLetterMatch = charData.letterMatches?.[`${char}@${idx}`] || false
                                  const letterColor = isLetterMatch ? '#22c55e' : 'var(--fg)'
                                  
                                  return (
                                    <span key={idx} style={{ color: letterColor }}>
                                      {char}
                                    </span>
                                  )
                                }
                              })}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 输入区域 */}
        {gameStatus === 'playing' && (
          <form onSubmit={handleSubmit} style={{ padding: '32px 16px 0 16px' }}>
            <div style={{ marginBottom: '20px' }}>
              {/* 单个输入框 */}
              <input
                type="text"
                value={userInput}
                onChange={(e) => { setUserInput(e.target.value.trim()); setInlineMsg('') }}
                placeholder={(!isDevMode && dailyLimit.count >= DAILY_MAX) ? (lang === 'zh' ? '今日已达上限，请明天再来' : 'Daily limit reached') : (gameHistory.length === 0 ? (lang === 'zh' ? '请先输入一个四字成语...' : 'Please enter a 4-character idiom...') : (lang === 'zh' ? '输入四字成语...' : 'Enter a 4-character idiom...'))}
                maxLength={4}
                disabled={!isDevMode && dailyLimit.count >= DAILY_MAX}
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
              
              {/* 底部四条横线，表示四个字的位置 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginTop: '8px',
              }}>
                {[0, 1, 2, 3].map((index) => (
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
              
              <div className="font-mono text-xs" style={{
                marginTop: '8px',
                color: 'var(--muted)',
                textAlign: 'center',
              }}>
                {lang === 'zh' 
                  ? `剩余次数：${8 - guessCount} / 8` 
                  : `Remaining attempts: ${8 - guessCount} / 8`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={guessCount >= 8 || (!isDevMode && dailyLimit.count >= DAILY_MAX)}
                className="font-mono text-sm flex-1 relative hover:opacity-70 transition-opacity social-link"
                style={{ 
                  color: (guessCount >= 8 || (!isDevMode && dailyLimit.count >= DAILY_MAX)) ? 'var(--muted)' : 'var(--fg)', 
                  border: '1px solid var(--fg)',
                  cursor: (guessCount >= 8 || (!isDevMode && dailyLimit.count >= DAILY_MAX)) ? 'not-allowed' : 'pointer',
                  opacity: (guessCount >= 8 || (!isDevMode && dailyLimit.count >= DAILY_MAX)) ? 0.5 : 1,
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {lang === 'zh' ? '猜！' : 'Guess!'}
                <span
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
                  style={{ backgroundColor: (guessCount >= 8 || (!isDevMode && dailyLimit.count >= DAILY_MAX)) ? 'var(--muted)' : 'var(--fg)' }}
                />
              </button>

              {!showHint && guessCount > 0 && (
                <button
                  type="button"
                  onClick={useHint}
                  disabled={!isDevMode && dailyLimit.count >= DAILY_MAX}
                  className="font-mono text-sm px-6 relative hover:opacity-70 transition-opacity social-link"
                  style={{ 
                    color: (!isDevMode && dailyLimit.count >= DAILY_MAX) ? 'var(--muted)' : 'var(--fg)', 
                    border: '1px solid var(--fg)',
                    height: '48px',
                    minWidth: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (!isDevMode && dailyLimit.count >= DAILY_MAX) ? 'not-allowed' : 'pointer',
                    opacity: (!isDevMode && dailyLimit.count >= DAILY_MAX) ? 0.5 : 1,
                  }}
                >
                  {lang === 'zh' ? '提示' : 'Hint'}
                  <span
                    className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
                    style={{ backgroundColor: (!isDevMode && dailyLimit.count >= DAILY_MAX) ? 'var(--muted)' : 'var(--fg)' }}
                  />
                </button>
              )}
            </div>

            {/* 按钮下方提示 */}
            {inlineMsg && (
              <div className="font-mono text-xs" style={{
                textAlign: 'center',
                color: 'var(--muted)',
                marginTop: '12px',
                opacity: 0.8,
              }}>
                {inlineMsg}
              </div>
            )}
          </form>
        )}

        {/* 游戏规则 */}
        <div style={{
          marginTop: '30px',
          padding: '16px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}>
          <div className="font-mono text-sm font-bold" style={{ color: 'var(--fg)', marginBottom: '12px' }}>
            {lang === 'zh' ? '游戏规则' : 'How to Play'}
          </div>
          <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
            <li className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '6px' }}>
              {lang === 'zh' ? '输入四字成语，最多猜8次' : 'Enter a 4-character idiom, max 8 guesses'}
            </li>
            <li className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '6px' }}>
              {lang === 'zh' ? '绿色拼音字母：该位置字母正确' : 'Green letter: correct at this position'}
            </li>
            <li className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '6px' }}>
              {lang === 'zh' ? '声调绿色：声调正确；声调橙色：声调错误' : 'Green tone: correct; Orange tone: wrong'}
            </li>
            <li className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '6px' }}>
              {lang === 'zh' ? '首次猜测后可使用提示' : 'Hint available after first guess'}
            </li>
            <li className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {lang === 'zh' ? `每天可答 ${DAILY_MAX} 题` : `${DAILY_MAX} questions/day`}
            </li>
          </ul>
        </div>
      </div>



      <style jsx>{`
        .social-link:hover .social-link-underline {
          width: 100% !important;
        }

      `}</style>
    </motion.div>
  )
}
