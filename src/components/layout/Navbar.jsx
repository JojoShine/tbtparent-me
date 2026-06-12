'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Logo from '@/components/ui/Logo'
import LanguageSwitch from '@/components/ui/LanguageSwitch'
import { useLang } from '@/hooks/useLang'

export default function Navbar() {
  const pathname = usePathname()
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  
  const navItems = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.blog', path: '/blog' },
    { key: 'nav.projects', path: '/projects' },
    { key: 'nav.tools', path: '/tools' },
    { key: 'nav.about', path: '/about' },
  ]

  // 点击导航链接后关闭菜单
  const handleNavClick = () => setMenuOpen(false)

  return (
    <>
      <nav className="z-50 flex justify-between items-center navbar-padding" style={{
        backgroundColor: 'var(--bg)'
      }}>
        <Logo />
        
        {/* 桌面端导航 */}
        <div className="hidden md:flex gap-6 items-center">
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className="relative transition-colors hover:opacity-70"
              style={{
                color: pathname === item.path ? 'var(--fg)' : 'var(--muted)'
              }}
            >
              {t(item.key)}
              {pathname === item.path && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5" style={{ backgroundColor: 'var(--fg)' }} />
              )}
            </Link>
          ))}
          <LanguageSwitch />
          <a
            href="https://github.com/JojoShine"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--fg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </a>
          <ThemeToggle />
        </div>

        {/* 移动端汉堡菜单按钮 */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
          style={{ color: 'var(--fg)' }}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* 移动端菜单 */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ backgroundColor: 'var(--bg)', top: '60px' }}
        >
          <div className="flex flex-col" style={{ padding: '24px 24px 0' }}>
            {navItems.map(item => (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleNavClick}
                className="py-3 border-b transition-colors"
                style={{
                  color: pathname === item.path ? 'var(--fg)' : 'var(--muted)',
                  borderColor: 'var(--border)',
                  fontWeight: pathname === item.path ? 700 : 400,
                }}
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="flex items-center gap-4 py-4">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
