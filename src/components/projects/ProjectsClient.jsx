'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Box,
  Circle,
  Database,
  Layers3,
  Monitor,
  ShieldCheck,
  Smartphone,
  Workflow,
  QrCode,
  Search,
} from 'lucide-react'
import QRCode from 'qrcode'
import { useLang } from '@/hooks/useLang'
import { localizeProject } from '@/lib/i18n-helpers'
import {
  filterProjectCatalog,
  getProjectTrialMode,
  getProjectYear,
  getProjectYearCounts,
  getInitialProjectYear,
  getYearOptions,
  isProjectShowcaseStyleReady,
  selectDefaultProject,
  shouldShowProjectCatalogTools,
} from '@/lib/project-showcase'
import EmptyState from '@/components/ui/EmptyState'
import GithubIcon from '@/components/ui/GithubIcon'

const typeIcons = { mobile: Smartphone, pc: Monitor, dashboard: Monitor }
const capabilityIcons = {
  circle: Circle,
  workflow: Workflow,
  shield: ShieldCheck,
  database: Database,
  layers: Layers3,
  monitor: Monitor,
  mobile: Smartphone,
  box: Box,
}

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

function ProjectShowcaseLoading({ lang }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'grid',
        minHeight: 'min(690px, calc(100vh - 110px))',
        placeItems: 'center',
      }}
    >
      <span
        style={{
          color: 'var(--muted, #888)',
          fontFamily: 'monospace',
          fontSize: '12px',
          letterSpacing: '0.16em',
        }}
      >
        {lang === 'zh' ? '正在加载作品…' : 'LOADING WORKS…'}
      </span>
    </div>
  )
}

export default function ProjectsClient({ projects }) {
  const { lang, t } = useLang()
  const showcaseRef = useRef(null)
  const [stylesReady, setStylesReady] = useState(false)
  const [activeYear, setActiveYear] = useState(() => getInitialProjectYear())
  const [query, setQuery] = useState('')
  const [projectType, setProjectType] = useState('all')
  const [selectedId, setSelectedId] = useState(() => selectDefaultProject(projects)?.id ?? null)
  const [qrRequestedId, setQrRequestedId] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const yearOptions = getYearOptions()
  const yearCounts = getProjectYearCounts(projects)
  const showCatalogTools = shouldShowProjectCatalogTools(projects)
  const visibleProjects = filterProjectCatalog(projects, { activeYear, projectType, query })
  const selectedProject = visibleProjects.find(project => project.id === selectedId)
    || selectDefaultProject(visibleProjects)
  const hasActiveFilters = activeYear !== null || projectType !== 'all' || query.trim() !== ''
  const localizedSelected = localizeProject(selectedProject, lang)
  const desktopTrialMode = selectedProject
    ? getProjectTrialMode(selectedProject.project_type, false)
    : 'hidden'
  const mobileTrialMode = selectedProject
    ? getProjectTrialMode(selectedProject.project_type, true)
    : 'hidden'

  useEffect(() => {
    if (!selectedProject?.demo_url || qrRequestedId !== selectedProject.id) return
    let cancelled = false

    QRCode.toDataURL(selectedProject.demo_url, { width: 320, margin: 1 })
      .then(url => {
        if (!cancelled) setQrCode({ projectId: selectedProject.id, url })
      })
      .catch(console.error)

    return () => { cancelled = true }
  }, [qrRequestedId, selectedProject])

  useEffect(() => {
    let frameId

    const revealWhenStyled = () => {
      if (isProjectShowcaseStyleReady(showcaseRef.current)) {
        setStylesReady(true)
        return
      }
      frameId = window.requestAnimationFrame(revealWhenStyled)
    }

    revealWhenStyled()
    return () => window.cancelAnimationFrame(frameId)
  }, [])

  return (
    <div ref={showcaseRef} className="projects-showcase">
      {stylesReady ? (
        <>
          <header className="projects-intro">
        <h1>{t('nav.projects')}</h1>
        <p>
          {lang === 'zh'
            ? '从实际问题出发，把想法做成可以体验、可以使用的产品。'
            : 'Products built from real problems, ready to see and use.'}
        </p>
          </header>

          <nav className="projects-years" aria-label={lang === 'zh' ? '按年份筛选作品' : 'Filter works by year'}>
        <button
          type="button"
          aria-pressed={activeYear === null}
          className={activeYear === null ? 'is-active' : ''}
          onClick={() => setActiveYear(null)}
        >
          <span>{lang === 'zh' ? '全部' : 'All'}</span>
          <span className="projects-year-count">{projects.length}</span>
        </button>
        {yearOptions.map(year => (
          <button
            key={year}
            type="button"
            aria-pressed={activeYear === year}
            className={activeYear === year ? 'is-active' : ''}
            onClick={() => setActiveYear(year)}
          >
            <span>{year}</span>
            <span className="projects-year-count">{yearCounts[year] || 0}</span>
          </button>
        ))}
          </nav>

          {showCatalogTools && (
            <div className="projects-catalog-tools">
              <label className="projects-search">
                <Search size={15} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={lang === 'zh' ? '搜索作品' : 'Search works'}
                  aria-label={lang === 'zh' ? '搜索作品' : 'Search works'}
                />
              </label>
              <div className="projects-type-filter" aria-label={lang === 'zh' ? '按载体筛选' : 'Filter by platform'}>
                {['all', 'pc', 'mobile', 'dashboard'].map(type => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={projectType === type}
                    className={projectType === type ? 'is-active' : ''}
                    onClick={() => setProjectType(type)}
                  >
                    {type === 'all' ? (lang === 'zh' ? '全部载体' : 'All platforms') : typeLabel(type, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedProject ? (
            <>
              <label className="projects-mobile-selector">
                <span>{lang === 'zh' ? '选择作品' : 'Select work'}</span>
                <select
                  value={selectedProject.id}
                  onChange={event => {
                    setSelectedId(Number(event.target.value))
                    setQrRequestedId(null)
                    setQrCode(null)
                  }}
                >
                  {visibleProjects.map((project, index) => {
                    const localized = localizeProject(project, lang)
                    return (
                      <option key={project.id} value={project.id}>
                        {String(index + 1).padStart(2, '0')} · {localized.name} · {typeLabel(project.project_type, lang)}
                      </option>
                    )
                  })}
                </select>
              </label>
              <section className="projects-master-detail">
          <div className="projects-index" aria-label={lang === 'zh' ? '作品列表' : 'Works list'}>
            {visibleProjects.map((project, index) => {
              const localized = localizeProject(project, lang)
              const TypeIcon = typeIcons[project.project_type] || Monitor
              const selected = project.id === selectedProject.id

              return (
                <button
                  key={project.id}
                  type="button"
                  className={`project-index-row ${selected ? 'is-selected' : ''}`}
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => {
                    setSelectedId(project.id)
                    setQrRequestedId(null)
                    setQrCode(null)
                  }}
                >
                  <span className="project-index-marker" aria-hidden="true" />
                  <span className="project-index-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="project-index-name">{localized.name}</span>
                  <span className="project-index-type"><TypeIcon size={13} />{typeLabel(project.project_type, lang)}</span>
                  <span className="project-index-tags">
                    {localized.tags.slice(0, 2).map(tag => <span className="project-tag" key={tag}>{tag}</span>)}
                  </span>
                </button>
              )
            })}
          </div>

          <article
            key={`${selectedProject.id}-${lang}`}
            className="project-detail-panel"
          >
            <div className="project-detail-topline">
              <div className="project-detail-copy">
                <h2>{localizedSelected.name}</h2>
                <p>{localizedSelected.description}</p>
              </div>
              <div className="project-detail-actions">
                {localizedSelected.demo_url && !localizedSelected.archived && (desktopTrialMode === 'link' || mobileTrialMode === 'link') && (
                  <a className={`project-action project-action-primary ${desktopTrialMode === 'qr' ? 'project-mobile-direct-trial' : ''} ${mobileTrialMode === 'hidden' ? 'project-pc-trial' : ''}`} href={localizedSelected.demo_url} target="_blank" rel="noopener noreferrer">
                    {lang === 'zh' ? '在线体验' : 'Live demo'} <ArrowUpRight size={16} />
                  </a>
                )}
                {localizedSelected.demo_url && !localizedSelected.archived && desktopTrialMode === 'qr' && (
                  <div
                    className={`project-showcase-qr-trigger ${qrRequestedId === selectedProject.id ? 'is-open' : ''}`}
                    onMouseEnter={() => setQrRequestedId(selectedProject.id)}
                    onMouseLeave={() => setQrRequestedId(null)}
                  >
                    <button
                      type="button"
                      className="project-action project-action-primary"
                      aria-expanded={qrRequestedId === selectedProject.id}
                      onFocus={() => setQrRequestedId(selectedProject.id)}
                      onClick={() => setQrRequestedId(selectedProject.id)}
                    >
                      <QrCode size={16} /> {lang === 'zh' ? '扫码体验' : 'Scan to try'}
                    </button>
                    {qrRequestedId === selectedProject.id && qrCode?.projectId === selectedProject.id && (
                      <div className="project-showcase-qr" role="status">
                        <img src={qrCode.url} alt={lang === 'zh' ? '在线体验二维码' : 'Live demo QR code'} />
                        <span>{lang === 'zh' ? '手机扫码打开' : 'Scan on your phone'}</span>
                      </div>
                    )}
                  </div>
                )}
                <Link className="project-action" href={`/projects/${selectedProject.id}`}>
                  {lang === 'zh' ? '查看详情' : 'View details'} <ArrowUpRight size={16} />
                </Link>
                {localizedSelected.github && (
                  <a className="project-action" href={localizedSelected.github} target="_blank" rel="noopener noreferrer">
                    <GithubIcon size={16} /> {lang === 'zh' ? '源码' : 'Source'}
                  </a>
                )}
              </div>
            </div>

            <div className="project-detail-meta">
              <span className="project-tag">{typeLabel(selectedProject.project_type, lang)}</span>
              {localizedSelected.tags.slice(0, 3).map(tag => <span className="project-tag" key={tag}>{tag}</span>)}
              <span className="project-state"><span aria-hidden="true" />{projectState(localizedSelected, lang)}</span>
              {getProjectYear(selectedProject) && <span className="project-year">{getProjectYear(selectedProject)}</span>}
            </div>

            {localizedSelected.capabilities.length > 0 && (
              <section className="project-capabilities" aria-labelledby={`project-capabilities-${selectedProject.id}`}>
                <h3 id={`project-capabilities-${selectedProject.id}`}>{lang === 'zh' ? '核心能力' : 'Core capabilities'}</h3>
                <div className="project-capability-list">
                  {localizedSelected.capabilities.map(capability => {
                    const CapabilityIcon = capabilityIcons[capability.icon] || Circle
                    return (
                      <div className="project-capability" key={capability.id || `${capability.title}-${capability.sortOrder}`}>
                        <span className="project-capability-icon" aria-hidden="true"><CapabilityIcon size={29} strokeWidth={1.35} /></span>
                        <div>
                          <h4>{capability.title}</h4>
                          <p>{capability.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </article>
              </section>
            </>
          ) : (
            <EmptyState
              message={hasActiveFilters
                ? (lang === 'zh' ? '没有匹配的作品' : 'No matching works')
                : (lang === 'zh' ? '暂无作品' : 'No works yet')}
              actionLabel={hasActiveFilters ? (lang === 'zh' ? '清除筛选' : 'Clear filters') : null}
              onAction={hasActiveFilters ? () => {
                setActiveYear(null)
                setProjectType('all')
                setQuery('')
              } : null}
            />
          )}
        </>
      ) : (
        <ProjectShowcaseLoading lang={lang} />
      )}

      <style jsx>{`
        :global(.cat-duty) {
          display: none !important;
        }
        .projects-showcase {
          --project-showcase-ready: 1;
          width: 100%;
          max-width: 1340px;
          margin: 0 auto;
          padding-bottom: 56px;
        }
        .projects-intro { margin: 0 0 26px 32px; }
        .projects-intro h1 {
          margin-bottom: 10px;
          color: var(--fg);
          font: 700 clamp(2rem, 3.2vw, 2.8rem)/1.1 monospace;
          letter-spacing: -0.055em;
        }
        .projects-intro p {
          max-width: 620px;
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.7;
        }
        .projects-years {
          display: flex;
          gap: 10px;
          margin: 0 0 20px 32px;
        }
        .projects-years button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-width: 58px;
          height: 38px;
          padding: 0 14px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: color-mix(in srgb, var(--bg) 94%, transparent);
          font: 0.78rem/1 monospace;
          cursor: pointer;
          transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease;
        }
        .projects-years button:hover { border-color: color-mix(in srgb, var(--fg) 50%, var(--border)); color: var(--fg); }
        .projects-years button:focus-visible,
        .project-index-row:focus-visible,
        :global(.project-action:focus-visible) { outline: 2px solid var(--fg); outline-offset: 3px; }
        .projects-years button.is-active {
          border-color: var(--fg);
          color: var(--bg);
          background: var(--fg);
        }
        .projects-year-count {
          opacity: 0.58;
          font-size: 0.65rem;
        }
        .projects-catalog-tools {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 0 0 18px 32px;
        }
        .projects-search {
          display: flex;
          align-items: center;
          gap: 9px;
          width: min(300px, 32vw);
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: color-mix(in srgb, var(--bg) 94%, transparent);
        }
        .projects-search:focus-within { border-color: var(--fg); color: var(--fg); }
        .projects-search input {
          min-width: 0;
          width: 100%;
          border: 0;
          outline: 0;
          color: var(--fg);
          background: transparent;
          font: 0.76rem/1 monospace;
        }
        .projects-search input::placeholder { color: var(--muted); }
        .projects-type-filter { display: flex; gap: 7px; }
        .projects-type-filter button {
          min-height: 40px;
          padding: 0 12px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: transparent;
          font: 0.7rem/1 monospace;
          cursor: pointer;
        }
        .projects-type-filter button:hover,
        .projects-type-filter button.is-active { border-color: var(--fg); color: var(--fg); }
        .projects-mobile-selector { display: none; }
        .projects-master-detail {
          display: grid;
          grid-template-columns: minmax(390px, 36%) minmax(0, 64%);
          height: min(690px, calc(100dvh - 150px));
          min-height: 560px;
          border: 1px solid color-mix(in srgb, var(--fg) 26%, var(--border));
          background: color-mix(in srgb, var(--bg) 96%, transparent);
          backdrop-filter: blur(3px);
        }
        .projects-index {
          min-width: 0;
          overflow-y: auto;
          border-right: 1px solid color-mix(in srgb, var(--fg) 26%, var(--border));
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .project-index-row {
          position: relative;
          display: grid;
          grid-template-columns: 36px minmax(118px, 1fr) auto auto;
          column-gap: 10px;
          align-items: center;
          width: 100%;
          min-height: 86px;
          padding: 16px 24px;
          border: 0;
          border-bottom: 1px solid var(--border);
          color: var(--muted);
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: color 160ms ease, background-color 160ms ease;
        }
        .project-index-row:last-child { border-bottom: 0; }
        .project-index-row:hover,
        .project-index-row.is-selected {
          color: var(--fg);
          background: color-mix(in srgb, var(--fg) 2.6%, transparent);
        }
        .project-index-marker {
          position: absolute;
          top: 50%;
          left: 4px;
          width: 3px;
          height: 0;
          background: var(--fg);
          transform: translateY(-50%);
          transition: height 160ms ease;
        }
        .project-index-row.is-selected .project-index-marker { height: 34px; }
        .project-index-number {
          color: var(--muted);
          font: 0.83rem/1 monospace;
        }
        .project-index-name {
          overflow: hidden;
          color: inherit;
          font: 600 clamp(0.95rem, 1.2vw, 1.1rem)/1.2 monospace;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .project-index-tags {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }
        .project-index-type {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          color: var(--muted);
          font: 0.7rem/1 monospace;
        }
        .project-index-tags .project-tag { padding-inline: 7px; }
        .project-tag {
          display: inline-flex;
          align-items: center;
          min-height: 27px;
          padding: 0 9px;
          border: 1px solid var(--border);
          color: var(--muted);
          font: 0.69rem/1.2 monospace;
          white-space: nowrap;
        }
        .project-detail-panel {
          min-width: 0;
          overflow-y: auto;
          padding: 36px 38px 32px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .project-detail-topline {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 28px;
        }
        .project-detail-copy { flex: 1 1 auto; min-width: 0; }
        .project-detail-copy h2 {
          margin-bottom: 14px;
          color: var(--fg);
          font: 700 clamp(2rem, 3.2vw, 2.75rem)/1 monospace;
          letter-spacing: -0.045em;
          overflow-wrap: anywhere;
        }
        .project-detail-copy p {
          color: var(--muted);
          font-size: 0.95rem;
          line-height: 1.75;
        }
        .project-detail-actions {
          display: flex;
          flex: 0 0 auto;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
        }
        .project-mobile-direct-trial { display: none !important; }
        .project-showcase-qr-trigger { position: relative; }
        .project-showcase-qr {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 5;
          display: grid;
          justify-items: center;
          gap: 8px;
          width: 176px;
          padding: 12px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: var(--bg);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
          font: 0.68rem/1.3 monospace;
        }
        .project-showcase-qr img { width: 150px; height: 150px; }
        :global(.project-action) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 44px;
          padding: 0 16px;
          border: 1px solid color-mix(in srgb, var(--fg) 32%, var(--border));
          color: var(--muted);
          background: transparent;
          font: 0.76rem/1 monospace;
          white-space: nowrap;
          transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
        }
        :global(.project-action:hover) { border-color: var(--fg); color: var(--fg); }
        :global(.project-action-primary) { color: var(--bg); background: var(--fg); }
        :global(.project-action-primary:hover) { color: var(--bg); opacity: 0.82; }
        .project-detail-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        .project-state,
        .project-year {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font: 0.72rem/1.3 monospace;
        }
        .project-state { margin-left: 8px; }
        .project-state > span { width: 5px; height: 5px; border-radius: 50%; background: var(--muted); }
        .project-year { padding-left: 14px; border-left: 1px solid var(--border); }
        .project-capabilities { padding-top: 28px; }
        .project-capabilities > h3 {
          margin-bottom: 10px;
          color: var(--fg);
          font: 500 0.88rem/1.4 monospace;
        }
        .project-capability { 
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr);
          gap: 15px;
          align-items: center;
          min-height: 88px;
          padding: 15px 10px;
          border-bottom: 1px solid var(--border);
        }
        .project-capability:last-child { border-bottom: 0; }
        .project-capability-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
        }
        .project-capability h4 {
          margin-bottom: 4px;
          color: var(--fg);
          font: 500 0.84rem/1.3 monospace;
        }
        .project-capability p {
          color: var(--muted);
          font-size: 0.79rem;
          line-height: 1.6;
        }
        @media (max-width: 1100px) {
          .projects-master-detail { grid-template-columns: minmax(320px, 40%) minmax(0, 60%); }
          .project-index-row { grid-template-columns: 38px minmax(110px, 1fr); }
          .project-index-type,
          .project-index-tags { display: none; }
          .project-detail-topline { flex-direction: column; }
          .project-detail-actions { justify-content: flex-start; }
        }
        @media (max-width: 760px) {
          .projects-showcase { padding-bottom: 32px; }
          .projects-intro,
          .projects-years,
          .projects-catalog-tools { margin-left: 0; }
          .projects-intro { margin-bottom: 22px; }
          .projects-intro h1 { font-size: 2rem; }
          .projects-intro p { font-size: 0.9rem; }
          .projects-years {
            overflow-x: auto;
            width: calc(100vw - 2.5rem);
            padding-bottom: 2px;
          }
          .projects-years button { flex: 0 0 auto; min-width: 60px; height: 44px; }
          .projects-catalog-tools {
            align-items: stretch;
            flex-direction: column;
          }
          .projects-search { width: 100%; height: 44px; }
          .projects-type-filter {
            overflow-x: auto;
            width: calc(100vw - 2.5rem);
          }
          .projects-type-filter button { flex: 0 0 auto; min-height: 42px; }
          .projects-mobile-selector {
            display: grid;
            gap: 8px;
            margin-bottom: 12px;
            color: var(--muted);
            font: 0.68rem/1.3 monospace;
          }
          .projects-mobile-selector select {
            width: 100%;
            min-height: 48px;
            padding: 0 14px;
            border: 1px solid var(--border);
            border-radius: 0;
            color: var(--fg);
            background: var(--bg);
            font: 0.78rem/1 monospace;
          }
          .projects-master-detail {
            display: block;
            height: auto;
            min-height: 0;
            border-color: var(--border);
          }
          .projects-index {
            display: none;
          }
          .project-index-row {
            flex: 0 0 248px;
            grid-template-columns: 38px minmax(0, 1fr);
            min-height: 76px;
            padding: 14px 18px;
            border-right: 1px solid var(--border);
            border-bottom: 0;
            scroll-snap-align: start;
          }
          .project-index-row:last-child { border-right: 0; }
          .project-index-marker { top: auto; bottom: 0; left: 18px; width: 0; height: 3px; transform: none; }
          .project-index-row.is-selected .project-index-marker { width: 34px; height: 3px; }
          .project-detail-panel { overflow: visible; padding: 26px 20px 20px; }
          .project-detail-topline { gap: 20px; }
          .project-detail-copy h2 { font-size: clamp(1.8rem, 9vw, 2.35rem); }
          .project-detail-copy p { font-size: 0.88rem; }
          .project-detail-actions { width: 100%; }
          :global(.project-pc-trial) { display: none; }
          :global(.project-mobile-direct-trial) { display: inline-flex !important; }
          .project-showcase-qr-trigger { display: none; }
          :global(.project-action) { flex: 1 1 auto; }
          .project-detail-meta { margin-top: 20px; padding-bottom: 20px; }
          .project-detail-meta .project-tag:nth-of-type(n + 4) { display: none; }
          .project-state { margin-left: 0; }
          .project-capabilities { padding-top: 23px; }
          .project-capability {
            grid-template-columns: 38px minmax(0, 1fr);
            gap: 10px;
            min-height: 0;
            padding: 17px 0;
          }
          .project-capability-icon { justify-content: flex-start; }
        }
      `}</style>
    </div>
  )
}
