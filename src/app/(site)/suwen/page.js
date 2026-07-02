'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Suwen from '@/app/(site)/tools/Suwen'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

export default function SuwenPage() {
  return (
    <motion.div
      className="max-w-4xl pb-8 md:pb-20"
      style={{ margin: '0 auto' }}
      initial="initial"
      animate="animate"
      variants={fadeUp}
    >
      {/* 头部 */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm relative hover:opacity-70 transition-opacity"
          style={{ color: 'var(--muted)', marginBottom: '30px', textDecoration: 'none' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px' }}>
          素问 · 卜卦
        </h1>
        <div className="font-mono text-sm" style={{ color: 'var(--muted)' }}>
          六爻 · 梅花易数 · AI 卦象解读
        </div>
      </div>

      <Suwen />
    </motion.div>
  )
}
