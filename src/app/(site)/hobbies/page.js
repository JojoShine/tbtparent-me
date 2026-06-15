'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, Play, BookOpen, FileText, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [loaded, setLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    Promise.all([
      fetch('/api/archive/videos').then(r => r.json()),
      fetch('/api/archive/novels').then(r => r.json()),
    ]).then(([v, n]) => {
      setVideos(Array.isArray(v) ? v : [])
      // 对每部小说的章节按 chapter_number 升序排序
      const sortedNovels = Array.isArray(n) ? n.map(novel => ({
        ...novel,
        chapters: novel.chapters ? novel.chapters.sort((a, b) => a.chapter_number - b.chapter_number) : []
      })) : []
      setNovels(sortedNovels)
      setLoaded(true)
    }).catch(console.error)
  }, [])


  const hasContent = videos.length > 0 || novels.length > 0

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
            { key: 'all', label: lang === 'zh' ? '全部' : 'All' },
            { key: 'novels', label: lang === 'zh' ? '小说' : 'Novels' },
            { key: 'videos', label: lang === 'zh' ? '视频' : 'Videos' },
            { key: 'audios', label: lang === 'zh' ? '音频' : 'Audios' },
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
      {(activeCategory === 'all' || activeCategory === 'videos') && videos.length > 0 && (
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

      {(activeCategory === 'all' || activeCategory === 'novels') && novels.length > 0 && (
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

      {/* 音频分类始终显示空状态（预留） */}
      {activeCategory === 'audios' && (
        <EmptyState message={lang === 'zh' ? '音频内容建设中...' : 'Audio coming soon...'} />
      )}

      {/* 全部分类但没有任何内容时显示空状态 */}
      {activeCategory === 'all' && videos.length === 0 && novels.length === 0 && (
        <EmptyState message={lang === 'zh' ? '内容建设中...' : 'Content under construction...'} />
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .novel-item {
            flex-direction: column !important;
          }
          .novel-cover img {
            width: 100% !important;
            height: auto !important;
            max-height: 200px;
          }
        }
      `}</style>
    </motion.div>
  )
}
