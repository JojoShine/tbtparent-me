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
        className="p-2 hover:bg-border/20 rounded-full transition-colors cursor-pointer"
        aria-label="切换主题"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 hover:bg-border/20 rounded-full transition-colors cursor-pointer"
      aria-label="切换主题"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}
