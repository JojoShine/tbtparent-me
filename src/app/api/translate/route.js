import { NextResponse } from 'next/server'

/**
 * 翻译 API - 使用 MyMemory 免费翻译服务
 * 免费额度：每天 5000 字（无需 API Key）
 * 如需更高额度，可注册获取 key: https://mymemory.translated.net/doc/spec.php
 *
 * 请求：POST /api/translate
 * Body: { text: "你好", from: "zh", to: "en" }
 */

export async function POST(req) {
  try {
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
