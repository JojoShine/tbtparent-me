'use client'

import { useState, useEffect } from 'react'

export default function EmptyState({ message, actionLabel, onAction }) {
  const [phase, setPhase] = useState(0)

  // 动画阶段控制
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 200)   // 圆环出现
    const timer2 = setTimeout(() => setPhase(2), 600)   // 线条出现
    const timer3 = setTimeout(() => setPhase(3), 1000)  // 文字淡入
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div
      style={{
        padding: '4rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* 有趣的空状态图标：跳动的小猫 + 旋转的虚线圆 */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {/* 虚线圆 - 旋转动画 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--fg)',
            opacity: phase >= 1 ? 0.3 : 0,
            transform: phase >= 1 ? 'rotate(0deg)' : 'rotate(-180deg)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <circle cx="50" cy="50" r="40" strokeDasharray="8 6" />
        </svg>

        {/* 简笔小猫 - 弹跳动画 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            color: 'var(--fg)',
            opacity: phase >= 2 ? 0.7 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* 猫耳朵 */}
          <path d="M35 40 L30 25 L45 35" />
          <path d="M65 40 L70 25 L55 35" />
          {/* 猫脸 */}
          <circle cx="50" cy="50" r="18" />
          {/* 猫眼睛 */}
          <circle cx="44" cy="48" r="2" fill="currentColor" />
          <circle cx="56" cy="48" r="2" fill="currentColor" />
          {/* Zzz 符号 - 表示在睡觉 */}
          <text
            x="70"
            y="35"
            fontSize="14"
            fontFamily="monospace"
            fill="currentColor"
            stroke="none"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              animation: 'float 2s ease-in-out infinite',
            }}
          >
            z
          </text>
          <text
            x="78"
            y="28"
            fontSize="11"
            fontFamily="monospace"
            fill="currentColor"
            stroke="none"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              animation: 'float 2s ease-in-out infinite 0.3s',
            }}
          >
            z
          </text>
        </svg>
      </div>

      {/* 提示文字 - 淡入动画 */}
      <p
        className="font-mono"
        style={{
          fontSize: '0.8rem',
          color: 'var(--muted)',
          letterSpacing: '0.03em',
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
        }}
      >
        {message}
      </p>

      {/* 操作按钮 */}
      {actionLabel && onAction && (
        <button
          className="font-mono"
          onClick={onAction}
          style={{
            marginTop: '4px',
            fontSize: '0.75rem',
            padding: '4px 14px',
            border: '1px solid var(--border)',
            borderRadius: '2px',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--fg)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          {actionLabel}
        </button>
      )}

      {/* 浮动动画定义 */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
