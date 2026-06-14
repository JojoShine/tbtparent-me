'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'
import CustomSelect from './CustomSelect'

export default function DNSLookup() {
  const { lang } = useLang()
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [dnsServer, setDnsServer] = useState('223.5.5.5') // 默认使用阿里云DNS
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const recordTypes = [
    { value: 'A', label: 'A (IPv4地址)', desc: lang === 'zh' ? '域名到IPv4地址' : 'Domain to IPv4' },
    { value: 'AAAA', label: 'AAAA (IPv6地址)', desc: lang === 'zh' ? '域名到IPv6地址' : 'Domain to IPv6' },
    { value: 'CNAME', label: 'CNAME (别名)', desc: lang === 'zh' ? '域名别名记录' : 'Domain alias' },
    { value: 'MX', label: 'MX (邮件服务器)', desc: lang === 'zh' ? '邮件交换记录' : 'Mail exchange' },
    { value: 'TXT', label: 'TXT (文本记录)', desc: lang === 'zh' ? '文本信息记录' : 'Text records' },
    { value: 'NS', label: 'NS (名称服务器)', desc: lang === 'zh' ? '域名服务器记录' : 'Name server' },
    { value: 'SOA', label: 'SOA (授权信息)', desc: lang === 'zh' ? '起始授权机构' : 'Start of authority' },
    { value: 'PTR', label: 'PTR (反向解析)', desc: lang === 'zh' ? 'IP到域名反向解析' : 'Reverse lookup' },
  ]
  const dnsServers = [
    { name: 'Aliyun DNS', address: '223.5.5.5' },
    { name: 'Tencent DNS', address: '119.29.29.29' },
    { name: 'Baidu DNS', address: '180.76.76.76' },
    { name: '360 DNS', address: '101.226.4.6' },
  ]

  // 真实DNS查询API
  const queryDNS = async () => {
    if (!domain.trim()) {
      setError(lang === 'zh' ? '请输入域名' : 'Please enter a domain')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      console.log('Frontend: Sending DNS query for', domain, recordType)
      
      const response = await fetch('/api/dns-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain.trim(),
          recordType,
          dnsServer,
        }),
      })

      console.log('Frontend: Response status', response.status)
      
      const data = await response.json()
      console.log('Frontend: Response data', data)

      if (!response.ok) {
        // 优先使用后端返回的message字段
        const errorMsg = data.message || data.error || (lang === 'zh' ? 'DNS查询失败' : 'DNS query failed')
        throw new Error(errorMsg)
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results)
      } else {
        setError(lang === 'zh' 
          ? `未找到 ${domain} 的 ${recordType} 记录` 
          : `No ${recordType} records found for ${domain}`)
      }
    } catch (err) {
      console.error('DNS query error:', err)
      // 如果是网络错误，显示更友好的提示
      const errorMsg = err.message === 'fetch failed' 
        ? (lang === 'zh' ? '网络连接失败，请检查服务器配置' : 'Network connection failed, please check server configuration')
        : err.message || (lang === 'zh' ? '查询出错' : 'Query error')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? 'DNS查询工具' : 'DNS Lookup'}
      </h3>
      <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '20px' }}>
        {lang === 'zh' 
          ? '查询域名的DNS记录，包括A记录、MX记录、CNAME等多种记录类型' 
          : 'Query DNS records for domains, including A records, MX records, CNAME and other record types'}
      </p>

      {/* 域名输入 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '域名：' : 'Domain:'}
        </label>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="例如：google.com 或 baidu.com"
          style={{
            width: '100%',
            height: '40px',
            padding: '0 10px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            backgroundColor: 'transparent',
            color: 'var(--fg)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onKeyPress={(e) => e.key === 'Enter' && queryDNS()}
        />
        <div className="font-mono" style={{ 
          marginTop: '6px', 
          fontSize: '0.75rem', 
          color: 'var(--muted)',
        }}>
          {lang === 'zh' 
            ? '输入域名后选择记录类型进行查询，可获取该域名的DNS解析信息（如IP地址、邮件服务器等）' 
            : 'Enter a domain and select record type to query DNS information (IP addresses, mail servers, etc.)'}
        </div>
      </div>

      {/* 记录类型和DNS服务器 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
            {lang === 'zh' ? '记录类型：' : 'Record Type:'}
          </label>
          <CustomSelect
            value={recordType}
            onChange={(value) => setRecordType(value)}
            options={recordTypes.map(type => ({
              value: type.value,
              label: type.label,
            }))}
            placeholder={lang === 'zh' ? '选择记录类型' : 'Select record type'}
          />
          {/* 记录类型说明 */}
          <div className="font-mono" style={{ 
            marginTop: '6px', 
            fontSize: '0.75rem', 
            color: '#38a169',
          }}>
            {recordTypes.find(t => t.value === recordType)?.desc}
          </div>
        </div>

        <div>
          <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
            {lang === 'zh' ? 'DNS服务器：' : 'DNS Server:'}
          </label>
          <CustomSelect
            value={dnsServer}
            onChange={(value) => setDnsServer(value)}
            options={dnsServers.map(server => ({
              value: server.address,
              label: `${server.name} (${server.address})`,
            }))}
            placeholder={lang === 'zh' ? '选择DNS服务器' : 'Select DNS server'}
          />
        </div>
      </div>

      {/* 查询按钮 */}
      <button
        onClick={queryDNS}
        disabled={loading}
        style={{
          width: '100%',
          height: '40px',
          backgroundColor: loading ? 'var(--muted)' : 'var(--fg)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          marginBottom: '16px',
        }}
      >
        {loading ? (lang === 'zh' ? '查询中...' : 'Querying...') : (lang === 'zh' ? '查询DNS' : 'Query DNS')}
      </button>

      {/* 错误信息 */}
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fed7d7',
          color: '#c53030',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* 查询结果 */}
      {results.length > 0 && (
        <div>
          <h4 className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.9rem', marginBottom: '12px' }}>
            {lang === 'zh' ? `查询结果 - ${domain} 的 ${recordType} 记录：` : `Results - ${recordType} records for ${domain}:`}
          </h4>
          
          <div style={{ display: 'grid', gap: '8px' }}>
            {results.map((result, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="font-mono" style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700,
                    color: '#38a169',
                  }}>
                    {result.type}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    TTL: {result.ttl}s
                  </span>
                </div>
                
                {result.priority !== undefined && (
                  <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '4px' }}>
                    Priority: {result.priority}
                  </div>
                )}
                
                <div className="font-mono" style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--fg)',
                  wordBreak: 'break-all',
                }}>
                  {result.type === 'A' && (
                    <span>
                      {lang === 'zh' ? 'IPv4地址：' : 'IPv4 Address: '}
                      <strong>{result.value}</strong>
                    </span>
                  )}
                  {result.type === 'AAAA' && (
                    <span>
                      {lang === 'zh' ? 'IPv6地址：' : 'IPv6 Address: '}
                      <strong>{result.value}</strong>
                    </span>
                  )}
                  {result.type === 'CNAME' && (
                    <span>
                      {lang === 'zh' ? '别名指向：' : 'Alias to: '}
                      <strong>{result.value}</strong>
                    </span>
                  )}
                  {result.type === 'MX' && (
                    <span>
                      {lang === 'zh' ? '邮件服务器：' : 'Mail Server: '}
                      <strong>{result.value}</strong>
                      {result.priority !== undefined && ` (优先级: ${result.priority})`}
                    </span>
                  )}
                  {result.type === 'TXT' && (
                    <span>
                      {lang === 'zh' ? '文本记录：' : 'TXT Record: '}
                      <strong>{result.value}</strong>
                    </span>
                  )}
                  {result.type === 'NS' && (
                    <span>
                      {lang === 'zh' ? '名称服务器：' : 'Name Server: '}
                      <strong>{result.value}</strong>
                    </span>
                  )}
                  {result.type === 'SOA' && (
                    <span>
                      {lang === 'zh' ? '授权信息：' : 'SOA: '}
                      <strong>{result.value}</strong>
                    </span>
                  )}
                  {!['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA'].includes(result.type) && result.value}
                </div>
              </div>
            ))}
          </div>

          {/* DNS服务器信息 */}
          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'var(--border)',
            borderRadius: '4px',
          }}>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {lang === 'zh' ? '查询自：' : 'Queried from: '} 
              <span style={{ color: 'var(--fg)' }}>{dnsServer}</span>
            </div>
          </div>
        </div>
      )}

      {/* 空状态提示 */}
      {!loading && results.length === 0 && !error && (
        <div className="font-mono" style={{ 
          color: 'var(--muted)', 
          fontSize: '0.8rem', 
          textAlign: 'center',
          padding: '40px 0',
        }}>
          {lang === 'zh' ? '输入域名后点击查询' : 'Enter a domain and click Query'}
        </div>
      )}
    </div>
  )
}
