'use client'

import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  const handleClick = () => {
    if (!document.startViewTransition) {
      toggleTheme()
      return
    }

    document.startViewTransition(() => {
      toggleTheme()
    })
  }

  // 避免 hydration 错误：挂载前不渲染图标
  if (!mounted) {
    return (
      <button
        className="flex items-center justify-center rounded-full transition-colors cursor-pointer"
        aria-label="切换主题"
        style={{ width: '32px', height: '32px' }}
      >
        <div className="w-[18px] h-[18px]" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center rounded-full transition-colors cursor-pointer"
      aria-label="切换主题"
      style={{ width: '32px', height: '32px' }}
    >
      {theme === 'light' ? (
        <Moon className="w-[18px] h-[18px]" />
      ) : (
        <Sun className="w-[18px] h-[18px]" />
      )}
    </button>
  )
}
