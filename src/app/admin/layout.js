'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { label: '首页', path: '/admin/home' },
  { label: '博客', path: '/admin/blog' },
  { label: '项目', path: '/admin/projects' },
  { label: '工具', path: '/admin/tools' },
  { label: '收录', path: '/admin/archive' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [token, setToken] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('admin_token')
    if (!saved) {
      router.push('/login')
    } else {
      setToken(saved)
    }
  }, [router])

  if (!token) return null

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 侧边栏 - 固定在左侧 */}
      <aside style={{
        width: '220px',
        borderRight: '1px solid var(--border)',
        padding: '24px 0',
        flexShrink: 0,
        position: 'relative',
      }}>
        <div style={{ padding: '0 20px', marginBottom: '32px' }}>
          <Link href="/admin/home" style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '1.2rem',
            color: 'var(--fg)',
          }}>
            管理后台
          </Link>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px' }}>
            tbtparent.me
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                color: pathname === item.path ? 'var(--fg)' : 'var(--muted)',
                fontWeight: pathname === item.path ? 600 : 400,
                backgroundColor: pathname === item.path ? 'var(--border)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '20px', position: 'absolute', bottom: '24px' }}>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: 'var(--muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            退出登录
          </button>
          <Link
            href="/"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: 'var(--muted)',
              marginTop: '8px',
            }}
          >
            ← 返回前台
          </Link>
        </div>
      </aside>

      {/* 内容区 */}
      <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
