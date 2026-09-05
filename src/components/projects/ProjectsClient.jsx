'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Monitor, Play, QrCode, Search, Smartphone } from 'lucide-react'
import QRCode from 'qrcode'
import { useLang } from '@/hooks/useLang'
import { localizeProject } from '@/lib/i18n-helpers'
import { filterProjectCatalog, getProjectArchivedLabel, getProjectTrialMode, getProjectYear, isProjectShowcaseStyleReady, shouldShowProjectCatalogTools } from '@/lib/project-showcase'
import EmptyState from '@/components/ui/EmptyState'
import GithubIcon from '@/components/ui/GithubIcon'

const typeIcons = { mobile: Smartphone, pc: Monitor, dashboard: Monitor }

function typeLabel(type, lang) {
  const labels = {
    mobile: { zh: '移动端', en: 'Mobile' },
    pc: { zh: 'PC 端', en: 'Desktop' },
    dashboard: { zh: '数据大屏', en: 'Dashboard' },
  }
  return labels[type]?.[lang] || labels.pc[lang]
}

function projectState(project, lang) {
  if (project.archived) return lang === 'zh' ? '已下架' : 'Discontinued'
  return project.deadline || (lang === 'zh' ? '持续迭代' : 'In progress')
}

function projectDate(project) {
  const date = new Date(project.createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()} · ${String(date.getMonth() + 1).padStart(2, '0')}`
}

function ProjectRiverLoading({ lang }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'grid',
        minHeight: 'min(690px, calc(100dvh - 110px))',
        placeItems: 'center',
      }}
    >
      <span
        style={{
          color: 'var(--muted, #888)',
          fontFamily: 'monospace',
          fontSize: '12px',
          letterSpacing: '.16em',
        }}
      >
        {lang === 'zh' ? '正在加载作品…' : 'LOADING WORKS…'}
      </span>
    </div>
  )
}

function ProjectMedia({ project, lang, active, onPlay, onError }) {
  const TypeIcon = typeIcons[project.project_type] || Monitor
  const previewRef = useRef(null)
  const [nearby, setNearby] = useState(false)
  useEffect(() => {
    const element = previewRef.current
    if (!element || !project.video_url) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearby(true)
        observer.disconnect()
      }
    }, { rootMargin: '100px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [project.video_url])

  if (!project.video_url || project.archived) {
    return (
      <div className="river-project-media river-project-media-static" aria-hidden="true">
        <TypeIcon size={28} strokeWidth={1.25} />
        <span>{typeLabel(project.project_type, lang)}</span>
        <strong>{project.name}</strong>
      </div>
    )
  }

  if (active) {
    return (
      <div className="river-project-media is-playing">
        <video src={project.video_url} controls autoPlay muted playsInline preload="metadata" onError={onError} />
      </div>
    )
  }

  return (
    <button ref={previewRef} type="button" className="river-project-media river-project-video-poster" onClick={onPlay} aria-label={`${lang === 'zh' ? '播放演示：' : 'Play demo: '}${project.name}`}>
      {nearby && <video src={project.video_url} muted playsInline preload="metadata" onLoadedMetadata={event => { event.currentTarget.currentTime = .1 }} onError={onError} aria-hidden="true" />}
      <span className="river-project-play"><Play size={16} fill="currentColor" />{lang === 'zh' ? '播放演示' : 'Play demo'}</span>
    </button>
  )
}

function TrialAction({ project, lang, isMobileViewport, qrCode, qrOpen, onQrOpen, onQrClose }) {
  const destination = project.demo_url || project.link
  if (!destination || destination === '#') return null
  const mode = getProjectTrialMode(project.project_type, isMobileViewport)
  if (mode === 'hidden') return null

  if (mode === 'qr') {
    return (
      <span
        className={`river-project-qr-wrap ${qrOpen ? 'is-open' : ''}`}
        onMouseEnter={onQrOpen}
        onMouseLeave={onQrClose}
        onFocus={onQrOpen}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) onQrClose()
        }}
      >
        <button type="button" className="river-project-action river-project-action-primary" onClick={onQrOpen}>
          <QrCode size={14} />{lang === 'zh' ? '扫码演示' : 'Scan demo'}
        </button>
        {qrOpen && (
          <span className="river-project-qr" role="status">
            {qrCode ? <img src={qrCode} alt={lang === 'zh' ? '项目演示二维码' : 'Project demo QR code'} /> : <span>{lang === 'zh' ? '生成中…' : 'Loading…'}</span>}
          </span>
        )}
      </span>
    )
  }

  return (
    <a className="river-project-action river-project-action-primary" href={destination} target="_blank" rel="noreferrer">
      {lang === 'zh' ? '在线试用' : 'Live demo'}<ArrowUpRight size={14} />
    </a>
  )
}

function ProjectEntry({ rawProject, index, lang, isMobileViewport, activeVideoId, failedVideos, onVideo, qrState, onQrOpen }) {
  const project = localizeProject(rawProject, lang)
  const TypeIcon = typeIcons[project.project_type] || Monitor
  const videoFailed = failedVideos.has(project.id)

  return (
    <article
      className={`river-project ${index % 2 === 0 ? 'is-left' : 'is-right'} ${project.archived ? 'is-archived' : ''}`}
    >
      <div className="river-project-node" aria-hidden="true"><span /></div>
      <span className="river-project-date">{projectDate(project)}</span>
      <div className="river-project-visual">
        {videoFailed ? (
          <div className="river-project-media river-project-media-static">
            <TypeIcon size={28} strokeWidth={1.25} /><span>{lang === 'zh' ? '演示暂不可用' : 'Demo unavailable'}</span><strong>{project.name}</strong>
          </div>
        ) : (
          <ProjectMedia project={project} lang={lang} active={activeVideoId === project.id} onPlay={() => onVideo(project.id)} onError={() => onVideo(project.id, true)} />
        )}
        {project.archived && <span className="river-project-archived-badge">{getProjectArchivedLabel(true, lang)}</span>}
      </div>

      <div className="river-project-content">
        <div className="river-project-eyebrow">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span><TypeIcon size={13} />{typeLabel(project.project_type, lang)}</span>
          <span className="river-project-status">{projectState(project, lang)}</span>
        </div>
        <h2>{project.name}</h2>
        <p className="river-project-description">{project.description}</p>

        {project.tags.length > 0 && <div className="river-project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}

        {project.capabilities.length > 0 && (
          <ol className="river-project-capabilities" aria-label={lang === 'zh' ? '核心能力' : 'Capabilities'}>
            {project.capabilities.map((capability, capabilityIndex) => (
              <li key={capability.id ?? capability.title}>
                <span className="river-project-capability-number">{capabilityIndex + 1}</span>
                <span><strong>{capability.title}</strong>{capability.description && <small>{capability.description}</small>}</span>
              </li>
            ))}
          </ol>
        )}

        {project.archived ? (
          <div className="river-project-archived-note">{lang === 'zh' ? '该作品已停止维护，相关入口已关闭' : 'This project is no longer maintained and its links are disabled.'}</div>
        ) : (
          <div className="river-project-actions">
            <TrialAction project={project} lang={lang} isMobileViewport={isMobileViewport} qrCode={qrState.code} qrOpen={qrState.open} onQrOpen={() => onQrOpen(project)} onQrClose={() => onQrOpen(null)} />
            <Link className="river-project-action" href={`/projects/${project.id}`}>{lang === 'zh' ? '查看详情' : 'View details'}<ArrowUpRight size={14} /></Link>
            {project.github && <a className="river-project-action" href={project.github} target="_blank" rel="noreferrer"><GithubIcon size={14} />GitHub</a>}
          </div>
        )}
      </div>
    </article>
  )
}

export default function ProjectsClient({ projects }) {
  const { lang } = useLang()
  const pageRef = useRef(null)
  const [stylesReady, setStylesReady] = useState(false)
  const [query, setQuery] = useState('')
  const [projectType, setProjectType] = useState('all')
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [failedVideos, setFailedVideos] = useState(() => new Set())
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [qrRequestedId, setQrRequestedId] = useState(null)
  const [qrCodes, setQrCodes] = useState({})
  const showCatalogTools = shouldShowProjectCatalogTools(projects)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const syncViewport = () => setIsMobileViewport(media.matches)
    syncViewport()
    media.addEventListener('change', syncViewport)
    return () => media.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    let frameId

    const revealWhenStyled = () => {
      if (isProjectShowcaseStyleReady(pageRef.current)) {
        setStylesReady(true)
        return
      }
      frameId = window.requestAnimationFrame(revealWhenStyled)
    }

    revealWhenStyled()
    return () => window.cancelAnimationFrame(frameId)
  }, [])

  const visibleProjects = useMemo(() => filterProjectCatalog(projects, { projectType, query }), [projects, projectType, query])
  const yearGroups = useMemo(() => {
    const groups = []
    visibleProjects.forEach(project => {
      const year = getProjectYear(project) || (lang === 'zh' ? '未标注' : 'Undated')
      const previous = groups[groups.length - 1]
      if (previous?.year === year) previous.projects.push(project)
      else groups.push({ year, projects: [project] })
    })
    return groups
  }, [visibleProjects, lang])

  const openQr = async project => {
    if (!project) {
      setQrRequestedId(null)
      return
    }
    const destination = project.demo_url || project.link
    setQrRequestedId(project.id)
    if (qrCodes[project.id] || !destination || destination === '#') return
    try {
      const code = await QRCode.toDataURL(destination, { width: 220, margin: 1 })
      setQrCodes(current => ({ ...current, [project.id]: code }))
    } catch {
      setQrCodes(current => ({ ...current, [project.id]: '' }))
    }
  }

  const handleVideo = (projectId, failed = false) => {
    if (failed) {
      setFailedVideos(current => new Set(current).add(projectId))
      setActiveVideoId(null)
      return
    }
    setActiveVideoId(projectId)
  }

  if (projects.length === 0) return <EmptyState message={lang === 'zh' ? '暂无项目' : 'No projects yet'} />

  return (
    <main ref={pageRef} className="projects-river-page">
      {stylesReady ? <>
        {showCatalogTools && (
        <div className="projects-river-tools">
          <label><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={lang === 'zh' ? '搜索作品' : 'Search projects'} /></label>
          <select value={projectType} onChange={event => setProjectType(event.target.value)} aria-label={lang === 'zh' ? '项目类型' : 'Project type'}>
            <option value="all">{lang === 'zh' ? '全部类型' : 'All types'}</option><option value="pc">{lang === 'zh' ? 'PC 端' : 'Desktop'}</option><option value="mobile">{lang === 'zh' ? '移动端' : 'Mobile'}</option><option value="dashboard">{lang === 'zh' ? '数据大屏' : 'Dashboard'}</option>
          </select>
        </div>
        )}

        {visibleProjects.length === 0 ? <EmptyState message={lang === 'zh' ? '没有匹配的项目' : 'No matching projects'} /> : (
          <div className="projects-river">
            <div className="projects-timeline-line" aria-hidden="true" />
            {yearGroups.map(group => (
              <section key={group.year} id={`projects-year-${group.year}`} className="projects-year-group">
                <div className="projects-year-heading"><span>{group.year}</span></div>
                {group.projects.map(project => {
                  const index = visibleProjects.findIndex(item => item.id === project.id)
                  return <ProjectEntry key={project.id} rawProject={project} index={index} lang={lang} isMobileViewport={isMobileViewport} activeVideoId={activeVideoId} failedVideos={failedVideos} onVideo={handleVideo} qrState={{ open: qrRequestedId === project.id, code: qrCodes[project.id] }} onQrOpen={openQr} />
                })}
              </section>
            ))}
          </div>
        )}
      </> : <ProjectRiverLoading lang={lang} />}

      <style jsx global>{`
        .projects-river-page { --project-showcase-ready: 1; --river-line: color-mix(in srgb, var(--fg) 30%, transparent); --river-soft: color-mix(in srgb, var(--fg) 7%, transparent); width: 100%; padding: clamp(36px, 6vw, 70px) 0 120px; }
        .projects-river-tools { display: flex; gap: 10px; max-width: 1080px; margin: 0 auto 72px; padding: 0 24px; }
        .projects-river-tools label { display: flex; align-items: center; gap: 8px; flex: 1; padding: 0 12px; border: 1px solid var(--border); }
        .projects-river-tools input, .projects-river-tools select { min-height: 42px; border: 0; color: var(--fg); background: transparent; font: .78rem/1.2 monospace; outline: none; }
        .projects-river-tools input { width: 100%; } .projects-river-tools select { padding: 0 12px; border: 1px solid var(--border); }
        .projects-river { position: relative; max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .projects-year-group { position: relative; scroll-margin-top: 92px; } .projects-year-group + .projects-year-group { margin-top: 54px; }
        .projects-year-heading { position: absolute; z-index: 0; top: -54px; left: 0; color: color-mix(in srgb, var(--fg) 10%, transparent); pointer-events: none; }
        .projects-year-group:nth-of-type(even) .projects-year-heading { right: 0; left: auto; }
        .projects-year-heading span { font: 300 clamp(4.8rem, 9vw, 7.4rem)/1 monospace; letter-spacing: -.08em; }
        .river-project { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) 96px minmax(0, 1fr); grid-template-areas: 'visual node content'; align-items: center; min-height: 350px; margin-bottom: clamp(52px, 7vw, 92px); }
        .river-project.is-right { grid-template-areas: 'content node visual'; }
        .river-project-node { grid-area: node; position: relative; align-self: stretch; }
        .river-project-node span { position: absolute; top: 50%; left: 50%; display: block; width: 12px; height: 12px; margin: -6px 0 0 -6px; border: 3px solid var(--bg); border-radius: 50%; background: var(--fg); box-shadow: 0 0 0 1px var(--river-line), 0 0 24px color-mix(in srgb, var(--fg) 25%, transparent); transform: translateX(var(--river-node-x)); }
        .river-project-date { position: absolute; z-index: 3; top: 50%; left: 50%; color: color-mix(in srgb, var(--fg) 72%, var(--muted)); font: .62rem/1 monospace; white-space: nowrap; transform: translate(calc(var(--river-node-x) - 74px), -22px); }
        .river-project-visual { position: relative; grid-area: visual; min-width: 0; } .river-project-content { grid-area: content; min-width: 0; }
        .river-project.is-left .river-project-visual { padding-right: 18px; } .river-project.is-left .river-project-content { padding-left: 18px; } .river-project.is-right .river-project-content { padding-right: 18px; } .river-project.is-right .river-project-visual { padding-left: 18px; }
        .river-project-media { position: relative; display: flex; aspect-ratio: 16/10; width: 100%; min-height: 220px; overflow: hidden; border: 1px solid var(--border); border-radius: 2px; color: var(--fg); background: linear-gradient(135deg, color-mix(in srgb, var(--fg) 5%, transparent), transparent 62%), repeating-linear-gradient(90deg, transparent 0 48px, color-mix(in srgb, var(--fg) 3%, transparent) 49px 50px); }
        .river-project-media::after { content: ''; position: absolute; inset: 10px; border: 1px solid color-mix(in srgb, var(--fg) 7%, transparent); pointer-events: none; }
        .river-project-media video { width: 100%; height: 100%; object-fit: contain; background: #050505; } .river-project-media.is-playing::after { display: none; }
        .river-project-media-static { flex-direction: column; align-items: flex-start; justify-content: flex-end; gap: 9px; padding: 28px; }
        .river-project-media-static span { color: var(--muted); font: .66rem/1.2 monospace; letter-spacing: .12em; text-transform: uppercase; }
        .river-project-media-static strong { max-width: 90%; font-size: clamp(1.45rem, 3vw, 2.5rem); font-weight: 500; line-height: 1; letter-spacing: -.04em; }
        .river-project-video-poster { flex-direction: column; justify-content: space-between; padding: 24px; font: inherit; text-align: left; cursor: pointer; }
        .river-project-video-poster:hover { border-color: color-mix(in srgb, var(--fg) 45%, var(--border)); } .river-project-video-poster:focus-visible { outline: 2px solid var(--fg); outline-offset: 4px; }
        .river-project-media-type { display: inline-flex; align-items: center; gap: 7px; color: var(--muted); font: .66rem/1.2 monospace; letter-spacing: .1em; text-transform: uppercase; }
        .river-project-media-name { max-width: 90%; font-size: clamp(1.7rem, 3vw, 2.9rem); font-weight: 500; line-height: .98; letter-spacing: -.05em; } .river-project-play { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font: .7rem/1.2 monospace; }
        .river-project-eyebrow { display: flex; flex-wrap: wrap; gap: 12px 16px; align-items: center; color: var(--muted); font: .65rem/1.2 monospace; letter-spacing: .08em; text-transform: uppercase; }
        .river-project-eyebrow > span { display: inline-flex; align-items: center; gap: 6px; } .river-project-status { margin-left: auto; }
        .river-project-content h2 { margin: 16px 0 12px; font-size: clamp(1.75rem, 3vw, 2.8rem); font-weight: 500; line-height: 1; letter-spacing: -.045em; overflow-wrap: anywhere; }
        .river-project-description { margin: 0; color: color-mix(in srgb, var(--fg) 76%, var(--muted)); font-size: .92rem; line-height: 1.78; }
        .river-project-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; } .river-project-tags span { padding: 5px 8px; border: 1px solid var(--border); color: var(--muted); font: .62rem/1.2 monospace; white-space: nowrap; }
        .river-project-capabilities { display: grid; gap: 0; margin: 24px 0 0; padding: 0; border-top: 1px solid var(--border); list-style: none; }
        .river-project-capabilities li { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .river-project-capability-number { color: var(--muted); font: .62rem/1.5 monospace; } .river-project-capabilities strong { display: block; font-size: .78rem; font-weight: 500; line-height: 1.45; }
        .river-project-capabilities small { display: block; margin-top: 4px; color: var(--muted); font-size: .68rem; line-height: 1.55; }
        .river-project-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
        .river-project-action { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; gap: 7px; padding: 0 12px; border: 1px solid var(--border); color: var(--fg); background: transparent; font: .66rem/1.2 monospace; text-decoration: none; cursor: pointer; transition: border-color 160ms ease, background 160ms ease, color 160ms ease; }
        .river-project-action:hover { border-color: color-mix(in srgb, var(--fg) 55%, var(--border)); background: var(--river-soft); color: var(--fg); } .river-project-action:focus-visible { outline: 2px solid var(--fg); outline-offset: 3px; }
        .river-project-action-primary { border-color: var(--fg); color: var(--bg); background: var(--fg); } .river-project-action-primary:hover { border-color: var(--fg); color: var(--bg); background: var(--fg); opacity: .86; }
        .river-project-qr-wrap { position: relative; display: inline-flex; } .river-project-qr { position: absolute; right: 0; bottom: calc(100% + 10px); z-index: 10; display: grid; width: 174px; min-height: 174px; place-items: center; padding: 10px; border: 1px solid var(--border); background: #fff; box-shadow: 0 18px 50px rgba(0,0,0,.28); color: #222; font: .68rem/1.2 monospace; }
        .river-project-qr img { width: 152px; height: 152px; } .river-project-archived-note { margin-top: 22px; padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); color: var(--muted); font: .67rem/1.55 monospace; }
        .river-project-archived-badge { position: absolute; right: 14px; bottom: 14px; z-index: 2; padding: 6px 10px; border: 1px solid color-mix(in srgb, var(--fg) 32%, transparent); border-radius: 2px; color: color-mix(in srgb, var(--fg) 48%, transparent); background: color-mix(in srgb, var(--bg) 82%, transparent); font: 10px/1.2 monospace; letter-spacing: .12em; transform: rotate(-8deg); transform-origin: center; }
        .river-project.is-archived .river-project-media { opacity: .5; filter: grayscale(1); } .river-project.is-archived .river-project-content { opacity: .58; } .river-project.is-archived .river-project-node span { background: var(--muted); box-shadow: 0 0 0 1px var(--river-line); }
        @media (max-width: 900px) { .river-project { grid-template-columns: minmax(0,1fr) 70px minmax(0,1fr); } .river-project.is-left .river-project-visual { padding-right: 8px; } .river-project.is-left .river-project-content { padding-left: 8px; } .river-project.is-right .river-project-content { padding-right: 8px; } .river-project.is-right .river-project-visual { padding-left: 8px; } .river-project-media { min-height: 220px; } }
        @media (max-width: 760px) {
          .projects-river-page { padding-top: 28px; padding-bottom: 72px; }
          .projects-river-tools { margin: 0 auto 54px; padding: 0 18px; } .projects-river { padding: 0 18px 0 52px; }
          .projects-year-heading, .projects-year-group:nth-of-type(even) .projects-year-heading { top: -30px; right: auto; left: 0; } .projects-year-heading span { font-size: 3.2rem; }
          .river-project, .river-project.is-right { grid-template-columns: 1fr; grid-template-areas: 'visual' 'content'; gap: 26px; min-height: 0; margin-bottom: 94px; }
          .river-project-node { position: absolute; top: 28px; left: -32px; } .river-project-node span { position: static; width: 10px; height: 10px; margin: 0; transform: none; } .river-project-date { top: 26px; left: -10px; transform: none; }
          .river-project.is-left .river-project-visual, .river-project.is-left .river-project-content, .river-project.is-right .river-project-content, .river-project.is-right .river-project-visual { padding: 0; }
          .river-project-media { min-height: 0; aspect-ratio: 16/10; } .river-project-content h2 { font-size: clamp(2rem, 11vw, 3rem); } .river-project-status { margin-left: 0; } .river-project-qr-wrap { display: none; }
        }
        @media (prefers-reduced-motion: reduce) { .river-project-action, .river-project-video-poster { transition: none; } }
        .projects-river-page { position: relative; isolation: isolate; padding-top: clamp(72px, 8vw, 104px); }
        .projects-river { --river-node-x: 0px; --river-section-gap: 70px; --river-media-offset: 40px; max-width: 1080px; padding: 0 32px 90px; }
        .projects-timeline-line { position: absolute; top: 0; bottom: 0; left: calc(50% - .5px); width: 1px; background: color-mix(in srgb, var(--fg) 35%, transparent); pointer-events: none; }
        .projects-year-group + .projects-year-group { margin-top: 88px; }
        .projects-year-heading { top: -62px; }
        .projects-year-heading span { font-size: 86px; font-weight: 200; color: transparent; -webkit-text-stroke: 1px color-mix(in srgb, var(--fg) 13%, transparent); }
        .river-project { grid-template-columns: minmax(0, 1fr) 144px minmax(0, 1fr); align-items: start; min-height: 332px; margin-bottom: var(--river-section-gap); }
        .river-project-node { position: absolute; left: calc(50% - 7px); top: 24px; width: 14px; height: 14px; }
        .river-project-node span { position: static; margin: 0; width: 14px; height: 14px; border: 3px solid var(--bg); outline: 1px solid #aaa; box-shadow: 0 0 0 3px #ffffff15, 0 0 17px #ffffff66; }
        .river-project-date { top: 31px; transform: translate(calc(var(--river-node-x) - 80px), -50%); }
        .river-project.is-left .river-project-visual,
        .river-project.is-left .river-project-content,
        .river-project.is-right .river-project-content,
        .river-project.is-right .river-project-visual { padding: 0; }
        .river-project-visual { margin-top: var(--river-media-offset); }
        .river-project-eyebrow { display: none; }
        .river-project-content h2 { margin: 0 0 12px; font-size: 36px; letter-spacing: -.025em; font-weight: 600; }
        .river-project-description { font-size: 14px; line-height: 1.75; color: var(--muted); }
        .river-project-tags { gap: 8px; margin-top: 16px; }
        .river-project-tags span { border: 0; background: color-mix(in srgb, var(--fg) 7%, transparent); border-radius: 2px; padding: 6px 9px; font: 10px/1.3 inherit; }
        .river-project-capabilities { border: 0; margin-top: 24px; gap: 9px; }
        .river-project-capabilities::before { content: attr(aria-label); margin-bottom: 4px; font-size: 13px; }
        .river-project-capabilities li { border: 0; padding: 0; grid-template-columns: 16px 1fr; gap: 9px; }
        .river-project-capability-number { border: 1px solid var(--muted); border-radius: 50%; width: 15px; height: 15px; text-align: center; font: 9px/13px monospace; }
        .river-project-capabilities strong { font-weight: 400; font-size: 13px; color: var(--muted); }
        .river-project-capabilities small { display: block; margin-top: 5px; font-size: 13px; line-height: 1.7; }
        .river-project-actions { margin-top: 28px; gap: 22px; }
        .river-project-action { padding: 0; border: 0; background: transparent; color: var(--fg); font-size: 11px; min-height: 32px; }
        .river-project-action:hover { background: transparent; color: var(--fg); opacity: .7; }
        .river-project-action-primary { min-height: 34px; padding: 0 14px; border: 1px solid var(--fg); color: var(--bg); background: var(--fg); }
        .river-project-action-primary:hover { border-color: var(--fg); color: var(--bg); background: var(--fg); opacity: .82; }
        .river-project-media { min-height: 0; aspect-ratio: 1.58; background: color-mix(in srgb, var(--bg) 97%, var(--fg)); }
        .river-project-media::after { display: none; }
        .river-project-video-poster { padding: 0; }
        .river-project-video-poster video { position: absolute; inset: 0; pointer-events: none; }
        .river-project-play { position: absolute; bottom: 12px; right: 12px; padding: 7px 9px; background: #080b0cba; border-radius: 2px; color: #eee; font-size: 10px; }
        .river-project-media-static { opacity: .45; padding: 24px; }
        .river-project-media-static strong { font-size: 23px; }
        @media (max-width: 760px) {
          .projects-river-page { padding-top: 56px; }
          .projects-river { padding: 0 12px 50px 60px; }
          .projects-timeline-line { left: 33.5px; }
          .river-project, .river-project.is-right { grid-template-columns: 1fr; grid-template-areas: 'content' 'visual'; min-height: 0; gap: 18px; margin-bottom: 70px; }
          .river-project-node { left: -33px; top: 7px; }
          .river-project-node span { transform: none; }
          .river-project-date { left: 0; top: -18px; transform: none; font-size: 9px; }
          .river-project-visual { margin-top: 0; }
          .river-project-content h2 { font-size: 30px; }
          .projects-year-heading, .projects-year-group:nth-of-type(even) .projects-year-heading { top: -57px; }
          .projects-year-heading span { font-size: 48px; }
        }
      `}</style>
    </main>
  )
}
