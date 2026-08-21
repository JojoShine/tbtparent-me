'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!secret.trim()) {
      setError('请输入密钥')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secret.trim() }),
      })
      if (!res.ok) {
        setError('密钥错误，请重试')
        setLoading(false)
        return
      }
      localStorage.setItem('admin_token', secret.trim())
      router.push('/admin/home')
    } catch {
      setError('网络错误，请重试')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <form onSubmit={handleLogin} style={{ width: '320px' }}>
        <h1 style={{
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'var(--fg)',
          marginBottom: '8px',
        }}>
          管理后台
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
          输入管理员密钥登录
        </p>

        <input
          type="password"
          value={secret}
          onChange={(e) => { setSecret(e.target.value); setError('') }}
          placeholder="Admin Secret"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            color: 'var(--fg)',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            marginBottom: '16px',
            outline: 'none',
          }}
        />

        {error && (
          <p style={{ color: '#e53e3e', fontSize: '0.8rem', marginBottom: '12px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? 'var(--muted)' : 'var(--fg)',
            color: 'var(--bg)',
            border: 'none',
            fontFamily: 'monospace',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '验证中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
