'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { localizedField } from '@/lib/i18n-helpers'
import EmptyState from '@/components/ui/EmptyState'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } }
}

function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  )
}

export default function BlogPage() {
  const { lang, t } = useLang()
  const [blogs, setBlogs] = useState([])
  const [allTags, setAllTags] = useState([])
  const [activeTag, setActiveTag] = useState('')
  const [loaded, setLoaded] = useState(false)

  const loadBlogs = (tag = '') => {
    const params = new URLSearchParams({ status: 'published', page: '1', pageSize: '100' })
    if (tag) params.set('tag', tag)
    fetch(`/api/blog?${params}`)
      .then(r => r.json())
      .then(data => {
        const list = data.blogs || data
        setBlogs(Array.isArray(list) ? list : [])
        if (data.allTags) setAllTags(data.allTags)
        setLoaded(true)
      })
      .catch(console.error)
  }

  useEffect(() => { loadBlogs() }, [])

  const handleTagClick = (tag) => {
    const newTag = activeTag === tag ? '' : tag
    setActiveTag(newTag)
    loadBlogs(newTag)
  }

  const formatShortDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${m}-${day}`
  }

  // 按年份分组
  const groupedByYear = {}
  blogs.forEach(blog => {
    const dateStr = blog.published_at || blog.createdAt
    const year = dateStr ? new Date(dateStr).getFullYear() : '未知'
    if (!groupedByYear[year]) groupedByYear[year] = []
    groupedByYear[year].push(blog)
  })
  const years = Object.keys(groupedByYear).sort((a, b) => b - a)

  return (
    <motion.div
      className="max-w-3xl py-8 md:py-20"
      style={{ margin: '0 auto' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      <motion.section variants={fadeUp} style={{ marginBottom: '24px' }}>
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)' }}>
          {t('nav.blog')}
        </h1>
      </motion.section>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <motion.section variants={fadeUp} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleTagClick('')}
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                padding: '4px 12px',
                border: '1px solid',
                borderColor: !activeTag ? 'var(--fg)' : 'var(--border)',
                backgroundColor: !activeTag ? 'var(--fg)' : 'transparent',
                color: !activeTag ? 'var(--bg)' : 'var(--muted)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {lang === 'zh' ? '全部' : 'All'}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="font-mono"
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  border: '1px solid',
                  borderColor: activeTag === tag ? 'var(--fg)' : 'var(--border)',
                  backgroundColor: activeTag === tag ? 'var(--fg)' : 'transparent',
                  color: activeTag === tag ? 'var(--bg)' : 'var(--muted)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* 按年份分组的文章列表 */}
      {years.map(year => (
        <motion.section
          key={year}
          variants={fadeUp}
          style={{ marginBottom: '40px', position: 'relative' }}
        >
          {/* 年份背景大字 */}
          <div
            className="font-mono"
            style={{
              position: 'absolute',
              top: '-20px',
              right: '0',
              fontSize: '6rem',
              fontWeight: 900,
              lineHeight: 1,
              color: 'var(--fg)',
              opacity: 0.04,
              userSelect: 'none',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {year}
          </div>

          {/* 年份标题 */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '12px' }}>
            <span
              className="font-mono"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--fg)',
                opacity: 0.5,
              }}
            >
              {year}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: '0.7rem',
                color: 'var(--muted)',
                marginLeft: '8px',
              }}
            >
              {groupedByYear[year].length} {lang === 'zh' ? '篇' : 'posts'}
            </span>
          </div>

          {/* 文章目录列表 */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {groupedByYear[year].map(blog => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {/* 左侧：pin + 标题 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  {blog.pinned && (
                    <span style={{ color: 'var(--fg)', opacity: 0.5, flexShrink: 0 }}>
                      <PinIcon />
                    </span>
                  )}
                  <span
                    className="font-mono"
                    style={{
                      color: 'var(--fg)',
                      fontSize: '0.9rem',
                      fontWeight: blog.pinned ? 700 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {localizedField(blog, 'title', lang)}
                  </span>
                </div>

                {/* 右侧：标签 + 日期 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                  {(lang === 'zh' ? blog.tags_zh : blog.tags_en)?.slice(0, 1).map(tag => (
                    <span
                      key={tag}
                      className="font-mono"
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--muted)',
                        backgroundColor: 'var(--border)',
                        padding: '1px 6px',
                        borderRadius: '2px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    className="font-mono"
                    style={{ color: 'var(--muted)', fontSize: '0.75rem', minWidth: '42px', textAlign: 'right' }}
                  >
                    {formatShortDate(blog.published_at || blog.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      ))}

      {!loaded && blogs.length === 0 && (
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      )}
      {loaded && years.length === 0 && (
        <EmptyState
          message={activeTag ? (lang === 'zh' ? `「${activeTag}」下暂无文章` : `No posts tagged "${activeTag}"`) : (lang === 'zh' ? '暂无文章' : 'No posts yet')}
          actionLabel={activeTag ? (lang === 'zh' ? '查看全部' : 'View all') : null}
          onAction={activeTag ? () => handleTagClick('') : null}
        />
      )}
    </motion.div>
  )
}
