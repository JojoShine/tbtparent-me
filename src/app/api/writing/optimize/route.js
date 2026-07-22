/**
 * 口语转书面语优化 API
 * POST /api/writing/optimize - 将口语化表达优化为书面语
 */

const limitMap = new Map()
const DAILY_LIMIT = 50

function getIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getUsage(ip) {
  const today = getToday()
  const key = `${ip}_${today}`
  const entry = limitMap.get(key)
  if (!entry) return { count: 0, key }
  return { count: entry.count, key }
}

function incrementUsage(ip) {
  const { count, key } = getUsage(ip)
  limitMap.set(key, { count: count + 1 })
  return DAILY_LIMIT - count - 1
}

const SYSTEM_PROMPT = `你是一位语言表达优化专家，擅长将口语化的表达转化为更精炼、更有文学性的书面语。

你的任务是：
1. 理解用户口语表达的核心意思和情感
2. 将其优化为更书面化、更有表现力的表达
3. 指出原表达中可以改进的地方
4. 提供具体的优化建议

回复格式（Markdown）：

## 优化版本
提供 1-2 个优化后的版本，保持原意但更具文学性

## 改进要点
- 指出 2-3 个可以改进的地方
- 每个要点附带简短说明

## 表达技巧
给出 1-2 条相关的写作技巧，帮助用户提升表达能力

要求：
- 保持原意，不要改变核心内容
- 优化版本要自然流畅，不要过度修饰
- 建议要具体实用，避免空泛
- 不要使用任何 emoji 表情符号
- 总字数控制在 200-400 字`

export async function POST(request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  const ip = getIP(request)
  const { count } = getUsage(ip)
  if (count >= DAILY_LIMIT) {
    return Response.json({ error: '今日优化次数已用完，明日再试' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { text, prompt, lang } = body

  if (!text || text.trim().length < 5) {
    return Response.json({ error: '内容太短，请至少说一句话' }, { status: 400 })
  }

  const userPrompt = prompt
    ? `【写作提示】${prompt}\n\n【用户口语表达】\n${text}\n\n请将这段口语表达优化为更书面化、更有表现力的文字。`
    : `【用户口语表达】\n${text}\n\n请将这段口语表达优化为更书面化、更有表现力的文字。`

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      console.error('DeepSeek API error:', errText)
      return Response.json({ error: 'AI 服务暂时不可用' }, { status: 502 })
    }

    const remaining = incrementUsage(ip)

    const encoder = new TextEncoder()
    const reader = response.body.getReader()

    const newStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              break
            }
            const text = new TextDecoder().decode(value)
            const lines = text.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim()
                if (!jsonStr || jsonStr === '[DONE]') continue
                try {
                  const parsed = JSON.parse(jsonStr)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`))
                  }
                } catch {
                  // skip invalid JSON
                }
              }
            }
          }
        } catch (e) {
          controller.error(e)
        }
      },
    })

    return new Response(newStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Remaining': String(remaining),
      },
    })
  } catch (error) {
    console.error('Optimize API error:', error)
    return Response.json({ error: '服务内部错误' }, { status: 500 })
  }
}
