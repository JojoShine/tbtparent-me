'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, Play, BookOpen, FileText, ChevronDown, ChevronUp, Film, X } from 'lucide-react'
import { useLang } from '@/hooks/useLang'
import EmptyState from '@/components/ui/EmptyState'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

export default function HobbiesPage() {
  const { lang } = useLang()
  const [videos, setVideos] = useState([])
  const [novels, setNovels] = useState([])
  const [mangas, setMangas] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState('novels')
  const [activeMangaId, setActiveMangaId] = useState(null)
  const [mangaPage, setMangaPage] = useState(1)
  const mangaPageSize = 20
  const [playingEpisode, setPlayingEpisode] = useState(null)

  // ESC 键关闭视频弹窗
  useEffect(() => {
    if (!playingEpisode) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPlayingEpisode(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [playingEpisode])

  useEffect(() => {
    Promise.all([
      fetch('/api/archive/videos').then(r => r.json()),
      fetch('/api/archive/novels').then(r => r.json()),
      fetch('/api/archive/mangas').then(r => r.json()),
    ]).then(([v, n, m]) => {
      setVideos(Array.isArray(v) ? v : [])
      const sortedNovels = Array.isArray(n) ? n.map(novel => ({
        ...novel,
        chapters: novel.chapters ? novel.chapters.sort((a, b) => a.chapter_number - b.chapter_number) : []
      })) : []
      setNovels(sortedNovels)
      const sortedMangas = Array.isArray(m) ? m.map(manga => ({
        ...manga,
        episodes: manga.episodes ? manga.episodes.sort((a, b) => a.episode_number - b.episode_number) : []
      })) : []
      setMangas(sortedMangas)
      // 默认选中第一个漫剧系列
      if (sortedMangas.length > 0) { setActiveMangaId(sortedMangas[0].id); setMangaPage(1) }
      setLoaded(true)
    }).catch(console.error)
  }, [])


  const hasContent = videos.length > 0 || novels.length > 0 || mangas.length > 0
  const activeManga = mangas.find(m => m.id === activeMangaId) || null
  const mangaEpisodes = activeManga?.episodes || []
  const mangaTotalPages = Math.ceil(mangaEpisodes.length / mangaPageSize)
  const mangaPageItems = mangaEpisodes.slice((mangaPage - 1) * mangaPageSize, mangaPage * mangaPageSize)

  if (!loaded) {
    return (
      <div className="max-w-4xl pb-8 md:pb-20" style={{ margin: '0 auto' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      </div>
    )
  }

  if (!hasContent) {
    return (
      <div className="max-w-4xl pb-8 md:pb-20" style={{ margin: '0 auto' }}>
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '16px' }}>
          {lang === 'zh' ? '收录' : 'Archive'}
        </h1>
        <p className="font-mono text-lg" style={{ color: 'var(--muted)' }}>
          {lang === 'zh' ? '内容建设中...' : 'Coming soon...'}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-4xl pb-8 md:pb-20"
      style={{ margin: '0 auto' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* 标题 */}
      <motion.section variants={fadeUp} style={{ marginBottom: '24px' }}>
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)' }}>
          {lang === 'zh' ? '收录' : 'Archive'}
        </h1>
      </motion.section>

      {/* 分类筛选 */}
      <motion.section variants={fadeUp} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'novels', label: lang === 'zh' ? '小说' : 'Novels' },
            { key: 'mangas', label: lang === 'zh' ? '漫剧' : 'Manga' },
            { key: 'videos', label: lang === 'zh' ? '视频' : 'Videos' },
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '6px 16px',
                border: '1px solid var(--border)',
                backgroundColor: activeCategory === cat.key ? 'var(--fg)' : 'transparent',
                color: activeCategory === cat.key ? 'var(--bg)' : 'var(--muted)',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.section>

      {/* 根据分类显示内容 */}
      {/* 小说分类 */}
      {activeCategory === 'novels' && novels.length > 0 && (
        <motion.section variants={fadeUp} style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--fg)', opacity: 0.5 }}>
              {lang === 'zh' ? '小说创作' : 'Novels'}
            </span>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: '8px' }}>
              {novels.length} {lang === 'zh' ? '部' : 'novels'}
            </span>
          </div>
          <div className="space-y-6">
            {novels.map(novel => (
              <div key={novel.id} className="novel-item" style={{ display: 'flex', gap: '16px' }}>
                {/* 左侧：封面图片 */}
                {novel.cover_url && (
                  <div className="novel-cover" style={{ flexShrink: 0, position: 'relative' }}>
                    <img
                      src={`/api/archive/files?path=${encodeURIComponent(novel.cover_url)}`}
                      alt={lang === 'zh' ? novel.title_zh : (novel.title_en || novel.title_zh)}
                      style={{ width: '160px', height: '220px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    {/* 状态标签 */}
                    {novel.status && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '2px 8px',
                          backgroundColor: novel.status === 'completed' ? '#38a169' : novel.status === 'discontinued' ? '#e53e3e' : '#3182ce',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          borderRadius: '2px',
                        }}
                      >
                        {novel.status === 'completed' ? (lang === 'zh' ? '完结' : 'Done') : novel.status === 'discontinued' ? (lang === 'zh' ? '停更' : 'Paused') : (lang === 'zh' ? '连载' : 'Ongoing')}
                      </div>
                    )}
                  </div>
                )}

                {/* 右侧：作品信息和章节列表 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* 作品信息 */}
                  <div style={{ marginBottom: '12px' }}>
                    <div className="font-mono" style={{ color: 'var(--fg)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>
                      {lang === 'zh' ? novel.title_zh : (novel.title_en || novel.title_zh)}
                    </div>
                    {(lang === 'zh' ? novel.description_zh : (novel.description_en || novel.description_zh)) && (
                      <p className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                        {lang === 'zh' ? novel.description_zh : (novel.description_en || novel.description_zh)}
                      </p>
                    )}
                    {novel.external_link && (
                      <a
                        href={novel.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--accent)', fontSize: '0.85rem' }}
                      >
                        {lang === 'zh' ? '阅读完整作品' : 'Read Full Work'} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* 章节列表 - 网格布局，固定高度 */}
                  {novel.chapters && novel.chapters.length > 0 && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                      gap: '6px',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '12px',
                      maxHeight: '280px',
                      overflowY: 'auto',
                    }}>
                      {novel.chapters.map(chapter => (
                        <Link
                          key={chapter.id}
                          href={`/hobbies/${chapter.id}`}
                          className="font-mono"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 6px',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--fg)'
                            e.currentTarget.style.opacity = '0.7'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.opacity = '1'
                          }}
                        >
                          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '3px' }}>
                            {lang === 'zh' ? `第${chapter.chapter_number}章` : `Ch.${chapter.chapter_number}`}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--fg)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                            {lang === 'zh' ? chapter.title_zh : (chapter.title_en || chapter.title_zh)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* 小说分类为空时显示空状态 */}
      {activeCategory === 'novels' && novels.length === 0 && (
        <EmptyState message={lang === 'zh' ? '暂无小说内容' : 'No novels yet'} />
      )}

      {/* 漫剧分类 */}
      {activeCategory === 'mangas' && mangas.length > 0 && (
        <motion.section variants={fadeUp} style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--fg)', opacity: 0.5 }}>
              {lang === 'zh' ? '漫剧' : 'Manga'}
            </span>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: '8px' }}>
              {mangas.length} {lang === 'zh' ? '部' : 'series'}
            </span>
          </div>

          {/* 遍历每个系列 */}
          {mangas.map(manga => {
            const episodes = (manga.episodes || []).sort((a, b) => a.episode_number - b.episode_number)
            const totalEps = episodes.length
            const totalPages = Math.ceil(totalEps / mangaPageSize)
            const pagedEps = episodes.slice((mangaPage - 1) * mangaPageSize, mangaPage * mangaPageSize)
            return (
              <div key={manga.id} style={{ marginBottom: '24px' }}>
                {/* 系列名称 + 状态 */}
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--fg)' }}>
                    {lang === 'zh' ? manga.title_zh : (manga.title_en || manga.title_zh)}
                  </span>
                  {manga.status && (
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      borderRadius: '2px',
                      backgroundColor: manga.status === 'completed' ? '#38a169' : '#3182ce',
                      color: '#fff',
                      fontWeight: 600,
                    }}>
                      {manga.status === 'completed' ? (lang === 'zh' ? '完结' : 'Done') : (lang === 'zh' ? '连载' : 'Ongoing')}
                    </span>
                  )}
                </div>

                {/* 封面网格 - 固定5列 */}
                {episodes.length > 0 && (
                  <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '12px',
                  }}>
                    {pagedEps.map(ep => {
                      const videoSrc = ep.video_url ? (ep.video_url.startsWith('http') ? ep.video_url : `/api/archive/files?path=${encodeURIComponent(ep.video_url)}`) : null
                      const isExternal = ep.video_url?.startsWith('http')
                      return (
                        <div
                          key={ep.id}
                          onClick={() => {
                            if (!videoSrc) return
                            if (isExternal) window.open(videoSrc, '_blank', 'noopener,noreferrer')
                            else setPlayingEpisode(ep)
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: videoSrc ? 'pointer' : 'default',
                            transition: 'opacity 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          <div style={{
                            position: 'relative',
                            width: '100%',
                            paddingBottom: ep.aspect_ratio === 'portrait' ? '130%' : '60%',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--border)',
                          }}>
                            {ep.cover_url ? (
                              <img
                                src={`/api/archive/files?path=${encodeURIComponent(ep.cover_url)}`}
                                alt={lang === 'zh' ? ep.title_zh : (ep.title_en || ep.title_zh)}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Film className="w-5 h-5" style={{ color: 'var(--muted)', opacity: 0.3 }} />
                              </div>
                            )}
                            {videoSrc && (
                              <div style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '24px', height: '24px', borderRadius: '50%',
                                backgroundColor: 'rgba(0,0,0,0.55)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Play className="w-3 h-3" style={{ color: '#fff', marginLeft: '1px' }} fill="#fff" />
                              </div>
                            )}
                            <div style={{
                              position: 'absolute', bottom: '2px', right: '2px',
                              padding: '0 4px', backgroundColor: 'rgba(0,0,0,0.6)',
                              color: '#fff', fontSize: '0.55rem', fontFamily: 'monospace', borderRadius: '2px',
                            }}>
                              {ep.episode_number}
                            </div>
                          </div>
                          <div className="font-mono" style={{
                            fontSize: '0.8rem', color: 'var(--fg)', marginTop: '4px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                          }}>
                            {lang === 'zh' ? ep.title_zh : (ep.title_en || ep.title_zh)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                      <button
                        onClick={() => setMangaPage(p => Math.max(1, p - 1))}
                        disabled={mangaPage === 1}
                        className="font-mono"
                        style={{
                          padding: '4px 10px', fontSize: '0.75rem',
                          border: '1px solid var(--border)', borderRadius: '2px',
                          backgroundColor: 'transparent', color: mangaPage === 1 ? 'var(--border)' : 'var(--muted)',
                          cursor: mangaPage === 1 ? 'default' : 'pointer',
                        }}
                      >
                        {lang === 'zh' ? '上一页' : 'Prev'}
                      </button>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {mangaPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setMangaPage(p => Math.min(totalPages, p + 1))}
                        disabled={mangaPage === totalPages}
                        className="font-mono"
                        style={{
                          padding: '4px 10px', fontSize: '0.75rem',
                          border: '1px solid var(--border)', borderRadius: '2px',
                          backgroundColor: 'transparent', color: mangaPage === totalPages ? 'var(--border)' : 'var(--muted)',
                          cursor: mangaPage === totalPages ? 'default' : 'pointer',
                        }}
                      >
                        {lang === 'zh' ? '下一页' : 'Next'}
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>
            )
          })}
        </motion.section>
      )}

      {activeCategory === 'mangas' && mangas.length === 0 && (
        <EmptyState message={lang === 'zh' ? '暂无漫剧内容' : 'No manga yet'} />
      )}

      {activeCategory === 'videos' && videos.length > 0 && (
        <motion.section variants={fadeUp} style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--fg)', opacity: 0.5 }}>
              {lang === 'zh' ? '视频创作' : 'Videos'}
            </span>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: '8px' }}>
              {videos.length} {lang === 'zh' ? '个' : 'videos'}
            </span>
          </div>
          <div>
            {videos.map(video => (
              <a
                key={video.id}
                href={video.video_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {lang === 'zh' ? video.title_zh : (video.title_en || video.title_zh)}
                  </div>
                  {(lang === 'zh' ? video.description_zh : (video.description_en || video.description_zh)) && (
                    <div className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.8rem', opacity: 0.7 }}>
                      {lang === 'zh' ? video.description_zh : (video.description_en || video.description_zh)}
                    </div>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)', marginLeft: '12px' }} />
              </a>
            ))}
          </div>
        </motion.section>
      )}

      {/* 视频分类为空时显示空状态 */}
      {activeCategory === 'videos' && videos.length === 0 && (
        <EmptyState message={lang === 'zh' ? '暂无视频内容' : 'No videos yet'} />
      )}

      {/* 音频分类始终显示空状态（预留） */}

      {/* 视频播放弹窗 */}
      {playingEpisode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setPlayingEpisode(null)}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setPlayingEpisode(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10000,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X className="w-5 h-5" style={{ color: '#fff' }} />
          </button>
          {/* 标题 */}
          <div className="font-mono" style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '12px', textAlign: 'center', padding: '0 60px' }}>
            {lang === 'zh' ? playingEpisode.title_zh : (playingEpisode.title_en || playingEpisode.title_zh)}
          </div>
          {/* 视频播放器 */}
          <video
            src={playingEpisode.video_url?.startsWith('http') ? playingEpisode.video_url : `/api/archive/files?path=${encodeURIComponent(playingEpisode.video_url)}`}
            controls
            autoPlay
            style={{
              maxWidth: playingEpisode.aspect_ratio === 'portrait' ? '40vh' : '70vw',
              maxHeight: '75vh',
              width: '100%',
              borderRadius: '4px',
              outline: 'none',
              aspectRatio: playingEpisode.aspect_ratio === 'portrait' ? '9/16' : '16/9',
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </motion.div>
  )
}
