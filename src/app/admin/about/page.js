'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPut, apiTranslate, inputStyle, textareaStyle, buttonStyle, translateButtonStyle, labelStyle } from '@/lib/admin-utils'

export default function AdminAbout() {
  const [data, setData] = useState(null)
  const [techStack, setTechStack] = useState([])
  const [newTech, setNewTech] = useState('')
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState({})
  const [msg, setMsg] = useState('')

  const load = async () => {
    const about = await apiGet('/api/about')
    setData(about)
    const tech = await apiGet('/api/tech-stack')
    setTechStack(tech)
  }
  useEffect(() => { load().catch(console.error) }, [])

  const handleTranslate = async (fromField, toField) => {
    const text = data?.[fromField]
    if (!text) return
    const key = `${fromField}->${toField}`
    setTranslating(prev => ({ ...prev, [key]: true }))
    try {
      const from = fromField.endsWith('_zh') ? 'zh' : 'en'
      const to = fromField.endsWith('_zh') ? 'en' : 'zh'
      const translated = await apiTranslate(text, from, to)
      setData(prev => ({ ...prev, [toField]: translated }))
    } catch (e) {
      setMsg('翻译失败: ' + e.message)
    }
    setTranslating(prev => ({ ...prev, [key]: false }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      await apiPut('/api/about', data)
      setMsg('保存成功 ✓')
    } catch (e) {
      setMsg('保存失败: ' + e.message)
    }
    setSaving(false)
  }

  const handleAddTech = async () => {
    if (!newTech.trim()) return
    try {
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      await fetch('/api/tech-stack', {
        method: 'POST', headers,
        body: JSON.stringify({ name: newTech, sortOrder: techStack.length + 1 }),
      })
      setNewTech('')
      const tech = await apiGet('/api/tech-stack')
      setTechStack(tech)
    } catch (e) {
      setMsg('添加失败: ' + e.message)
    }
  }

  const handleDeleteTech = async (id) => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      await fetch(`/api/tech-stack?id=${id}`, { method: 'DELETE', headers })
      const tech = await apiGet('/api/tech-stack')
      setTechStack(tech)
    } catch (e) {
      setMsg('删除失败: ' + e.message)
    }
  }

  if (!data) return <p style={{ color: 'var(--muted)' }}>加载中...</p>

  return (
    <div>
      <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)', marginBottom: '24px' }}>
        关于页管理
      </h1>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={labelStyle}>
            关于标题（中文）
            <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['bio_zh->bio_en']}
              onClick={() => handleTranslate('bio_zh', 'bio_en')}>
              {translating['bio_zh->bio_en'] ? '...' : '译→'}
            </button>
          </label>
          <input style={inputStyle} value={data.bio_zh || ''} onChange={e => setData({ ...data, bio_zh: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>
            About Title (English)
            <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['bio_en->bio_zh']}
              onClick={() => handleTranslate('bio_en', 'bio_zh')}>
              {translating['bio_en->bio_zh'] ? '...' : '←译'}
            </button>
          </label>
          <input style={inputStyle} value={data.bio_en || ''} onChange={e => setData({ ...data, bio_en: e.target.value })} />
        </div>

        <button style={buttonStyle} onClick={handleSave} disabled={saving} >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* 技术栈管理 */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.2rem', color: 'var(--fg)', marginBottom: '16px' }}>
          技术栈
        </h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input style={{ ...inputStyle, maxWidth: '200px' }} placeholder="添加技术..." value={newTech} onChange={e => setNewTech(e.target.value)} />
          <button style={buttonStyle} onClick={handleAddTech}>添加</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {techStack.map(t => (
            <span key={t.id} style={{
              padding: '4px 10px',
              border: '1px solid var(--border)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--fg)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              {t.name}
              <button
                onClick={() => handleDeleteTech(t.id)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
