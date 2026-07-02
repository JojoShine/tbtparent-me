import { NextResponse } from 'next/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const DAILY_LIMIT = 100

export async function POST(request) {
  try {
    // 限流检查
    const { allowed } = checkRateLimit(request, DAILY_LIMIT)
    if (!allowed) {
      return rateLimitResponse(DAILY_LIMIT)
    }

    const { ip } = await request.json()

    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      )
    }

    // 验证IP格式
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(ip)) {
      return NextResponse.json(
        { error: 'Invalid IP address format' },
        { status: 400 }
      )
    }

    // 优先使用百度地图IP定位API（国内最准确）
    const baiduAK = process.env.BAIDU_IP_AK
    if (!baiduAK) {
      throw new Error('Baidu IP API key not configured')
    }
    const apiUrl = `https://api.map.baidu.com/location/ip?ak=${baiduAK}&ip=${encodeURIComponent(ip)}&coor=bd09ll`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // 缓存5分钟
    })

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

    // 运营商从顶层 address 提取
    let ispFromAddress = topAddressParts.length >= 5 && topAddressParts[4] !== 'None' ? topAddressParts[4] : null

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

    // 根据 countryCode 决定时区
    const isCN = countryCode2 === 'CN' || nationCode3 === 'CHN'
    const timezone = isCN ? 'Asia/Shanghai' : 'N/A'

    // 如果百度API没有返回运营商信息，尝试使用备用API查询
    if (!ispFromAddress || ispFromAddress === 'None') {
      try {
        const backupUrl = `http://ip-api.com/json/${ip}?fields=isp`
        
        const backupResponse = await fetch(backupUrl, {
          method: 'GET',
        })

        if (backupResponse.ok) {
          const backupData = await backupResponse.json()
          if (backupData.isp) {
            ispFromAddress = backupData.isp
          }
        }
      } catch (backupError) {
        // 备用API失败不影响主流程，继续使用N/A
      }
    }

    // 转换为前端需要的格式
    return NextResponse.json({
      success: true,
      data: {
        ip: ip,
        country: country,
        region: addressDetail.province || 'N/A',  // 省份
        city: addressDetail.city || 'N/A',        // 城市（地级市）
        location: point.x && point.y ? `${point.y}, ${point.x} (BD09)` : 'N/A',  // 纬度, 经度 (百度坐标系)
        isp: ispFromAddress || 'N/A',  // 运营商（直接返回原始值）
        timezone: timezone,
      }
    })

  } catch (error) {
    console.error('IP query error:', error)
    
    // 如果淘宝API失败，尝试备用API（ip-api.com）
    try {
      const { ip } = await request.json()
      const backupUrl = `http://ip-api.com/json/${ip}?lang=zh-CN`
      
      console.log('Trying backup API:', backupUrl)
      
      const backupResponse = await fetch(backupUrl, {
        method: 'GET',
      })

      if (!backupResponse.ok) {
        throw new Error(`Backup API failed: ${backupResponse.status}`)
      }

      const backupData = await backupResponse.json()

      if (backupData.status === 'fail') {
        throw new Error(backupData.message || 'Backup API failed')
      }

      return NextResponse.json({
        success: true,
        data: {
          ip: backupData.query,
          country: backupData.country,
          region: backupData.regionName,
          city: backupData.city,
          location: `${backupData.lat}, ${backupData.lon}`,
          isp: backupData.isp,
          timezone: backupData.timezone,
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
