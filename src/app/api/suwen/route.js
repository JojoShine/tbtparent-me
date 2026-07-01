/**
 * 素问 AI 解读 API
 * POST /api/suwen - 流式 AI 解读
 * GET /api/suwen?action=remaining - 查询剩余次数
 */

// 限流：内存 Map（每日每 IP 5 次）
const limitMap = new Map()
const DAILY_LIMIT = 5

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

// 过滤 emoji 的正则
// eslint-disable-next-line no-control-regex
const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{FE0F}]/gu

function stripEmoji(text) {
  return text.replace(EMOJI_RE, '')
}

// System Prompts
const FORMAT_TEMPLATE = `你的回复必须严格按以下 Markdown 格式输出：

## 结论：{吉/凶/平}
一句话概括结论（直白明了，不故弄玄虚）

## 卦象分析
基于卦象数据的专业分析（六爻则分析用神旺衰、世应关系、动变；梅花则分析体用生克、互变关系）

## 动爻提示
（仅当有动爻时输出此节，无动爻则跳过）解读动爻爻辞含义及其对占事的影响

## 古籍引用
引用卦辞/爻辞/象辞原文，注明出处（如《周易·乾》《增删卜易》）

## 建议
给出具体可执行的建议，贴近实际生活

要求：
- 语言直白清晰，不故弄玄虚，不用晦涩难懂的术数黑话
- 不要使用任何 emoji 表情符号
- 每个章节必须有对应的 Markdown 标题（##）
- 总字数控制在 300-500 字`

const SYSTEM_PROMPTS = {
  jingshi_liuyao: `你是一位精通六爻预测的易学学者，风格严谨专业。
${FORMAT_TEMPLATE}`,

  jingshi_meihua: `你是一位精通梅花易数的易学学者，风格严谨专业。
${FORMAT_TEMPLATE}`,

  yinshi: `你是一位精通六爻与梅花易数的易学高人，风格随性风趣，一针见血。
${FORMAT_TEMPLATE}
- 语气可以轻松随意，但分析必须到位，结论必须明确`,
}

function buildUserPrompt(method, data, category, question) {
  if (method === 'liuyao' && data) {
    const yaoLines = data.yaoData || []
    const linesText = [5, 4, 3, 2, 1, 0].map(i => {
      const y = yaoLines[i]
      if (!y) return ''
      const pos = ['初', '二', '三', '四', '五', '上'][i]
      return `第${i + 1}爻（${pos}）：${y.zhi} ${y.liuQin} ${y.liuShen} ${y.changing ? '动' : '静'}${y.changing ? ' → ' + y.bianZhi : ''}${y.isShi ? ' [世]' : ''}${y.isYing ? ' [应]' : ''}`
    }).join('\n')

    const dongYaoTexts = (data.dongYao || []).map(y => {
      const lineData = data.benGua?.lines?.[y.position - 1]
      return lineData ? `${lineData.name}：${lineData.text} —— ${lineData.source}` : ''
    }).filter(Boolean).join('\n')

    return `【卜卦方式】六爻
【占事类别】${category || '未指定'}
【占事问题】${question || '无'}

【本卦】${data.benGua?.fullName || ''}（${data.gong || ''}宫·${data.gongElement || ''}）
【变卦】${data.bianGua?.fullName || '无'}
【世爻】第${data.shiPos || '?'}爻
【应爻】第${data.yingPos || '?'}爻
【用神】${data.yongShen || '未指定'}

【六爻详情】
${linesText}

【古籍原文】
卦辞：${data.judgement || ''} —— ${data.judgementSource || ''}
象曰：${data.xiang || ''} —— ${data.xiangSource || ''}
${dongYaoTexts ? '动爻辞：\n' + dongYaoTexts : ''}`
  }

  if (method === 'meihua' && data) {
    return `【卜卦方式】梅花易数
【占事类别】${category || '未指定'}
【占事问题】${question || '无'}

【本卦】${data.benGua?.fullName || ''}（上${data.upper || ''}下${data.lower || ''}）
  卦辞：${data.benGua?.judgement || ''}
  象曰：${data.benGua?.xiang || ''}
【动爻】第${data.movingLine || '?'}爻
  爻辞：${data.movingLineData?.text || ''} —— ${data.movingLineData?.source || ''}

【体卦】${data.tiGua || ''}（${data.tiElement || ''}）
【用卦】${data.yongGua || ''}（${data.yongElement || ''}）
  体用关系：${data.wuxingRelation?.relation || ''}（${data.wuxingRelation?.desc || ''}）

【互卦】${data.huGua?.fullName || ''}
【变卦】${data.bianGua?.fullName || ''}
  变卦与体卦关系：${data.bianRelation?.relation || ''}（${data.bianRelation?.desc || ''}）`
  }

  return '无法解析卦数据'
}

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

// POST: AI 解读
export async function POST(request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  // 限流检查
  const ip = getIP(request)
  const { count } = getUsage(ip)
  if (count >= DAILY_LIMIT) {
    return Response.json({ error: '今日 AI 解读次数已用完（5/5），明日再试' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { method, data, style, category, question } = body

  // 选择 system prompt
  let systemKey = 'yinshi'
  if (style === 'jingshi') {
    systemKey = method === 'liuyao' ? 'jingshi_liuyao' : 'jingshi_meihua'
  }
  const systemPrompt = SYSTEM_PROMPTS[systemKey] || SYSTEM_PROMPTS.yinshi
  const userPrompt = buildUserPrompt(method, data, category, question)

  // 调用 DeepSeek API
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
          { role: 'system', content: systemPrompt },
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

    // 增加使用次数
    const remaining = incrementUsage(ip)

    // 转发流式响应
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
                    const cleaned = stripEmoji(content)
                    if (cleaned) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(cleaned)}\n\n`))
                    }
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
    console.error('Qingnang API error:', error)
    return Response.json({ error: '服务内部错误' }, { status: 500 })
  }
}
