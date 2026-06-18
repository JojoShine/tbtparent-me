'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Smartphone, Monitor, Tv, QrCode, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode'

function GithubIcon({ style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={style?.width || 14} height={style?.height || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
      <path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
  )
}

const typeIconMap = {
  mobile: Smartphone,
  pc: Monitor,
  dashboard: Tv,
}

const typeLabelMap = {
  mobile: '移动端',
  pc: 'PC端',
  dashboard: '大屏',
}

export default function ProjectCard({ project, fromHome = false }) {
  const router = useRouter()
  const [showQr, setShowQr] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const qrGeneratedRef = useRef(false)
  const TypeIcon = typeIconMap[project.project_type] || Monitor
  const hasDemo = !!project.demo_url
  const isMobile = project.project_type === 'mobile'

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 本地生成二维码（一次性，缓存结果）
  useEffect(() => {
    if (hasDemo && project.demo_url && !qrGeneratedRef.current) {
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
  }, [hasDemo, project.demo_url])

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        className="block border transition-all duration-200 ease-out"
        style={{ borderColor: 'var(--border)', padding: '20px 24px', cursor: 'pointer' }}
        whileHover={{ y: -3 }}
        onClick={(e) => {
          if (e.target.closest('a') || e.target.closest('span[style*="cursor: pointer"]')) return
          e.stopPropagation()
          router.push(fromHome ? `/projects/${project.id}?from=home` : `/projects/${project.id}`)
        }}
      >
        {/* 标题行 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          {/* 类型图标 + 项目名 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              title={typeLabelMap[project.project_type] || 'PC端'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--muted)',
                lineHeight: 1,
              }}
            >
              <TypeIcon size={16} strokeWidth={2} />
            </span>
            <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', fontSize: '1.1rem', lineHeight: 1, margin: 0 }}>
              {project.name}
            </h3>
          </div>

          {/* GitHub + 演示 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '12px' }}>
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
                  width: '24px',
                  height: '24px',
                  border: '1px solid var(--border)',
                  borderRadius: '2px',
                  color: 'var(--muted)',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
              >
                <GithubIcon style={{ width: '12px', height: '12px' }} />
              </a>
            )}

            {hasDemo && isMobile && !isSmallScreen && (
              <span
                onMouseEnter={() => setShowQr(true)}
                onMouseLeave={() => setShowQr(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  border: '1px solid var(--border)',
                  borderRadius: '2px',
                  color: showQr ? 'var(--fg)' : 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
              >
                <QrCode style={{ width: '12px', height: '12px' }} />
              </span>
            )}

            {hasDemo && (isMobile ? isSmallScreen : true) && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                title="打开演示"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  border: '1px solid var(--border)',
                  borderRadius: '2px',
                  color: 'var(--muted)',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
              >
                <ExternalLink style={{ width: '12px', height: '12px' }} />
              </a>
            )}
          </div>
        </div>

        {/* 描述 */}
        <p className="leading-relaxed" style={{ color: 'var(--muted)', marginBottom: '12px', fontSize: '0.9rem' }}>
          {project.description}
        </p>

        {/* 计划时间 */}
        {project.deadline && (
          <p className="font-mono" style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '0.8rem', opacity: 0.7 }}>
            {project.deadline}
          </p>
        )}

        {/* 标签 */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {project.tags.map(tag => (
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
      </motion.div>

      {/* 右侧悬浮二维码面板 - 仅非小屏幕显示 */}
      {showQr && !isSmallScreen && (
        <div
          onMouseEnter={() => setShowQr(true)}
          onMouseLeave={() => setShowQr(false)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '100%',
            transform: 'translateY(-50%)',
            marginLeft: '12px',
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
  )
}
