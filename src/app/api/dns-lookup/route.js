import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { domain, recordType, dnsServer } = await request.json()

    if (!domain || !recordType) {
      return NextResponse.json(
        { error: 'Domain and record type are required' },
        { status: 400 }
      )
    }

    // 尝试多个DNS API，优先使用国内可用的服务
    const apis = [
      {
        name: 'Aliyun DNS',
        url: `https://dns.alidns.com/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`,
      },
      {
        name: 'Tencent DNS',
        url: `https://doh.pub/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`,
      },
      {
        name: '360 DNS',
        url: `https://doh.360.cn/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`,
      },
    ]

    let lastError = null

    for (const api of apis) {
      try {
        console.log(`Trying ${api.name}:`, api.url)

        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'Accept': api.name === 'Cloudflare DNS' ? 'application/dns-json' : 'application/dns-json',
          },
          next: { revalidate: 60 },
        })

        if (!response.ok) {
          throw new Error(`${api.name} failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`${api.name} Response:`, JSON.stringify(data).substring(0, 200))

        // Cloudflare和Google的响应格式略有不同
        const answers = data.Answer || data.answer || []

        // 转换API响应格式为我们需要的格式
        const results = []

        if (answers && answers.length > 0) {
          answers.forEach(answer => {
            const result = {
              type: getRecordTypeName(answer.type),
              value: formatRecordValue(answer.type, answer.data || answer.rdata),
              ttl: answer.TTL || answer.ttl,
            }

            // MX记录需要特殊处理优先级
            if (answer.type === 15) { // MX type
              const parts = (answer.data || answer.rdata || '').split(' ')
              result.priority = parseInt(parts[0])
              result.value = parts.slice(1).join(' ')
            }

            results.push(result)
          })
        }

        // 返回结果
        return NextResponse.json({
          domain,
          recordType,
          dnsServer,
          results,
          status: data.Status || 0,
          source: api.name,
        })
      } catch (apiError) {
        console.error(`${api.name} error:`, apiError.message)
        lastError = apiError
        continue // 尝试下一个API
      }
    }

    // 所有API都失败
    throw lastError || new Error('All DNS APIs failed')

  } catch (error) {
    console.error('DNS lookup error:', error)
    return NextResponse.json(
      { 
        error: 'DNS query failed',
        message: error.message,
        results: [],
      },
      { status: 500 }
    )
  }
}

// DNS记录类型映射（数字到字符串）
function getRecordTypeName(typeNum) {
  const typeMap = {
    1: 'A',
    2: 'NS',
    5: 'CNAME',
    6: 'SOA',
    12: 'PTR',
    15: 'MX',
    16: 'TXT',
    28: 'AAAA',
    33: 'SRV',
    255: 'ANY',
  }
  return typeMap[typeNum] || `TYPE${typeNum}`
}

// 格式化记录值
function formatRecordValue(type, value) {
  if (!value) return 'N/A'

  switch (type) {
    case 1: // A
    case 28: // AAAA
      return value.trim()
    case 5: // CNAME
      return value.replace(/\.$/, '') // 移除末尾的点
    case 15: // MX
      return value.replace(/\.$/, '').split(' ').slice(1).join(' ')
    case 16: // TXT
      // 移除TXT记录的引号
      return value.replace(/^"|"$/g, '')
    case 2: // NS
      return value.replace(/\.$/, '')
    case 6: // SOA
      return value.replace(/\.$/g, '').replace(/\s+/g, ' ')
    default:
      return value
  }
}
