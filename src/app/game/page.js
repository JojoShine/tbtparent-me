'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { pinyin } from 'pinyin-pro'
import { ArrowLeft } from 'lucide-react'

import ALL_IDIOMS from '@/data/idioms.json'
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

  // 初始化游戏
  useEffect(() => {
    startNewGame()
    loadStats()
  }, [])

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
    
    // 从整个成语库中随机选择（不再分关卡）
    const availableIdioms = ALL_IDIOMS.filter(idiom => {
      // 过滤掉当前关卡已使用的成语
      const usedInLevel = usedIdioms[targetLevel] || []
      return !usedInLevel.includes(idiom)
    })
    
    // 如果所有成语都用过了，重置该关卡的使用记录
    if (availableIdioms.length === 0) {
      const newUsedIdioms = { ...usedIdioms }
      delete newUsedIdioms[targetLevel]
      setUsedIdioms(newUsedIdioms)
      
      // 重新从全部成语中随机选择
      const randomIdiom = ALL_IDIOMS[Math.floor(Math.random() * ALL_IDIOMS.length)]
      setTargetIdiom(randomIdiom)
      
      // 记录已使用
      setUsedIdioms({
        ...newUsedIdioms,
        [targetLevel]: [randomIdiom]
      })
    } else {
      // 从未使用的成语中随机选择
      const randomIdiom = availableIdioms[Math.floor(Math.random() * availableIdioms.length)]
      setTargetIdiom(randomIdiom)
      
      // 记录已使用
      setUsedIdioms({
        ...usedIdioms,
        [targetLevel]: [...(usedIdioms[targetLevel] || []), randomIdiom]
      })
    }
    
    setUserInput('')
    setGuessCount(0)
    setGameHistory([])
    setShowHint(false)
    setHintChar('')
    setGameStatus('playing')
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

  // 检查猜测结果
  const checkGuess = (guess) => {
    if (guess.length !== 4) return null

    const result = []
    const targetPinyins = getIdiomPinyins(targetIdiom)
    const guessPinyins = getIdiomPinyins(guess)

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
    
    // 逐个字母比较（按位置），取较短的长度
    const minLength = Math.min(clean1.length, clean2.length)
    const matches = {}
    let hasMatch = false
    let allMatch = true
    
    for (let i = 0; i < minLength; i++) {
      const char1 = clean1[i]
      const char2 = clean2[i]
      const isMatch = char1 === char2
      matches[char1] = isMatch
      if (isMatch) hasMatch = true
      if (!isMatch) allMatch = false
    }
    
    // 如果长度不同，不可能全部匹配
    if (clean1.length !== clean2.length) allMatch = false
    
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
    } else if (guessCount + 1 >= 8) {
      setGameStatus('lost')
      const newStats = { 
        total: stats.total + 1,
        won: stats.won,
        totalGuesses: stats.totalGuesses + 8
      }
      saveStats(newStats)
    }

    setUserInput('')
  }

  // 下一关
  const nextLevel = () => {
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
          href="/" 
          className="inline-flex items-center gap-2 font-mono text-sm relative hover:opacity-70 transition-opacity social-link"
          style={{ color: 'var(--muted)', marginBottom: '30px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'zh' ? '返回首页' : 'Back to Home'}
          <span
            className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
            style={{ backgroundColor: 'var(--muted)' }}
          />
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
          {lang === 'zh' ? '成语闯关' : 'Idiom Quest'}
        </h1>
        
        <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          {lang === 'zh' ? `第 ${currentLevel + 1} 关 | 成语库 ${ALL_IDIOMS.length} 条` : `Level ${currentLevel + 1} | ${ALL_IDIOMS.length} idioms`}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4" style={{ marginBottom: '30px' }}>
        <div style={{
          padding: '16px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div className="text-2xl md:text-3xl font-mono font-bold" style={{ color: 'var(--fg)' }}>{stats.won}</div>
          <div className="text-xs md:text-sm font-mono" style={{ color: 'var(--muted)', marginTop: '4px' }}>
            {lang === 'zh' ? '获胜次数' : 'Wins'}
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div className="text-2xl md:text-3xl font-mono font-bold" style={{ color: 'var(--fg)' }}>{stats.totalGuesses}</div>
          <div className="text-xs md:text-sm font-mono" style={{ color: 'var(--muted)', marginTop: '4px' }}>
            {lang === 'zh' ? '猜题总次数' : 'Total Guesses'}
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <div className="text-2xl md:text-3xl font-mono font-bold" style={{ color: 'var(--fg)' }}>
            {stats.total > 0 ? (stats.totalGuesses / stats.total).toFixed(1) : '0'}
          </div>
          <div className="text-xs md:text-sm font-mono" style={{ color: 'var(--muted)', marginTop: '4px' }}>
            {lang === 'zh' ? '平均次数' : 'Avg Guesses'}
          </div>
        </div>
      </div>

      {/* 游戏主区域 */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '20px' }}>
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
              onClick={nextLevel}
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
              {lang === 'zh' ? '下一关' : 'Next Level'}
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
              onClick={restartLevel}
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
              {lang === 'zh' ? '重新挑战' : 'Try Again'}
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
                      <div
                        title={`${lang === 'zh' ? '目标' : 'Target'}: ${charData.targetPinyin}`}
                        className="font-mono text-lg font-bold"
                        style={{
                          textAlign: 'center',
                          padding: '10px 5px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          background: charData.status === 'correct' ? 'var(--fg)' : 'transparent',
                          color: charData.status === 'correct' ? 'var(--bg)' : 'var(--muted)',
                          borderColor: charData.status === 'correct' ? 'var(--fg)' : 'var(--border)',
                        }}
                      >
                        {charData.char}
                      </div>
                      {/* 拼音显示 - 放大，每个字母和声调分别用颜色标记 */}
                      <div className="font-mono" style={{
                        textAlign: 'center',
                        marginTop: '6px',
                        fontSize: '16px',
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
                                  const isLetterMatch = charData.letterMatches?.[baseLetter] || false
                                  
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
                                          fontSize: '1.0em',
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
                                  const isLetterMatch = charData.letterMatches?.[char] || false
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
          <form onSubmit={handleSubmit} style={{ padding: '0 16px' }}>
            <div style={{ marginBottom: '20px' }}>
              {/* 单个输入框 */}
              <input
                type="text"
                value={userInput}
                onChange={(e) => { setUserInput(e.target.value.trim()); setInlineMsg('') }}
                placeholder={lang === 'zh' ? '输入四字成语...' : 'Enter a 4-character idiom...'}
                maxLength={4}
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
                disabled={guessCount >= 8}
                className="font-mono text-sm flex-1 relative hover:opacity-70 transition-opacity social-link"
                style={{ 
                  color: guessCount >= 8 ? 'var(--muted)' : 'var(--fg)', 
                  border: '1px solid var(--fg)',
                  cursor: guessCount >= 8 ? 'not-allowed' : 'pointer',
                  opacity: guessCount >= 8 ? 0.5 : 1,
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {lang === 'zh' ? '猜！' : 'Guess!'}
                <span
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
                  style={{ backgroundColor: guessCount >= 8 ? 'var(--muted)' : 'var(--fg)' }}
                />
              </button>

              {!showHint && guessCount > 0 && (
                <button
                  type="button"
                  onClick={useHint}
                  className="font-mono text-sm px-6 relative hover:opacity-70 transition-opacity social-link"
                  style={{ 
                    color: 'var(--fg)', 
                    border: '1px solid var(--fg)',
                    height: '48px',
                    minWidth: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {lang === 'zh' ? '提示' : 'Hint'}
                  <span
                    className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
                    style={{ backgroundColor: 'var(--fg)' }}
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
            <li className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {lang === 'zh' ? '首次猜测后可使用提示' : 'Hint available after first guess'}
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
