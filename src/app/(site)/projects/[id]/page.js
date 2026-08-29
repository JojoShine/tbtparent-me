'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Smartphone, Monitor, Tv, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import { defaultSchema } from 'hast-util-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MermaidBlock from '@/components/ui/MermaidBlock'
import { useLang } from '@/hooks/useLang'
import { useTheme } from '@/hooks/useTheme'
import { localizedField, localizeProject } from '@/lib/i18n-helpers'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
      <path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

const typeIconMap = {
  mobile: Smartphone,
  pc: Monitor,
  dashboard: Tv,
}

function extractHeadings(markdown) {
  if (!markdown) return []
  const lines = markdown.split('\n')
  const headings = []
  let inCodeBlock = false
  const slugCounts = {}
  lines.forEach(line => {
    if (line.trim().startsWith('```')) { inCodeBlock = !inCodeBlock; return }
    if (inCodeBlock) return
    const match = line.match(/^(##)\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`~\[\]]/g, '').trim()
      let slug = text.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
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

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes.code || []),
      ['className', 'language-mermaid', 'language-mermaid'],
    ],
  },
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { lang } = useLang()
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromHome = searchParams.get('from') === 'home'
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [activeId, setActiveId] = useState('')
  const [showTop, setShowTop] = useState(false)
  const [mediaFailed, setMediaFailed] = useState(false)
  const qrGeneratedRef = useRef(false)

  useEffect(() => {
    document.body.classList.add('project-detail-page')
    return () => document.body.classList.remove('project-detail-page')
  }, [])

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/projects?id=${id}`)
      .then(r => r.json())
      .then(data => {
        setProject(data || null)
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (project?.demo_url && project.deadline_zh !== '已下架' && project.deadline_en !== 'Discontinued' && !qrGeneratedRef.current) {
      // 根据主题设置二维码颜色
      const isDark = document.documentElement.classList.contains('dark')
      QRCode.toDataURL(project.demo_url, { 
        width: 400, 
        margin: 1, 
        color: isDark ? {
          dark: '#e5e5e5',  // 柔和的浅灰色，不是纯白
          light: '#1a1a1a'  // 深灰黑色背景，不是纯黑
        } : {
          dark: '#000000',  // 浅色模式保持纯黑
          light: '#ffffff'  // 浅色模式保持纯白
        }
      })
        .then(url => {
          setQrDataUrl(url)
          qrGeneratedRef.current = true
        })
        .catch(console.error)
    }
  }, [project])

  const content = localizedField(project, 'content', lang)
  const headings = useMemo(() => extractHeadings(content), [content])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  const mdComponents = useMemo(() => ({
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
      if (match[1] === 'mermaid') {
        return (
          <MermaidBlock chart={String(children).replace(/\n$/, '')} theme={theme} />
        )
      }
      return (
        <div className="code-block-wrapper">
          <div className="code-scroll">
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{ borderRadius: '6px', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, overflowX: 'auto' }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
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
      <img src={src} alt={alt || ''} loading="lazy" style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', margin: '1rem 0', display: 'block' }} {...props} />
    ),
    video: ({ src, children, ...props }) => (
      <video
        src={src}
        controls
        preload="metadata"
        style={{ maxWidth: '100%', borderRadius: '4px', margin: '1rem 0', display: 'block' }}
        {...props}
      >
        {children}
      </video>
    ),
  }), [theme])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p className="font-mono" style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p className="font-mono" style={{ color: 'var(--muted)' }}>Project not found</p>
      </div>
    )
  }

  const localized = localizeProject(project, lang)
  const tags = localized.tags || []
  const isArchived = project.deadline_zh === '已下架' || project.deadline_en === 'Discontinued'
  const hasDemo = !!project.demo_url && !isArchived
  const hasVideo = !!project.video_url
  const isMobile = project.project_type === 'mobile'

  return (
    <div className="project-layout">
      <motion.div
        className="project-main pb-8 md:pb-20"
        variants={fadeUp}
        initial="initial"
        animate="animate"
      >
      {/* 返回按钮 */}
      <button
        onClick={() => router.push(fromHome ? '/' : '/projects')}
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
        <ArrowLeftIcon />
        {fromHome ? (lang === 'zh' ? '返回首页' : 'Back') : (lang === 'zh' ? '返回项目' : 'Back')}
      </button>

      <section className="project-hero">
        <div className="project-hero-copy">
          <div className="project-meta font-mono">
            <span>{(() => { const Icon = typeIconMap[localized.project_type] || Monitor; return <Icon size={14} /> })()}</span>
            {project.createdAt && <span>{formatDate(project.createdAt)}</span>}
            {localized.deadline && <span className={isArchived ? 'project-archived-state' : ''}>{localized.deadline}</span>}
          </div>

          {isArchived && (
            <div className="project-archived-notice">
              {lang === 'zh' ? '该项目已下架，相关能力已升级至 FlowCraft。' : 'This project has been discontinued and upgraded to FlowCraft.'}
            </div>
          )}

          <h1 className="font-mono">{localized.name}</h1>
          <p className="project-lead">{localized.description}</p>

          {tags.length > 0 && (
            <div className="project-tags">
              {tags.slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}
            </div>
          )}

          <div className="project-actions">
            {hasDemo && (!isMobile || isSmallScreen) && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="primary-action">
                {lang === 'zh' ? '立即试用' : 'Try it live'} <ExternalLinkIcon />
              </a>
            )}
            {hasVideo && (
              <a href="#video-section">{lang === 'zh' ? '观看演示' : 'Watch demo'}</a>
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub</a>
            )}
            {hasDemo && isMobile && !isSmallScreen && (
              <div className="project-detail-qr-trigger">
                <button type="button"><QrCode size={15} /> {lang === 'zh' ? '扫码演示' : 'QR demo'}</button>
                {qrDataUrl && (
                  <div className="project-qr">
                    <img src={qrDataUrl} alt={lang === 'zh' ? '在线试用二维码' : 'Demo QR code'} />
                    <span>{lang === 'zh' ? '手机扫码打开' : 'Scan to open'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {hasVideo && (
          <div className="project-hero-media" id="video-section">
            {!mediaFailed ? (
              <video src={project.video_url} controls muted playsInline preload="metadata" onError={() => setMediaFailed(true)} />
            ) : (
              <div className="project-media-placeholder">
                {(() => { const Icon = typeIconMap[localized.project_type] || Monitor; return <Icon size={52} strokeWidth={1} /> })()}
                <strong>{localized.name}</strong>
                <span>{lang === 'zh' ? '演示视频暂时无法加载' : 'Demo video is unavailable'}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {headings.length > 1 && (
        <nav className="project-section-nav" aria-label={lang === 'zh' ? '项目章节' : 'Project sections'}>
          {headings.map(h => (
            <a
              key={h.id}
              href={`#${h.id}`}
              data-id={h.id}
              onClick={event => {
                event.preventDefault()
                setActiveId(h.id)
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`font-mono ${activeId === h.id ? 'project-section-link-active' : ''}`}
            >
              {h.text}
            </a>
          ))}
        </nav>
      )}

      {/* Markdown 内容 */}
      {content && (
        <>
          <style>{`
            .project-content h1 { font-family: monospace; font-weight: 700; font-size: 1.5rem; margin: 2rem 0 0.8rem; }
            .project-content h2 { font-family: monospace; font-weight: 700; font-size: 1.45rem; margin: 3rem 0 0.8rem; letter-spacing: -0.03em; }
            .project-content h2:first-child { margin-top: 0; }
            .project-content h3 { font-family: monospace; font-weight: 700; font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
            .project-content h4 { font-family: monospace; font-weight: 600; font-size: 1rem; margin: 1.2rem 0 0.4rem; }
            .project-content p { margin: 0.8rem 0; font-size: 0.95rem; }
            .project-content ul, .project-content ol { margin: 0.6rem 0; padding-left: 1.5rem; }
            .project-content ol { list-style: decimal; }
            .project-content li { margin: 0.3rem 0; font-size: 0.95rem; }
            .project-content blockquote {
              margin: 1rem 0;
              padding: 0.5rem 1rem;
              border-left: 3px solid var(--border);
              color: var(--muted);
              font-style: italic;
            }
            .project-content a { color: var(--fg); text-decoration: underline; text-underline-offset: 2px; }
            .project-content a:hover { opacity: 0.7; }
            .project-content img { max-width: 100%; height: auto; border-radius: 4px; margin: 1rem 0; display: block; }
            .project-content video { max-width: 100%; border-radius: 4px; margin: 1rem 0; display: block; }
            .project-content table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
            .project-content th, .project-content td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
            .project-content th { font-family: monospace; font-weight: 600; background: var(--border); }
            .project-content hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
            .project-content code:not(pre code) {
              font-family: monospace;
              font-size: 0.85rem;
              background: var(--border);
              padding: 0.15rem 0.4rem;
              border-radius: 2px;
            }
            .project-content pre { margin: 0; }
            .project-content pre code { background: none; padding: 0; }
            .project-content .code-block-wrapper { position: relative; margin: 1rem 0; }
            .project-content .code-scroll { overflow-x: auto; border-radius: 6px; }
            .project-content .code-scroll::-webkit-scrollbar { display: block !important; height: 6px !important; }
            .project-content .code-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05) !important; }
            .project-content .code-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25) !important; border-radius: 3px !important; }
            @media (max-width: 767px) {
              .project-content .code-copy-btn { display: none; }
            }
          `}</style>
          <article
            className="project-content"
            style={{ color: 'var(--fg)', lineHeight: 1.8, fontSize: '0.95rem', paddingBottom: '8rem' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeSlug]}
              components={mdComponents}
            >
              {content}
            </ReactMarkdown>
          </article>
        </>
      )}
    </motion.div>

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
        .project-hero {
          display: flex;
          flex-direction: column;
          gap: 42px;
          margin-bottom: 0;
        }
        .project-hero-copy {
          position: relative;
          max-width: 780px;
        }
        .project-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px 14px;
          margin-bottom: 18px;
          color: var(--muted);
          font-size: 0.72rem;
        }
        .project-meta span { display: inline-flex; align-items: center; }
        .project-meta .project-archived-state {
          padding: 5px 8px;
          border: 1px solid var(--fg);
          color: var(--fg);
        }
        .project-archived-notice {
          width: fit-content;
          margin-bottom: 20px;
          padding: 10px 14px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: color-mix(in srgb, var(--fg) 4%, transparent);
          font: 0.76rem/1.6 monospace;
        }
        .project-hero h1 {
          margin: 0 0 18px;
          color: var(--fg);
          font-size: clamp(2.4rem, 4.7vw, 3.75rem);
          line-height: 1;
          letter-spacing: -0.075em;
          text-wrap: balance;
        }
        .project-lead {
          max-width: 62ch;
          margin: 0;
          color: var(--fg);
          font-size: 1rem;
          line-height: 1.75;
          text-wrap: pretty;
        }
        .project-tags { display: flex; flex-wrap: wrap; gap: 6px 10px; margin-top: 20px; }
        .project-tags span {
          color: var(--muted);
          font: 0.7rem monospace;
        }
        .project-tags span + span::before {
          content: '/';
          margin-right: 10px;
          color: color-mix(in srgb, var(--muted) 55%, transparent);
        }
        .project-actions {
          position: relative;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px 16px;
          margin-top: 28px;
        }
        .project-actions a,
        .project-actions button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
          padding: 0;
          border: 0;
          color: var(--muted);
          background: transparent;
          font: 0.76rem monospace;
          text-decoration: none;
          cursor: pointer;
          transition: color 180ms ease, transform 180ms ease;
        }
        .project-actions a:hover,
        .project-actions button:hover { color: var(--fg); transform: translateY(-1px); }
        .project-actions .primary-action {
          padding: 0 16px;
          color: var(--bg);
          background: var(--fg);
        }
        .project-detail-qr-trigger {
          position: relative;
          display: inline-flex;
        }
        .project-qr {
          position: absolute;
          right: 0;
          bottom: 100%;
          z-index: 4;
          display: none;
          justify-items: center;
          gap: 8px;
          width: 174px;
          padding: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
          color: var(--muted);
          font: 0.68rem monospace;
        }
        .project-detail-qr-trigger:hover .project-qr { display: grid; }
        .project-qr img { width: 148px; height: 148px; }
        .project-hero-media {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid var(--border);
          background: color-mix(in srgb, var(--border) 42%, var(--bg));
        }
        .project-hero-media video,
        .project-hero-media img {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
          object-fit: contain;
          background: #090909;
        }
        .project-media-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 10px;
          padding: clamp(24px, 5vw, 48px);
          color: var(--muted);
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--fg) 7%, transparent), transparent 52%),
            repeating-linear-gradient(90deg, transparent 0, transparent 47px, color-mix(in srgb, var(--fg) 5%, transparent) 48px);
          font-family: monospace;
        }
        .project-media-placeholder svg { margin-bottom: auto; }
        .project-media-placeholder strong {
          max-width: 90%;
          overflow: hidden;
          color: var(--fg);
          font-size: clamp(1.8rem, 4vw, 3.6rem);
          line-height: 1;
          letter-spacing: -0.06em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .project-media-placeholder span { font: 0.72rem/1.4 monospace; }
        .project-detail-page .cat-duty {
          display: none;
        }
        .project-content {
          width: 100%;
          max-width: none;
          margin: 0 auto;
          padding-top: 58px;
        }
        .project-layout {
          max-width: 920px;
          margin: 0 auto;
          padding: 0;
        }
        .project-section-nav {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 26px;
          padding: 18px 0;
          overflow-x: auto;
          border-bottom: 1px solid var(--border);
          scrollbar-width: none;
        }
        .project-section-nav::-webkit-scrollbar { display: none; }
        .project-section-nav a {
          position: relative;
          flex: 0 0 auto;
          font-size: 0.8rem;
          line-height: 1.4;
          color: var(--muted);
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .project-section-nav a::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: -19px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--fg);
          transition: width 0.25s ease;
        }
        .project-section-nav a:hover,
        .project-section-link-active { color: var(--fg) !important; }
        .project-section-link-active::after { width: 100% !important; }
        .project-main {
          width: 100%;
          min-width: 0;
          max-width: none;
          margin: 0 auto;
        }
        @media (max-width: 1023px) {
          .project-layout {
            overflow-x: hidden;
            max-width: 100vw;
            padding: 0 16px;
            gap: 0;
          }
          .project-main {
            width: 100%;
            overflow-x: hidden;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .project-hero {
            gap: 28px;
          }
          .project-hero h1 { font-size: clamp(2rem, 10vw, 3rem); }
          .project-content { padding-top: 42px; }
          .project-section-nav { gap: 18px; margin-top: 20px; }
        }
        .project-content .mermaid-block {
          display: flex;
          justify-content: center;
          padding: 1rem;
          background: var(--border);
          border-radius: 6px;
          margin: 1rem 0;
        }
        .project-content .mermaid-block svg {
          max-width: 100%;
          height: auto;
        }
        .project-content .mermaid-block .node rect,
        .project-content .mermaid-block .node circle,
        .project-content .mermaid-block .node polygon {
          transition: none !important;
          stroke-width: 1px !important;
        }
        .project-content .mermaid-block .edgePath .path {
          stroke-width: 1px !important;
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
          z-index: 9999;
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
