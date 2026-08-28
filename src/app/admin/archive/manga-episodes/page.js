'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiPost, apiPut, apiDelete, inputStyle, buttonStyle, secondaryButtonStyle, labelStyle } from '@/lib/admin-utils'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const emptyEpisode = { mangaId: null, episode_number: 0, title_zh: '', title_en: '', cover_url: '', video_url: '', aspect_ratio: 'landscape', sortOrder: 0 }

export default function AdminMangaEpisodes() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mangaId = searchParams.get('mangaId')
  const [episodes, setEpisodes] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [mangaTitle, setMangaTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  useEffect(() => {
    if (!mangaId) {
      router.push('/admin/archive')
      return
    }
    loadEpisodes()
    loadMangaInfo()
  }, [mangaId])

  const loadEpisodes = () => {
    apiGet(`/api/archive/manga-episodes?mangaId=${mangaId}`)
      .then(setEpisodes)
      .catch(console.error)
  }

  const loadMangaInfo = async () => {
    try {
      const mangas = await apiGet('/api/archive/mangas')
      const manga = mangas.find(m => m.id === parseInt(mangaId))
      if (manga) setMangaTitle(manga.title_zh)
    } catch (e) {
      console.error(e)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      const res = await fetch('/api/archive/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setEditing(prev => ({ ...prev, cover_url: data.path }))
        setMsg('封面上传成功，请点击"保存"按钮写入数据库 ✓')
      } else {
        setMsg('上传失败: ' + (data.error || '未知错误'))
      }
    } catch (err) {
      setMsg('上传失败: ' + err.message)
    }
    setUploading(false)
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingVideo(true)
    try {
      // 先检测视频横竖屏
      const videoEl = document.createElement('video')
      videoEl.preload = 'metadata'
      const objectUrl = URL.createObjectURL(file)
      videoEl.src = objectUrl
      await new Promise((resolve) => {
        videoEl.onloadedmetadata = () => {
          const ratio = videoEl.videoWidth > videoEl.videoHeight ? 'landscape' : 'portrait'
          setEditing(prev => ({ ...prev, aspect_ratio: ratio }))
          URL.revokeObjectURL(objectUrl)
          resolve()
        }
        videoEl.onerror = () => {
          URL.revokeObjectURL(objectUrl)
          resolve()
        }
      })

      const formData = new FormData()
      formData.append('file', file)
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
      const res = await fetch('/api/archive/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setEditing(prev => ({ ...prev, video_url: data.path }))
        setMsg('视频上传成功，请点击"保存"按钮写入数据库 ✓')
      } else {
        setMsg('上传失败: ' + (data.error || '未知错误'))
      }
    } catch (err) {
      setMsg('上传失败: ' + err.message)
    }
    setUploadingVideo(false)
  }

  const handleSave = async () => {
    try {
      if (editing.id) {
        await apiPut('/api/archive/manga-episodes', editing)
      } else {
        await apiPost('/api/archive/manga-episodes', editing)
      }
      setEditing(null)
      setMsg('集数保存成功 ✓')
      setCurrentPage(1)
      loadEpisodes()
    } catch (e) {
      setMsg('保存失败: ' + e.message)
    }
  }

  const [deleteTarget, setDeleteTarget] = useState(null)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await apiDelete('/api/archive/manga-episodes', deleteTarget)
      setMsg('集数已删除 ✓')
      loadEpisodes()
    } catch (e) {
      setMsg('删除失败: ' + e.message)
    }
    setDeleteTarget(null)
  }

  const totalPages = Math.ceil(episodes.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedEpisodes = episodes.slice(startIndex, startIndex + pageSize)

  if (!mangaId) return null

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/archive"
          className="font-mono"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 0', background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none',
          }}
        >
          ← 返回书影管理
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--fg)' }}>
            集数管理
          </h1>
          {mangaTitle && (
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
              《{mangaTitle}》
            </p>
          )}
        </div>
        {!editing && (
          <button style={buttonStyle} onClick={() => setEditing({ ...emptyEpisode, mangaId: parseInt(mangaId) })}>
            + 新增集数
          </button>
        )}
      </div>

      {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('✓') ? '#38a169' : '#e53e3e', marginBottom: '16px' }}>{msg}</p>}

      {/* 编辑表单 */}
      {editing && (
        <div style={{ display: 'grid', gap: '12px', marginBottom: '32px', padding: '20px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--fg)' }}>
            {editing.id ? '编辑集数' : '新增集数'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>集数序号</label>
              <input style={inputStyle} type="number" value={editing.episode_number || 0} onChange={e => setEditing(prev => ({ ...prev, episode_number: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label style={labelStyle}>排序</label>
              <input style={inputStyle} type="number" value={editing.sortOrder || 0} onChange={e => setEditing(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

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
            <label style={labelStyle}>视频（上传文件或填写外部链接）</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <input type="file" accept="video/*,.mov,.mp4,.avi,.mkv,.wmv,.flv,.webm" onChange={handleVideoUpload} disabled={uploadingVideo} style={{ flex: 1 }} />
              {uploadingVideo && <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>上传中...</span>}
            </div>
            <input style={inputStyle} value={editing.video_url || ''} onChange={e => setEditing(prev => ({ ...prev, video_url: e.target.value }))} placeholder="外部链接 https://... 或上传文件后自动填入" />
            {editing.video_url && editing.video_url.startsWith('http') && (
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>外部链接: {editing.video_url}</p>
            )}
          </div>

          {/* 视频比例 */}
          <div>
            <label style={labelStyle}>观看比例</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { value: 'landscape', label: '横屏 16:9' },
                { value: 'portrait', label: '竖屏 9:16' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEditing(prev => ({ ...prev, aspect_ratio: opt.value }))}
                  style={{
                    padding: '6px 16px',
                    border: '1px solid var(--border)',
                    backgroundColor: editing.aspect_ratio === opt.value ? 'var(--fg)' : 'transparent',
                    color: editing.aspect_ratio === opt.value ? 'var(--bg)' : 'var(--muted)',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 封面上传 */}
          <div>
            <label style={labelStyle}>封面图片</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ flex: 1 }} />
              {uploading && <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>上传中...</span>}
            </div>
            {editing.cover_url && (
              <div style={{ marginTop: '8px' }}>
                <img src={`/api/archive/files?path=${encodeURIComponent(editing.cover_url)}`} alt="Cover" style={{ maxWidth: '150px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>{editing.cover_url}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button style={buttonStyle} onClick={handleSave}>保存</button>
            <button style={secondaryButtonStyle} onClick={() => setEditing(null)}>取消</button>
          </div>
        </div>
      )}

      {/* 集数列表 */}
      {!editing && (
        <div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {paginatedEpisodes.length === 0 ? (
              <p style={{ fontFamily: 'monospace', color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>
                暂无集数，点击右上方按钮添加
              </p>
            ) : (
              paginatedEpisodes.map(ep => (
                <div key={ep.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {ep.cover_url && (
                      <img src={`/api/archive/files?path=${encodeURIComponent(ep.cover_url)}`} alt="" style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '2px' }} />
                    )}
                    <div>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--fg)' }}>{ep.title_zh}</span>
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>第{ep.episode_number}集</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={secondaryButtonStyle} onClick={() => setEditing(ep)}>编辑</button>
                    <button style={secondaryButtonStyle} onClick={() => { setDeleteTarget(ep.id) }}>删除</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div style={{
              marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
            }}>
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                style={{ ...secondaryButtonStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ← 上一页
              </button>
              <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--muted)', minWidth: '80px', textAlign: 'center' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                style={{ ...secondaryButtonStyle, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                下一页 →
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除这个集数吗？删除后无法恢复。"
      />
    </div>
  )
}
