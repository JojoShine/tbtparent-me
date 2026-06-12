'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Mail, MessageCircle, Cat } from 'lucide-react'
import { useLang } from '@/hooks/useLang'
import { localizedField } from '@/lib/i18n-helpers'

const iconMap = { github: Cat, mail: Mail, wechat: MessageCircle }

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

export default function AboutPage() {
  const { lang, t } = useLang()
  const [about, setAbout] = useState(null)
  const [techStack, setTechStack] = useState([])
  const [socialLinks, setSocialLinks] = useState([])

  useEffect(() => {
    fetch('/api/about').then(r => r.json()).then(setAbout).catch(console.error)
    fetch('/api/tech-stack').then(r => r.json()).then(setTechStack).catch(console.error)
    fetch('/api/social-links').then(r => r.json()).then(setSocialLinks).catch(console.error)
  }, [])

  if (!about) {
    return (
      <div className="max-w-2xl py-8 md:py-20" style={{ margin: '0 auto' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      </div>
    )
  }

  const bio = localizedField(about, 'bio', lang)

  return (
    <motion.div
      className="max-w-2xl py-8 md:py-20"
      style={{ margin: '0 auto' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* 标题 */}
      <motion.section variants={fadeUp} style={{ marginBottom: '32px' }}>
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)' }}>
          {t('about.bio')}
        </h1>
      </motion.section>

      {/* 关于内容 */}
      {bio && (
        <motion.section variants={fadeUp} style={{ marginBottom: '40px' }}>
          <p className="text-base leading-loose" style={{ color: 'var(--fg)' }}>{bio}</p>
        </motion.section>
      )}

      {/* 技术栈 */}
      {techStack.length > 0 && (
        <motion.section variants={fadeUp} style={{ marginBottom: '40px' }}>
          <h2 className="text-xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '16px' }}>
            {t('about.techStack')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map(tech => (
              <span
                key={tech.id}
                className="font-mono"
                style={{
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  padding: '4px 12px',
                  fontSize: '0.85rem',
                }}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {/* 联系方式 */}
      {socialLinks.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="text-xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '16px' }}>
            Contact
          </h2>
          <div className="flex gap-4 md:gap-6 flex-wrap">
            {socialLinks.map(link => {
              const Icon = iconMap[link.icon]
              return (
                <a
                  key={link.id || link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center gap-2 font-mono hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--fg)' }}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </a>
              )
            })}
          </div>
        </motion.section>
      )}
    </motion.div>
  )
}
