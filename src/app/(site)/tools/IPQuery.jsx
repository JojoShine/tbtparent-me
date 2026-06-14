'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'

export default function IPQuery() {
  const { lang } = useLang()
  const [ip, setIp] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 验证IP格式
  const isValidIP = (ipStr) => {
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!regex.test(ipStr)) return false
    return ipStr.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255)
  }

  const queryIP = async () => {
    if (!ip.trim()) {
      setError(lang === 'zh' ? '请输入IP地址' : 'Please enter an IP address')
      return
    }

    if (!isValidIP(ip.trim())) {
      setError(lang === 'zh' ? 'IP地址格式不正确' : 'Invalid IP address format')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // 调用后端API（使用淘宝IP库）
      const response = await fetch('/api/ip-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: ip.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (lang === 'zh' ? '查询失败' : 'Query failed'))
      }

      setResult(data.data)
    } catch (err) {
      console.error('IP query error:', err)
      setError(lang === 'zh' ? '查询失败，请检查网络连接' : 'Query failed, please check your connection')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setIp('')
    setResult(null)
    setError('')
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? 'IP地址查询' : 'IP Address Query'}
      </h3>
      <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '20px' }}>
        {lang === 'zh' 
          ? '查询IP地址的地理位置、运营商、时区等详细信息' 
          : 'Query detailed information about IP address including location, ISP, timezone'}
      </p>

      {/* IP输入 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? 'IP地址：' : 'IP Address:'}
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="例如: 8.8.8.8"
            onKeyDown={(e) => e.key === 'Enter' && queryIP()}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              backgroundColor: 'transparent',
              color: 'var(--fg)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={queryIP}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? 'var(--muted)' : 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s ease',
            }}
          >
            {loading ? (lang === 'zh' ? '查询中...' : 'Querying...') : (lang === 'zh' ? '查询' : 'Query')}
          </button>
        </div>
        {error && (
          <p className="font-mono" style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '6px' }}>
            {error}
          </p>
        )}
      </div>

      {/* 查询结果 */}
      {result && (
        <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', fontSize: '0.85rem' }}>
            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? 'IP地址：' : 'IP:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.ip}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '国家：' : 'Country:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.countryZh || result.country || 'N/A'}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '省份：' : 'Region:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.regionZh || result.region || 'N/A'}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '城市：' : 'City:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.cityZh || result.city || 'N/A'}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '坐标：' : 'Location:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.location}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '运营商：' : 'ISP:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.isp || 'N/A'}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '时区：' : 'Timezone:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.timezone || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* 重置按钮 */}
      {(result || error) && (
        <button
          onClick={reset}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--fg)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          {lang === 'zh' ? '重置' : 'Reset'}
        </button>
      )}
    </div>
  )
}
