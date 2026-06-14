'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { useLang } from '@/hooks/useLang'
import EmptyState from '@/components/ui/EmptyState'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

export default function QAPage() {
  const { lang } = useLang()
  const [qas, setQAs] = useState([])
  const [expandedIds, setExpandedIds] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/qa')
      .then(r => r.json())
      .then(data => {
        setQAs(Array.isArray(data) ? data : [])
        setLoaded(true)
      })
      .catch(console.error)
  }, [])

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (!loaded) {
    return (
      <div className="max-w-4xl py-8 md:py-20" style={{ margin: '0 auto' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-4xl py-8 md:py-20"
      style={{ margin: '0 auto' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* 标题 */}
      <motion.section variants={fadeUp} style={{ marginBottom: '24px' }}>
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)' }}>
          {lang === 'zh' ? '问题集' : 'Q&A'}
        </h1>
      </motion.section>

      {/* 问题列表 */}
      {qas.length === 0 ? (
        <motion.section variants={fadeUp}>
          <EmptyState message={lang === 'zh' ? '暂无问题记录' : 'No questions yet'} />
        </motion.section>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {qas.map(qa => (
            <motion.section key={qa.id} variants={fadeUp}>
              <div
                style={{
                  padding: '16px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
                onClick={() => toggleExpand(qa.id)}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {/* 标题和标签 */}
                <div style={{ marginBottom: '8px' }}>
                  <h2 className="font-mono" style={{ color: 'var(--fg)', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
                    {lang === 'zh' ? qa.title_zh : (qa.title_en || qa.title_zh)}
                  </h2>
                  {(lang === 'zh' ? qa.tags_zh : qa.tags_en).length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(lang === 'zh' ? qa.tags_zh : qa.tags_en).map((tag, idx) => (
                        <span
                          key={idx}
                          className="font-mono"
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            backgroundColor: 'var(--border)',
                            color: 'var(--muted)',
                            borderRadius: '2px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 展开的内容 */}
                {expandedIds[qa.id] && (
                  <div className="prose prose-invert max-w-none" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <ReactMarkdown 
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        p: ({ children, node }) => {
                          const isEmpty = !children || (typeof children === 'string' && children.trim() === '')
                          if (isEmpty) {
                            return <div style={{ height: '1rem' }} />
                          }
                          return <p style={{ margin: '1rem 0', whiteSpace: 'pre-wrap' }}>{children}</p>
                        },
                      }}
                    >
                      {lang === 'zh' ? qa.content_zh : (qa.content_en || qa.content_zh)}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </motion.div>
  )
}
