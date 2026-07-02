import { NextResponse } from 'next/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const DAILY_LIMIT = 100

// 创建带超时的 fetch
function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId))
}

export async function POST(request) {
  let ip = null
  try {
    // 限流检查
    const { allowed } = checkRateLimit(request, DAILY_LIMIT)
    if (!allowed) {
      return rateLimitResponse(DAILY_LIMIT)
    }

    const body = await request.json()
    ip = body.ip

    if (!ip) {
      return NextResponse.json(
        { error: '请输入IP地址' },
        { status: 400 }
      )
    }

    // 验证IP格式
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(ip)) {
      return NextResponse.json(
        { error: 'IP地址格式不正确' },
        { status: 400 }
      )
    }

    // 检测私有/内网IP，外部API无法查询
    const isPrivateIP = (addr) => {
      const parts = addr.split('.').map(Number)
      return parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        parts[0] === 127 ||
        parts[0] === 0
    }
    if (isPrivateIP(ip)) {
      return NextResponse.json(
        { error: '无法查询内网/私有IP地址，请输入公网IP' },
        { status: 400 }
      )
    }

    // 优先使用百度地图IP定位API（国内最准确）
    const baiduAK = process.env.BAIDU_IP_AK
    if (!baiduAK) {
      throw new Error('Baidu IP API key not configured')
    }
    const apiUrl = `https://api.map.baidu.com/location/ip?ak=${baiduAK}&ip=${encodeURIComponent(ip)}&coor=bd09ll`

    // 百度查地理位置，ipwho.is 查运营商+时区，并行发起
    const baiduPromise = fetchWithTimeout(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }, 5000)

    // ipwho.is 返回 connection.isp + timezone.id
    const ispPromise = fetchWithTimeout(
      `https://ipwho.is/${ip}`,
      { method: 'GET' },
      4000
    ).catch(() => null)

    const response = await baiduPromise

    if (!response.ok) {
      throw new Error(`Baidu IP query failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // 百度API返回格式检查
    if (data.status !== 0) {
      throw new Error(data.message || 'Baidu IP query failed')
    }

    // 解析百度返回的数据
    const content = data.content
    const addressDetail = content.address_detail
    const point = content.point

    // 从 address_detail 获取国家信息（更可靠）
    // nation: "Saudi Arabia", nation_code: "SAU"
    const nationCode3 = addressDetail.nation_code || '' // 3字母代码如 SAU
    const nationName = addressDetail.nation || '' // 英文名如 Saudi Arabia

    // 从顶层 address 提取2字母国家代码作为备用
    // 顶层 data.address 格式: "SA|Riyadh|Riyadh|None|None|100|0|0"
    const topAddressParts = data.address ? data.address.split('|') : []
    const countryCode2 = topAddressParts[0] || '' // 2字母代码如 SA

    // 运营商从顶层 address 提取（百度通常不返回，作为优先源）
    let isp = topAddressParts.length >= 5 && topAddressParts[4] !== 'None' ? topAddressParts[4] : null
    let timezone = null

    // 百度没有运营商时，用已并行的 ipwho.is 补充
    if (!isp) {
      try {
        const ispResp = await ispPromise
        if (ispResp && ispResp.ok) {
          const ispData = await ispResp.json()
          if (ispData.connection?.isp) isp = ispData.connection.isp
          if (ispData.timezone?.id) timezone = ispData.timezone.id
        }
      } catch { /* 备用失败不影响主流程 */ }
    }

    // 3字母国家代码映射为中文名
    const countryMap3 = {
      'CHN': '中国',
      'USA': '美国',
      'JPN': '日本',
      'KOR': '韩国',
      'GBR': '英国',
      'DEU': '德国',
      'FRA': '法国',
      'SAU': '沙特阿拉伯',
      'RUS': '俄罗斯',
      'AUS': '澳大利亚',
      'CAN': '加拿大',
      'SGP': '新加坡',
      'HKG': '中国香港',
      'TWN': '中国台湾',
      'MAC': '中国澳门',
    }
    // 2字母国家代码映射为中文名
    const countryMap2 = {
      'CN': '中国',
      'US': '美国',
      'JP': '日本',
      'KR': '韩国',
      'GB': '英国',
      'DE': '德国',
      'FR': '法国',
      'SA': '沙特阿拉伯',
      'RU': '俄罗斯',
      'AU': '澳大利亚',
      'CA': '加拿大',
      'SG': '新加坡',
      'HK': '中国香港',
      'TW': '中国台湾',
      'MO': '中国澳门',
    }
    const country = countryMap3[nationCode3] || countryMap2[countryCode2] || nationName || countryCode2 || 'N/A'

    // 时区：优先用 ipwho.is 返回的，否则中国IP默认 Asia/Shanghai
    if (!timezone) {
      const isCN = countryCode2 === 'CN' || nationCode3 === 'CHN'
      timezone = isCN ? 'Asia/Shanghai' : 'N/A'
    }

    // 转换为前端需要的格式
    return NextResponse.json({
      success: true,
      data: {
        ip: ip,
        country: country,
        region: addressDetail.province || 'N/A',
        city: addressDetail.city || 'N/A',
        location: point.x && point.y ? `${point.y}, ${point.x} (BD09)` : 'N/A',
        isp: isp || 'N/A',
        timezone: timezone,
      }
    })

  } catch (error) {
    console.error('IP query error:', error)
    
    // 如果百度API失败，尝试备用API（ipwho.is）
    try {
      if (!ip) throw new Error('No IP address')
      const backupUrl = `https://ipwho.is/${ip}`
      
      console.log('Trying backup API:', backupUrl)
      
      const backupResponse = await fetchWithTimeout(backupUrl, { method: 'GET' }, 5000)

      if (!backupResponse.ok) {
        throw new Error(`Backup API failed: ${backupResponse.status}`)
      }

      const backupData = await backupResponse.json()

      if (!backupData.success) {
        throw new Error(backupData.message || 'Backup API failed')
      }

      return NextResponse.json({
        success: true,
        data: {
          ip: backupData.ip,
          country: backupData.country || 'N/A',
          region: backupData.region || 'N/A',
          city: backupData.city || 'N/A',
          location: backupData.latitude && backupData.longitude ? `${backupData.latitude}, ${backupData.longitude}` : 'N/A',
          isp: backupData.connection?.isp || 'N/A',
          timezone: backupData.timezone?.id || 'N/A',
        },
        source: 'backup'
      })

    } catch (backupError) {
      console.error('Backup API also failed:', backupError)
      
      return NextResponse.json(
        { 
          error: 'IP query failed',
          message: error.message || 'Unknown error'
        },
        { status: 500 }
      )
    }
  }
}
