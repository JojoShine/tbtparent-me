/**
 * 公开 API 限流工具
 * 基于 IP + 日期的内存限流（无需外部依赖）
 */

const limitMap = new Map()

function getIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 检查并增加限流计数
 * @param {Request} request
 * @param {number} dailyLimit - 每日限额
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function checkRateLimit(request, dailyLimit) {
  const ip = getIP(request)
  const today = getToday()
  const key = `${ip}_${today}`
  const entry = limitMap.get(key) || { count: 0 }

  if (entry.count >= dailyLimit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  limitMap.set(key, entry)
  return { allowed: true, remaining: dailyLimit - entry.count }
}

/**
 * 返回限流错误响应
 */
export function rateLimitResponse(dailyLimit) {
  return Response.json(
    { error: `今日请求次数已达上限（${dailyLimit}/${dailyLimit}），明日再试` },
    { status: 429 }
  )
}

// 定期清理过期条目（每小时清理一次）
setInterval(() => {
  const today = getToday()
  for (const key of limitMap.keys()) {
    if (!key.endsWith(`_${today}`)) {
      limitMap.delete(key)
    }
  }
}, 60 * 60 * 1000)
