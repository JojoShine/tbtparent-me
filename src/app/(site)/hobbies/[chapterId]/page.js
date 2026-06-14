'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { useLang } from '@/hooks/useLang'

export default function ChapterPage() {
  const { chapterId } = useParams()
  const router = useRouter()
  const { lang } = useLang()
  const [chapter, setChapter] = useState(null)
  const [novel, setNovel] = useState(null)
  const [allChapters, setAllChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chapterId) return
    
    // 获取章节信息
    fetch(`/api/archive/chapters?chapterId=${chapterId}`)
      .then(r => r.json())
      .then(async (chapters) => {
        if (Array.isArray(chapters) && chapters.length > 0) {
          const found = chapters[0]
          setChapter(found)
          
          // 获取小说信息
          const novels = await fetch('/api/archive/novels').then(r => r.json())
          const novelFound = novels.find(n => n.id === found.novelId)
          if (novelFound) {
            setNovel(novelFound)
            
            // 获取该小说的所有章节（用于上下章导航）
            const novelChapters = await fetch(`/api/archive/chapters?novelId=${novelFound.id}`).then(r => r.json())
            if (Array.isArray(novelChapters)) {
              // 按 chapter_number 升序排序
              const sorted = novelChapters.sort((a, b) => a.chapter_number - b.chapter_number)
              setAllChapters(sorted)
            }
          }
        }
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [chapterId])

  if (loading) {
    return (
      <div className="max-w-4xl py-8 md:py-20" style={{ margin: '0 auto' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      </div>
    )
  }

  if (!chapter || !novel) {
    return (
      <div className="max-w-4xl py-8 md:py-20" style={{ margin: '0 auto' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>404 - Chapter not found</p>
      </div>
    )
  }

  const content = lang === 'zh' ? chapter.content_zh : (chapter.content_en || chapter.content_zh)
  
  // 查找上一章和下一章
  const currentIndex = allChapters.findIndex(c => c.id === chapter.id)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  return (
    <div className="max-w-4xl py-8 md:py-20" style={{ margin: '0 auto' }}>
      {/* 返回按钮 */}
      <button
        onClick={() => router.push('/hobbies')}
        className="font-mono"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 0',
          marginBottom: '24px',
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {lang === 'zh' ? '返回收录' : 'Back'}
      </button>

      {/* 小说标题 */}
      <div style={{ marginBottom: '8px' }}>
        <span className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {lang === 'zh' ? novel.title_zh : (novel.title_en || novel.title_zh)}
        </span>
      </div>

      {/* 章节标题 */}
      <h1
        className="font-mono font-bold"
        style={{
          color: 'var(--fg)',
          fontSize: '1.5rem',
          marginBottom: '16px',
          lineHeight: 1.3,
        }}
      >
        {lang === 'zh' ? chapter.title_zh : (chapter.title_en || chapter.title_zh)}
      </h1>

      {/* 章节序号 */}
      <div style={{ marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <span className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {lang === 'zh' ? `第${chapter.chapter_number}章` : `Chapter ${chapter.chapter_number}`}
        </span>
      </div>

      {/* Markdown 内容 */}
      <article className="chapter-content" style={{ color: 'var(--fg)', lineHeight: 1.8 }}>
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            p: ({ children, node }) => {
              // 检查是否是空段落（由空行产生）
              const isEmpty = !children || (typeof children === 'string' && children.trim() === '')
              if (isEmpty) {
                return <div style={{ height: '1rem' }} />
              }
              return <p style={{ margin: '1rem 0', whiteSpace: 'pre-wrap' }}>{children}</p>
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {/* 上一章/下一章导航 */}
      {(prevChapter || nextChapter) && (
        <div style={{ 
          marginTop: '48px', 
          marginBottom: '80px',
          paddingTop: '24px', 
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          {prevChapter ? (
            <Link
              href={`/hobbies/${prevChapter.id}`}
              className="font-mono"
              style={{
                padding: '8px 0',
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>
                ← {lang === 'zh' ? '上一章' : 'Previous'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--fg)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                {lang === 'zh' ? prevChapter.title_zh : (prevChapter.title_en || prevChapter.title_zh)}
              </div>
            </Link>
          ) : (
            <div style={{ flex: 1 }} />
          )}
          
          {nextChapter ? (
            <Link
              href={`/hobbies/${nextChapter.id}`}
              className="font-mono"
              style={{
                padding: '8px 0',
                textDecoration: 'none',
                textAlign: 'right',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>
                {lang === 'zh' ? '下一章' : 'Next'} →
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--fg)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                {lang === 'zh' ? nextChapter.title_zh : (nextChapter.title_en || nextChapter.title_zh)}
              </div>
            </Link>
          ) : (
            <div style={{ flex: 1 }} />
          )}
        </div>
      )}

      <style jsx global>{`
        .chapter-content h1 { font-family: monospace; font-weight: 700; font-size: 1.5rem; margin: 2rem 0 0.8rem; }
        .chapter-content h2 { font-family: monospace; font-weight: 700; font-size: 1.3rem; margin: 1.8rem 0 0.6rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--border); }
        .chapter-content h3 { font-family: monospace; font-weight: 700; font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
        .chapter-content h4 { font-family: monospace; font-weight: 600; font-size: 1rem; margin: 1.2rem 0 0.4rem; }
        .chapter-content p { margin: 1rem 0; font-size: 0.95rem; white-space: pre-wrap; }
        .chapter-content ul, .chapter-content ol { margin: 0.6rem 0; padding-left: 1.5rem; }
        .chapter-content li { margin: 0.3rem 0; font-size: 0.95rem; }
        .chapter-content a { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
        .chapter-content a:hover { opacity: 0.7; }
        .chapter-content blockquote {
          margin: 1rem 0;
          padding: 0.5rem 1rem;
          border-left: 3px solid var(--border);
          color: var(--muted);
          font-style: italic;
        }
        .chapter-content code {
          font-family: monospace;
          font-size: 0.85rem;
          background: var(--border);
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
        }
        .chapter-content pre {
          margin: 1rem 0;
          overflow-x: auto;
        }
        .chapter-content pre code {
          background: none;
          padding: 0;
        }
        .chapter-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.9rem;
        }
        .chapter-content th, .chapter-content td {
          border: 1px solid var(--border);
          padding: 0.5rem 0.8rem;
          text-align: left;
        }
        .chapter-content th {
          font-family: monospace;
          font-weight: 600;
          background: var(--border);
        }
        .chapter-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1rem 0;
        }
        .chapter-content hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2rem 0;
        }
      `}</style>
    </div>
  )
}
