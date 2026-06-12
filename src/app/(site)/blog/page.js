'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { localizedField } from '@/lib/i18n-helpers'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

export default function BlogPage() {
  const { lang, t } = useLang()
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    fetch('/api/blog?status=published')
      .then(r => r.json())
      .then(setBlogs)
      .catch(console.error)
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

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
          {t('nav.blog')}
        </h1>
      </motion.section>

      <motion.section variants={fadeUp}>
        <div className="grid gap-4">
          {blogs.map(blog => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="block border transition-all duration-200 ease-out hover:-translate-y-0.5"
              style={{ borderColor: 'var(--border)', padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', fontSize: '1.1rem' }}>
                  {localizedField(blog, 'title', lang)}
                </h3>
                {blog.publishedAt && (
                  <span className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.75rem', flexShrink: 0, marginLeft: '12px' }}>
                    {formatDate(blog.publishedAt)}
                  </span>
                )}
              </div>
              {localizedField(blog, 'excerpt', lang) && (
                <p className="leading-relaxed" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {localizedField(blog, 'excerpt', lang)}
                </p>
              )}
            </Link>
          ))}
        </div>
        {blogs.length === 0 && (
          <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
        )}
      </motion.section>
    </motion.div>
  )
}
