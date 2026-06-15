'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Gamepad2, Search } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Logo from '@/components/ui/Logo'
import LanguageSwitch from '@/components/ui/LanguageSwitch'
import { useLang } from '@/hooks/useLang'

export default function Navbar() {
  const pathname = usePathname()
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  const navItems = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.blog', path: '/blog' },
    { key: 'nav.projects', path: '/projects' },
    { key: 'nav.tools', path: '/tools' },
    { key: 'nav.hobbies', path: '/hobbies' },
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
          <a
            href="/api/rss"
            target="_blank"
            rel="noopener noreferrer"
            title="RSS Feed"
            className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--fg)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
          </a>
          
          {/* 游戏入口按钮 */}
          <Link
            href="/game"
            title="益智趣味小游戏"
            className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--fg)' }}
          >
            <Gamepad2 className="w-5 h-5" />
          </Link>
          
          {/* 搜索按钮 */}
          <button
            onClick={() => setSearchOpen(true)}
            title="搜索"
            className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: 'var(--fg)' }}
          >
            <Search className="w-5 h-5" />
          </button>
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
              <button
                onClick={() => {
                  setSearchOpen(true)
                  setMenuOpen(false)
                }}
                title="搜索"
                className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: 'var(--fg)' }}
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/game"
                onClick={handleNavClick}
                title="益智趣味小游戏"
                className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: 'var(--fg)' }}
              >
                <Gamepad2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* 搜索弹窗 */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  )
}

// 搜索弹窗组件
const builtinTools = [
  { key: 'image-compressor', label_zh: '图片压缩', label_en: 'Image Compressor', category_zh: '办公' },
  { key: 'qrcode-generator', label_zh: '二维码生成', label_en: 'QR Code Generator', category_zh: '办公' },
  { key: 'ip-query', label_zh: 'IP查询', label_en: 'IP Query', category_zh: '网络' },
  { key: 'ip-calculator', label_zh: 'IP计算器', label_en: 'IP Calculator', category_zh: '网络' },
  { key: 'network-planning', label_zh: '组网规划', label_en: 'Network Planning', category_zh: '网络' },
  { key: 'network-latency', label_zh: '延迟测试', label_en: 'Network Latency', category_zh: '网络' },
  { key: 'dns-lookup', label_zh: 'DNS查询', label_en: 'DNS Lookup', category_zh: '网络' },
]

const searchPages = [
  { key: 'idiom-game', label_zh: '成语闯关', label_en: 'Idiom Game', description_zh: '猜成语小游戏', path: '/game/idiom' },
]

function SearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('') // 仅在输入法确认后才更新，用于过滤
  const composingRef = useRef(false)
  const [cache, setCache] = useState(null)
  
  // ESC 关闭
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])
  
  // 打开时加载全部可搜索数据（只请求一次）
  useEffect(() => {
    Promise.all([
      fetch('/api/blog?pageSize=200').then(r => r.json()).then(d => d.blogs || []).catch(() => []),
      fetch('/api/projects').then(r => r.json()).catch(() => []),
      fetch('/api/tools').then(r => r.json()).catch(() => []),
      fetch('/api/archive/novels').then(r => r.json()).catch(() => []),
    ]).then(([blogs, projects, tools, novels]) => {
      setCache({
        blogs: Array.isArray(blogs) ? blogs : [],
        projects: Array.isArray(projects) ? projects : [],
        tools: Array.isArray(tools) ? tools : [],
        novels: Array.isArray(novels) ? novels : [],
      })
    })
  }, [])
  
  // 客户端过滤
  const match = (text, q) => text && text.toLowerCase().includes(q.toLowerCase())
  
  const q = search.trim()
  const results = !q || !cache ? null : {
    blogs: cache.blogs.filter(b =>
      b.status === 'published' && (
        match(b.title_zh, q) || match(b.title_en, q) ||
        match(b.excerpt_zh, q) || match(b.excerpt_en, q)
      )
    ),
    projects: cache.projects.filter(p =>
      match(p.name_zh, q) || match(p.name_en, q) ||
      match(p.description_zh, q) || match(p.description_en, q)
    ),
    tools: [
      ...builtinTools.filter(t =>
        match(t.label_zh, q) || match(t.label_en, q) || match(t.category_zh, q)
      ).map(t => ({ id: t.key, name_zh: t.label_zh, description_zh: t.category_zh, _builtin: true })),
      ...cache.tools.filter(t =>
        t.available && (
          match(t.name_zh, q) || match(t.name_en, q) ||
          match(t.description_zh, q) || match(t.description_en, q)
        )
      ),
    ],
    pages: searchPages.filter(p =>
      match(p.label_zh, q) || match(p.label_en, q) || match(p.description_zh, q)
    ),
    novels: cache.novels.filter(n =>
      match(n.title_zh, q) || match(n.title_en, q) ||
      match(n.description_zh, q) || match(n.description_en, q)
    ),
  }
  
  const totalCount = results
    ? results.blogs.length + results.projects.length + results.tools.length + results.novels.length + results.pages.length
    : 0
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl mx-4 rounded-lg shadow-2xl border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 搜索输入框 */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              if (!composingRef.current) setSearch(e.target.value)
            }}
            onCompositionStart={() => { composingRef.current = true }}
            onCompositionEnd={e => {
              composingRef.current = false
              setSearch(e.target.value)
            }}
            placeholder="搜索博客、项目、工具、游戏..."
            className="flex-1 bg-transparent outline-none font-mono text-sm placeholder:text-[color:var(--muted)]"
            style={{ color: 'var(--fg)' }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSearch('') }}
              className="p-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* 搜索结果区域 */}
        {!q ? (
          <div className="text-center text-[color:var(--muted)] p-6">
            <p className="font-mono text-sm">输入关键词开始搜索</p>
            <p className="font-mono text-xs mt-2">支持博客、项目、工具、游戏检索</p>
          </div>
        ) : !cache ? (
          <div className="text-center text-[color:var(--muted)] p-6">
            <p className="font-mono text-sm">加载中...</p>
          </div>
        ) : (
          <div className="overflow-y-auto px-4 py-4 pb-8" style={{ maxHeight: '60vh' }}>
            {totalCount === 0 ? (
              <div className="text-center text-[color:var(--muted)] py-8">
                <p className="font-mono text-sm">没有找到相关结果</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.blogs.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs mb-2 text-[color:var(--muted)]">博客</h3>
                    <div className="space-y-2">
                      {results.blogs.map(blog => (
                        <Link key={blog.id} href={`/blog/${blog.slug}`} onClick={onClose}
                          className="block p-3 rounded transition-colors hover:opacity-70"
                          style={{ backgroundColor: 'var(--border)' }}>
                          <p className="font-mono text-sm text-[color:var(--fg)]">{blog.title_zh}</p>
                          {blog.excerpt_zh && (
                            <p className="font-mono text-xs mt-1 text-[color:var(--muted)] line-clamp-2">{blog.excerpt_zh}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {results.projects.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs mb-2 text-[color:var(--muted)]">项目</h3>
                    <div className="space-y-2">
                      {results.projects.map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`} onClick={onClose}
                          className="block p-3 rounded transition-colors hover:opacity-70"
                          style={{ backgroundColor: 'var(--border)' }}>
                          <p className="font-mono text-sm text-[color:var(--fg)]">{project.name_zh}</p>
                          {project.description_zh && (
                            <p className="font-mono text-xs mt-1 text-[color:var(--muted)] line-clamp-2">{project.description_zh}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {results.tools.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs mb-2 text-[color:var(--muted)]">工具</h3>
                    <div className="space-y-2">
                      {results.tools.map(tool => (
                        <Link key={tool.id} href="/tools" onClick={onClose}
                          className="block p-3 rounded transition-colors hover:opacity-70"
                          style={{ backgroundColor: 'var(--border)' }}>
                          <p className="font-mono text-sm text-[color:var(--fg)]">{tool.name_zh}</p>
                          {tool.description_zh && (
                            <p className="font-mono text-xs mt-1 text-[color:var(--muted)] line-clamp-2">{tool.description_zh}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {results.novels.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs mb-2 text-[color:var(--muted)]">小说</h3>
                    <div className="space-y-2">
                      {results.novels.map(novel => (
                        <Link key={novel.id}
                          href={novel.chapters?.length > 0 ? `/hobbies/${novel.chapters[0].id}` : '/hobbies'}
                          onClick={onClose}
                          className="block p-3 rounded transition-colors hover:opacity-70"
                          style={{ backgroundColor: 'var(--border)' }}>
                          <p className="font-mono text-sm text-[color:var(--fg)]">{novel.title_zh}</p>
                          {novel.description_zh && (
                            <p className="font-mono text-xs mt-1 text-[color:var(--muted)] line-clamp-2">{novel.description_zh}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {results.pages.length > 0 && (
                  <div>
                    <h3 className="font-mono text-xs mb-2 text-[color:var(--muted)]">游戏</h3>
                    <div className="space-y-2">
                      {results.pages.map(page => (
                        <Link key={page.key} href={page.path} onClick={onClose}
                          className="block p-3 rounded transition-colors hover:opacity-70"
                          style={{ backgroundColor: 'var(--border)' }}>
                          <p className="font-mono text-sm text-[color:var(--fg)]">{page.label_zh}</p>
                          {page.description_zh && (
                            <p className="font-mono text-xs mt-1 text-[color:var(--muted)]">{page.description_zh}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
