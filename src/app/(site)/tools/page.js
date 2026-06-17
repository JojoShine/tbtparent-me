'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/hooks/useLang'
import { localizedField } from '@/lib/i18n-helpers'
import EmptyState from '@/components/ui/EmptyState'
import ImageCompressor from './ImageCompressor'
import QRCodeGenerator from './QRCodeGenerator'
import IPQuery from './IPQuery'
import IPCalculator from './IPCalculator'
import NetworkPlanning from './NetworkPlanning'
import NetworkCommands from './NetworkCommands'
import NetworkLatency from './NetworkLatency'
import DNSLookup from './DNSLookup'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

// 工具分类和子功能
const toolStructure = [
  {
    key: 'office',
    label: '办公',
    children: [
      { key: 'image-compressor', label: '图片压缩' },
      { key: 'qrcode-generator', label: '二维码生成' },
    ]
  },
  {
    key: 'network',
    label: '网络',
    children: [
      { key: 'ip-query', label: 'IP查询' },
      { key: 'ip-calculator', label: 'IP计算器' },
      { key: 'network-planning', label: '组网规划' },
      { key: 'network-latency', label: '延迟测试' },
      { key: 'dns-lookup', label: 'DNS查询' },
    ]
  },
]

export default function ToolsPage() {
  const { lang, t } = useLang()
  const [externalTools, setExternalTools] = useState([])
  const [activeTool, setActiveTool] = useState('image-compressor') // 默认选中第一个工具
  const [expandedCategories, setExpandedCategories] = useState(['office', 'network']) // 默认全部展开
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/tools').then(r => r.json()).then(data => { 
      setExternalTools(Array.isArray(data) ? data : [])
      setLoaded(true) 
    }).catch(console.error)
  }, [])

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(k => k !== categoryKey)
        : [...prev, categoryKey]
    )
  }

  // 获取当前激活的工具所属的分类
  const getActiveCategory = () => {
    for (const cat of toolStructure) {
      if (cat.children.some(child => child.key === activeTool)) {
        return cat.key
      }
    }
    return null
  }

  return (
    <motion.div
      className="max-w-6xl pb-8 md:pb-20"
      style={{ margin: '0 auto', display: 'flex', flexDirection: 'column' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      <motion.section variants={fadeUp} style={{ marginBottom: '32px' }}>
        <h1 className="text-3xl md:text-4xl font-mono font-bold" style={{ color: 'var(--fg)' }}>
          {t('nav.tools')}
        </h1>
      </motion.section>

      {/* 主内容区 - 左侧目录 + 右侧工具 */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* 左侧目录树 */}
        <motion.aside 
          variants={fadeUp}
          className="tools-sidebar"
          style={{ 
            width: '200px', 
            flexShrink: 0,
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '16px',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
            position: 'sticky',
            top: '80px',
          }}
        >
          {toolStructure.map(category => (
            <div key={category.key} style={{ marginBottom: '12px' }}>
              {/* 分类标题 - 只有一个子分类时不显示折叠按钮 */}
              {toolStructure.length > 1 && (
                <button
                  onClick={() => toggleCategory(category.key)}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{lang === 'zh' ? category.label : category.key}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                    {expandedCategories.includes(category.key) ? '▼' : '▶'}
                  </span>
                </button>
              )}

              {/* 子功能列表 - 始终显示 */}
              {category.children.length > 0 && (
                <div style={{ marginTop: expandedCategories.includes(category.key) || toolStructure.length === 1 ? '4px' : '0' }}>
                  {category.children.map(child => (
                    <button
                      key={child.key}
                      onClick={() => setActiveTool(child.key)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: activeTool === child.key ? 'var(--fg)' : 'transparent',
                        color: activeTool === child.key ? 'var(--bg)' : 'var(--muted)',
                        border: 'none',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: '2px',
                        marginBottom: '4px',
                      }}
                      className="tool-menu-item"
                    >
                      {lang === 'zh' ? child.label : child.key}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.aside>

        {/* 右侧工具区域 */}
        <motion.main 
          variants={fadeUp}
          className="tools-main-content"
          style={{ flex: 1, minWidth: 0 }}
        >

          {/* 根据选中的工具显示对应内容（使用 display 控制避免重新挂载闪烁） */}
          <div style={{ display: activeTool === 'image-compressor' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <ImageCompressor />
          </div>
          
          <div style={{ display: activeTool === 'qrcode-generator' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <QRCodeGenerator />
          </div>
          
          <div style={{ display: activeTool === 'ip-query' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <IPQuery />
          </div>
          
          <div style={{ display: activeTool === 'ip-calculator' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <IPCalculator />
          </div>
          
          <div style={{ display: activeTool === 'network-planning' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <NetworkPlanning />
          </div>
          
          <div style={{ display: activeTool === 'network-commands' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <NetworkCommands />
          </div>
          
          <div style={{ display: activeTool === 'network-latency' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <NetworkLatency />
          </div>
          
          <div style={{ display: activeTool === 'dns-lookup' ? 'block' : 'none', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <DNSLookup />
          </div>
        </motion.main>
      </div>

      {/* 外部链接工具 - 固定在底部（移动端隐藏） */}
      {externalTools.filter(tool => tool.available).length > 0 && (
        <motion.section className="external-tools-section" variants={fadeUp} style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px solid var(--border)' }}>
          <h2 className="text-xl font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '16px' }}>
            {lang === 'zh' ? '外部工具' : 'External Tools'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="external-tools-grid">
            {externalTools.filter(tool => tool.available).map(tool => (
              <a
                key={tool.id}
                href={tool.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block border transition-all duration-200 ease-out hover:-translate-y-0.5"
                style={{ borderColor: 'var(--border)', padding: '20px' }}
              >
                <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1rem' }}>
                  {localizedField(tool, 'name', lang)}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  {localizedField(tool, 'description', lang)}
                </p>
              </a>
            ))}
          </div>
        </motion.section>
      )}

      {!loaded && externalTools.length === 0 && (
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>Loading...</p>
      )}
      {loaded && externalTools.filter(tool => tool.available).length === 0 && categories.every(() => true) && (
        <EmptyState message={lang === 'zh' ? '暂无可用工具' : 'No tools available'} />
      )}

      <style jsx global>{`
        /* 菜单按钮只在 hover 时有过渡，选中态切换无过渡避免闪烁 */
        .tool-menu-item {
          transition: none;
        }
        .tool-menu-item:hover {
          opacity: 0.85;
        }
        @media (max-width: 768px) {
          .external-tools-section {
            display: none !important;
          }
          .external-tools-grid {
            grid-template-columns: 1fr !important;
          }
          
          /* 移动端防止输入框擑开页面 */
          .tools-main-content {
            width: 100% !important;
            overflow-x: hidden !important;
          }
          .tools-main-content input,
          .tools-main-content select,
          .tools-main-content textarea {
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
          .tools-main-content div[style*="display: flex"] {
            flex-wrap: wrap !important;
          }
          
          /* 移动端改为垂直布局：菜单在上，工具在下 */
          div:has(> .tools-sidebar) {
            flex-direction: column !important;
          }
          
          /* 移动端侧边栏改为顶部横向滚动 */
          .tools-sidebar {
            display: flex !important;
            flex-direction: row !important;
            position: static !important;
            width: 100% !important;
            max-height: none !important;
            padding: 12px !important;
            margin-bottom: 16px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            white-space: nowrap !important;
            gap: 8px !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          .tools-sidebar > div {
            display: inline-flex !important;
            flex-direction: column !important;
            margin-right: 0 !important;
            margin-bottom: 0 !important;
            vertical-align: top !important;
            min-width: fit-content !important;
          }
          
          /* 移动端隐藏分类标题按钮 */
          .tools-sidebar > div > button:first-child {
            display: none !important;
          }
          
          /* 移动端子功能列表横向排列 */
          .tools-sidebar > div > div {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            margin-top: 0 !important;
          }
          
          .tools-sidebar button {
            padding: 8px 16px !important;
            font-size: 0.75rem !important;
            white-space: nowrap !important;
          }
          
          .tools-main-content {
            width: 100% !important;
          }
        }
      `}</style>
    </motion.div>
  )
}
