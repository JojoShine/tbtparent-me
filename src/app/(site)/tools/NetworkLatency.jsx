'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'
import CustomSelect from './CustomSelect'

export default function NetworkLatency() {
  const { lang } = useLang()
  const [targets, setTargets] = useState([
    { name: 'Google DNS', address: '8.8.8.8', results: [] },
    { name: 'Cloudflare DNS', address: '1.1.1.1', results: [] },
    { name: 'Baidu', address: 'www.baidu.com', results: [] },
  ])
  const [customTarget, setCustomTarget] = useState('')
  const [testing, setTesting] = useState(false)
  const [testCount, setTestCount] = useState(4)

  // 模拟Ping测试（实际项目中需要使用后端API）
  const ping = async (address) => {
    return new Promise((resolve) => {
      const start = Date.now()
      // 模拟网络延迟
      const delay = Math.random() * 100 + 10
      setTimeout(() => {
        const latency = Date.now() - start + delay
        resolve({
          latency: Math.round(latency),
          success: true,
          timestamp: new Date().toLocaleTimeString(),
        })
      }, delay)
    })
  }

  const runTest = async () => {
    setTesting(true)
    
    const updatedTargets = [...targets]
    for (let i = 0; i < updatedTargets.length; i++) {
      const results = []
      for (let j = 0; j < testCount; j++) {
        const result = await ping(updatedTargets[i].address)
        results.push(result)
      }
      updatedTargets[i].results = results
    }
    
    setTargets(updatedTargets)
    setTesting(false)
  }

  const addCustomTarget = () => {
    if (!customTarget.trim()) return
    setTargets([...targets, { 
      name: customTarget, 
      address: customTarget, 
      results: [] 
    }])
    setCustomTarget('')
  }

  const removeTarget = (index) => {
    setTargets(targets.filter((_, i) => i !== index))
  }

  const getStats = (results) => {
    if (results.length === 0) return null
    const latencies = results.map(r => r.latency)
    const min = Math.min(...latencies)
    const max = Math.max(...latencies)
    const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    return { min, max, avg }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? '网络延迟测试' : 'Network Latency Test'}
      </h3>
      <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '20px' }}>
        {lang === 'zh' 
          ? '测试到多个目标地址的网络延迟，支持自定义测试次数和目标地址' 
          : 'Test network latency to multiple target addresses, with customizable test count and custom targets'}
      </p>

      {/* 测试配置 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '测试次数：' : 'Test Count:'}
        </label>
        <CustomSelect
          value={String(testCount)}
          onChange={(value) => setTestCount(parseInt(value))}
          options={[
            { value: '4', label: lang === 'zh' ? '4次' : '4 times' },
            { value: '8', label: lang === 'zh' ? '8次' : '8 times' },
            { value: '16', label: lang === 'zh' ? '16次' : '16 times' },
          ]}
          placeholder={lang === 'zh' ? '选择测试次数' : 'Select test count'}
          className="test-count-select"
        />

        {/* 添加自定义目标 */}
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
            {lang === 'zh' ? '添加测试目标（IP或域名）：' : 'Add Target (IP or Domain):'}
          </label>
          <div className="add-target-container" style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder={lang === 'zh' ? '例如：8.8.8.8 或 google.com' : 'e.g., 8.8.8.8 or google.com'}
              className="add-target-input"
              style={{
                flex: 1,
                height: '48px',
                padding: '0 16px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 'normal',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={addCustomTarget}
              className="add-target-btn"
              style={{
                padding: '0 16px',
                height: '48px',
                backgroundColor: 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {lang === 'zh' ? '添加' : 'Add'}
            </button>
          </div>
        </div>

        {/* 测试按钮 */}
        <button
          onClick={runTest}
          disabled={testing}
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: testing ? 'var(--muted)' : 'var(--fg)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            cursor: testing ? 'not-allowed' : 'pointer',
            opacity: testing ? 0.6 : 1,
          }}
        >
          {testing ? (lang === 'zh' ? '测试中...' : 'Testing...') : (lang === 'zh' ? '开始测试' : 'Start Test')}
        </button>
      </div>

      {/* 测试结果 */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {targets.map((target, idx) => {
          const stats = getStats(target.results)
          return (
            <div key={idx} style={{ 
              padding: '16px', 
              border: '1px solid var(--border)',
              borderRadius: '4px',
            }}>
              <div className="target-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span className="font-mono" style={{ color: 'var(--fg)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {target.name}
                  </span>
                  <span className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: '8px' }}>
                    {target.address}
                  </span>
                </div>
                {idx >= 3 && (
                  <button
                    onClick={() => removeTarget(idx)}
                    className="remove-target-btn"
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'transparent',
                      color: '#e53e3e',
                      border: '1px solid #e53e3e',
                      borderRadius: '2px',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'zh' ? '删除' : 'Delete'}
                  </button>
                )}
              </div>

              {stats ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'var(--border)', borderRadius: '4px' }}>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>
                        {lang === 'zh' ? '最小' : 'Min'}
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.1rem', color: '#38a169', fontWeight: 700 }}>
                        {stats.min}ms
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'var(--border)', borderRadius: '4px' }}>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>
                        {lang === 'zh' ? '平均' : 'Avg'}
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--fg)', fontWeight: 700 }}>
                        {stats.avg}ms
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'var(--border)', borderRadius: '4px' }}>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>
                        {lang === 'zh' ? '最大' : 'Max'}
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.1rem', color: '#ed8936', fontWeight: 700 }}>
                        {stats.max}ms
                      </div>
                    </div>
                  </div>

                  {/* 详细结果 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {target.results.map((result, rIdx) => (
                      <div 
                        key={rIdx}
                        style={{
                          padding: '6px',
                          backgroundColor: 'var(--border)',
                          borderRadius: '2px',
                          textAlign: 'center',
                        }}
                      >
                        <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                          #{rIdx + 1}
                        </div>
                        <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--fg)' }}>
                          {result.latency}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
                  {lang === 'zh' ? '点击开始测试' : 'Click to start test'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          /* 移动端添加目标改为垂直布局 */
          .add-target-container {
            display: block !important;
            gap: 12px !important;
          }
          
          .add-target-input,
          .add-target-btn {
            width: 100% !important;
            height: 48px !important;
            padding: 0 16px !important;
            font-size: 0.9rem !important;
            line-height: normal !important;
            margin-bottom: 12px !important;
          }
          
          /* 移动端测试目标头部改为垂直布局 */
          .target-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          
          /* 移动端删除按钮占满宽度 */
          .remove-target-btn {
            width: 100% !important;
            padding: 10px !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  )
}
