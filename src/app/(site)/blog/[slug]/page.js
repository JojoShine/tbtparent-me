'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useLang } from '@/hooks/useLang'
import { localizedField } from '@/lib/i18n-helpers'

function extractHeadings(markdown) {
  if (!markdown) return []
  const lines = markdown.split('\n')
  const headings = []
  let inCodeBlock = false
  const slugCounts = {} // 处理重复 slug
  lines.forEach(line => {
    if (line.trim().startsWith('```')) { inCodeBlock = !inCodeBlock; return }
    if (inCodeBlock) return
    const match = line.match(/^(#{1,4})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`~\[\]]/g, '').trim()
      // github-slugger 算法
      let slug = text.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
      // 处理重复 slug
      if (slugCounts[slug] !== undefined) {
        slugCounts[slug]++
        slug = `${slug}-${slugCounts[slug]}`
      } else {
        slugCounts[slug] = 0
      }
      headings.push({ level, text, id: slug })
    }
  })
  return headings
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState('')
  const [tocVisible, setTocVisible] = useState(false)
  const [tocPos, setTocPos] = useState({ left: 0, top: 0 })
  const [showTop, setShowTop] = useState(false)
  const contentRef = useRef(null)
  const tocAreaRef = useRef(null)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blog?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        setBlog(data)
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [slug])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const content = blog ? localizedField(blog, 'content', lang) : ''
  const headings = useMemo(() => extractHeadings(content), [content])

  // 目录自动滚动到选中项
  useEffect(() => {
    if (!activeId) return
    const tocItem = document.querySelector(`.blog-toc-inner a[data-id="${activeId}"]`)
    if (tocItem) {
      tocItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeId])

  // 计算目录面板 fixed 位置
  useEffect(() => {
    const updatePos = () => {
      if (tocAreaRef.current) {
        const rect = tocAreaRef.current.getBoundingClientRect()
        setTocPos({ left: rect.left + 40, top: rect.top })
      }
    }
    updatePos()
    window.addEventListener('resize', updatePos)
    return () => window.removeEventListener('resize', updatePos)
  }, [headings])

  // 返回顶部按钮显隐
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 0' }}>
        <p className="font-mono" style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!blog) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 0' }}>
        <p className="font-mono" style={{ color: 'var(--muted)' }}>404 - Article not found</p>
      </div>
    )
  }

  return (
    <div
      className="blog-layout py-8 md:py-16"
      style={{ paddingBottom: '8rem' }}
      onMouseEnter={() => setTocVisible(true)}
      onMouseLeave={() => setTocVisible(false)}
    >
      {/* 目录树 - 左侧 */}
      {headings.length > 0 && (
        <div className={`blog-toc-area ${tocVisible ? 'blog-toc-visible' : ''}`} ref={tocAreaRef}>
          {/* 目录图标按钮 - 始终可见 */}
          <button
            className="toc-toggle"
            onClick={() => setTocVisible(v => !v)}
            title={lang === 'zh' ? '目录' : 'Contents'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="15" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </button>
          {/* 目录内容 */}
          <nav className="blog-toc" style={{ left: `${tocPos.left}px`, top: '100px' }}>
            <div className="blog-toc-inner">
              <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border)', letterSpacing: '0.05em', fontWeight: 600 }}>
                {lang === 'zh' ? '目录' : 'CONTENTS'}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {headings.map((h, i) => (
                  <li key={i}>
                    <a
                      href={`#${h.id}`}
                      data-id={h.id}
                      onClick={e => {
                        e.preventDefault()
                        setActiveId(h.id)
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className={`toc-link font-mono ${activeId === h.id ? 'toc-link-active' : ''}`}
                      style={{
                        paddingLeft: `${(h.level - 1) * 12 + 12}px`,
                      }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      )}

      {/* 正文 */}
      <div className="blog-main" ref={contentRef}>
      {/* 标题 */}
      <h1
        className="font-mono font-bold"
        style={{ color: 'var(--fg)', fontSize: '1.8rem', lineHeight: 1.3, marginBottom: '12px' }}
      >
        {localizedField(blog, 'title', lang)}
      </h1>

      {/* 元信息 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {blog.published_at && (
          <span className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            {formatDate(blog.published_at)}
          </span>
        )}
        {(lang === 'zh' ? blog.tags_zh : blog.tags_en)?.map(tag => (
          <span
            key={tag}
            className="font-mono"
            style={{
              fontSize: '0.7rem',
              color: 'var(--muted)',
              backgroundColor: 'var(--border)',
              padding: '2px 8px',
              borderRadius: '2px',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Markdown 内容 */}
      <article className="blog-content" style={{ color: 'var(--fg)', lineHeight: 1.8 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
          components={{
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match
              if (isInline) {
                return (
                  <code
                    className={className}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      background: 'var(--border)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '2px',
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <div style={{ position: 'relative', margin: '1rem 0' }}>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                  <button
                    className="code-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
                      const btn = document.activeElement
                      btn.textContent = '✓'
                      setTimeout(() => { btn.textContent = 'Copy' }, 1500)
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 10px',
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#abb2bf',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>
              )
            },
            img: ({ src, alt, ...props }) => (
              <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  margin: '1rem 0',
                  display: 'block',
                }}
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      </div>

      {/* 返回顶部按钮 */}
      {showTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title={lang === 'zh' ? '返回顶部' : 'Back to top'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      <style jsx global>{`
        .blog-layout {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          gap: 100px;
        }
        .blog-toc-area {
          width: 200px;
          flex-shrink: 0;
          order: -1;
          position: relative;
        }
        .toc-toggle {
          position: sticky;
          top: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--muted);
          cursor: pointer;
          z-index: 2;
        }
        .blog-toc {
          position: fixed;
          width: 220px;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
          z-index: 10;
        }
        .blog-toc-visible .blog-toc {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }
        .blog-toc-inner {
          position: sticky;
          top: 100px;
          max-height: calc(100vh - 140px);
          overflow-y: auto;
          padding-right: 4px;
        }
        .blog-toc-inner::-webkit-scrollbar { width: 0; }
        .toc-link {
          display: block;
          position: relative;
          font-size: 0.8rem;
          line-height: 1.6;
          padding: 4px 12px 4px 12px;
          color: var(--muted);
          border-left: 2px solid transparent;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .toc-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 12px;
          width: 0;
          height: 0;
          border-bottom: 1px dashed var(--fg);
          opacity: 0.4;
          transition: width 0.25s ease;
        }
        .toc-link:hover::after {
          width: calc(100% - 24px);
          opacity: 0.7;
        }
        .toc-link:hover {
          color: var(--fg);
        }
        .toc-link-active {
          color: var(--fg) !important;
          border-left-color: var(--fg);
        }
        .blog-main {
          flex: 1;
          min-width: 0;
          max-width: 720px;
        }
        @media (max-width: 1023px) {
          .blog-toc-area { display: none; }
        }
        .blog-content h1 { font-family: monospace; font-weight: 700; font-size: 1.5rem; margin: 2rem 0 0.8rem; }
        .blog-content h2 { font-family: monospace; font-weight: 700; font-size: 1.3rem; margin: 1.8rem 0 0.6rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--border); }
        .blog-content h3 { font-family: monospace; font-weight: 700; font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
        .blog-content h4 { font-family: monospace; font-weight: 600; font-size: 1rem; margin: 1.2rem 0 0.4rem; }
        .blog-content p { margin: 0.8rem 0; font-size: 0.95rem; }
        .blog-content ul, .blog-content ol { margin: 0.6rem 0; padding-left: 1.5rem; }
        .blog-content li { margin: 0.3rem 0; font-size: 0.95rem; }
        .blog-content a { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
        .blog-content a:hover { opacity: 0.7; }
        .blog-content blockquote {
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          border-left: 3px solid var(--border);
          color: var(--muted);
          font-style: italic;
        }
        .blog-content code {
          font-family: monospace;
          font-size: 0.85rem;
          background: var(--border);
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
        }
        .blog-content pre {
          margin: 0;
        }
        .blog-content pre code {
          background: none;
          padding: 0;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.9rem;
        }
        .blog-content th, .blog-content td {
          border: 1px solid var(--border);
          padding: 0.5rem 0.8rem;
          text-align: left;
        }
        .blog-content th {
          font-family: monospace;
          font-weight: 600;
          background: var(--border);
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1rem 0;
        }
        @media (max-width: 767px) {
          .code-copy-btn { display: none; }
        }
        .blog-content hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2rem 0;
        }
        .back-to-top {
          position: fixed;
          bottom: 32px;
          right: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--muted);
          cursor: pointer;
          z-index: 20;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
