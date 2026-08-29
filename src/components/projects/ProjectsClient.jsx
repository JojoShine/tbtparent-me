'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/hooks/useLang'
import { localizeProject } from '@/lib/i18n-helpers'
import ProjectCard from '@/components/ui/ProjectCard'
import EmptyState from '@/components/ui/EmptyState'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: 'easeOut' },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

export default function ProjectsClient({ projects }) {
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]
  const { lang, t } = useLang()
  const [activeYear, setActiveYear] = useState(null)

  const filtered = activeYear ? projects.filter(project => project.createdAt && new Date(project.createdAt).getFullYear() === activeYear) : projects
  const groupedByYear = {}
  filtered.forEach(project => {
    const year = project.createdAt ? new Date(project.createdAt).getFullYear() : '?'
    if (!groupedByYear[year]) groupedByYear[year] = []
    groupedByYear[year].push(project)
  })
  const years = Object.keys(groupedByYear).sort((a, b) => b - a)

  return (
    <motion.div
      className="pb-8 md:pb-20"
      style={{ width: '100%', maxWidth: '1120px', margin: '0 auto' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      <motion.section variants={fadeUp} style={{ marginBottom: '32px' }}>
        <h1 className="text-3xl md:text-5xl font-mono font-bold" style={{ color: 'var(--fg)', letterSpacing: '-0.05em', marginBottom: '12px' }}>
          {t('nav.projects')}
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: '580px', lineHeight: 1.7 }}>
          {lang === 'zh' ? '从实际问题出发，把想法做成可以体验、可以使用的产品。' : 'Products built from real problems, ready to see and try.'}
        </p>
      </motion.section>

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

      {years.map(year => (
        <motion.section key={year} variants={fadeUp} style={{ marginBottom: '40px', position: 'relative' }}>
          <div className="project-year-heading">
            <span className="font-mono project-year-count">
              {groupedByYear[year].length} {lang === 'zh' ? '个作品' : 'projects'}
            </span>
            <strong className="font-mono project-year-value">{year}</strong>
          </div>

          <div className="projects-grid">
            {groupedByYear[year].map(project => (
              <ProjectCard key={project.id} project={localizeProject(project, lang)} />
            ))}
          </div>
        </motion.section>
      ))}

      {years.length === 0 && (
        <EmptyState
          message={activeYear ? (lang === 'zh' ? `${activeYear} 年暂无项目` : `No projects in ${activeYear}`) : (lang === 'zh' ? '暂无项目' : 'No projects yet')}
          actionLabel={activeYear ? (lang === 'zh' ? '查看全部' : 'View all') : null}
          onAction={activeYear ? () => setActiveYear(null) : null}
        />
      )}

      <style jsx>{`
        .projects-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
        }
        .project-year-heading {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          min-height: 64px;
          margin-bottom: 12px;
        }
        .project-year-count {
          color: var(--muted);
          font-size: 0.72rem;
        }
        .project-year-value {
          position: absolute;
          right: 0;
          bottom: -6px;
          color: var(--fg);
          font-size: clamp(4rem, 8vw, 6rem);
          line-height: 1;
          letter-spacing: -0.06em;
          opacity: 0.04;
          user-select: none;
          pointer-events: none;
        }
        @media (max-width: 760px) {
          .projects-grid { grid-template-columns: 1fr; gap: 20px; }
        }
      `}</style>
    </motion.div>
  )
}
