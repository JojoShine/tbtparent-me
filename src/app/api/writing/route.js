/**
 * 文笔训练 AI 评分 API
 * POST /api/writing - 流式 AI 评分
 * GET /api/writing?action=remaining - 查询剩余次数
 */

const limitMap = new Map()
const DAILY_LIMIT = 10

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

const SYSTEM_PROMPT = `你是一位严格的文学写作教练，擅长从专业角度点评短片段写作。

你的任务是：根据给定的写作提示，对用户提交的短片段进行综合评分和点评。

你的回复必须严格按以下 Markdown 格式输出：

**得分：X.X/10**

## 点评
从整体表达、语言质感、情感传达等方面给出一段简洁的综合评价（2-3句话）

## 亮点
指出 1-2 个写得好的地方，引用原文片段说明

## 改进建议
给出 2-3 条具体可操作的改进建议，可附示范改写

要求：
- 评分严格但公正，不要给虚高的分数
- 点评简洁有力，不要空泛的夸奖
- 改进建议必须具体，最好附带改写示例
- 不要使用任何 emoji 表情符号
- 总字数控制在 300-500 字`

// GET: 查询剩余次数
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('action') !== 'remaining') {
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  }

  const ip = getIP(request)
  const { count } = getUsage(ip)
  return Response.json({ remaining: DAILY_LIMIT - count })
}

// POST: AI 评分
export async function POST(request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  const ip = getIP(request)
  const { count } = getUsage(ip)
  if (count >= DAILY_LIMIT) {
    return Response.json({ error: '今日评分次数已用完（10/10），明日再试' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { prompt, writing, lang } = body

  if (!prompt || !writing) {
    return Response.json({ error: 'Missing prompt or writing content' }, { status: 400 })
  }

  if (writing.length < 10) {
    return Response.json({ error: '写作内容太短，请至少写 10 个字' }, { status: 400 })
  }

  const userPrompt = `【写作提示】${prompt}

【用户作品】
${writing}`

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
    console.error('Writing API error:', error)
    return Response.json({ error: '服务内部错误' }, { status: 500 })
  }
}
