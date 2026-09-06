'use client'

import { useSyncExternalStore, useEffect, useState } from 'react'

// 外部主题存储，在组件外部维护状态
let currentTheme = typeof window !== 'undefined'
  ? (localStorage.getItem('theme') || 'dark')
  : 'dark'
const listeners = new Set()

function subscribe(cb) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

function getSnapshot() {
  return currentTheme
}

function getServerSnapshot() {
  return 'dark'
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
    listeners.forEach(listener => listener())
  }

  return { theme, toggleTheme, mounted }
}
