'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'

export default function HttpRequestTester() {
  const { lang } = useLang()
  const [url, setUrl] = useState('https://api.example.com')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index, field, value) => {
    const updated = [...headers]
    updated[index][field] = value
    setHeaders(updated)
  }

  const sendRequest = async () => {
    if (!url.trim()) {
      setError(lang === 'zh' ? '请输入URL' : 'Please enter URL')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const requestOptions = {
        method,
        headers: {},
      }

      // 构建headers对象
      headers.forEach(h => {
        if (h.key.trim()) {
          requestOptions.headers[h.key] = h.value
        }
      })

      // 添加body（非GET请求）
      if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
        requestOptions.body = body
        if (!requestOptions.headers['Content-Type']) {
          requestOptions.headers['Content-Type'] = 'application/json'
        }
      }

      const startTime = Date.now()
      const res = await fetch(url, requestOptions)
      const duration = Date.now() - startTime

      // 获取响应头
      const responseHeaders = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // 尝试解析响应体
      let responseBody
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        responseBody = await res.json()
      } else {
        responseBody = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        duration,
        size: JSON.stringify(responseBody).length,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(body)
      setBody(JSON.stringify(parsed, null, 2))
    } catch (e) {
      // 不是有效的JSON，不做处理
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '20px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? 'HTTP请求测试' : 'HTTP Request Tester'}
      </h3>

      {/* URL输入 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com"
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
        />
      </div>

      {/* 方法选择 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '请求方法：' : 'Method:'}
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
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
        >
          {methods.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Headers */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem' }}>
            Headers
          </label>
          <button
            onClick={addHeader}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              color: 'var(--muted)',
              border: '1px dashed var(--border)',
              borderRadius: '2px',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>
        {headers.map((header, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={header.key}
              onChange={(e) => updateHeader(idx, 'key', e.target.value)}
              placeholder="Key"
              style={{
                flex: 1,
                height: '36px',
                padding: '0 8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="text"
              value={header.value}
              onChange={(e) => updateHeader(idx, 'value', e.target.value)}
              placeholder="Value"
              style={{
                flex: 2,
                height: '36px',
                padding: '0 8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {headers.length > 1 && (
              <button
                onClick={() => removeHeader(idx)}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'transparent',
                  color: '#e53e3e',
                  border: '1px solid #e53e3e',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      {method !== 'GET' && method !== 'HEAD' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem' }}>
              Body (JSON)
            </label>
            <button
              onClick={formatJson}
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {lang === 'zh' ? '格式化' : 'Format'}
            </button>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '10px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              backgroundColor: 'transparent',
              color: 'var(--fg)',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* 发送按钮 */}
      <button
        onClick={sendRequest}
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
        {loading ? (lang === 'zh' ? '发送中...' : 'Sending...') : (lang === 'zh' ? '发送请求' : 'Send Request')}
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

      {/* 响应结果 */}
      {response && (
        <div>
          <h4 className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.9rem', marginBottom: '12px' }}>
            {lang === 'zh' ? '响应结果：' : 'Response:'}
          </h4>
          
          {/* 状态码和耗时 */}
          <div style={{ 
            padding: '12px', 
            border: '1px solid var(--border)',
            borderRadius: '4px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span className="font-mono" style={{ 
                fontSize: '1.2rem', 
                fontWeight: 700,
                color: response.status >= 200 && response.status < 300 ? '#38a169' : '#e53e3e',
              }}>
                {response.status} {response.statusText}
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              {response.duration}ms • {response.size} bytes
            </div>
          </div>

          {/* 响应头 */}
          <div style={{ marginBottom: '12px' }}>
            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px' }}>
              Headers
            </div>
            <div style={{ 
              padding: '12px', 
              border: '1px solid var(--border)',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '4px', fontSize: '0.8rem' }}>
                  <span className="font-mono" style={{ color: 'var(--muted)' }}>{key}: </span>
                  <span className="font-mono" style={{ color: 'var(--fg)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 响应体 */}
          <div>
            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '6px' }}>
              Body
            </div>
            <pre style={{ 
              padding: '12px', 
              border: '1px solid var(--border)',
              borderRadius: '4px',
              maxHeight: '400px',
              overflowY: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              color: 'var(--fg)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {typeof response.body === 'object' 
                ? JSON.stringify(response.body, null, 2)
                : response.body
              }
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
