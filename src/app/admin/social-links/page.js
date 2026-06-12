'use client'

import { useState, useEffect, useRef } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, inputStyle, buttonStyle, secondaryButtonStyle, labelStyle } from '@/lib/admin-utils'

const emptyLink = {
  name: '', url: '', icon: 'mail', sortOrder: 0,
}

const iconOptions = [
  { value: 'mail', label: '邮箱' },
  { value: 'wechat', label: '微信' },
]

export default function AdminSocialLinks() {
  const [links, setLinks] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [iconOpen, setIconOpen] = useState(false)
  const iconRef = useRef(null)

  const load = () => apiGet('/api/social-links').then(setLinks).catch(console.error)
  useEffect(() => { load() }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (iconRef.current && !iconRef.current.contains(e.target)) {
        setIconOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field, value) => {
    setEditing(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (editing.id) {
        await apiPut('/api/social-links', editing)
      } else {
        await apiPost('/api/social-links', editing)
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
      await apiDelete('/api/social-links', id)
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
          社交链接
        </h1>
        <button style={buttonStyle} onClick={() => setEditing({ ...emptyLink })}>
          + 新增链接
        </button>
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 列表 */}
      {!editing && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {links.map(l => (
            <div key={l.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', border: '1px solid var(--border)',
            }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{l.name}</span>
                <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--muted)' }}>{l.icon}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={secondaryButtonStyle} onClick={() => setEditing(l)}>编辑</button>
                <button style={secondaryButtonStyle} onClick={() => handleDelete(l.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? '编辑链接' : '新增链接'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>显示名称</label>
              <input style={inputStyle} value={editing.name} onChange={e => handleChange('name', e.target.value)} placeholder="如: tbtparent@163.com" />
            </div>
            <div>
              <label style={labelStyle}>链接地址</label>
              <input style={inputStyle} value={editing.url} onChange={e => handleChange('url', e.target.value)} placeholder="mailto:xxx 或 #" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>图标类型</label>
              <div ref={iconRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => setIconOpen(!iconOpen)}
                  style={{
                    ...inputStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span>{iconOptions.find(o => o.value === editing.icon)?.label}</span>
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'var(--muted)',
                    transition: 'transform 0.15s ease',
                    transform: iconOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▼</span>
                </div>
                {iconOpen && (
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
                    {iconOptions.map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => { handleChange('icon', opt.value); setIconOpen(false) }}
                        style={{
                          padding: '8px 12px',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: editing.icon === opt.value ? 'var(--fg)' : 'var(--muted)',
                          backgroundColor: editing.icon === opt.value ? 'var(--border)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={e => { if (editing.icon !== opt.value) e.currentTarget.style.backgroundColor = 'var(--border)' }}
                        onMouseLeave={e => { if (editing.icon !== opt.value) e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
