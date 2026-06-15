'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, Mail, MessageCircle, Cat } from 'lucide-react'
import { useLang } from '@/hooks/useLang'
import { localizedField, localizeProject } from '@/lib/i18n-helpers'
import ProjectCard from '@/components/ui/ProjectCard'

// 图标映射
const iconMap = {
  github: Cat,
  mail: Mail,
  wechat: MessageCircle,
}

// 动画配置
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  const { lang, t } = useLang()
  const [home, setHome] = useState(null)
  const [socialLinks, setSocialLinks] = useState([])
  const [projects, setProjects] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/home').then(r => r.json()).then(setHome).catch(console.error)
    fetch('/api/social-links').then(r => r.json()).then(setSocialLinks).catch(console.error)
    fetch('/api/projects/recent').then(r => r.json()).then(setProjects).catch(console.error)
  }, [])

  const copyId = (id) => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const renderParagraph = (text) => {
    // 处理「关于」链接、ID 复制、OPC 链接
    const parts = text.split(/(「关于」|ID: 甜枣0818|ID：甜枣0818|OPC)/)
    return parts.map((part, j) => {
      if (part === '「关于」') {
        return <span key={j}>&nbsp;&nbsp;<Link href="/about" style={{ fontWeight: 700, textDecoration: 'underline', color: 'var(--fg)' }}>关于</Link>&nbsp;&nbsp;</span>
      }
      if (part === 'ID: 甜枣0818' || part === 'ID：甜枣0818') {
        return (
          <span key={j} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => copyId('甜枣0818')}
              style={{ fontWeight: 600, color: 'var(--fg)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit', textDecoration: 'underline dotted' }}
              title="点击复制 ID"
            >
              {part}
            </button>
            {copied && <span style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>已复制!</span>}
          </span>
        )
      }
      if (part === 'OPC') {
        return (
          <a key={j} href="https://baike.baidu.com/item/%E4%B8%80%E4%BA%BA%E5%85%AC%E5%8F%B8/67142772" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, textDecoration: 'underline', color: 'var(--fg)' }}>
            OPC
          </a>
        )
      }
      return part
    })
  }

  if (!home) {
    return (
      <div className="max-w-3xl pb-8 md:pb-20" style={{ margin: '0 auto' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      </div>
    )
  }

  const name = localizedField(home, 'name', lang)
  const nameZh = home.nameZh || ''
  const title = localizedField(home, 'title', lang)
  const bio = localizedField(home, 'bio', lang)

  return (
    <motion.div
      className="max-w-3xl pb-8 md:pb-20"
      style={{ margin: '0 auto' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* 姓名区域 */}
      <motion.section variants={fadeUp} style={{ padding: '16px 0' }}>
        <h2 className="text-3xl md:text-5xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
          {name} {nameZh && <span style={{ color: 'var(--muted)', fontSize: '0.6em', fontWeight: 400 }}>({nameZh})</span>}
        </h2>
        <p className="text-base md:text-lg font-mono" style={{ color: 'var(--muted)', marginTop: '8px' }}>
          {title}
        </p>
        
        {/* 个人标签 */}
        <div className="flex flex-wrap gap-2" style={{ marginTop: '20px' }}>
          <span 
            className="font-mono text-xs rounded inline-block" 
            style={{ 
              backgroundColor: 'var(--muted)', 
              color: 'var(--bg)', 
              fontWeight: 500,
              padding: '4px 12px',
              opacity: 0.8
            }}
          >
            INTJ-A
          </span>
          <span 
            className="font-mono text-xs rounded inline-block" 
            style={{ 
              backgroundColor: 'var(--muted)', 
              color: 'var(--bg)', 
              fontWeight: 500,
              padding: '4px 12px',
              opacity: 0.8
            }}
          >
            摩羯男
          </span>
          <span 
            className="font-mono text-xs rounded inline-block" 
            style={{ 
              backgroundColor: 'var(--muted)', 
              color: 'var(--bg)', 
              fontWeight: 500,
              padding: '4px 12px',
              opacity: 0.8
            }}
          >
            宅
          </span>
          <span 
            className="font-mono text-xs rounded inline-block" 
            style={{ 
              backgroundColor: 'var(--muted)', 
              color: 'var(--bg)', 
              fontWeight: 500,
              padding: '4px 12px',
              opacity: 0.8
            }}
          >
            铲屎官
          </span>
          <span 
            className="font-mono text-xs rounded inline-block" 
            style={{ 
              backgroundColor: 'var(--muted)', 
              color: 'var(--bg)', 
              fontWeight: 500,
              padding: '4px 12px',
              opacity: 0.8
            }}
          >
            王者荣耀
          </span>
        </div>
      </motion.section>

      {/* 简介 */}
      <motion.section variants={fadeUp} style={{ padding: '16px 0' }}>
        {bio.split('\n\n').map((paragraph, i, arr) => (
          <p key={i} className="text-base leading-loose max-w-prose" style={{ color: 'var(--fg)', marginBottom: i < arr.length - 1 ? '16px' : 0 }}>
            {renderParagraph(paragraph)}
          </p>
        ))}
      </motion.section>

      {/* 社交链接 */}
      <motion.section variants={fadeUp} style={{ padding: '24px 0' }}>
        <h2 className="text-2xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '16px' }}>
          {t('home.contact')}
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
                className="relative flex items-center gap-2 font-mono hover:opacity-70 transition-opacity social-link"
                style={{ color: 'var(--fg)' }}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.name}
                <span
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
                  style={{ backgroundColor: 'var(--fg)' }}
                />
              </a>
            )
          })}
        </div>
      </motion.section>

      {/* 项目卡片 */}
      {projects.length > 0 && (
        <motion.section variants={fadeUp} style={{ padding: '24px 0' }}>
          <h2 className="text-2xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '16px' }}>
            {t('home.projects')}
          </h2>
          <div className="grid gap-4 md:gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={localizeProject(project, lang)} />
            ))}
          </div>
          <Link
            href="/projects"
            className="inline-block font-mono text-sm relative hover:opacity-70 transition-opacity social-link"
            style={{ color: 'var(--muted)', marginTop: '24px' }}
          >
            {t('home.viewAllProjects')}
            <span
              className="absolute bottom-0 left-0 h-px w-0 transition-all duration-200 ease-out social-link-underline"
              style={{ backgroundColor: 'var(--muted)' }}
            />
          </Link>
        </motion.section>
      )}

      <style jsx>{`
        .social-link:hover .social-link-underline {
          width: 100% !important;
        }
      `}</style>
    </motion.div>
  )
}
