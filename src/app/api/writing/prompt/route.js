/**
 * 文笔训练 - AI 动态生成提示词
 * GET /api/writing/prompt?category=action
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

const CATEGORY_DESCRIPTIONS = {
  action: {
    zh: '动作描写',
    en: 'Action',
    examples_zh: ['雨天奔跑', '老人递茶杯', '指尖捏碎信纸', '深夜翻墙', '母亲缝补衣服', '篮球最后一投', '厨房里切菜', '系鞋带的孩子', '撑伞的瞬间'],
    examples_en: ['Running in the rain', 'An elder handing over a teacup', 'Fingertips crushing a letter', 'Climbing over a wall at night', 'A mother mending clothes', 'The last basketball shot', 'Chopping vegetables in the kitchen', 'A child tying shoelaces', 'The moment of opening an umbrella'],
  },
  expression: {
    zh: '神态微表情',
    en: 'Expression',
    examples_zh: ['强忍委屈', '暗自窃喜', '眼底失望', '听到噩耗的瞬间', '久别重逢', '被揭穿时的表情', '努力保持微笑', '突然被点名', '假装不在意'],
    examples_en: ['Holding back grievance', 'Secret delight', 'Disappointment in the eyes', 'The instant of hearing bad news', 'Reuniting after long separation', 'Expression when caught in a lie', 'Struggling to maintain a smile', 'Suddenly being called on', 'Pretending not to care'],
  },
  atmosphere: {
    zh: '环境氛围',
    en: 'Atmosphere',
    examples_zh: ['深夜空巷', '雪后窗台', '闷热旧教室', '凌晨的医院走廊', '黄昏的菜市场', '暴雨前的天空', '废弃的游乐场', '绿皮火车车厢'],
    examples_en: ['An empty alley at midnight', 'A windowsill after snowfall', 'A stuffy old classroom', 'A hospital corridor at dawn', 'A vegetable market at dusk', 'The sky before a rainstorm', 'An abandoned playground', 'Inside a green train carriage'],
  },
  monologue: {
    zh: '心理独白',
    en: 'Inner Voice',
    examples_zh: ['忐忑等待', '瞬间释然', '莫名心酸', '做出艰难决定前', '独自走夜路', '看到前任的动态', '考试前的最后十分钟', '收到录取通知的那一刻'],
    examples_en: ['Anxious waiting', 'Sudden relief', 'Inexplicable sadness', 'Before a difficult decision', 'Walking alone at night', 'Seeing an ex\'s social media post', 'Last 10 minutes before an exam', 'The moment of receiving acceptance'],
  },
  sensory: {
    zh: '感官描写',
    en: 'Sensory',
    examples_zh: ['清晨面包房的香气', '赤脚踩在沙滩上', '老唱片的声音', '咬一口冰西瓜', '雨后的泥土气息', '冬天触摸铁栏杆', '深夜的猫叫声', '外婆手上的茧'],
    examples_en: ['A bakery\'s morning aroma', 'Barefoot on the beach', 'Sound of an old vinyl record', 'Biting into cold watermelon', 'Earthy scent after rain', 'Touching iron railings in winter', 'A cat\'s cry at night', 'Grandmother\'s calloused hands'],
  },
}

const SYSTEM_PROMPT = `你是一位创意写作教练，擅长设计富有挑战性和启发性的写作练习题目。

你的任务是：根据给定的写作分类，生成一个全新的、独特的写作提示词。

要求：
- 提示词要具体、有画面感，能激发创作灵感
- 避免使用示例中的题目，要有创新性
- 提示词长度：中文 4-10 个字，英文 3-8 个单词
- 写作提示要具体、可操作，指导用户从哪些角度入手
- 不要使用任何 emoji 表情符号

你必须严格按以下 JSON 格式输出，不要包含任何其他内容：

{
  "zh": "提示词中文",
  "en": "Prompt in English",
  "hint_zh": "写作提示中文，50-100字，具体指导写作角度和技巧",
  "hint_en": "Writing hint in English, 50-100 words, specific guidance on angles and techniques"
}`

export async function GET(request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'all'
  const lang = searchParams.get('lang') || 'zh'

  // 限流
  const ip = getIP(request)
  const { count } = getUsage(ip)
  if (count >= DAILY_LIMIT) {
    return Response.json({ error: '今日生成次数已用完' }, { status: 429 })
  }

  // 随机选择分类
  const categories = Object.keys(CATEGORY_DESCRIPTIONS)
  const selectedCategory = category === 'all'
    ? categories[Math.floor(Math.random() * categories.length)]
    : category

  if (!CATEGORY_DESCRIPTIONS[selectedCategory]) {
    return Response.json({ error: 'Invalid category' }, { status: 400 })
  }

  const catInfo = CATEGORY_DESCRIPTIONS[selectedCategory]

  const userPrompt = `分类：${catInfo.zh} (${catInfo.en})

中文示例（避免重复）：${catInfo.examples_zh.join('、')}
英文示例（避免重复）：${catInfo.examples_en.join(', ')}

请生成一个全新的写作提示词。`

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
        temperature: 0.9,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      console.error('DeepSeek API error:', errText)
      return Response.json({ error: 'AI 服务暂时不可用' }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return Response.json({ error: '生成失败' }, { status: 500 })
    }

    // 解析 JSON
    let prompt
    try {
      prompt = JSON.parse(content)
    } catch {
      // 尝试从 markdown 代码块中提取 JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        prompt = JSON.parse(jsonMatch[1])
      } else {
        console.error('Failed to parse prompt:', content)
        return Response.json({ error: '生成格式错误' }, { status: 500 })
      }
    }

    incrementUsage(ip)

    return Response.json({
      category: selectedCategory,
      ...prompt,
    })
  } catch (error) {
    console.error('Prompt generation error:', error)
    return Response.json({ error: '服务内部错误' }, { status: 500 })
  }
}
