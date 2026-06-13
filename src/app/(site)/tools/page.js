'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/hooks/useLang'
import { localizedField } from '@/lib/i18n-helpers'
import EmptyState from '@/components/ui/EmptyState'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

export default function ToolsPage() {
  const { lang, t } = useLang()
  const [tools, setTools] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/tools').then(r => r.json()).then(data => { setTools(data); setLoaded(true) }).catch(console.error)
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
          {t('nav.tools')}
        </h1>
      </motion.section>

      <motion.section variants={fadeUp}>
        <div className="grid gap-4">
          {tools.filter(tool => tool.available).map(tool => (
            <a
              key={tool.id}
              href={tool.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block border transition-all duration-200 ease-out hover:-translate-y-0.5"
              style={{ borderColor: 'var(--border)', padding: '16px 20px' }}
            >
              <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '6px', fontSize: '1rem' }}>
                {localizedField(tool, 'name', lang)}
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                {localizedField(tool, 'description', lang)}
              </p>
            </a>
          ))}
        </div>
        {!loaded && tools.length === 0 && (
          <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
        )}
        {loaded && tools.filter(tool => tool.available).length === 0 && (
          <EmptyState message={lang === 'zh' ? '暂无可用工具' : 'No tools available'} />
        )}
      </motion.section>
    </motion.div>
  )
}
