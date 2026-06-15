'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLang } from '@/hooks/useLang'
import { localizeProject } from '@/lib/i18n-helpers'
import ProjectCard from '@/components/ui/ProjectCard'
import EmptyState from '@/components/ui/EmptyState'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

export default function ProjectsPage() {
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

  const { lang, t } = useLang()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [activeYear, setActiveYear] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(data => { setProjects(data); setLoaded(true) }).catch(console.error)
  }, [])

  // 按年份分组
  const filtered = activeYear ? projects.filter(p => p.createdAt && new Date(p.createdAt).getFullYear() === activeYear) : projects
  const groupedByYear = {}
  filtered.forEach(p => {
    const year = p.createdAt ? new Date(p.createdAt).getFullYear() : '?'
    if (!groupedByYear[year]) groupedByYear[year] = []
    groupedByYear[year].push(p)
  })
  const years = Object.keys(groupedByYear).sort((a, b) => b - a)

  return (
    <motion.div
      className="max-w-4xl pb-8 md:pb-20"
      style={{ margin: '0 auto' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      <motion.section variants={fadeUp} style={{ marginBottom: '32px' }}>
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)' }}>
          {t('nav.projects')}
        </h1>
      </motion.section>

      {/* 年份筛选 */}
      <motion.section variants={fadeUp} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveYear(null)}
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              padding: '4px 12px',
              border: '1px solid',
              borderColor: !activeYear ? 'var(--fg)' : 'var(--border)',
              backgroundColor: !activeYear ? 'var(--fg)' : 'transparent',
              color: !activeYear ? 'var(--bg)' : 'var(--muted)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {lang === 'zh' ? '全部' : 'All'}
          </button>
          {yearOptions.map(year => (
            <button
              key={year}
              onClick={() => setActiveYear(activeYear === year ? null : year)}
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                padding: '4px 12px',
                border: '1px solid',
                borderColor: activeYear === year ? 'var(--fg)' : 'var(--border)',
                backgroundColor: activeYear === year ? 'var(--fg)' : 'transparent',
                color: activeYear === year ? 'var(--bg)' : 'var(--muted)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {year}
            </button>
          ))}
        </div>
      </motion.section>

      {/* 按年份分组 */}
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
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '16px' }}>
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
              {groupedByYear[year].length} {lang === 'zh' ? '个' : 'projects'}
            </span>
          </div>

          {/* 项目卡片 - 单列 */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groupedByYear[year].map(project => (
              <div key={project.id} onClick={() => router.push(`/projects/${project.id}`)} style={{ cursor: 'pointer' }}>
                <ProjectCard project={localizeProject(project, lang)} />
              </div>
            ))}
          </div>
        </motion.section>
      ))}

      {!loaded && projects.length === 0 && (
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      )}
      {loaded && years.length === 0 && (
        <EmptyState
          message={activeYear ? (lang === 'zh' ? `${activeYear} 年暂无项目` : `No projects in ${activeYear}`) : (lang === 'zh' ? '暂无项目' : 'No projects yet')}
          actionLabel={activeYear ? (lang === 'zh' ? '查看全部' : 'View all') : null}
          onAction={activeYear ? () => setActiveYear(null) : null}
        />
      )}
    </motion.div>
  )
}
