'use client'

import { useSyncExternalStore, useEffect, useState } from 'react'

// 外部主题存储，在组件外部维护状态
let currentTheme = typeof window !== 'undefined'
  ? (localStorage.getItem('theme') || 'light')
  : 'light'
let listener = null

function subscribe(cb) {
  listener = cb
  return () => { listener = null }
}

function getSnapshot() {
  return currentTheme
}

function getServerSnapshot() {
  return 'light'
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', currentTheme)
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')
    if (listener) listener()
  }

  return { theme, toggleTheme, mounted }
}
