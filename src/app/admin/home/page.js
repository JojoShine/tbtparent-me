'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPut, apiTranslate, inputStyle, textareaStyle, buttonStyle, translateButtonStyle, labelStyle } from '@/lib/admin-utils'

export default function AdminHome() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    apiGet('/api/home').then(setData).catch(console.error)
  }, [])

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleTranslate = async (fromField, toField) => {
    const text = data?.[fromField]
    if (!text) return
    const key = `${fromField}->${toField}`
    setTranslating(prev => ({ ...prev, [key]: true }))
    try {
      const from = fromField.endsWith('_zh') ? 'zh' : 'en'
      const to = fromField.endsWith('_zh') ? 'en' : 'zh'
      const translated = await apiTranslate(text, from, to)
      handleChange(toField, translated)
    } catch (e) {
      setMsg('翻译失败: ' + e.message)
    }
    setTranslating(prev => ({ ...prev, [key]: false }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      await apiPut('/api/home', data)
      setMsg('保存成功 ✓')
    } catch (e) {
      setMsg('保存失败: ' + e.message)
    }
    setSaving(false)
  }

  if (!data) return <p style={{ color: 'var(--muted)' }}>加载中...</p>

  return (
    <div>
      <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)', marginBottom: '24px' }}>
        首页管理
      </h1>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              名称（中文）
              <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['name_zh->name_en']}
                onClick={() => handleTranslate('name_zh', 'name_en')}>
                {translating['name_zh->name_en'] ? '...' : '译→'}
              </button>
            </label>
            <input style={inputStyle} value={data.name_zh || ''} onChange={e => handleChange('name_zh', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>
              Name (English)
              <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['name_en->name_zh']}
                onClick={() => handleTranslate('name_en', 'name_zh')}>
                {translating['name_en->name_zh'] ? '...' : '←译'}
              </button>
            </label>
            <input style={inputStyle} value={data.name_en || ''} onChange={e => handleChange('name_en', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>中文别名</label>
          <input style={inputStyle} value={data.nameZh || ''} onChange={e => handleChange('nameZh', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              标题（中文）
              <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['title_zh->title_en']}
                onClick={() => handleTranslate('title_zh', 'title_en')}>
                {translating['title_zh->title_en'] ? '...' : '译→'}
              </button>
            </label>
            <input style={inputStyle} value={data.title_zh || ''} onChange={e => handleChange('title_zh', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>
              Title (English)
              <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['title_en->title_zh']}
                onClick={() => handleTranslate('title_en', 'title_zh')}>
                {translating['title_en->title_zh'] ? '...' : '←译'}
              </button>
            </label>
            <input style={inputStyle} value={data.title_en || ''} onChange={e => handleChange('title_en', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            简介（中文）
            <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['bio_zh->bio_en']}
              onClick={() => handleTranslate('bio_zh', 'bio_en')}>
              {translating['bio_zh->bio_en'] ? '翻译中...' : '译→'}
            </button>
          </label>
          <textarea style={{ ...textareaStyle, minHeight: '200px' }} value={data.bio_zh || ''} onChange={e => handleChange('bio_zh', e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>
            Bio (English)
            <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['bio_en->bio_zh']}
              onClick={() => handleTranslate('bio_en', 'bio_zh')}>
              {translating['bio_en->bio_zh'] ? '翻译中...' : '←译'}
            </button>
          </label>
          <textarea style={{ ...textareaStyle, minHeight: '200px' }} value={data.bio_en || ''} onChange={e => handleChange('bio_en', e.target.value)} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={buttonStyle} onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
          {msg && <span style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e' }}>{msg}</span>}
        </div>
      </div>
    </div>
  )
}
