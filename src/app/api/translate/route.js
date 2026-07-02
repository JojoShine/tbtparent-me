import { NextResponse } from 'next/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const DAILY_LIMIT = 200

export async function POST(req) {
  try {
    // 限流检查
    const { allowed } = checkRateLimit(req, DAILY_LIMIT)
    if (!allowed) {
      return rateLimitResponse(DAILY_LIMIT)
    }

    const { text, from = 'zh', to = 'en' } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    // MyMemory 语言代码映射
    const langMap = {
      zh: 'zh-CN',
      en: 'en-US',
    }

    const langPair = `${langMap[from] || from}|${langMap[to] || to}`
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`

    const res = await fetch(url)
    const data = await res.json()

    if (data.responseStatus === 200) {
      return NextResponse.json({ translated: data.responseData.translatedText })
    } else {
      console.error('Translate API error:', data)
      return NextResponse.json({ error: '翻译失败' }, { status: 500 })
    }
  } catch (e) {
    console.error('Translate API error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
