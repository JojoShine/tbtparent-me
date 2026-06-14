'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet, apiPost, apiPut, apiDelete, inputStyle, textareaStyle, buttonStyle, secondaryButtonStyle, labelStyle } from '@/lib/admin-utils'

const emptyVideo = { title_zh: '', title_en: '', description_zh: '', description_en: '', cover_url: '', video_url: '', sortOrder: 0 }
const emptyNovel = { title_zh: '', title_en: '', description_zh: '', description_en: '', cover_url: '', external_link: '', status: 'ongoing', sortOrder: 0 }

export default function AdminArchive() {
  const [activeTab, setActiveTab] = useState('novels')
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const load = () => {
    if (activeTab === 'videos') {
      apiGet('/api/archive/videos').then(setItems).catch(console.error)
    } else if (activeTab === 'novels') {
      apiGet('/api/archive/novels').then(setItems).catch(console.error)
    }
  }

  useEffect(() => { load() }, [activeTab])

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      const res = await fetch('/api/archive/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setEditing(prev => ({ ...prev, [field]: data.path }))
        setMsg('图片上传成功，请点击“保存”按钮写入数据库 ✓')
      } else {
        setMsg('上传失败: ' + (data.error || '未知错误'))
      }
    } catch (err) {
      setMsg('上传失败: ' + err.message)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    try {
      const endpoint = activeTab === 'videos' ? '/api/archive/videos' : '/api/archive/novels'
      
      if (editing.id) {
        await apiPut(endpoint, editing)
      } else {
        await apiPost(endpoint, editing)
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
      const endpoint = activeTab === 'videos' ? '/api/archive/videos' : '/api/archive/novels'
      await apiDelete(endpoint, id)
      setMsg('已删除 ✓')
      load()
    } catch (e) {
      setMsg('删除失败: ' + e.message)
    }
  }



  const tabs = [
    { key: 'novels', label: '小说' },
    { key: 'videos', label: '视频' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)' }}>
          收录管理
        </h1>
        <button style={buttonStyle} onClick={() => {
          const empty = activeTab === 'videos' ? emptyVideo : emptyNovel
          setEditing({ ...empty })
        }}>
          + 新增{tabs.find(t => t.key === activeTab)?.label}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              backgroundColor: activeTab === tab.key ? 'var(--fg)' : 'transparent',
              color: activeTab === tab.key ? 'var(--bg)' : 'var(--muted)',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 列表 */}
      {!editing && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', border: '1px solid var(--border)',
            }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{item.title_zh}</span>
                {item.cover_url && <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>有封面</span>}
                {activeTab === 'novels' && item.chapters && item.chapters.length > 0 && (
                  <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>{item.chapters.length}章</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {activeTab === 'novels' && (
                  <Link
                    href={`/admin/archive/chapters?novelId=${item.id}`}
                    style={secondaryButtonStyle}
                  >
                    管理章节
                  </Link>
                )}
                <button style={secondaryButtonStyle} onClick={() => setEditing(item)}>编辑</button>
                <button style={secondaryButtonStyle} onClick={() => handleDelete(item.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? `编辑${tabs.find(t => t.key === activeTab)?.label}` : `新增${tabs.find(t => t.key === activeTab)?.label}`}
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

          <div>
            <label style={labelStyle}>描述（中文）</label>
            <textarea style={textareaStyle} value={editing.description_zh || ''} onChange={e => setEditing(prev => ({ ...prev, description_zh: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Description (English)</label>
            <textarea style={textareaStyle} value={editing.description_en || ''} onChange={e => setEditing(prev => ({ ...prev, description_en: e.target.value }))} />
          </div>

          {/* 封面上传 */}
          <div>
            <label style={labelStyle}>封面图片</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover_url')}
                disabled={uploading}
                style={{ flex: 1 }}
              />
              {uploading && <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>上传中...</span>}
            </div>
            {editing.cover_url && (
              <div style={{ marginTop: '8px' }}>
                <img src={`/api/archive/files?path=${encodeURIComponent(editing.cover_url)}`} alt="Cover" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>{editing.cover_url}</p>
              </div>
            )}
          </div>

          {activeTab === 'videos' && (
            <div>
              <label style={labelStyle}>视频链接</label>
              <input style={inputStyle} value={editing.video_url || ''} onChange={e => setEditing(prev => ({ ...prev, video_url: e.target.value }))} placeholder="https://..." />
            </div>
          )}

          {activeTab === 'novels' && (
            <div>
              <label style={labelStyle}>外部链接（如番茄小说）</label>
              <input style={inputStyle} value={editing.external_link || ''} onChange={e => setEditing(prev => ({ ...prev, external_link: e.target.value }))} placeholder="https://..." />
            </div>
          )}

          {activeTab === 'novels' && (
            <div>
              <label style={labelStyle}>状态</label>
              <div style={{ position: 'relative' }}>
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
                  <span>{editing.status === 'completed' ? '已完结' : editing.status === 'discontinued' ? '停更' : '连载中'}</span>
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
                    {[
                      { value: 'ongoing', label: '连载中' },
                      { value: 'completed', label: '已完结' },
                      { value: 'discontinued', label: '停更' },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => { setEditing(prev => ({ ...prev, status: opt.value })); setStatusOpen(false) }}
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
          )}

          <div>
            <label style={labelStyle}>排序（数字越小越靠前）</label>
            <input style={inputStyle} type="number" value={editing.sortOrder || 0} onChange={e => setEditing(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button style={buttonStyle} onClick={handleSave}>保存</button>
            <button style={secondaryButtonStyle} onClick={() => setEditing(null)}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
