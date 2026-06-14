'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import { pinyin } from 'pinyin-pro'

// 丰富的成语库（按难度分级）
const IDIOM_DATABASE = [
  // 第1关 - 简单
  ['画蛇添足', '守株待兔', '亡羊补牢', '掩耳盗铃', '刻舟求剑'],
  // 第2关
  ['井底之蛙', '狐假虎威', '叶公好龙', '杯弓蛇影', '对牛弹琴'],
  // 第3关
  ['拔苗助长', '郑人买履', '滥竽充数', '自相矛盾', '愚公移山'],
  // 第4关
  ['望梅止渴', '纸上谈兵', '指鹿为马', '草木皆兵', '风声鹤唳'],
  // 第5关 - 中等
  ['破釜沉舟', '卧薪尝胆', '负荆请罪', '完璧归赵', '四面楚歌'],
  // 第6关
  ['三顾茅庐', '草船借箭', '望洋兴叹', '塞翁失马', '黔驴技穷'],
  // 第7关
  ['精卫填海', '夸父追日', '女娲补天', '后羿射日', '嫦娥奔月'],
  // 第8关 - 困难
  ['高山流水', '阳春白雪', '下里巴人', '曲高和寡', '知音难觅'],
  // 第9关
  ['悬梁刺股', '凿壁偷光', '囊萤映雪', '程门立雪', '闻鸡起舞'],
  // 第10关 - 专家
  ['韬光养晦', '厚积薄发', '未雨绸缪', '居安思危', '防微杜渐'],
]

export default function IdiomGame() {
  const { lang } = useLang()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [targetIdiom, setTargetIdiom] = useState('')
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState('playing')
  const [hintUsed, setHintUsed] = useState(false)
  const [hintChar, setHintChar] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [stats, setStats] = useState({ totalGames: 0, wins: 0 })

  // 初始化关卡
  useEffect(() => {
    startNewLevel()
    loadStats()
  }, [currentLevel])

  const loadStats = () => {
    const saved = localStorage.getItem('idiom-game-stats')
    if (saved) {
      setStats(JSON.parse(saved))
    }
  }

  const saveStats = (newStats) => {
    localStorage.setItem('idiom-game-stats', JSON.stringify(newStats))
    setStats(newStats)
  }

  const startNewLevel = () => {
    const levelIndex = currentLevel - 1
    if (levelIndex >= IDIOM_DATABASE.length) {
      setGameStatus('completed')
      return
    }
    
    const idioms = IDIOM_DATABASE[levelIndex]
    const randomIdiom = idioms[Math.floor(Math.random() * idioms.length)]
    setTargetIdiom(randomIdiom)
    setGuesses([])
    setCurrentGuess('')
    setGameStatus('playing')
    setHintUsed(false)
    setHintChar('')
    setShowHint(false)
  }

  // 获取字符的拼音信息
  const getPinyinInfo = (char) => {
    const result = pinyin(char, { 
      toneType: 'num',
      type: 'array' 
    })
    return result[0] || ''
  }

  // 解析拼音，分离声母、韵母和声调
  const parsePinyin = (pinyinStr) => {
    // 例如: "hua4" -> { initial: 'h', final: 'ua', tone: 4 }
    const toneMatch = pinyinStr.match(/(\d)$/)
    const tone = toneMatch ? parseInt(toneMatch[1]) : 0
    const basePinyin = pinyinStr.replace(/\d$/, '')
    
    // 简化的声母韵母分离（实际需要更复杂的逻辑）
    const initials = ['b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s','y','w']
    let initial = ''
    let final_part = basePinyin
    
    for (const ini of initials) {
      if (basePinyin.startsWith(ini)) {
        initial = ini
        final_part = basePinyin.substring(ini.length)
        break
      }
    }
    
    return { initial, final: final_part, tone, full: basePinyin }
  }

  // 检查猜测结果
  const checkGuess = (guess) => {
    const result = []
    const targetChars = targetIdiom.split('')
    const guessChars = guess.split('')

    for (let i = 0; i < 4; i++) {
      const targetPinyin = getPinyinInfo(targetChars[i])
      const guessPinyin = getPinyinInfo(guessChars[i])
      
      const targetParsed = parsePinyin(targetPinyin)
      const guessParsed = parsePinyin(guessPinyin)

      let status = 'wrong'
      
      // 完全匹配
      if (guessChars[i] === targetChars[i]) {
        status = 'correct'
      } 
      // 声调正确
      else if (targetParsed.tone === guessParsed.tone && targetParsed.tone !== 0) {
        status = 'tone-correct'
      }
      // 声母或韵母部分匹配
      else if (guessParsed.initial && targetParsed.initial && 
               (guessParsed.initial === targetParsed.initial || 
                guessParsed.final === targetParsed.final)) {
        status = 'partial'
      }

      result.push({
        char: guessChars[i],
        status,
        pinyin: guessPinyin,
      })
    }

    return result
  }

  // 提交猜测
  const submitGuess = () => {
    if (currentGuess.length !== 4) {
      alert(lang === 'zh' ? '请输入四字成语' : 'Please enter a four-character idiom')
      return
    }

    if (guesses.length >= 8) {
      return
    }

    const result = checkGuess(currentGuess)
    const newGuesses = [...guesses, { guess: currentGuess, result }]
    setGuesses(newGuesses)

    // 检查是否获胜
    if (currentGuess === targetIdiom) {
      setGameStatus('won')
      const newStats = { 
        totalGames: stats.totalGames + 1, 
        wins: stats.wins + 1 
      }
      saveStats(newStats)
      
      setTimeout(() => {
        if (window.confirm(lang === 'zh' ? '恭喜过关！进入下一关？' : 'Congratulations! Next level?')) {
          setCurrentLevel(prev => prev + 1)
        }
      }, 500)
    } else if (newGuesses.length >= 8) {
      setGameStatus('lost')
      const newStats = { 
        totalGames: stats.totalGames + 1, 
        wins: stats.wins 
      }
      saveStats(newStats)
    }

    setCurrentGuess('')
  }

  // 使用提示
  const useHint = () => {
    if (hintUsed || guesses.length === 0) {
      alert(lang === 'zh' ? '请先进行一次猜测后再使用提示' : 'Please make a guess before using hint')
      return
    }

    const targetChars = targetIdiom.split('')
    const randomChar = targetChars[Math.floor(Math.random() * targetChars.length)]
    setHintChar(randomChar)
    setHintUsed(true)
    setShowHint(true)
  }

  // 重置游戏
  const resetGame = () => {
    setCurrentLevel(1)
    startNewLevel()
  }

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'correct': return '#38a169'  // 绿色
      case 'tone-correct': return '#ed8936'  // 橘黄色
      case 'partial': return '#38a169'  // 绿色（部分匹配）
      default: return 'transparent'
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? '猜成语挑战' : 'Idiom Guessing Challenge'}
      </h3>
      <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '12px' }}>
        {lang === 'zh' 
          ? `第 ${currentLevel}/10 关 | 最多猜8次 | 首次猜测后可使用提示` 
          : `Level ${currentLevel}/10 | Max 8 guesses | Hint after first guess`}
      </p>
      <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
        {lang === 'zh' 
          ? `胜率: ${stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0}% (${stats.wins}/${stats.totalGames})`
          : `Win Rate: ${stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0}% (${stats.wins}/${stats.totalGames})`}
      </p>

      {/* 游戏状态 */}
      {gameStatus === 'won' && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#38a169', 
          color: 'white',
          borderRadius: '4px',
          marginBottom: '16px',
          textAlign: 'center',
          fontFamily: 'monospace',
        }}>
          {lang === 'zh' ? '恭喜过关！' : 'Level Completed!'}
        </div>
      )}

      {gameStatus === 'lost' && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#e53e3e', 
          color: 'white',
          borderRadius: '4px',
          marginBottom: '16px',
          textAlign: 'center',
          fontFamily: 'monospace',
        }}>
          {lang === 'zh' ? `挑战失败！正确答案：${targetIdiom}` : `Game Over! Answer: ${targetIdiom}`}
        </div>
      )}

      {gameStatus === 'completed' && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#38a169', 
          color: 'white',
          borderRadius: '4px',
          marginBottom: '16px',
          textAlign: 'center',
          fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
            {lang === 'zh' ? '恭喜你完成所有关卡！' : 'All levels completed!'}
          </div>
          <button
            onClick={resetGame}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#38a169',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            {lang === 'zh' ? '重新开始' : 'Restart'}
          </button>
        </div>
      )}

      {/* 提示信息 */}
      {showHint && hintChar && (
        <div style={{ 
          padding: '12px', 
          border: '1px solid #ed8936',
          borderRadius: '4px',
          marginBottom: '16px',
          backgroundColor: 'rgba(237, 137, 54, 0.1)',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
        }}>
          {lang === 'zh' ? '提示：答案中包含字 "' : 'Hint: The answer contains "'}{hintChar}"
        </div>
      )}

      {/* 猜测历史 */}
      {guesses.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>
            {lang === 'zh' ? '猜测记录：' : 'Guess History:'}
          </label>
          {guesses.map((item, idx) => (
            <div key={idx} style={{ 
              padding: '8px', 
              marginBottom: '4px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}>
              {item.result.map((charInfo, charIdx) => (
                <span
                  key={charIdx}
                  title={charInfo.pinyin}
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    margin: '0 2px',
                    backgroundColor: getStatusColor(charInfo.status),
                    color: charInfo.status === 'wrong' ? 'var(--fg)' : 'white',
                    borderRadius: '2px',
                    cursor: 'help',
                  }}
                >
                  {charInfo.char}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      {gameStatus === 'playing' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value.slice(0, 4))}
              placeholder={lang === 'zh' ? '输入四字成语...' : 'Enter 4-character idiom...'}
              maxLength={4}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                outline: 'none',
              }}
              onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
            />
            <button
              onClick={submitGuess}
              disabled={currentGuess.length !== 4}
              style={{
                padding: '10px 20px',
                backgroundColor: currentGuess.length === 4 ? 'var(--fg)' : 'var(--muted)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'monospace',
                cursor: currentGuess.length === 4 ? 'pointer' : 'not-allowed',
              }}
            >
              {lang === 'zh' ? '提交' : 'Submit'}
            </button>
          </div>

          {/* 提示按钮 */}
          {!hintUsed && guesses.length > 0 && (
            <button
              onClick={useHint}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#ed8936',
                border: '1px solid #ed8936',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {lang === 'zh' ? '使用提示（揭示一个字）' : 'Use Hint (reveal one character)'}
            </button>
          )}

          {/* 剩余次数 */}
          <div className="font-mono" style={{ 
            marginTop: '12px', 
            fontSize: '0.8rem', 
            color: 'var(--muted)',
            textAlign: 'center',
          }}>
            {lang === 'zh' ? `剩余次数：${8 - guesses.length}/8` : `Remaining: ${8 - guesses.length}/8`}
          </div>
        </div>
      )}

      {/* 游戏规则说明 */}
      <div style={{ 
        marginTop: '24px',
        padding: '16px',
        border: '1px dashed var(--border)',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        color: 'var(--muted)',
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
          {lang === 'zh' ? '游戏规则：' : 'Game Rules:'}
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>{lang === 'zh' ? '绿色：字完全正确' : 'Green: Character is correct'}</li>
          <li>{lang === 'zh' ? '橘黄色：声调正确' : 'Orange: Tone is correct'}</li>
          <li>{lang === 'zh' ? '无色：完全不匹配' : 'No color: No match'}</li>
          <li>{lang === 'zh' ? '每关最多猜8次' : 'Maximum 8 guesses per level'}</li>
          <li>{lang === 'zh' ? '首次猜测后可使用提示' : 'Hint available after first guess'}</li>
          <li>{lang === 'zh' ? '共10关，全部通关即胜利' : '10 levels total, win by completing all'}</li>
        </ul>
      </div>
    </div>
  )
}
