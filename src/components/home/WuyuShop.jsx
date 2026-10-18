'use client'

import { useRef } from 'react'
import Image from 'next/image'

const CODE_IMAGE = '/assets/wuyu-mini-program.jpg'

export default function WuyuShop({ lang }) {
  const dialogRef = useRef(null)
  const zh = lang === 'zh'
  const openCode = () => dialogRef.current?.showModal()
  const closeCode = () => dialogRef.current?.close()

  return (
    <>
      <div className="wuyu-shop" aria-labelledby="wuyu-title">
        <div className="wuyu-copy">
          <p className="wuyu-label font-mono">{zh ? '小程序商店' : 'MINI PROGRAM SHOP'}</p>
          <h2 id="wuyu-title" className="text-2xl font-mono font-bold">雾屿实验室</h2>
          <p className="wuyu-description">{zh ? '微信扫码进入小程序，查看商品与详情。' : 'Scan in WeChat to browse products and details.'}</p>
          <div className="wuyu-actions font-mono">
            <button type="button" onClick={openCode}>{zh ? '查看大图' : 'View code'} ↗</button>
            <a href={CODE_IMAGE} download="雾屿实验室小程序码.jpg">{zh ? '保存小程序码' : 'Save code'}</a>
          </div>
        </div>
        <figure>
          <button className="wuyu-code" type="button" onClick={openCode} aria-label={zh ? '查看雾屿实验室小程序码大图' : 'Enlarge Wuyu Lab mini program code'}>
            <Image src={CODE_IMAGE} alt="雾屿实验室微信小程序码" width={1280} height={1280} unoptimized />
          </button>
          <figcaption>{zh ? '微信扫一扫，查看商品' : 'Scan with WeChat'}</figcaption>
        </figure>
      </div>
      <dialog ref={dialogRef} className="wuyu-dialog" aria-labelledby="wuyu-dialog-title" onClick={event => { if (event.target === event.currentTarget) closeCode() }}>
        <div className="wuyu-dialog-head">
          <h2 id="wuyu-dialog-title" className="font-mono font-bold">雾屿实验室</h2>
          <button type="button" onClick={closeCode} aria-label={zh ? '关闭小程序码大图' : 'Close code'}>×</button>
        </div>
        <Image className="wuyu-full-code" src={CODE_IMAGE} alt="雾屿实验室微信小程序码原图" width={1280} height={1280} unoptimized />
        <p>{zh ? '使用微信扫一扫，或保存图片后在微信中识别。' : 'Scan with WeChat, or save this image to scan in WeChat.'}</p>
        <a className="wuyu-save" href={CODE_IMAGE} download="雾屿实验室小程序码.jpg">{zh ? '保存原图' : 'Save original image'} ↓</a>
      </dialog>
      <style jsx>{`
        .wuyu-shop { display: grid; grid-template-columns: minmax(0, 1fr) 224px; gap: 32px; align-items: center; padding: 28px; border: 1px solid var(--border); border-radius: 8px; color: var(--fg); }
        .wuyu-label { font-size: 11px; letter-spacing: 2px; color: var(--muted); margin-bottom: 12px; }
        .wuyu-description { font-size: 15px; line-height: 1.8; color: var(--muted); margin-top: 12px; }
        .wuyu-actions { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 26px; font-size: 12px; }
        .wuyu-actions button, .wuyu-actions a { text-decoration: underline; text-underline-offset: 5px; cursor: pointer; }
        .wuyu-actions button:hover, .wuyu-actions a:hover { opacity: .65; }
        figure { margin: 0; text-align: center; }
        .wuyu-code { display: block; width: 204px; max-width: 100%; padding: 12px; margin: 0 auto; border-radius: 4px; background: white; cursor: zoom-in; }
        .wuyu-code :global(img) { width: 100%; height: auto; display: block; }
        figcaption { color: var(--muted); font-size: 11px; margin-top: 12px; }
        .wuyu-dialog { position: fixed; inset: 0; margin: auto; width: min(560px, calc(100vw - 32px)); max-height: 92dvh; padding: 20px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--fg); overflow: auto; }
        .wuyu-dialog::backdrop { background: rgba(0, 0, 0, .75); }
        .wuyu-dialog-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; }
        .wuyu-dialog-head h2 { font-size: 17px; }
        .wuyu-dialog-head button { width: 36px; height: 36px; font-size: 25px; cursor: pointer; }
        .wuyu-dialog :global(.wuyu-full-code) { display: block; width: auto; max-width: 100%; height: auto; max-height: 65dvh; object-fit: contain; margin: 0 auto; background: white; }
        .wuyu-dialog p { font-size: 12px; color: var(--muted); line-height: 1.8; margin: 16px 0; }
        .wuyu-save { font-size: 13px; text-decoration: underline; text-underline-offset: 4px; }
        button:focus-visible, a:focus-visible { outline: 2px solid var(--fg); outline-offset: 5px; }
        @media (max-width: 600px) {
          .wuyu-shop { grid-template-columns: minmax(0, 1fr); padding: 24px 20px; gap: 28px; }
          .wuyu-code { width: 244px; }
          .wuyu-dialog { padding: 16px; }
        }
      `}</style>
    </>
  )
}
