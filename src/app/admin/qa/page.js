'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, inputStyle, textareaStyle, buttonStyle, secondaryButtonStyle, labelStyle } from '@/lib/admin-utils'

const emptyQA = { title_zh: '', title_en: '', tags_zh: [], tags_en: [], content_zh: '', content_en: '', sortOrder: 0 }

export default function AdminQA() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [tagInputZh, setTagInputZh] = useState('')
  const [tagInputEn, setTagInputEn] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = () => {
    apiGet('/api/qa').then(setItems).catch(console.error)
  }

  const handleSave = async () => {
    try {
      if (editing.id) {
        await apiPut('/api/qa', editing)
      } else {
        await apiPost('/api/qa', editing)
      }
      setEditing(null)
      setTagInputZh('')
      setTagInputEn('')
      setMsg('保存成功 ✓')
      load()
    } catch (e) {
      setMsg('保存失败: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除？')) return
    try {
      await apiDelete('/api/qa', id)
      setMsg('已删除 ✓')
      load()
    } catch (e) {
      setMsg('删除失败: ' + e.message)
    }
  }

  const addTag = (lang) => {
    const input = lang === 'zh' ? tagInputZh : tagInputEn
    if (!input.trim()) return
    
    const field = lang === 'zh' ? 'tags_zh' : 'tags_en'
    setEditing(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), input.trim()]
    }))
    
    if (lang === 'zh') {
      setTagInputZh('')
    } else {
      setTagInputEn('')
    }
  }

  const removeTag = (lang, index) => {
    const field = lang === 'zh' ? 'tags_zh' : 'tags_en'
    setEditing(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleKeyDown = (e, lang) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(lang)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)' }}>
          问题集管理
        </h1>
        {!editing && (
          <button style={buttonStyle} onClick={() => setEditing({ ...emptyQA })}>
            + 新增问题
          </button>
        )}
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '32px', padding: '20px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? '编辑问题' : '新增问题'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>标题（中文）</label>
              <input style={inputStyle} value={editing.title_zh} onChange={e => setEditing(prev => ({ ...prev, title_zh: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Title (English)</label>
              <input style={inputStyle} value={editing.title_en} onChange={e => setEditing(prev => ({ ...prev, title_en: e.target.value }))} />
            </div>
          </div>

          {/* 标签管理 */}
          <div>
            <label style={labelStyle}>标签（中文）</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={tagInputZh}
                onChange={e => setTagInputZh(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'zh')}
                placeholder="输入标签后按回车添加"
              />
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => addTag('zh')}
              >
                添加
              </button>
            </div>
            {editing.tags_zh && editing.tags_zh.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {editing.tags_zh.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      backgroundColor: 'var(--border)',
                      color: 'var(--muted)',
                      borderRadius: '2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag('zh', idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.9rem',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Tags (English)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={tagInputEn}
                onChange={e => setTagInputEn(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'en')}
                placeholder="Enter tag and press Enter"
              />
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => addTag('en')}
              >
                Add
              </button>
            </div>
            {editing.tags_en && editing.tags_en.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {editing.tags_en.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      backgroundColor: 'var(--border)',
                      color: 'var(--muted)',
                      borderRadius: '2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag('en', idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.9rem',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>内容 Markdown（中文）</label>
            <textarea style={{ ...textareaStyle, minHeight: '300px', fontFamily: 'monospace' }} value={editing.content_zh || ''} onChange={e => setEditing(prev => ({ ...prev, content_zh: e.target.value }))} placeholder="支持 Markdown 格式..." />
          </div>
          <div>
            <label style={labelStyle}>Content (English Markdown)</label>
            <textarea style={{ ...textareaStyle, minHeight: '300px', fontFamily: 'monospace' }} value={editing.content_en || ''} onChange={e => setEditing(prev => ({ ...prev, content_en: e.target.value }))} placeholder="Supports Markdown format..." />
          </div>

          <div>
            <label style={labelStyle}>排序（数字越小越靠前）</label>
            <input style={inputStyle} type="number" value={editing.sortOrder || 0} onChange={e => setEditing(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button style={buttonStyle} onClick={handleSave}>保存</button>
            <button style={secondaryButtonStyle} onClick={() => { setEditing(null); setTagInputZh(''); setTagInputEn('') }}>取消</button>
          </div>
        </div>
      )}

      {/* 列表 */}
      {!editing && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {items.length === 0 ? (
            <p style={{ fontFamily: 'monospace', color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>
              暂无问题，点击右上方按钮添加
            </p>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', border: '1px solid var(--border)',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{item.title_zh}</span>
                  {item.tags_zh && item.tags_zh.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {item.tags_zh.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            backgroundColor: 'var(--border)',
                            color: 'var(--muted)',
                            borderRadius: '2px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                  <button style={secondaryButtonStyle} onClick={() => setEditing(item)}>编辑</button>
                  <button style={secondaryButtonStyle} onClick={() => handleDelete(item.id)}>删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
