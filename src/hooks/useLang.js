'use client'

import { useSyncExternalStore, useEffect, useState } from 'react'
import { translations } from '@/data/translations'

// 根据浏览器语言自动检测默认语言
function detectLang() {
  if (typeof window === 'undefined') return 'zh'
  const saved = localStorage.getItem('lang')
  if (saved) return saved
  // 检测浏览器语言
  const browserLang = navigator.language || navigator.languages?.[0] || 'zh'
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

let currentLang = detectLang()
let listeners = new Set()

function subscribe(cb) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

function getSnapshot() {
  return currentLang
}

function getServerSnapshot() {
  return 'zh'
}

// 获取嵌套对象值 (如 'nav.home')
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = lang
      localStorage.setItem('lang', lang)
    }
  }, [lang, mounted])

  // 翻译函数 t('nav.home') => '首页'
  const t = (key) => {
    const value = getNestedValue(translations[lang], key)
    return value || key // 找不到则返回 key
  }

  const setLang = (newLang) => {
    currentLang = newLang
    localStorage.setItem('lang', newLang)
    document.documentElement.lang = newLang
    listeners.forEach(cb => cb())
  }

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh')
  }

  return { lang, t, setLang, toggleLang, mounted }
}
