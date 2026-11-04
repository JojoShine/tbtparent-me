'use client'

import { useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, ArrowLeftRight, GitBranch, Database, ShieldCheck, Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import './datamesh-landing.css'

const platformIcons = [ArrowLeftRight, GitBranch, Database, ShieldCheck]

export default function DataMeshLanding({ project, profile }) {
  const [active, setActive] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const tabs = useRef([])
  const platform = profile.platforms[active]

  function handleTabKey(event, index) {
    let next
    if (event.key === 'ArrowRight') next = (index + 1) % profile.platforms.length
    else if (event.key === 'ArrowLeft') next = (index + profile.platforms.length - 1) % profile.platforms.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = profile.platforms.length - 1
    else return
    event.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <div className="dm-page" lang="zh-CN">
      <a className="dm-skip" href="#platforms">跳到产品能力</a>
      <header className="dm-header"><div className="dm-header-inner dm-wrap">
        <a className="dm-brand" href="#overview" onClick={() => setMenuOpen(false)}>DataMesh</a>
        <nav className="dm-desktop-nav" aria-label="DataMesh 官网导航"><a href="#platforms">产品能力</a><a href="#coordination">平台协同</a><a href="#ai">智能问数</a><a href="#progress">项目进展</a><a href={project.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={14} /></a></nav>
        <div className="dm-header-actions"><ThemeToggle /><button className="dm-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="dm-mobile-nav" aria-label={menuOpen ? '关闭导航' : '打开导航'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
        </div><nav className="dm-mobile-nav dm-wrap" id="dm-mobile-nav" aria-label="DataMesh 手机导航" hidden={!menuOpen}><a href="#platforms" onClick={() => setMenuOpen(false)}>产品能力</a><a href="#coordination" onClick={() => setMenuOpen(false)}>平台协同</a><a href="#ai" onClick={() => setMenuOpen(false)}>智能问数</a><a href="#progress" onClick={() => setMenuOpen(false)}>项目进展</a><a href={project.github} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>GitHub<ArrowUpRight size={14} /></a></nav>
      </header>

      <main>
        <section className="dm-hero" id="overview"><div className="dm-wrap dm-hero-layout">
          <div className="dm-hero-copy"><p className="dm-hero-state">项目建设中</p><h1>DataMesh<span>一体化数据服务体系</span></h1><p className="dm-hero-summary">围绕数据交换、数据治理、数据资产与数据安全，构建四个平台协同的数据服务体系。</p><a className="dm-button dm-hero-button" href="#platforms">了解产品能力<ArrowRight size={17} /></a></div>
          <div className="dm-overview" role="img" aria-label="产品体系示意：统一身份认证连接数据交换、数据治理、数据资产和数据安全四个独立平台；AI 智能问数作为旁路能力贯穿全局。"><div className="dm-overview-identity">统一身份认证</div><div className="dm-overview-platforms">{profile.platforms.map((item, index) => { const Icon = platformIcons[index]; return <div key={item.id}><Icon size={22} strokeWidth={1.6} aria-hidden="true" /><span>{item.name}</span></div> })}</div><div className="dm-overview-ai"><strong>AI 智能问数</strong><span>旁路接入四个平台</span></div><p>产品体系示意</p></div>
        </div></section>

        <section className="dm-platforms dm-wrap" id="platforms"><div className="dm-section-heading"><h2>四个平台，清晰分工</h2><p>分别承载专业业务，保留清晰的平台边界。以下为当前建设范围。</p></div><div className="dm-platform-tabs" role="tablist" aria-label="产品平台">{profile.platforms.map((item, index) => { const Icon = platformIcons[index]; return <button type="button" role="tab" key={item.id} id={`dm-tab-${item.id}`} aria-selected={active === index} aria-controls="dm-platform-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => handleTabKey(event, index)} ref={node => { tabs.current[index] = node }}><Icon size={23} strokeWidth={1.6} aria-hidden="true" /><span>{item.name}</span></button> })}</div><div className="dm-platform-panel" id="dm-platform-panel" role="tabpanel" aria-labelledby={`dm-tab-${platform.id}`}><div><h3>{platform.name}平台</h3><p className="dm-platform-lead">{platform.headline}</p><p className="dm-platform-description">{platform.description}</p></div><div className="dm-platform-scope"><h4>主要建设内容</h4><ul>{platform.topics.map(topic => <li key={topic}>{topic}</li>)}</ul></div></div></section>

        <section className="dm-coordination" id="coordination"><div className="dm-wrap"><div className="dm-section-heading"><h2>统一连接，保持专业分工</h2><p>在独立平台之间衔接身份、权限与使用体验。</p></div><dl>{profile.coordination.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}</dl></div></section>

        <section className="dm-ai dm-wrap" id="ai"><div className="dm-ai-copy"><h2>AI 智能问数</h2><h3>以旁路方式贯穿四个平台</h3><p>围绕数据上下文、指标口径和访问权限组织自然语言问数能力，与各平台的专业工作协同。</p><p className="dm-ai-note">智能问数纳入整体建设范围，具体能力以实际交付为准。</p></div><dl>{profile.aiContext.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}</dl></section>

        <section className="dm-progress dm-wrap" id="progress"><div><h2>项目进展</h2><p className="dm-progress-state">建设中</p><p>DataMesh 正在推进建设，当前页面介绍产品体系与平台范围，公开体验入口尚未开放。</p></div><a className="dm-button" href={project.github} target="_blank" rel="noopener noreferrer">查看项目仓库<ArrowUpRight size={17} /></a></section>
      </main>

      <footer className="dm-footer"><div className="dm-wrap"><div><span className="dm-footer-brand">DataMesh</span><p>一体化数据服务体系</p></div><a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer">甜宝塔家长<ArrowUpRight size={14} /></a></div></footer>
    </div>
  )
}
