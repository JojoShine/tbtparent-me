'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Smartphone, Monitor, Tv, QrCode } from 'lucide-react'
import QRCode from 'qrcode'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useLang } from '@/hooks/useLang'
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

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { lang } = useLang()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQr, setShowQr] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const qrGeneratedRef = useRef(false)

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!id) return
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find(p => String(p.id) === String(id)) : null
        setProject(found)
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (project?.demo_url && !qrGeneratedRef.current) {
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
  const content = localizedField(project, 'content', lang)
  const hasDemo = !!project.demo_url
  const isMobile = project.project_type === 'mobile'

  return (
    <motion.div
      className="max-w-4xl pb-8 md:pb-20"
      style={{ margin: '0 auto' }}
      variants={fadeUp}
      initial="initial"
      animate="animate"
    >
      {/* 返回按钮 */}
      <button
        onClick={() => router.push('/projects')}
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
        {lang === 'zh' ? '返回项目' : 'Back'}
      </button>

      {/* 标题 */}
      <h1
        className="font-mono font-bold"
        style={{
          color: 'var(--fg)',
          fontSize: '1.8rem',
          marginBottom: '16px',
          lineHeight: 1.3,
        }}
      >
        {localized.name}
      </h1>

      {/* Meta 信息 */}
      <div
        className="font-mono"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          fontSize: '0.8rem',
          color: 'var(--muted)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {(() => {
            const Icon = typeIconMap[localized.project_type] || Monitor
            return <Icon size={14} />
          })()}
        </span>
        {project.createdAt && (
          <span>{formatDate(project.createdAt)}</span>
        )}
        {localized.deadline && (
          <span>{localized.deadline}</span>
        )}
      </div>

      {/* 链接图标 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '32px', position: 'relative' }}>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              opacity: 0.5,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
          >
            <GithubIcon />
          </a>
        )}

        {hasDemo && isMobile && !isSmallScreen && (
          <span
            onMouseEnter={() => setShowQr(true)}
            onMouseLeave={() => setShowQr(false)}
            title={lang === 'zh' ? '扫码预览' : 'Scan to preview'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              opacity: showQr ? 1 : 0.5,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
          >
            <QrCode size={16} />
          </span>
        )}

        {hasDemo && (isMobile ? isSmallScreen : true) && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            title={lang === 'zh' ? '打开演示' : 'Open demo'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              opacity: 0.5,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
          >
            <ExternalLinkIcon />
          </a>
        )}

        {/* 二维码悬浮弹窗 */}
        {showQr && !isSmallScreen && (
          <div
            onMouseEnter={() => setShowQr(true)}
            onMouseLeave={() => setShowQr(false)}
            style={{
              position: 'absolute',
              top: '100%',
              left: project.github ? '40px' : '0',
              marginTop: '8px',
              width: '220px',
              padding: '20px 16px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '10px' }}>
              <img
                src={qrDataUrl || ''}
                alt="QR Code"
                style={{ display: 'block', width: '180px', height: '180px' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: '6px',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src="/assets/logo.jpg" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
              </div>
            </div>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: '#666',
              textAlign: 'center',
              wordBreak: 'break-all',
              lineHeight: 1.4,
            }}>
              {project.demo_url}
            </p>
          </div>
        )}
      </div>

      {/* 描述 */}
      <div
        style={{
          color: 'var(--fg)',
          lineHeight: 1.8,
          fontSize: '0.95rem',
          marginBottom: '32px',
        }}
      >
        <p>{localized.description}</p>
      </div>

      {/* 标签 */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {tags.map(tag => (
            <span
              key={tag}
              className="font-mono"
              style={{
                color: 'var(--muted)',
                backgroundColor: 'var(--border)',
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '2px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Markdown 内容 */}
      {content && (
        <>
          <style>{`
            .project-content h1 { font-family: monospace; font-weight: 700; font-size: 1.5rem; margin: 2rem 0 0.8rem; }
            .project-content h2 { font-family: monospace; font-weight: 700; font-size: 1.3rem; margin: 1.8rem 0 0.6rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--border); }
            .project-content h3 { font-family: monospace; font-weight: 700; font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
            .project-content h4 { font-family: monospace; font-weight: 600; font-size: 1rem; margin: 1.2rem 0 0.4rem; }
            .project-content p { margin: 0.8rem 0; font-size: 0.95rem; }
            .project-content ul, .project-content ol { margin: 0.6rem 0; padding-left: 1.5rem; }
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
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </>
      )}
    </motion.div>
  )
}
