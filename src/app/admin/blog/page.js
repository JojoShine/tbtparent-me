'use client'

import { useState, useEffect, useRef } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, apiTranslate, getHeaders, inputStyle, textareaStyle, buttonStyle, secondaryButtonStyle, translateButtonStyle, labelStyle } from '@/lib/admin-utils'

const emptyBlog = {
  title_zh: '', title_en: '',
  slug: '',
  excerpt_zh: '', excerpt_en: '',
  content_zh: '', content_en: '',
  status: 'draft',
}

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [translating, setTranslating] = useState({})
  const [statusOpen, setStatusOpen] = useState(false)
  const statusRef = useRef(null)

  const statusOptions = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '发布' },
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const load = () => apiGet('/api/blog').then(setBlogs).catch(console.error)
  useEffect(() => { load() }, [])

  const handleChange = (field, value) => {
    setEditing(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (editing.id) {
        await apiPut('/api/blog', editing)
      } else {
        await apiPost('/api/blog', editing)
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
      await apiDelete('/api/blog', id)
      setMsg('已删除 ✓')
      load()
    } catch (e) {
      setMsg('删除失败: ' + e.message)
    }
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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !editing?.id) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('blogId', editing.id)
      const res = await fetch('/api/blog/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setMsg(`图片已上传: ${data.url}`)
      }
    } catch (e) {
      setMsg('上传失败: ' + e.message)
    }
    setUploading(false)
  }

  const statusLabel = (s) => s === 'published' ? '已发布' : '草稿'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)' }}>
          博客管理
        </h1>
        <button style={buttonStyle} onClick={() => setEditing({ ...emptyBlog })}>
          + 新增文章
        </button>
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 文章列表 */}
      {!editing && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {blogs.map(b => (
            <div key={b.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', border: '1px solid var(--border)',
            }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{b.title_zh}</span>
                <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--muted)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '2px' }}>
                  {statusLabel(b.status)}
                </span>
                <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>/{b.slug}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={secondaryButtonStyle} onClick={() => setEditing(b)}>编辑</button>
                <button style={secondaryButtonStyle} onClick={() => handleDelete(b.id)}>删除</button>
              </div>
            </div>
          ))}
          {blogs.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>暂无文章</p>}
        </div>
      )}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? '编辑文章' : '新增文章'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                标题（中文）
                <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['title_zh->title_en']}
                  onClick={() => handleTranslate('title_zh', 'title_en')}>
                  {translating['title_zh->title_en'] ? '...' : '译→'}
                </button>
              </label>
              <input style={inputStyle} value={editing.title_zh} onChange={e => handleChange('title_zh', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>
                Title (English)
                <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['title_en->title_zh']}
                  onClick={() => handleTranslate('title_en', 'title_zh')}>
                  {translating['title_en->title_zh'] ? '...' : '←译'}
                </button>
              </label>
              <input style={inputStyle} value={editing.title_en} onChange={e => handleChange('title_en', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Slug</label>
            <input style={inputStyle} value={editing.slug} onChange={e => handleChange('slug', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>
              摘要（中文）
              <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['excerpt_zh->excerpt_en']}
                onClick={() => handleTranslate('excerpt_zh', 'excerpt_en')}>
                {translating['excerpt_zh->excerpt_en'] ? '...' : '译→'}
              </button>
            </label>
            <textarea style={textareaStyle} value={editing.excerpt_zh} onChange={e => handleChange('excerpt_zh', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>
              Excerpt (English)
              <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['excerpt_en->excerpt_zh']}
                onClick={() => handleTranslate('excerpt_en', 'excerpt_zh')}>
                {translating['excerpt_en->excerpt_zh'] ? '...' : '←译'}
              </button>
            </label>
            <textarea style={textareaStyle} value={editing.excerpt_en} onChange={e => handleChange('excerpt_en', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>
              内容 Markdown（中文）
              <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['content_zh->content_en']}
                onClick={() => handleTranslate('content_zh', 'content_en')}>
                {translating['content_zh->content_en'] ? '翻译中...' : '译→'}
              </button>
            </label>
            <textarea style={{ ...textareaStyle, minHeight: '200px' }} value={editing.content_zh} onChange={e => handleChange('content_zh', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>
              Content Markdown (English)
              <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['content_en->content_zh']}
                onClick={() => handleTranslate('content_en', 'content_zh')}>
                {translating['content_en->content_zh'] ? '翻译中...' : '←译'}
              </button>
            </label>
            <textarea style={{ ...textareaStyle, minHeight: '200px' }} value={editing.content_en} onChange={e => handleChange('content_en', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>状态</label>
              <div ref={statusRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => setStatusOpen(!statusOpen)}
                  style={{
                    ...inputStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span>{statusOptions.find(o => o.value === editing.status)?.label}</span>
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'var(--muted)',
                    transition: 'transform 0.15s ease',
                    transform: statusOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▼</span>
                </div>
                {statusOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    backgroundColor: 'var(--bg)',
                  }}>
                    {statusOptions.map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => { handleChange('status', opt.value); setStatusOpen(false) }}
                        style={{
                          padding: '8px 12px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          backgroundColor: editing.status === opt.value ? 'var(--border)' : 'transparent',
                          color: editing.status === opt.value ? 'var(--fg)' : 'var(--muted)',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border)'}
                        onMouseLeave={e => { if (editing.status !== opt.value) e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {editing.id && (
              <div>
                <label style={labelStyle}>上传图片（MinIO）</label>
                <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ ...inputStyle, padding: '6px' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={buttonStyle} onClick={handleSave}>保存</button>
            <button style={secondaryButtonStyle} onClick={() => { setEditing(null); setMsg('') }}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
