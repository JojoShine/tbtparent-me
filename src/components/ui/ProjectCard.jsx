'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Monitor, Play, QrCode, Smartphone, Tv } from 'lucide-react'
import QRCode from 'qrcode'

const typeIconMap = { mobile: Smartphone, pc: Monitor, dashboard: Tv }
const typeLabelMap = { mobile: '移动端', pc: 'PC 端', dashboard: '数据大屏' }

function GithubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function projectHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export default function ProjectCard({ project, fromHome = false }) {
  const router = useRouter()
  const mediaRef = useRef(null)
  const videoRef = useRef(null)
  const [qrRequested, setQrRequested] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const TypeIcon = typeIconMap[project.project_type] || Monitor
  const isArchived = Boolean(project.archived)
  const hasDemo = Boolean(project.demo_url) && !isArchived
  const hasVideo = Boolean(project.video_url) && !videoFailed
  const isMobile = project.project_type === 'mobile'
  const detailUrl = `/projects/${project.id}${fromHome ? '?from=home' : ''}`

  useEffect(() => {
    if (!qrRequested || !hasDemo || qrDataUrl) return
    QRCode.toDataURL(project.demo_url, { width: 320, margin: 1 })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [hasDemo, project.demo_url, qrDataUrl, qrRequested])

  useEffect(() => {
    if (!hasVideo || isArchived || !mediaRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShouldLoadVideo(true)
      observer.disconnect()
    }, { rootMargin: '240px' })
    observer.observe(mediaRef.current)
    return () => observer.disconnect()
  }, [hasVideo, isArchived])

  const playVideo = () => {
    setVideoPlaying(true)
    videoRef.current?.play().catch(() => setVideoPlaying(false))
  }

  return (
    <motion.article
      className={`project-card ${fromHome ? 'project-card-home' : ''} ${isArchived ? 'project-card-archived' : ''}`}
      whileHover={isArchived ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={event => {
        if (isArchived) return
        if (event.target.closest('a, button, video')) return
        router.push(detailUrl)
      }}
      aria-disabled={isArchived}
    >
      <div className={`project-card-frame ${fromHome ? 'project-card-frame-home' : ''} ${isArchived ? 'project-card-frame-archived' : ''}`}>
        {!fromHome && (
          <div className="project-card-media" ref={mediaRef}>
          {isArchived && <span className="project-archived-badge">已下架</span>}
          <div className="project-card-placeholder" aria-label={`${project.name} 项目封面`}>
            <div className="project-card-cover-icon"><TypeIcon size={24} strokeWidth={1.4} /></div>
            <strong>{project.name}</strong>
            <span>{hasVideo ? '演示视频加载后可播放' : hasDemo ? projectHost(project.demo_url) : '项目介绍与实现记录'}</span>
          </div>

          {hasVideo && shouldLoadVideo && !isArchived && (
            <video
              ref={videoRef}
              src={project.video_url}
              className={videoReady ? 'project-video-ready' : ''}
              controls={videoPlaying}
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setVideoReady(true)}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onError={() => setVideoFailed(true)}
              aria-label={`${project.name} 演示视频`}
            />
          )}

          {hasVideo && !isArchived && !videoReady && (
            <span className="project-video-loading">{shouldLoadVideo ? '演示加载中' : '等待加载'}</span>
          )}
          {hasVideo && !isArchived && videoReady && !videoPlaying && (
            <button type="button" className="project-media-play" onClick={playVideo} aria-label={`播放 ${project.name} 演示视频`}>
              <Play size={18} fill="currentColor" /> 播放演示
            </button>
          )}
          </div>
        )}

        <div className="project-card-body">
        <div className="project-card-copy">
          <div className="project-card-meta">
            <TypeIcon size={14} />
            <span>{typeLabelMap[project.project_type] || 'PC 端'}</span>
            <span>{isArchived ? '已下架' : hasVideo ? '视频演示' : hasDemo ? '在线体验' : '项目案例'}</span>
          </div>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>

        {project.tags?.length > 0 && (
          <div className="project-card-tags" aria-label="项目标签">
            {project.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}
          </div>
        )}

        <div className="project-card-actions">
          {isArchived ? (
            <span className="project-archived-action">项目已下架</span>
          ) : (
            <>
              {hasDemo && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`project-primary-action ${isMobile ? 'project-mobile-live-action' : ''}`}
                >
                  在线试用 <ArrowUpRight size={15} />
                </a>
              )}
              <a href={detailUrl}>查看详情 <ArrowUpRight size={14} /></a>
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="查看 GitHub">
                  <GithubIcon /> 源码
                </a>
              )}
              {hasDemo && isMobile && (
                <div className="project-card-qr-trigger" onMouseEnter={() => setQrRequested(true)}>
                  <button type="button">
                    <QrCode size={15} /> 扫码演示
                  </button>
                  {qrDataUrl && (
                    <div className="project-card-qr" onClick={event => event.stopPropagation()}>
                      <img src={qrDataUrl} alt={`${project.name} 试用地址二维码`} />
                      <span>扫码打开在线版本</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>

      <style jsx>{`
        .project-card {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: visible;
          background: var(--bg);
          cursor: pointer;
          transition: border-color 220ms ease, box-shadow 220ms ease;
        }
        .project-card-archived { cursor: default; }
        .project-card:hover {
          box-shadow: 0 20px 50px color-mix(in srgb, var(--fg) 9%, transparent);
        }
        .project-card-archived:hover { box-shadow: none; }
        .project-card-frame {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: visible;
          border: 1px solid var(--border);
          background: var(--bg);
          transition: border-color 220ms ease, box-shadow 220ms ease;
        }
        .project-card-frame:not(.project-card-frame-archived):not(.project-card-frame-home):hover {
          border-color: color-mix(in srgb, var(--fg) 38%, var(--border));
          box-shadow: 0 20px 50px color-mix(in srgb, var(--fg) 9%, transparent);
        }
        .project-card:not(.project-card-archived):hover .project-card-media,
        .project-card:not(.project-card-archived):hover .project-card-body {
          border-color: color-mix(in srgb, var(--fg) 38%, var(--border));
        }
        .project-card-media {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 0;
          background: color-mix(in srgb, var(--border) 42%, var(--bg));
        }
        .project-archived-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 2;
          padding: 7px 11px;
          border: 1px solid color-mix(in srgb, var(--fg) 28%, transparent);
          color: var(--bg);
          background: var(--fg);
          font: 0.72rem/1 monospace;
          letter-spacing: 0.08em;
        }
        .project-card-archived .project-card-media video,
        .project-card-archived .project-card-placeholder {
          filter: grayscale(1);
          opacity: 0.52;
        }
        .project-card-archived .project-card-body {
          background: repeating-linear-gradient(
            -45deg,
            transparent 0,
            transparent 14px,
            color-mix(in srgb, var(--fg) 2.5%, transparent) 14px,
            color-mix(in srgb, var(--fg) 2.5%, transparent) 15px
          );
        }
        .project-card-media video {
          width: 100%;
          height: 100%;
          display: block;
          border: 0;
          object-fit: contain;
        }
        .project-card-media video {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0;
          background: #090909;
          transition: opacity 220ms ease;
        }
        .project-card-media video.project-video-ready { opacity: 1; }
        .project-video-loading {
          position: absolute;
          right: 16px;
          bottom: 16px;
          z-index: 2;
          padding: 7px 10px;
          color: rgba(255, 255, 255, 0.74);
          background: rgba(0, 0, 0, 0.58);
          font: 0.68rem monospace;
        }
        .project-media-play {
          position: absolute;
          right: 16px;
          bottom: 16px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 36px;
          padding: 0 12px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #fff;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(10px);
          font: 0.72rem monospace;
          cursor: pointer;
        }
        .project-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-start;
          gap: 8px;
          padding: clamp(24px, 5vw, 48px);
          color: var(--muted);
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--fg) 7%, transparent), transparent 52%),
            repeating-linear-gradient(90deg, transparent 0, transparent 47px, color-mix(in srgb, var(--fg) 5%, transparent) 48px);
          font-family: monospace;
        }
        .project-card-placeholder strong {
          max-width: 90%;
          overflow: hidden;
          color: var(--fg);
          font-size: clamp(1.8rem, 5vw, 3.6rem);
          line-height: 1;
          letter-spacing: -0.06em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .project-card-placeholder > span { font-size: 0.72rem; }
        .project-card-cover-icon {
          display: grid;
          width: 44px;
          height: 44px;
          place-items: center;
          margin-bottom: auto;
          border: 1px solid color-mix(in srgb, var(--fg) 18%, transparent);
        }
        .project-card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          border: 0;
        }
        .project-card-copy {
          display: grid;
          gap: 12px;
        }
        .project-card-meta {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--muted);
          font: 0.7rem/1.2 monospace;
        }
        .project-card-meta span + span {
          margin-left: 5px;
          padding-left: 12px;
          border-left: 1px solid var(--border);
        }
        h3 {
          margin: 0;
          color: var(--fg);
          font: 700 clamp(1.35rem, 3vw, 1.8rem)/1.15 monospace;
          letter-spacing: -0.04em;
          text-wrap: balance;
        }
        p {
          display: -webkit-box;
          margin: 0;
          overflow: hidden;
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.65;
          text-wrap: pretty;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .project-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          padding: 0 2px;
        }
        .project-card-tags span {
          padding: 4px 8px;
          color: var(--muted);
          background: color-mix(in srgb, var(--border) 70%, transparent);
          font: 0.7rem monospace;
        }
        .project-card-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 18px;
          margin-top: auto;
          padding-top: 4px;
        }
        .project-card-actions a,
        .project-card-actions button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          min-height: 34px;
          padding: 0;
          border: 0;
          color: var(--muted);
          background: none;
          font: 0.76rem monospace;
          text-decoration: none;
          cursor: pointer;
          transition: color 180ms ease, transform 180ms ease;
        }
        .project-card-actions a:hover,
        .project-card-actions button:hover { color: var(--fg); transform: translateY(-1px); }
        .project-card-actions .project-primary-action {
          min-height: 38px;
          padding: 0 13px;
          color: var(--bg);
          background: var(--fg);
        }
        .project-card-actions .project-primary-action:hover {
          color: var(--bg);
        }
        .project-card-actions .project-mobile-live-action {
          display: none;
        }
        .project-card-qr-trigger {
          position: static;
          display: inline-flex;
        }
        .project-archived-action {
          color: var(--muted);
          font: 0.76rem/1.4 monospace;
          cursor: not-allowed;
        }
        .project-card-qr {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 4;
          display: none;
          justify-items: center;
          gap: 8px;
          width: 172px;
          padding: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
          color: var(--muted);
          font: 0.68rem monospace;
        }
        .project-card-qr-trigger:hover .project-card-qr { display: grid; }
        .project-card-qr img { width: 146px; height: 146px; }
        @media (max-width: 760px) {
          .project-card-body { padding: 22px 20px 24px; gap: 18px; }
          .project-card-placeholder { padding: 22px; }
          .project-card-actions .project-mobile-live-action { display: inline-flex; }
          .project-card-qr-trigger { display: none; }
        }
      `}</style>
    </motion.article>
  )
}
