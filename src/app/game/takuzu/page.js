'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { ArrowLeft, RotateCcw, CheckCircle, Undo2, FlaskConical } from 'lucide-react'

const LEVELS = [
  { size: 4, name_zh: '4\u00d74', name_en: '4\u00d74' },
  { size: 6, name_zh: '6\u00d76', name_en: '6\u00d76' },
  { size: 8, name_zh: '8\u00d78', name_en: '8\u00d78' },
  { size: 10, name_zh: '10\u00d710', name_en: '10\u00d710', desktop: true },
  { size: 12, name_zh: '12\u00d712', name_en: '12\u00d712', desktop: true },
]

// ============ 谜题生成算法 ============

// 检查在 (r,c) 放置 val 是否合法
function isValidPlacement(board, r, c, val, n) {
  // 规则3：不能有3个连续相同
  if (c >= 2 && board[r][c - 1] === val && board[r][c - 2] === val) return false
  if (r >= 2 && board[r - 1][c] === val && board[r - 2][c] === val) return false
  // 规则1：每行/列不能超过一半
  const half = n / 2
  let rowCount = 0, colCount = 0
  for (let j = 0; j < n; j++) if (board[r][j] === val) rowCount++
  for (let i = 0; i < n; i++) if (board[i][c] === val) colCount++
  if (rowCount >= half || colCount >= half) return false
  return true
}

// 检查完整棋盘是否合法
function isCompleteBoardValid(board, n) {
  const half = n / 2
  // 检查每行每列的数量
  for (let i = 0; i < n; i++) {
    let rX = 0, rO = 0, cX = 0, cO = 0
    for (let j = 0; j < n; j++) {
      if (board[i][j] === 'X') rX++
      else if (board[i][j] === 'O') rO++
      if (board[j][i] === 'X') cX++
      else if (board[j][i] === 'O') cO++
    }
    if (rX !== half || rO !== half || cX !== half || cO !== half) return false
  }
  // 检查连续3个
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - 2; j++) {
      if (board[i][j] && board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2]) return false
      if (board[j][i] && board[j][i] === board[j + 1][i] && board[j][i] === board[j + 2][i]) return false
    }
  }
  // 检查行和列的唯一性
  const rows = board.map(r => r.join(''))
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (rows[i] === rows[j]) return false
  for (let c = 0; c < n; c++) {
    const col = board.map(r => r[c]).join('')
    for (let c2 = c + 1; c2 < n; c2++) {
      const col2 = board.map(r => r[c2]).join('')
      if (col === col2) return false
    }
  }
  return true
}

// 回溯法生成完整合法棋盘
function generateFullBoard(n) {
  const board = Array.from({ length: n }, () => Array(n).fill(''))
  
  function solve(pos) {
    if (pos === n * n) return true
    const r = Math.floor(pos / n)
    const c = pos % n
    const order = Math.random() < 0.5 ? ['X', 'O'] : ['O', 'X']
    for (const val of order) {
      if (isValidPlacement(board, r, c, val, n)) {
        board[r][c] = val
        if (solve(pos + 1)) return true
        board[r][c] = ''
      }
    }
    return false
  }
  
  // 多次尝试，因为随机顺序可能失败
  for (let attempt = 0; attempt < 50; attempt++) {
    for (let i = 0; i < n; i++) board[i].fill('')
    if (solve(0) && isCompleteBoardValid(board, n)) {
      return board.map(r => [...r])
    }
  }
  // fallback: 返回一个简单模式
  return board.map(r => [...r])
}

// 从完整棋盘创建谜题（移除部分格子，确保唯一解）
function createPuzzle(fullBoard, n) {
  const puzzle = fullBoard.map(r => r.map(v => ({ value: v, locked: true })))
  
  // 根据难度决定移除比例（降低比例以确保唯一解）
  const removeRatio = n <= 4 ? 0.35 : n <= 6 ? 0.4 : n <= 8 ? 0.45 : n <= 10 ? 0.5 : 0.55
  const totalCells = n * n
  const removeCount = Math.floor(totalCells * removeRatio)
  
  // 随机打乱位置
  const positions = []
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      positions.push([i, j])
  
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]]
  }
  
  let removed = 0
  for (const [r, c] of positions) {
    if (removed >= removeCount) break
    
    // 临时移除该格子
    const originalValue = puzzle[r][c].value
    puzzle[r][c] = { value: '', locked: false }
    
    // 简单验证：检查移除后是否仍有足够约束
    // （完整的唯一性验证需要求解器，这里用简化策略）
    // 如果某行或某列已移除超过一半，则恢复该格子
    let rowCount = 0, colCount = 0
    for (let j = 0; j < n; j++) if (!puzzle[r][j].locked) rowCount++
    for (let i = 0; i < n; i++) if (!puzzle[i][c].locked) colCount++
    
    if (rowCount > n / 2 || colCount > n / 2) {
      // 恢复该格子，避免约束过少
      puzzle[r][c] = { value: originalValue, locked: true }
    } else {
      removed++
    }
  }
  
  return puzzle
}

// ============ 游戏页面 ============

export default function TakuzuGamePage() {
  const { lang } = useLang()
  const [level, setLevel] = useState(0)
  const [board, setBoard] = useState(null)
  const [solution, setSolution] = useState(null)
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, checking
  const [errors, setErrors] = useState(new Set()) // 错误的格子 key: "r,c"
  const [errorMessages, setErrorMessages] = useState([]) // 具体错误描述
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [trialMode, setTrialMode] = useState(false)
  const [trialMoves, setTrialMoves] = useState([]) // [{r, c, value}]
  const [sealedCells, setSealedCells] = useState(new Set()) // "r,c" keys
  const [dailyLimit, setDailyLimit] = useState({ date: '', counts: {} }) // 每日限制
  const DAILY_MAX = 3
  const gridSize = LEVELS[level].size

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 加载每日限制
  useEffect(() => {
    try {
      const raw = localStorage.getItem('takuzu-daily')
      if (raw) {
        const parsed = JSON.parse(raw)
        const today = new Date().toISOString().split('T')[0]
        if (parsed.date === today) {
          setDailyLimit(parsed)
        }
      }
    } catch (e) {}
  }, [])

  // 计时器
  useEffect(() => {
    if (!isRunning || gameStatus === 'won') return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning, gameStatus])

  // 首次加载
  useEffect(() => {
    startNewGame(0)
  }, [])

  // 开始新游戏（同步生成）
  const startNewGame = useCallback((lvl) => {
    const targetLevel = lvl !== undefined ? lvl : level
    const size = LEVELS[targetLevel].size
    const today = new Date().toISOString().split('T')[0]
    const counts = dailyLimit.date === today ? dailyLimit.counts : {}
    const usedToday = counts[size] || 0
    if (usedToday >= DAILY_MAX) return
    const fullBoard = generateFullBoard(size)
    const puzzle = createPuzzle(fullBoard, size)
    setLevel(targetLevel)
    setSolution(fullBoard)
    setBoard(puzzle)
    setGameStatus('playing')
    setErrors(new Set())
    setErrorMessages([])
    setTimer(0)
    setIsRunning(true)
    setTrialMode(false)
    setTrialMoves([])
    setSealedCells(new Set())
  }, [level, dailyLimit])

  // 点击格子（锁定格子不可点击）
  const handleCellClick = (r, c) => {
    if (!board || gameStatus === 'won') return
    if (board[r][c].locked) return
    // 试算模式下封存格子不可修改
    if (trialMode && sealedCells.has(`${r},${c}`)) return
    
    const key = `${r},${c}`
    const currentVal = board[r][c].value
    const newVal = currentVal === '' ? 'X' : currentVal === 'X' ? 'O' : ''
    
    setBoard(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })))
      next[r][c].value = newVal
      return next
    })
    
    // 试算模式下记录操作（每次点击都压栈）
    if (trialMode) {
      setTrialMoves(prev => [...prev, { r, c, value: newVal }])
    }
    
    // 清除该格子的错误标记
    setErrors(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    setErrorMessages([])
  }

  // 进入试算模式
  const enterTrialMode = () => {
    if (!board) return
    const sealed = new Set()
    for (let r = 0; r < board.length; r++)
      for (let c = 0; c < board.length; c++)
        if (!board[r][c].locked && board[r][c].value !== '')
          sealed.add(`${r},${c}`)
    setSealedCells(sealed)
    setTrialMoves([])
    setTrialMode(true)
  }

  // 退出试算模式
  const exitTrialMode = (keep) => {
    if (!keep) {
      // 回退所有试算操作：非封存格子恢复到进入试算时的状态（空）
      setBoard(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })))
        const affected = new Set(trialMoves.map(m => `${m.r},${m.c}`))
        for (const key of affected) {
          if (!sealedCells.has(key)) {
            const [r, c] = key.split(',').map(Number)
            next[r][c].value = ''
          }
        }
        return next
      })
    }
    setTrialMode(false)
    setTrialMoves([])
    setSealedCells(new Set())
  }

  // 回退一步
  const undoTrial = () => {
    if (trialMoves.length === 0) return
    const last = trialMoves[trialMoves.length - 1]
    const newMoves = trialMoves.slice(0, -1)
    
    // 从剩余moves中找该格子最后一次操作的值
    let restoreVal = ''
    for (let i = newMoves.length - 1; i >= 0; i--) {
      if (newMoves[i].r === last.r && newMoves[i].c === last.c) {
        restoreVal = newMoves[i].value
        break
      }
    }
    
    setBoard(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })))
      next[last.r][last.c].value = restoreVal
      return next
    })
    setTrialMoves(newMoves)
  }

  // 检查当前答案
  const checkAnswer = () => {
    if (!board || !solution) return
    
    const n = board.length
    const half = n / 2
    const newErrors = new Set()
    const rules = new Set() // 用 Set 去重，只记录违反了哪些规则
    let allFilled = true
    let allCorrect = true

    // 检查是否填满
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (!board[i][j].locked && board[i][j].value === '') allFilled = false

    if (!allFilled) {
      setGameStatus('playing')
      setErrorMessages([lang === 'zh' ? '还有空格未填满' : 'Not all cells are filled'])
      return
    }

    // 检查连续3个（行）
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - 2; j++) {
        if (board[i][j].value && board[i][j].value === board[i][j + 1].value && board[i][j].value === board[i][j + 2].value) {
          newErrors.add(`${i},${j}`)
          newErrors.add(`${i},${j + 1}`)
          newErrors.add(`${i},${j + 2}`)
          allCorrect = false
          rules.add(2)
        }
      }
    }

    // 检查连续3个（列）
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - 2; j++) {
        if (board[j][i].value && board[j][i].value === board[j + 1][i].value && board[j][i].value === board[j + 2][i].value) {
          newErrors.add(`${j},${i}`)
          newErrors.add(`${j + 1},${i}`)
          newErrors.add(`${j + 2},${i}`)
          allCorrect = false
          rules.add(2)
        }
      }
    }

    // 检查行/列数量
    for (let i = 0; i < n; i++) {
      let rX = 0, rO = 0, cX = 0, cO = 0
      for (let j = 0; j < n; j++) {
        if (board[i][j].value === 'X') rX++
        else if (board[i][j].value === 'O') rO++
        if (board[j][i].value === 'X') cX++
        else if (board[j][i].value === 'O') cO++
      }
      if (rX !== half || rO !== half) {
        for (let j = 0; j < n; j++) if (!board[i][j].locked) newErrors.add(`${i},${j}`)
        allCorrect = false
        rules.add(1)
      }
      if (cX !== half || cO !== half) {
        for (let j = 0; j < n; j++) if (!board[j][i].locked) newErrors.add(`${j},${i}`)
        allCorrect = false
        rules.add(1)
      }
    }

    // 检查行/列唯一性
    const rowStrs = board.map(r => r.map(c => c.value).join(''))
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        if (rowStrs[i] === rowStrs[j]) {
          for (let k = 0; k < n; k++) {
            if (!board[i][k].locked) newErrors.add(`${i},${k}`)
            if (!board[j][k].locked) newErrors.add(`${j},${k}`)
          }
          allCorrect = false
          rules.add(3)
        }
    for (let c = 0; c < n; c++) {
      const col = board.map(r => r[c].value).join('')
      for (let c2 = c + 1; c2 < n; c2++) {
        const col2 = board.map(r => r[c2].value).join('')
        if (col === col2) {
          for (let k = 0; k < n; k++) {
            if (!board[k][c].locked) newErrors.add(`${k},${c}`)
            if (!board[k][c2].locked) newErrors.add(`${k},${c2}`)
          }
          allCorrect = false
          rules.add(3)
        }
      }
    }

    // 注意：不再与系统答案对比，只要满足三条规则即为正确
    // Takuzu 谜题理论上应有唯一解，但判定应基于规则而非特定答案

    // 生成规则提示（不暴露具体位置）
    const msgs = []
    const zh = lang === 'zh'
    if (rules.has(1)) {
      // 找出哪些行或列有问题
      const problemRows = []
      const problemCols = []
      for (let i = 0; i < n; i++) {
        let rX = 0, rO = 0, cX = 0, cO = 0
        for (let j = 0; j < n; j++) {
          if (board[i][j].value === 'X') rX++
          else if (board[i][j].value === 'O') rO++
          if (board[j][i].value === 'X') cX++
          else if (board[j][i].value === 'O') cO++
        }
        if (rX !== half || rO !== half) problemRows.push(i + 1)
        if (cX !== half || cO !== half) problemCols.push(i + 1)
      }
      
      if (problemRows.length > 0 && problemCols.length > 0) {
        msgs.push(zh 
          ? `① 第 ${problemRows.join(', ')} 行和第 ${problemCols.join(', ')} 列的 X/O 数量不均等`
          : `① Rows ${problemRows.join(', ')} and columns ${problemCols.join(', ')} have unequal X/O counts`)
      } else if (problemRows.length > 0) {
        msgs.push(zh 
          ? `① 第 ${problemRows.join(', ')} 行的 X/O 数量不均等`
          : `① Rows ${problemRows.join(', ')} have unequal X/O counts`)
      } else if (problemCols.length > 0) {
        msgs.push(zh 
          ? `① 第 ${problemCols.join(', ')} 列的 X/O 数量不均等`
          : `① Columns ${problemCols.join(', ')} have unequal X/O counts`)
      }
    }
    if (rules.has(2)) {
      // 找出哪些行或列有连续3个，并记录具体位置
      const rowIssues = [] // {row, cols, value}
      const colIssues = [] // {col, rows, value}
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - 2; j++) {
          if (board[i][j].value && board[i][j].value === board[i][j + 1].value && board[i][j].value === board[i][j + 2].value) {
            rowIssues.push({ row: i + 1, cols: [j + 1, j + 2, j + 3], value: board[i][j].value })
            break
          }
        }
        for (let j = 0; j < n - 2; j++) {
          if (board[j][i].value && board[j][i].value === board[j + 1][i].value && board[j][i].value === board[j + 2][i].value) {
            colIssues.push({ col: i + 1, rows: [j + 1, j + 2, j + 3], value: board[j][i].value })
            break
          }
        }
      }
      
      const rowDescs = rowIssues.map(r => zh
        ? `第${r.row}行第${r.cols.join('-')}列连续3个${r.value}`
        : `Row ${r.row}, cols ${r.cols.join('-')}: 3 consecutive ${r.value}`)
      const colDescs = colIssues.map(c => zh
        ? `第${c.col}列第${c.rows.join('-')}行连续3个${c.value}`
        : `Col ${c.col}, rows ${c.rows.join('-')}: 3 consecutive ${c.value}`)
      
      const allDescs = [...rowDescs, ...colDescs]
      if (allDescs.length > 0) {
        msgs.push(`② ${allDescs.join(zh ? '；' : '; ')}`)
      }
    }
    if (rules.has(3)) {
      // 找出哪些行或列重复，并配对显示
      const rowStrs = board.map(r => r.map(c => c.value).join(''))
      const rowPairs = []
      const colPairs = []
      const addedRows = new Set()
      const addedCols = new Set()
      
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (rowStrs[i] === rowStrs[j]) {
            const key = `${i}-${j}`
            if (!addedRows.has(key)) {
              rowPairs.push([i + 1, j + 1])
              addedRows.add(key)
            }
          }
        }
      }
      
      for (let c = 0; c < n; c++) {
        const col = board.map(r => r[c].value).join('')
        for (let c2 = c + 1; c2 < n; c2++) {
          const col2 = board.map(r => r[c2].value).join('')
          if (col === col2) {
            const key = `${c}-${c2}`
            if (!addedCols.has(key)) {
              colPairs.push([c + 1, c2 + 1])
              addedCols.add(key)
            }
          }
        }
      }
      
      const rowDescs = rowPairs.map(([a, b]) => zh ? `第${a}行和第${b}行` : `Row ${a} & ${b}`)
      const colDescs = colPairs.map(([a, b]) => zh ? `第${a}列和第${b}列` : `Col ${a} & ${b}`)
      
      if (rowDescs.length > 0 && colDescs.length > 0) {
        msgs.push(zh 
          ? `③ 排列重复：${rowDescs.join('、')}；${colDescs.join('、')}`
          : `③ Duplicates: ${rowDescs.join(', ')}; ${colDescs.join(', ')}`)
      } else if (rowDescs.length > 0) {
        msgs.push(zh 
          ? `③ 排列重复：${rowDescs.join('、')}`
          : `③ Duplicates: ${rowDescs.join(', ')}`)
      } else if (colDescs.length > 0) {
        msgs.push(zh 
          ? `③ 排列重复：${colDescs.join('、')}`
          : `③ Duplicates: ${colDescs.join(', ')}`)
      }
    }

    setErrors(newErrors)
    setErrorMessages(msgs)

    if (allCorrect) {
      setGameStatus('won')
      setIsRunning(false)
      // 增加每日计数
      const today = new Date().toISOString().split('T')[0]
      setDailyLimit(prev => {
        const counts = prev.date === today ? { ...prev.counts } : {}
        counts[gridSize] = (counts[gridSize] || 0) + 1
        const updated = { date: today, counts }
        localStorage.setItem('takuzu-daily', JSON.stringify(updated))
        return updated
      })
    }
  }

  // 重置格子
  const resetBoard = () => {
    if (!board) return
    setBoard(prev => prev.map(row => row.map(cell =>
      cell.locked ? cell : { ...cell, value: '' }
    )))
    setErrors(new Set())
    setErrorMessages([])
    setGameStatus('playing')
    setTimer(0)
    setIsRunning(true)
    setTrialMode(false)
    setTrialMoves([])
    setSealedCells(new Set())
  }

  // 格式化时间
  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // 获取格子样式
  const getCellStyle = (r, c) => {
    if (!board) return {}
    const cell = board[r][c]
    const key = `${r},${c}`
    const isError = errors.has(key)
    const isWon = gameStatus === 'won'
    const isSealed = sealedCells.has(key)
    const isTrial = trialMode && !cell.locked && !isSealed && cell.value !== ''
    
    return {
      width: '100%',
      aspectRatio: '1',
      border: isSealed ? '1px solid var(--border)' : '1px solid var(--border)',
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: gridSize <= 6 ? '20px' : gridSize <= 8 ? '16px' : '13px',
      fontWeight: cell.locked ? 800 : 'bold',
      fontFamily: 'monospace',
      cursor: (cell.locked && !isError) ? 'default' : 'pointer',
      userSelect: 'none',
      position: 'relative',
      backgroundColor: isError 
        ? 'rgba(239, 68, 68, 0.15)' 
        : isWon 
          ? cell.value === 'X' ? 'var(--fg)' : 'var(--fg)'
          : cell.locked 
            ? 'var(--cell-locked-bg)' 
            : isSealed
              ? 'var(--cell-sealed-bg)'
              : 'transparent',
      color: isWon
        ? cell.value === 'X' ? 'var(--bg)' : 'var(--bg)'
        : isError
          ? '#ef4444'
          : cell.locked
            ? 'var(--cell-locked-fg)'
            : isSealed
              ? 'var(--cell-sealed-fg)'
              : 'var(--fg)',
      opacity: isSealed ? 0.85 : 1,
      transition: 'none',
    }
  }

  // 获取试算角标（显示该格子最近一次操作的序号）
  const getTrialOrder = (r, c) => {
    if (!trialMode) return null
    const key = `${r},${c}`
    if (sealedCells.has(key)) return null
    // 从后往前找该格子最近一次操作
    for (let i = trialMoves.length - 1; i >= 0; i--) {
      if (trialMoves[i].r === r && trialMoves[i].c === c) {
        if (trialMoves[i].value === '') return null
        return i + 1
      }
    }
    return null
  }

  return (
    <div
      className="max-w-3xl pb-8 md:pb-12"
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
          {lang === 'zh' ? 'XXOO' : 'Takuzu'}
        </h1>
        <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          {gameStatus === 'won'
            ? (lang === 'zh' ? `完成! 用时 ${formatTime(timer)}` : `Done in ${formatTime(timer)}`)
            : (lang === 'zh' ? '填满棋盘，遵守三条规则' : 'Fill the board following 3 rules')}
        </div>
        <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginTop: '4px' }}>
          {(() => {
            const today = new Date().toISOString().split('T')[0]
            const counts = dailyLimit.date === today ? dailyLimit.counts : {}
            const used = counts[gridSize] || 0
            return `${LEVELS[level].name_zh}: ${used}/${DAILY_MAX}`
          })()}
        </div>
      </div>

      {/* 关卡选择 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {LEVELS.filter(lvl => !lvl.desktop || !isMobile).map((lvl, idx) => {
          const i = LEVELS.indexOf(lvl)
          return (
            <button
              key={i}
              onClick={() => startNewGame(i)}
              className="font-mono text-xs"
              style={{
                padding: '6px 12px',
                border: '1px solid',
                borderColor: level === i ? 'var(--fg)' : 'var(--border)',
                borderRadius: '3px',
                backgroundColor: level === i ? 'var(--fg)' : 'transparent',
                color: level === i ? 'var(--bg)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'none',
              }}
            >
              {lang === 'zh' ? lvl.name_zh : lvl.name_en}
            </button>
          )
        })}
      </div>

      {/* 计时器 */}
      <div className="font-mono text-sm" style={{ color: 'var(--muted)', marginBottom: '16px' }}>
        {formatTime(timer)}
      </div>

      {/* 每日限额提示 */}
      {(() => {
        const today = new Date().toISOString().split('T')[0]
        const counts = dailyLimit.date === today ? dailyLimit.counts : {}
        const used = counts[gridSize] || 0
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

      {/* 操作提示 */}
      <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '12px' }}>
        {lang === 'zh' ? '点击空格子切换: 空 → X → O → 空' : 'Click empty cell to cycle: empty → X → O → empty'}
      </div>

      {/* 棋盘 + 规则 外边框容器 */}
      {board && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px',
          maxWidth: '100%',
        }}>
          {/* 棋盘 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: gridSize <= 6 ? '3px' : '2px',
            maxWidth: gridSize <= 4 ? '240px' : gridSize <= 6 ? '320px' : gridSize <= 8 ? '400px' : gridSize <= 10 ? '480px' : '540px',
            margin: '0 auto 20px auto',
          }}>
            {board.map((row, r) =>
              row.map((cell, c) => {
                const order = getTrialOrder(r, c)
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    style={getCellStyle(r, c)}
                  >
                    {cell.locked ? cell.value : cell.value || ''}
                    {order !== null && (
                      <span style={{
                        position: 'absolute',
                        top: '1px',
                        right: '2px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: 'var(--muted)',
                        lineHeight: 1,
                        fontFamily: 'monospace',
                      }}>{order}</span>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* 规则提示 */}
          <div className="font-mono text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
            {lang === 'zh' ? (
              <>
                <div>① 每行每列 X 和 O 数量相等（各 {gridSize / 2} 个）</div>
                <div>② 每行每列不能有3个连续的 X 或 O</div>
                <div>③ 每行每列的排列不能重复</div>
              </>
            ) : (
              <>
                <div>① Equal X and O in each row/column ({gridSize / 2} each)</div>
                <div>② No 3 consecutive X or O in any row/column</div>
                <div>③ No duplicate rows or columns</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {errorMessages.length > 0 && (
        <div style={{
          border: '1px solid #ef4444',
          borderRadius: '4px',
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.06)',
        }}>
          {errorMessages.map((msg, i) => (
            <div key={i} className="font-mono text-xs" style={{ color: '#ef4444', lineHeight: 1.8 }}>
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={resetBoard}
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

        <button
          onClick={checkAnswer}
          disabled={gameStatus === 'won'}
          className="inline-flex items-center gap-2 font-mono text-sm"
          style={{
            padding: '8px 16px',
            border: '1px solid var(--fg)',
            borderRadius: '3px',
            backgroundColor: 'var(--fg)',
            color: 'var(--bg)',
            cursor: gameStatus === 'won' ? 'default' : 'pointer',
            opacity: gameStatus === 'won' ? 0.5 : 1,
          }}
        >
          <CheckCircle className="w-4 h-4" />
          {lang === 'zh' ? '检查' : 'Check'}
        </button>

        <button
          onClick={() => startNewGame(level)}
          disabled={(() => {
            const today = new Date().toISOString().split('T')[0]
            const counts = dailyLimit.date === today ? dailyLimit.counts : {}
            return (counts[gridSize] || 0) >= DAILY_MAX
          })()}
          className="inline-flex items-center gap-2 font-mono text-sm"
          style={{
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            cursor: (() => {
              const today = new Date().toISOString().split('T')[0]
              const counts = dailyLimit.date === today ? dailyLimit.counts : {}
              return (counts[gridSize] || 0) >= DAILY_MAX ? 'not-allowed' : 'pointer'
            })(),
            opacity: (() => {
              const today = new Date().toISOString().split('T')[0]
              const counts = dailyLimit.date === today ? dailyLimit.counts : {}
              return (counts[gridSize] || 0) >= DAILY_MAX ? 0.4 : 1
            })(),
          }}
        >
          {lang === 'zh' ? '新题' : 'New'}
        </button>

        {/* 试算模式按钮 */}
        {!trialMode && gameStatus !== 'won' && gridSize >= 10 && (
          <button
            onClick={enterTrialMode}
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
            <FlaskConical className="w-4 h-4" />
            {lang === 'zh' ? '试算' : 'Trial'}
          </button>
        )}

        {trialMode && (
          <>
            <button
              onClick={undoTrial}
              disabled={trialMoves.length === 0}
              className="inline-flex items-center gap-2 font-mono text-sm"
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                backgroundColor: 'transparent',
                color: trialMoves.length === 0 ? 'var(--border)' : 'var(--muted)',
                cursor: trialMoves.length === 0 ? 'default' : 'pointer',
              }}
            >
              <Undo2 className="w-4 h-4" />
              {lang === 'zh' ? `回退 (${trialMoves.length})` : `Undo (${trialMoves.length})`}
            </button>

            <button
              onClick={() => exitTrialMode(true)}
              className="inline-flex items-center gap-2 font-mono text-sm"
              style={{
                padding: '8px 16px',
                border: '1px solid var(--fg)',
                borderRadius: '3px',
                backgroundColor: 'var(--fg)',
                color: 'var(--bg)',
                cursor: 'pointer',
              }}
            >
              {lang === 'zh' ? '确认试算' : 'Keep'}
            </button>

            <button
              onClick={() => exitTrialMode(false)}
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
              {lang === 'zh' ? '放弃试算' : 'Discard'}
            </button>
          </>
        )}
      </div>

      {/* 试算模式提示 */}
      {trialMode && (
        <div className="font-mono text-xs" style={{
          color: 'var(--muted)',
          padding: '8px 12px',
          border: '1px dashed var(--border)',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          {lang === 'zh'
            ? '试算模式: 已填入的格子已封存(半透明)，新填入的显示角标序号，可随时回退'
            : 'Trial mode: Filled cells are sealed (dimmed). New entries show order number. Undo anytime.'}
        </div>
      )}

      <style jsx>{`
        .social-link:hover .social-link-underline {
          width: 100% !important;
        }
      `}</style>
    </div>
  )
}
