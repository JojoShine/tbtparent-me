import { catPersonas } from '@/data/cat-personas'

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

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('action') !== 'remaining') {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }
  const ip = getIP(request)
  const { count } = getUsage(ip)
  return Response.json({ remaining: DAILY_LIMIT - count })
}

export async function POST(request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  const ip = getIP(request)
  const { count } = getUsage(ip)
  if (count >= DAILY_LIMIT) {
    return Response.json({ error: '今日聊天次数已用完，明日再试' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { catId, messages } = body

  if (!catId || !messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Missing catId or messages' }, { status: 400 })
  }

  if (messages.length > 20) {
    return Response.json({ error: '消息数量不能超过20条' }, { status: 400 })
  }

  const allowedRoles = new Set(['user', 'assistant'])
  for (const m of messages) {
    if (!allowedRoles.has(m.role)) {
      return Response.json({ error: '消息角色仅允许 user 或 assistant' }, { status: 400 })
    }
    if (typeof m.content !== 'string' || m.content.length > 2000) {
      return Response.json({ error: '每条消息内容不能超过2000字符' }, { status: 400 })
    }
  }

  const persona = catPersonas.find(c => c.id === catId)
  if (!persona) {
    return Response.json({ error: 'Unknown cat' }, { status: 400 })
  }

  const chatMessages = [
    { role: 'system', content: persona.systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ]

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: chatMessages,
        stream: true,
        temperature: 0.85,
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
    console.error('Cat chat API error:', error)
    return Response.json({ error: '服务内部错误' }, { status: 500 })
  }
}
