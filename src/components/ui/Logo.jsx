'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
      {/* Logo 图片 */}
      <Image
        src="/assets/logo.jpg"
        alt="tbtparent"
        width={32}
        height={32}
        className="rounded-full"
      />
      {/* 名称 */}
      <span className="font-mono text-lg font-bold" style={{ color: 'var(--fg)' }}>
        tbtparent
      </span>
    </Link>
  )
}
