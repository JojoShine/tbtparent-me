import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
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
    const baiduAK = 'XGK56chBrXrRbZPIlFwVfmy0VNFIGBtD'
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

    // 尝试从address字段提取更多信息
    // address格式: "CN|北京|北京|None|CHINANET|0|0"
    const addressParts = content.address ? content.address.split('|') : []
    let ispFromAddress = addressParts.length >= 5 && addressParts[4] !== 'None' ? addressParts[4] : null

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
        country: '中国',  // 百度API默认返回中国数据
        region: addressDetail.province || 'N/A',  // 省份
        city: addressDetail.city || 'N/A',        // 城市（地级市）
        location: point.x && point.y ? `${point.y}, ${point.x} (BD09)` : 'N/A',  // 纬度, 经度 (百度坐标系)
        isp: ispFromAddress || 'N/A',  // 运营商（直接返回原始值）
        timezone: 'Asia/Shanghai',  // 默认中国时区
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
