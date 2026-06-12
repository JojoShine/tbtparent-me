'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/hooks/useLang'
import { localizeProject } from '@/lib/i18n-helpers'
import ProjectCard from '@/components/ui/ProjectCard'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

export default function ProjectsPage() {
  const { lang, t } = useLang()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(console.error)
  }, [])

  return (
    <motion.div
      className="max-w-2xl py-8 md:py-20"
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

      <motion.section variants={fadeUp}>
        <div className="grid gap-4 md:gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={localizeProject(project, lang)} />
          ))}
        </div>
        {projects.length === 0 && (
          <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
        )}
      </motion.section>
    </motion.div>
  )
}
