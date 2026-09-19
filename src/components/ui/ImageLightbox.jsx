'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export const IMAGE_ZOOM_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='11' cy='11' r='8' fill='%23fff' stroke='%23111' stroke-width='2'/%3E%3Cpath d='M17 17L26 26M11 7V15M7 11H15' fill='none' stroke='%23111' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 11 11, zoom-in`

export default function ImageLightbox({ image, onClose, lang = 'zh' }) {
  useEffect(() => {
    if (!image) return undefined

    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'

    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [image, onClose])

  if (!image) return null

  const closeLabel = lang === 'zh' ? '关闭图片预览' : 'Close image preview'

  return createPortal(
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'zh' ? '图片预览' : 'Image preview'}
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button type="button" className="image-lightbox-close" onClick={onClose} aria-label={closeLabel} autoFocus>
        <span aria-hidden="true">×</span>
      </button>
      <img src={image.src} alt={image.alt || ''} />

      <style jsx>{`
        .image-lightbox {
          position: fixed;
          z-index: 2147483647;
          inset: 0;
          display: grid;
          place-items: center;
          padding: clamp(18px, 4vw, 48px);
          background: rgba(5, 5, 5, 0.92);
          cursor: zoom-out;
          backdrop-filter: blur(10px);
        }
        .image-lightbox img {
          display: block;
          max-width: min(100%, 1680px);
          max-height: calc(100dvh - clamp(36px, 8vw, 96px));
          width: auto;
          height: auto;
          object-fit: contain;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
          cursor: default;
        }
        .image-lightbox-close {
          position: fixed;
          z-index: 1;
          top: max(16px, env(safe-area-inset-top));
          right: max(16px, env(safe-area-inset-right));
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.34);
          border-radius: 50%;
          color: #fff;
          background: rgba(0, 0, 0, 0.36);
          font: 300 28px/1 sans-serif;
          cursor: pointer;
        }
        .image-lightbox-close:hover { background: rgba(255, 255, 255, 0.14); }
        .image-lightbox-close:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
        @media (max-width: 600px) {
          .image-lightbox { padding: 58px 12px 20px; }
          .image-lightbox img { max-height: calc(100dvh - 78px); }
        }
      `}</style>
    </div>,
    document.body,
  )
}
