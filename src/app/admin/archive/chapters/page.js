'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiPost, apiPut, apiDelete, inputStyle, textareaStyle, buttonStyle, secondaryButtonStyle, labelStyle } from '@/lib/admin-utils'

const emptyChapter = { novelId: null, chapter_number: 0, title_zh: '', title_en: '', content_zh: '', content_en: '', sortOrder: 0 }

export default function AdminChapters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const novelId = searchParams.get('novelId')
  const [chapters, setChapters] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [novelTitle, setNovelTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    if (!novelId) {
      router.push('/admin/archive')
      return
    }
    loadChapters()
    loadNovelInfo()
  }, [novelId])

  const loadChapters = () => {
    apiGet(`/api/archive/chapters?novelId=${novelId}`)
      .then(setChapters)
      .catch(console.error)
  }

  const loadNovelInfo = async () => {
    try {
      const novels = await apiGet('/api/archive/novels')
      const novel = novels.find(n => n.id === parseInt(novelId))
      if (novel) {
        setNovelTitle(novel.title_zh)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async () => {
    try {
      if (editing.id) {
        await apiPut('/api/archive/chapters', editing)
      } else {
        await apiPost('/api/archive/chapters', editing)
      }
      setEditing(null)
      setMsg('章节保存成功 ✓')
      setCurrentPage(1) // 重置到第一页
      loadChapters()
    } catch (e) {
      setMsg('保存失败: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除此章节？')) return
    try {
      await apiDelete('/api/archive/chapters', id)
      setMsg('章节已删除 ✓')
      loadChapters()
    } catch (e) {
      setMsg('删除失败: ' + e.message)
    }
  }

  // 分页计算
  const totalPages = Math.ceil(chapters.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedChapters = chapters.slice(startIndex, endIndex)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (!novelId) return null

  return (
    <div>
      {/* 返回按钮 */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/archive"
          className="font-mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 0',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          ← 返回收录管理
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)' }}>
            章节管理
          </h1>
          {novelTitle && (
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
              《{novelTitle}》
            </p>
          )}
        </div>
        {!editing && (
          <button style={buttonStyle} onClick={() => setEditing({ ...emptyChapter, novelId: parseInt(novelId) })}>
            + 新增章节
          </button>
        )}
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '32px', padding: '20px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? '编辑章节' : '新增章节'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>章节序号</label>
              <input style={inputStyle} type="number" value={editing.chapter_number || 0} onChange={e => setEditing(prev => ({ ...prev, chapter_number: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label style={labelStyle}>排序（数字越小越靠前）</label>
              <input style={inputStyle} type="number" value={editing.sortOrder || 0} onChange={e => setEditing(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>章节标题（中文）</label>
              <input style={inputStyle} value={editing.title_zh} onChange={e => setEditing(prev => ({ ...prev, title_zh: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Chapter Title (English)</label>
              <input style={inputStyle} value={editing.title_en} onChange={e => setEditing(prev => ({ ...prev, title_en: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>内容 Markdown（中文）</label>
            <textarea style={{ ...textareaStyle, minHeight: '300px', fontFamily: 'monospace' }} value={editing.content_zh || ''} onChange={e => setEditing(prev => ({ ...prev, content_zh: e.target.value }))} placeholder="支持 Markdown 格式..." />
          </div>
          <div>
            <label style={labelStyle}>Content (English Markdown)</label>
            <textarea style={{ ...textareaStyle, minHeight: '300px', fontFamily: 'monospace' }} value={editing.content_en || ''} onChange={e => setEditing(prev => ({ ...prev, content_en: e.target.value }))} placeholder="Supports Markdown format..." />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button style={buttonStyle} onClick={handleSave}>保存</button>
            <button style={secondaryButtonStyle} onClick={() => setEditing(null)}>取消</button>
          </div>
        </div>
      )}

      {/* 章节列表 */}
      {!editing && (
        <div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {paginatedChapters.length === 0 ? (
              <p style={{ fontFamily: 'monospace', color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>
                暂无章节，点击右上方按钮添加
              </p>
            ) : (
              paginatedChapters.map(chapter => (
                <div key={chapter.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', border: '1px solid var(--border)',
                }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{chapter.title_zh}</span>
                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>第{chapter.chapter_number}章</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={secondaryButtonStyle} onClick={() => setEditing(chapter)}>编辑</button>
                    <button style={secondaryButtonStyle} onClick={() => handleDelete(chapter.id)}>删除</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div style={{ 
              marginTop: '24px', 
              paddingTop: '16px', 
              borderTop: '1px solid var(--border)',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  ...secondaryButtonStyle,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← 上一页
              </button>
              
              <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--muted)', minWidth: '80px', textAlign: 'center' }}>
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  ...secondaryButtonStyle,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                下一页 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
