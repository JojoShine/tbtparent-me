'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Monitor, Search } from 'lucide-react'
import { useLang } from '@/hooks/useLang'
import { localizeProject } from '@/lib/i18n-helpers'
import { getProductExploreUrl } from '@/lib/product-home'
import { filterProjectCatalog, getProjectCover, getProjectEntrypoints, getProjectYear, isProjectShowcaseStyleReady } from '@/lib/project-showcase'
import { getProjectCategory, projectCategories } from '@/lib/project-categories'
import EmptyState from '@/components/ui/EmptyState'
import ProjectStatusBadge from '@/components/ui/ProjectStatusBadge'
import ProjectOpenSourceBadge from '@/components/ui/ProjectOpenSourceBadge'
import GithubIcon from '@/components/ui/GithubIcon'
import ProjectEntrypoints from '@/components/ui/ProjectEntrypoints'
import ImageLightbox, { IMAGE_ZOOM_CURSOR } from '@/components/ui/ImageLightbox'
import ProjectYearFilter from './ProjectYearFilter'

function ProjectEntry({ rawProject, index, lang, onPreview }) {
  const project = localizeProject(rawProject, lang)
  const cover = getProjectCover(project)
  const exploreUrl = getProductExploreUrl(rawProject)
  const { pcUrl, mobileUrl, mobileQrUrl } = getProjectEntrypoints(project)
  const showExplore = exploreUrl && !(pcUrl || mobileUrl || mobileQrUrl)
  const alt = `${project.name} ${lang === 'zh' ? '项目封面' : 'project cover'}`

  return (
    <article className={`catalog-card ${project.archived ? 'is-archived' : ''}`}>
      {cover ? (
        <button
          type="button"
          className="catalog-cover river-project-cover"
          onClick={() => onPreview({ src: cover.src, alt })}
          aria-label={lang === 'zh' ? `放大查看${project.name}封面` : `Enlarge ${project.name} cover`}
          style={{ cursor: IMAGE_ZOOM_CURSOR }}
        >
          <Image src={cover.src} alt={alt} width={cover.width} height={cover.height}
            sizes="(max-width: 620px) calc(100vw - 36px), (max-width: 1100px) calc((100vw - 72px) / 2), (max-width: 1536px) calc((100vw - 136px) / 3), 466px"
            loading={index < 3 ? 'eager' : 'lazy'} />
        </button>
      ) : (
        <div className="catalog-cover catalog-cover-placeholder" aria-hidden="true"><Monitor size={30} strokeWidth={1.2} /><strong>{project.name}</strong></div>
      )}
      <div className="catalog-card-body">
        <div className="catalog-card-heading">
          <h2>{project.name}</h2>
          {project.archived ? <span className="catalog-archived-label">{lang === 'zh' ? '已下架' : 'Discontinued'}</span> : <ProjectStatusBadge status={project.status} lang={lang} />}
          <ProjectOpenSourceBadge isOpenSource={project.is_open_source} lang={lang} />
        </div>
        <p className="catalog-description">{project.description}</p>
        {project.tags.length > 0 && <div className="catalog-tags">{project.tags.slice(0, 2).map(tag => <span key={tag}>{tag}</span>)}</div>}
        {project.archived ? (
          <p className="catalog-archived-note">{lang === 'zh' ? '该作品已停止维护，相关入口已关闭' : 'No longer maintained; links are disabled.'}</p>
        ) : (
          <div className="catalog-actions">
            {showExplore && <a href={exploreUrl} target="_blank" rel="noopener noreferrer">{lang === 'zh' ? '查看作品' : 'View project'}<ArrowUpRight size={14} /></a>}
            <ProjectEntrypoints project={project} lang={lang} />
            <Link href={`/projects/${project.id}`}>{lang === 'zh' ? '查看详情' : 'View details'}<ArrowUpRight size={14} /></Link>
            {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer"><GithubIcon size={14} />GitHub</a>}
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
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('')
  const [previewImage, setPreviewImage] = useState(null)

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

  const listedProjects = useMemo(() => projects.filter(project => !project.archived && !localizeProject(project, 'zh').archived), [projects])
  const years = useMemo(() => [...new Set(listedProjects.map(getProjectYear).filter(Boolean))].sort((a, b) => b - a), [listedProjects])
  const matchingProjects = useMemo(() => filterProjectCatalog(listedProjects, { activeYear: year ? Number(year) : null, query }), [listedProjects, year, query])
  const counts = useMemo(() => matchingProjects.reduce((result, project) => {
    const key = getProjectCategory(project)
    result[key] = (result[key] || 0) + 1
    return result
  }, {}), [matchingProjects])
  const visibleProjects = useMemo(() => matchingProjects.filter(project => category === 'all' || getProjectCategory(project) === category), [matchingProjects, category])

  return (
    <main ref={pageRef} className="project-catalog" aria-busy={!stylesReady}>
      {stylesReady ? <>
      <header className="catalog-heading">
        <div><h1>{lang === 'zh' ? '作品' : 'Works'}</h1><p>{lang === 'zh' ? '从日常工具到产品实践，找到你感兴趣的作品。' : 'Explore everyday tools and product projects.'}</p></div>
        <span>{listedProjects.length} {lang === 'zh' ? '个作品' : 'works'}</span>
      </header>
      <div className="catalog-toolbar">
      <nav className="catalog-categories" aria-label={lang === 'zh' ? '作品分类' : 'Product categories'}>
        <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{lang === 'zh' ? '全部' : 'All'}<span>{matchingProjects.length}</span></button>
        {projectCategories.filter(item => item.id !== 'other' || listedProjects.some(project => getProjectCategory(project) === 'other')).map(item => (
          <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item[lang === 'zh' ? 'zh' : 'en']}<span>{counts[item.id] || 0}</span></button>
        ))}
      </nav>
      <div className="catalog-filters">
        <label className="catalog-search"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={lang === 'zh' ? '搜索作品' : 'Search works'} aria-label={lang === 'zh' ? '搜索作品' : 'Search works'} /></label>
        <ProjectYearFilter value={year} years={years} onChange={setYear} lang={lang} />
      </div>
      </div>
      <p className="catalog-result-count" role="status" aria-live="polite">{lang === 'zh' ? `显示 ${visibleProjects.length} 个作品` : `${visibleProjects.length} works shown`}</p>
      {visibleProjects.length ? <div className="catalog-grid">{visibleProjects.map((project, index) => <ProjectEntry key={project.id} rawProject={project} index={index} lang={lang} onPreview={setPreviewImage} />)}</div> : <EmptyState message={lang === 'zh' ? '没有匹配的作品' : 'No matching works'} />}
      <ImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} lang={lang} />
      </> : (
        <div role="status" aria-live="polite" style={{ display: 'grid', minHeight: 'min(690px, calc(100dvh - 110px))', placeItems: 'center', color: 'var(--muted, #888)', fontSize: '12px' }}>
          {lang === 'zh' ? '正在加载作品…' : 'Loading works…'}
        </div>
      )}
      <style jsx global>{`
        .site-page-shell:has(> .project-catalog) { max-width: 1440px; }
        .project-catalog { --project-showcase-ready: 1; --catalog-link: #177d66; width: 100%; margin: 0 auto; padding: 24px 0 80px; }
        .dark .project-catalog { --catalog-link: #65d7bb; }
        .catalog-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
        .catalog-heading > div { display: flex; align-items: baseline; gap: 22px; min-width: 0; }
        .catalog-heading h1 { margin: 0; font-size: 32px; font-weight: 600; line-height: 1.3; letter-spacing: -.04em; }
        .catalog-heading p, .catalog-heading > span { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
        .catalog-heading > span { flex-shrink: 0; }
        .catalog-toolbar { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px 24px; padding-bottom: 22px; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
        .catalog-categories { display: flex; flex: 1 1 auto; flex-wrap: wrap; min-width: 0; gap: 10px; }
        .catalog-filters { display: flex; flex: 0 1 350px; min-width: 0; gap: 10px; margin-left: auto; }
        .catalog-search { display: flex; flex: 1; min-width: 0; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--border); border-radius: 5px; color: var(--muted); background: var(--bg); }
        .catalog-search svg { flex-shrink: 0; }
        .catalog-search input { width: 100%; min-width: 0; min-height: 40px; padding: 0; border: 0; outline: none; color: var(--fg); background: transparent; font: inherit; font-size: 13px; }
        .catalog-search:focus-within { outline: 2px solid var(--fg); outline-offset: 3px; }
        .catalog-categories button { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; gap: 10px; min-height: 40px; padding: 8px 15px; border: 1px solid var(--border); border-radius: 5px; background: var(--bg); color: var(--muted); font: inherit; font-size: 13px; cursor: pointer; transition: color 150ms, border-color 150ms; }
        .catalog-categories button span { font: 11px/1.4 monospace; opacity: .7; }
        .catalog-categories button:hover { border-color: var(--muted); color: var(--fg); }
        .catalog-categories button[aria-pressed='true'] { color: var(--bg); border-color: var(--fg); background: var(--fg); }
        .catalog-result-count { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
        .catalog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: stretch; }
        .catalog-card { min-width: 0; display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 6px; background: color-mix(in srgb, var(--bg) 97%, var(--fg)); transition: border-color 150ms; }
        .catalog-card:hover { border-color: color-mix(in srgb, var(--fg) 40%, var(--border)); }
        .catalog-cover { display: block; flex-shrink: 0; width: 100%; padding: 0; border: 0; border-radius: 5px 5px 0 0; background: transparent; color: var(--fg); overflow: hidden; }
        .river-project-cover img { display: block; width: 100%; height: auto; cursor: zoom-in; }
        .catalog-cover-placeholder { display: flex; aspect-ratio: 3/2; align-items: center; justify-content: center; flex-direction: column; gap: 16px; color: var(--muted); }
        .catalog-cover-placeholder strong { max-width: 90%; overflow-wrap: anywhere; font-size: 24px; font-weight: 500; }
        .catalog-card-body { display: flex; flex: 1; flex-direction: column; padding: 16px; }
        .catalog-card-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; margin-bottom: 10px; }
        .catalog-card-heading h2 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -.025em; line-height: 1.3; overflow-wrap: anywhere; }
        .catalog-description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; margin: 0; min-height: 44px; color: var(--muted); font-size: 13px; line-height: 22px; }
        .catalog-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; }
        .catalog-tags span { max-width: 100%; padding: 3px 7px; border: 1px solid var(--border); border-radius: 3px; color: var(--muted); font-size: 11px; line-height: 1.4; overflow-wrap: anywhere; }
        .catalog-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 20px; margin-top: auto; padding-top: 14px; }
        .catalog-actions a { display: inline-flex; align-items: center; gap: 5px; min-height: 32px; color: var(--catalog-link); font-size: 12px; text-decoration: none; }
        .catalog-actions a:hover { text-decoration: underline; text-underline-offset: 4px; }
        .catalog-archived-label { color: var(--muted); font-size: 11px; border: 1px solid var(--border); border-radius: 3px; padding: 3px 6px; }
        .catalog-card.is-archived .catalog-cover { filter: grayscale(1); opacity: .5; }
        .catalog-archived-note { margin: auto 0 0; padding-top: 14px; color: var(--muted); font-size: 12px; line-height: 1.6; }
        .project-catalog button:focus-visible, .project-catalog a:focus-visible { outline: 2px solid var(--fg); outline-offset: 3px; }
        @media (max-width: 1100px) { .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 620px) {
          .project-catalog { padding-top: 12px; padding-bottom: 48px; }
          .catalog-heading { align-items: flex-start; gap: 12px; margin-bottom: 20px; }
          .catalog-heading > div { display: block; } .catalog-heading h1 { font-size: 28px; }
          .catalog-heading p { font-size: 12px; margin-top: 8px; } .catalog-heading > span { font-size: 12px; padding-top: 9px; }
          .catalog-toolbar { display: block; padding-bottom: 16px; margin-bottom: 20px; }
          .catalog-categories { flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-x: contain; gap: 8px; padding: 0 0 12px; }
          .catalog-filters { width: 100%; margin-top: 4px; }
          .catalog-filters input { min-height: 44px; }
          .catalog-categories button { min-height: 44px; padding: 8px 12px; font-size: 12px; }
          .catalog-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
          .catalog-card-heading h2 { font-size: 21px; } .catalog-actions { gap: 6px 18px; }
          .catalog-actions a { min-height: 40px; font-size: 13px; }
        }
        @media (prefers-reduced-motion: reduce) { .catalog-card, .catalog-categories button { transition: none; } }
      `}</style>
    </main>
  )
}
