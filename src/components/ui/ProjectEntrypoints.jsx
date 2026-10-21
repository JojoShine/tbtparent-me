'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Monitor, Smartphone } from 'lucide-react'
import { getProjectEntrypoints } from '@/lib/project-showcase'
import { getProjectQrCode } from '@/lib/project-qr-code'
import styles from './ProjectEntrypoints.module.css'

export default function ProjectEntrypoints({ project, lang }) {
  const { mobileUrl, mobileQrUrl, pcUrl } = getProjectEntrypoints(project)
  const [open, setOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [failed, setFailed] = useState(false)
  const qrCode = mobileQrUrl || generatedCode
  const zh = lang === 'zh'

  useEffect(() => {
    setGeneratedCode('')
    setFailed(false)
    if (!open || mobileQrUrl || !mobileUrl) return
    let cancelled = false
    getProjectQrCode({ mobile_url: mobileUrl }, { width: 320, margin: 2 })
      .then(code => { if (!cancelled) setGeneratedCode(code) })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [open, mobileUrl, mobileQrUrl])

  if (project.archived || (!mobileUrl && !mobileQrUrl && !pcUrl)) return null

  return (
    <div className={styles.entries} onClick={event => event.stopPropagation()}>
      {(mobileUrl || mobileQrUrl) && (
        <details className={styles.mobile} onPointerEnter={event => {
          if (event.pointerType === 'mouse') event.currentTarget.open = true
        }} onPointerLeave={event => {
          if (event.pointerType === 'mouse') event.currentTarget.open = false
        }} onToggle={event => setOpen(event.currentTarget.open)} onKeyDown={event => {
          if (event.key === 'Escape') event.currentTarget.open = false
        }}>
          <summary className={styles.action}><Smartphone size={14} />{zh ? '移动端入口' : 'Mobile entry'}</summary>
          <span className={styles.panel}>
            {qrCode
              ? <img src={qrCode} alt={zh ? '移动端入口二维码' : 'Mobile entry QR code'} />
              : <span role="status">{failed ? (zh ? '二维码加载失败，请直接打开链接' : 'QR unavailable. Open the link below.') : (zh ? '加载中…' : 'Loading…')}</span>}
            <small>{zh ? '扫码打开，或保存原图后识别' : 'Scan to open, or save the image to scan'}</small>
            {mobileUrl && <a href={mobileUrl} target="_blank" rel="noopener noreferrer">{zh ? '直接打开' : 'Open link'}<ArrowUpRight size={13} /></a>}
            {mobileQrUrl && <a href={mobileQrUrl} target="_blank" rel="noopener noreferrer">{zh ? '查看原图' : 'View original'}</a>}
          </span>
        </details>
      )}
      {pcUrl && <a className={styles.action} href={pcUrl} target="_blank" rel="noopener noreferrer"><Monitor size={14} />{zh ? 'PC 端入口' : 'PC entry'}<ArrowUpRight size={14} /></a>}
    </div>
  )
}
