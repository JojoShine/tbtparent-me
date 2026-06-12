'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, apiTranslate, inputStyle, textareaStyle, buttonStyle, secondaryButtonStyle, translateButtonStyle, labelStyle } from '@/lib/admin-utils'

const emptyTool = {
  name_zh: '', name_en: '',
  description_zh: '', description_en: '',
  link: '', available: false, sortOrder: 0,
}

export default function AdminTools() {
  const [tools, setTools] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [translating, setTranslating] = useState({})

  const load = () => apiGet('/api/tools').then(setTools).catch(console.error)
  useEffect(() => { load() }, [])

  const handleChange = (field, value) => {
    setEditing(prev => ({ ...prev, [field]: value }))
  }

  const handleTranslate = async (fromField, toField) => {
    const text = editing?.[fromField]
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
    try {
      if (editing.id) {
        await apiPut('/api/tools', editing)
      } else {
        await apiPost('/api/tools', editing)
      }
      setEditing(null)
      setMsg('保存成功 ✓')
      load()
    } catch (e) {
      setMsg('保存失败: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除？')) return
    try {
      await apiDelete('/api/tools', id)
      setMsg('已删除 ✓')
      load()
    } catch (e) {
      setMsg('删除失败: ' + e.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)' }}>
          工具管理
        </h1>
        <button style={buttonStyle} onClick={() => setEditing({ ...emptyTool })}>
          + 新增工具
        </button>
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 工具列表 */}
      {!editing && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {tools.map(t => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', border: '1px solid var(--border)',
            }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{t.name_zh}</span>
                <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: t.available ? '#38a169' : 'var(--muted)' }}>
                  {t.available ? '可用' : '不可用'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={secondaryButtonStyle} onClick={() => setEditing(t)}>编辑</button>
                <button style={secondaryButtonStyle} onClick={() => handleDelete(t.id)}>删除</button>
              </div>
            </div>
          ))}
          {tools.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>暂无工具</p>}
        </div>
      )}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? '编辑工具' : '新增工具'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                名称（中文）
                <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['name_zh->name_en']}
                  onClick={() => handleTranslate('name_zh', 'name_en')}>
                  {translating['name_zh->name_en'] ? '...' : '译→'}
                </button>
              </label>
              <input style={inputStyle} value={editing.name_zh} onChange={e => handleChange('name_zh', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>
                Name (English)
                <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['name_en->name_zh']}
                  onClick={() => handleTranslate('name_en', 'name_zh')}>
                  {translating['name_en->name_zh'] ? '...' : '←译'}
                </button>
              </label>
              <input style={inputStyle} value={editing.name_en} onChange={e => handleChange('name_en', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              描述（中文）
              <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['description_zh->description_en']}
                onClick={() => handleTranslate('description_zh', 'description_en')}>
                {translating['description_zh->description_en'] ? '翻译中...' : '译→'}
              </button>
            </label>
            <textarea style={textareaStyle} value={editing.description_zh} onChange={e => handleChange('description_zh', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>
              Description (English)
              <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['description_en->description_zh']}
                onClick={() => handleTranslate('description_en', 'description_zh')}>
                {translating['description_en->description_zh'] ? '翻译中...' : '←译'}
              </button>
            </label>
            <textarea style={textareaStyle} value={editing.description_en} onChange={e => handleChange('description_en', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>工具地址</label>
              <input style={inputStyle} value={editing.link} onChange={e => handleChange('link', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label style={labelStyle}>排序</label>
              <input style={inputStyle} type="number" value={editing.sortOrder} onChange={e => handleChange('sortOrder', parseInt(e.target.value))} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--fg)' }}>
            <input type="checkbox" checked={editing.available} onChange={e => handleChange('available', e.target.checked)} />
            可用
          </label>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={buttonStyle} onClick={handleSave}>保存</button>
            <button style={secondaryButtonStyle} onClick={() => { setEditing(null); setMsg('') }}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
