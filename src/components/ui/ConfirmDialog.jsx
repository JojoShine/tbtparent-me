'use client'

import { useEffect, useRef } from 'react'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '确认操作',
  message = '确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  danger = true,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '320px',
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <h3 style={{
          fontFamily: 'monospace',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--fg)',
          margin: '0 0 12px 0',
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          color: 'var(--muted)',
          margin: '0 0 20px 0',
          lineHeight: '1.5',
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm?.(); onClose?.() }}
            style={{
              padding: '8px 16px',
              backgroundColor: danger ? '#e53e3e' : 'var(--fg)',
              color: danger ? '#fff' : 'var(--bg)',
              border: 'none',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
