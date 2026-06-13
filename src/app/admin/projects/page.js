'use client'

import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, apiTranslate, inputStyle, textareaStyle, buttonStyle, secondaryButtonStyle, translateButtonStyle, labelStyle } from '@/lib/admin-utils'

const emptyProject = {
  name_zh: '', name_en: '',
  description_zh: '', description_en: '',
  content_zh: '', content_en: '',
  tags_zh: [], tags_en: [],
  deadline_zh: '', deadline_en: '',
  link: '#', github: '', demo_url: '',
  project_type: 'pc', sortOrder: 0,
}

const typeOptions = [
  { value: 'mobile', label: '手机' },
  { value: 'pc', label: 'PC' },
  { value: 'dashboard', label: '大屏' },
]

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [translating, setTranslating] = useState({})

  const load = () => apiGet('/api/projects').then(setProjects).catch(console.error)
  useEffect(() => { load() }, [])

  const handleChange = (field, value) => {
    setEditing(prev => ({ ...prev, [field]: value }))
  }

  const handleTagsChange = (lang, value) => {
    const key = `tags_${lang}`
    setEditing(prev => ({ ...prev, [key]: value.split(',').map(s => s.trim()).filter(Boolean) }))
  }

  const handleTranslate = async (fromField, toField) => {
    const raw = editing?.[fromField]
    if (!raw) return
    const text = Array.isArray(raw) ? raw.join(', ') : raw
    if (!text) return
    const key = `${fromField}->${toField}`
    setTranslating(prev => ({ ...prev, [key]: true }))
    try {
      const from = fromField.endsWith('_zh') ? 'zh' : 'en'
      const to = fromField.endsWith('_zh') ? 'en' : 'zh'
      const translated = await apiTranslate(text, from, to)
      if (Array.isArray(raw)) {
        handleChange(toField, translated.split(',').map(s => s.trim()).filter(Boolean))
      } else {
        handleChange(toField, translated)
      }
    } catch (e) {
      setMsg('翻译失败: ' + e.message)
    }
    setTranslating(prev => ({ ...prev, [key]: false }))
  }

  const handleSave = async () => {
    try {
      if (editing.id) {
        await apiPut('/api/projects', editing)
      } else {
        await apiPost('/api/projects', editing)
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
      await apiDelete('/api/projects', id)
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
          项目管理
        </h1>
        <button style={buttonStyle} onClick={() => setEditing({ ...emptyProject })}>
          + 新增项目
        </button>
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 项目列表 */}
      {!editing && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {projects.map(p => (
            <div key={p.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', border: '1px solid var(--border)',
            }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{p.name_zh}</span>
                <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--muted)' }}>{p.deadline_zh}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={secondaryButtonStyle} onClick={() => setEditing(p)}>编辑</button>
                <button style={secondaryButtonStyle} onClick={() => handleDelete(p.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? '编辑项目' : '新增项目'}
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
            <textarea style={{ ...textareaStyle, minHeight: '120px' }} value={editing.description_en} onChange={e => handleChange('description_en', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>
              详细介绍（中文 Markdown）
              <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['content_zh->content_en']}
                onClick={() => handleTranslate('content_zh', 'content_en')}>
                {translating['content_zh->content_en'] ? '翻译中...' : '译→'}
              </button>
            </label>
            <textarea style={{ ...textareaStyle, minHeight: '200px', fontFamily: 'monospace' }} value={editing.content_zh || ''} onChange={e => handleChange('content_zh', e.target.value)} placeholder="支持 Markdown 格式..." />
          </div>
          <div>
            <label style={labelStyle}>
              Detail (English Markdown)
              <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['content_en->content_zh']}
                onClick={() => handleTranslate('content_en', 'content_zh')}>
                {translating['content_en->content_zh'] ? '翻译中...' : '←译'}
              </button>
            </label>
            <textarea style={{ ...textareaStyle, minHeight: '200px', fontFamily: 'monospace' }} value={editing.content_en || ''} onChange={e => handleChange('content_en', e.target.value)} placeholder="Supports Markdown format..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                标签（中文，逗号分隔）
                <button type="button" style={translateButtonStyle} data-tooltip="将中文标签翻译为英文" disabled={translating['tags_zh->tags_en']}
                  onClick={() => handleTranslate('tags_zh', 'tags_en')}>
                  {translating['tags_zh->tags_en'] ? '...' : '译→'}
                </button>
              </label>
              <input style={inputStyle} value={(editing.tags_zh || []).join(', ')} onChange={e => handleTagsChange('zh', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>
                Tags (English, comma separated)
                <button type="button" style={translateButtonStyle} data-tooltip="将英文标签翻译为中文" disabled={translating['tags_en->tags_zh']}
                  onClick={() => handleTranslate('tags_en', 'tags_zh')}>
                  {translating['tags_en->tags_zh'] ? '...' : '←译'}
                </button>
              </label>
              <input style={inputStyle} value={(editing.tags_en || []).join(', ')} onChange={e => handleTagsChange('en', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                计划时间（中文）
                <button type="button" style={translateButtonStyle} data-tooltip="将中文翻译为英文" disabled={translating['deadline_zh->deadline_en']}
                  onClick={() => handleTranslate('deadline_zh', 'deadline_en')}>
                  {translating['deadline_zh->deadline_en'] ? '...' : '译→'}
                </button>
              </label>
              <input style={inputStyle} value={editing.deadline_zh} onChange={e => handleChange('deadline_zh', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>
                Deadline (English)
                <button type="button" style={translateButtonStyle} data-tooltip="将英文翻译为中文" disabled={translating['deadline_en->deadline_zh']}
                  onClick={() => handleTranslate('deadline_en', 'deadline_zh')}>
                  {translating['deadline_en->deadline_zh'] ? '...' : '←译'}
                </button>
              </label>
              <input style={inputStyle} value={editing.deadline_en} onChange={e => handleChange('deadline_en', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>GitHub 地址</label>
              <input style={inputStyle} value={editing.github || ''} onChange={e => handleChange('github', e.target.value)} placeholder="https://github.com/..." />
            </div>
            <div>
              <label style={labelStyle}>演示地址</label>
              <input style={inputStyle} value={editing.demo_url || ''} onChange={e => handleChange('demo_url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label style={labelStyle}>项目类型</label>
              <div style={{ display: 'flex', gap: '0', border: '1px solid var(--border)' }}>
                {typeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('project_type', opt.value)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      fontWeight: editing.project_type === opt.value ? 700 : 400,
                      backgroundColor: editing.project_type === opt.value ? 'var(--fg)' : 'transparent',
                      color: editing.project_type === opt.value ? 'var(--bg)' : 'var(--muted)',
                      border: 'none',
                      borderRight: opt !== typeOptions[typeOptions.length - 1] ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>链接</label>
              <input style={inputStyle} value={editing.link} onChange={e => handleChange('link', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>排序</label>
              <input style={inputStyle} type="number" value={editing.sortOrder} onChange={e => handleChange('sortOrder', parseInt(e.target.value))} />
            </div>
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
