'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react'

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

// 从完整棋盘创建谜题（移除部分格子）
function createPuzzle(fullBoard, n) {
  const puzzle = fullBoard.map(r => r.map(v => ({ value: v, locked: true })))
  
  // 根据难度决定移除比例（参照标准 Takuzu 难度设计）
  const removeRatio = n <= 4 ? 0.45 : n <= 6 ? 0.5 : n <= 8 ? 0.55 : n <= 10 ? 0.6 : 0.65
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
    puzzle[r][c] = { value: '', locked: false }
    removed++
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
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const gridSize = LEVELS[level].size
  const cacheRef = useRef({}) // 预生成的棋盘缓存 { size: [{fullBoard, puzzle}] }

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 后台预生成大棋盘（Web Worker）
  const pregenerate = useCallback((size) => {
    const workerCode = `
      ${isValidPlacement.toString()}
      ${isCompleteBoardValid.toString()}
      ${generateFullBoard.toString()}
      ${createPuzzle.toString()}
      self.onmessage = function(e) {
        var s = e.data.size;
        var fb = generateFullBoard(s);
        var pz = createPuzzle(fb, s);
        self.postMessage({ size: s, fullBoard: fb, puzzle: pz });
      };
    `
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const worker = new Worker(URL.createObjectURL(blob))
    worker.onmessage = (e) => {
      if (!cacheRef.current[e.data.size]) cacheRef.current[e.data.size] = []
      cacheRef.current[e.data.size].push({ fullBoard: e.data.fullBoard, puzzle: e.data.puzzle })
      worker.terminate()
    }
    worker.postMessage({ size })
  }, [])

  // 页面加载时预生成所有大尺寸棋盘
  useEffect(() => {
    const sizes = [10, 12]
    sizes.forEach(s => pregenerate(s))
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

  // 开始新游戏（优先用缓存，无缓存则异步生成）
  const startNewGame = useCallback((lvl) => {
    const targetLevel = lvl !== undefined ? lvl : level
    const size = LEVELS[targetLevel].size
    
    setLevel(targetLevel)
    setGameStatus('playing')
    setErrors(new Set())
    setTimer(0)
    setIsRunning(true)

    // 小棋盘直接同步生成
    if (size <= 8) {
      const fullBoard = generateFullBoard(size)
      const puzzle = createPuzzle(fullBoard, size)
      setSolution(fullBoard)
      setBoard(puzzle)
      return
    }

    // 检查缓存
    const cached = cacheRef.current[size]
    if (cached && cached.length > 0) {
      const { fullBoard, puzzle } = cached.shift()
      setSolution(fullBoard)
      setBoard(puzzle)
      // 用完补一个
      pregenerate(size)
      return
    }

    // 无缓存，显示加载提示但保留旧棋盘
    setLoading(true)
    pregenerate(size)
    // 等待 Worker 完成后自动更新
    const check = setInterval(() => {
      const c = cacheRef.current[size]
      if (c && c.length > 0) {
        const { fullBoard, puzzle } = c.shift()
        setSolution(fullBoard)
        setBoard(puzzle)
        setLoading(false)
        pregenerate(size)
        clearInterval(check)
      }
    }, 200)
  }, [level, pregenerate])

  // 点击格子
  const handleCellClick = (r, c) => {
    if (!board || board[r][c].locked || gameStatus !== 'playing') return
    
    setBoard(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })))
      const current = next[r][c].value
      next[r][c].value = current === '' ? 'X' : current === 'X' ? 'O' : ''
      return next
    })
    
    // 清除该格子的错误标记
    setErrors(prev => {
      const next = new Set(prev)
      next.delete(`${r},${c}`)
      return next
    })
  }

  // 检查当前答案
  const checkAnswer = () => {
    if (!board || !solution) return
    
    const n = board.length
    const half = n / 2
    const newErrors = new Set()
    let allFilled = true
    let allCorrect = true

    // 检查是否填满
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (!board[i][j].locked && board[i][j].value === '') allFilled = false

    if (!allFilled) {
      setGameStatus('playing')
      return
    }

    // 对比答案
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (!board[i][j].locked && board[i][j].value !== solution[i][j]) {
          newErrors.add(`${i},${j}`)
          allCorrect = false
        }

    // 检查连续3个
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - 2; j++) {
        if (board[i][j].value && board[i][j].value === board[i][j + 1].value && board[i][j].value === board[i][j + 2].value) {
          newErrors.add(`${i},${j}`)
          newErrors.add(`${i},${j + 1}`)
          newErrors.add(`${i},${j + 2}`)
          allCorrect = false
        }
      }
      for (let j = 0; j < n - 2; j++) {
        if (board[j][i].value && board[j][i].value === board[j + 1][i].value && board[j][i].value === board[j + 2][i].value) {
          newErrors.add(`${j},${i}`)
          newErrors.add(`${j + 1},${i}`)
          newErrors.add(`${j + 2},${i}`)
          allCorrect = false
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
      if (rX !== half || rO !== half)
        for (let j = 0; j < n; j++) if (!board[i][j].locked) newErrors.add(`${i},${j}`)
      if (cX !== half || cO !== half)
        for (let j = 0; j < n; j++) if (!board[j][i].locked) newErrors.add(`${j},${i}`)
      if (rX !== half || rO !== half || cX !== half || cO !== half) allCorrect = false
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
        }
      }
    }

    setErrors(newErrors)

    if (allCorrect) {
      setGameStatus('won')
      setIsRunning(false)
    }
  }

  // 重置格子
  const resetBoard = () => {
    if (!board) return
    setBoard(prev => prev.map(row => row.map(cell =>
      cell.locked ? cell : { ...cell, value: '' }
    )))
    setErrors(new Set())
    setGameStatus('playing')
    setTimer(0)
    setIsRunning(true)
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
    const isError = errors.has(`${r},${c}`)
    const isWon = gameStatus === 'won'
    
    return {
      width: '100%',
      aspectRatio: '1',
      border: '1px solid var(--border)',
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: gridSize <= 6 ? '20px' : gridSize <= 8 ? '16px' : '13px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      cursor: cell.locked ? 'default' : 'pointer',
      userSelect: 'none',
      backgroundColor: isError 
        ? 'rgba(239, 68, 68, 0.15)' 
        : isWon 
          ? cell.value === 'X' ? 'var(--fg)' : 'var(--fg)'
          : cell.locked 
            ? 'transparent' 
            : 'transparent',
      color: isWon
        ? cell.value === 'X' ? 'var(--bg)' : 'var(--bg)'
        : isError
          ? '#ef4444'
          : cell.value === 'X'
            ? 'var(--fg)'
            : 'var(--fg)',
      transition: 'none',
    }
  }

  return (
    <div
      className="max-w-3xl pb-8 md:pb-12"
      style={{ margin: '0 auto', minHeight: '100vh', paddingBottom: '60px', padding: '0 16px' }}
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

      {/* 操作提示 */}
      <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '12px' }}>
        {lang === 'zh' ? '点击空格子切换: 空 → X → O → 空' : 'Click empty cell to cycle: empty → X → O → empty'}
      </div>

      {/* 加载提示 */}
      {loading && (
        <div className="font-mono text-xs" style={{ color: 'var(--muted)', marginBottom: '12px' }}>
          {lang === 'zh' ? '生成棋盘中...' : 'Generating puzzle...'}
        </div>
      )}

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
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={getCellStyle(r, c)}
                >
                  {cell.locked ? cell.value : cell.value || ''}
                </div>
              ))
            )}
          </div>

          {/* 规则提示 */}
          <div className="font-mono text-xs" style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
            {lang === 'zh' ? (
              <>
                <div>① 每行每列 X 和 O 数量相等（各 {gridSize / 2} 个）</div>
                <div>② 不能有3个连续的 X 或 O</div>
                <div>③ 每行每列的排列不能重复</div>
              </>
            ) : (
              <>
                <div>① Equal X and O in each row/column ({gridSize / 2} each)</div>
                <div>② No 3 consecutive X or O</div>
                <div>③ No duplicate rows or columns</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px' }}>
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
          className="font-mono text-sm"
          style={{
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          {lang === 'zh' ? '新题' : 'New'}
        </button>
      </div>

      <style jsx>{`
        .social-link:hover .social-link-underline {
          width: 100% !important;
        }
      `}</style>
    </div>
  )
}
