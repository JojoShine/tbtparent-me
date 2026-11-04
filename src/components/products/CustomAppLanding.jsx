'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ArrowUpRight, ArrowRight, Plus, Minus, Smartphone, Layers3, Workflow } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import './custom-app-landing.css'

const delivery = [
  ['确认需求', '目标用户、页面、业务与平台范围，先形成清晰的交付约定。'],
  ['定制产品', '在 Flutter 中开发品牌与业务界面，组合已有基础能力。'],
  ['连接服务', '按需配置后端、管理平台与厂商服务，逐端联调验收。'],
  ['交付与维护', '交付安装包、项目代码和必要说明，在原工程持续迭代。'],
]
const platformIcons = [Workflow, Layers3, Smartphone]

export default function CustomAppLanding({ project, profile }) {
  const [active, setActive] = useState(0)
  const tabs = useRef([])
  const platforms = profile.construction.slice(1)
  const selected = platforms[active]
  const Icon = platformIcons[active]

  function navigateTabs(event, index) {
    const directions = { ArrowRight: (index + 1) % 3, ArrowLeft: (index + 2) % 3, Home: 0, End: 2 }
    if (!(event.key in directions)) return
    event.preventDefault()
    const next = directions[event.key]
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <div className="ca-page" lang="zh-CN">
      <header className="ca-header ca-wrap">
        <a href="#overview" className="ca-brand"><Image src={profile.logo} alt="" width={38} height={38} /><span>custom_app</span></a>
        <nav aria-label="custom_app 导航"><a href="#construction">App 底座</a><a href="#collaboration">配套平台</a><a href="#delivery">定制交付</a><a className="ca-nav-try" href="#experience">Android 体验<ArrowUpRight size={14} /></a><ThemeToggle /></nav>
      </header>
      <main>
        <section className="ca-hero ca-wrap" id="overview">
          <div className="ca-hero-copy"><p className="ca-eyebrow">为具体的业务，构建自己的产品</p><h1>你的业务。<br /><span>你的 App。</span></h1><p className="ca-intro">从 Flutter App 到业务后端，再到接入、运维与运营平台。复用基础能力，把品牌、页面与业务做成适合你的产品。</p><div className="ca-actions"><a className="ca-button" href="#construction">了解定制能力<ArrowRight size={18} /></a><a className="ca-text-link" href="#experience">体验 Android 测试版<ArrowUpRight size={17} /></a></div></div>
          <div className="ca-composition" aria-label="App、共享能力、三个管理平台与业务后端的组成关系">
            <div className="ca-composition-top"><span>产品组成</span><ArrowUpRight size={22} /></div>
            <div className="ca-app-word">APP<span>品牌 · 界面 · 业务</span></div>
            <div className="ca-shared"><strong>共享能力</strong><span>账号 / 消息 / 文件 / 原生</span></div>
            <div className="ca-platform-names"><span>应用接入</span><span>运维</span><span>运营</span></div>
            <div className="ca-backend"><span>共同支撑</span><strong>业务后端</strong></div>
          </div>
        </section>

        <section className="ca-foundation ca-wrap" id="construction">
          <div className="ca-section-intro"><span className="ca-label">APP FOUNDATION</span><h2>界面为业务定制。<br />能力在底座复用。</h2><p>产品页面、共享业务与原生适配分层维护。品牌和交互可以改变，已有基础能力继续使用。</p></div>
          <div className="ca-capabilities">{profile.construction[0].items.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p><ArrowUpRight size={22} aria-hidden="true" /></article>)}</div>
        </section>

        <section className="ca-platform-section" id="collaboration"><div className="ca-wrap">
          <div className="ca-platform-heading"><span className="ca-label">BEYOND THE APP</span><h2>交付之后，<br />让产品继续运转。</h2><p>应用接入、运维和运营三个平台并列协作，共用管理基础，各自承担明确的职责。</p></div>
          <div className="ca-tabs" role="tablist" aria-label="三个配套平台">{platforms.map((platform, index) => <button key={platform.title} ref={node => { tabs.current[index] = node }} id={`ca-tab-${index}`} role="tab" aria-selected={active === index} aria-controls="ca-platform-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => navigateTabs(event, index)}>{platform.title}<ArrowUpRight size={18} /></button>)}</div>
          <div className="ca-platform-panel" id="ca-platform-panel" role="tabpanel" aria-labelledby={`ca-tab-${active}`} tabIndex={0}>
            <div className="ca-platform-caption"><Icon size={42} strokeWidth={1.3} /><h3>{selected.title}</h3><p>{selected.description}</p></div>
            <div className="ca-platform-details">{selected.items.map(item => <article key={item.title}><h4>{item.title}</h4><p>{item.description}</p></article>)}</div>
          </div>
          <p className="ca-platform-note">第三方 H5 按需接入。纯原生 App 可以直接开发自己的业务。</p>
        </div></section>

        <section className="ca-delivery ca-wrap" id="delivery"><h2>从需求出发，<br />以可交付的产品落地。</h2><ol>{delivery.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{description}</p></li>)}</ol><div className="ca-engineering" id="technology"><strong>一套完整的工程支撑</strong><p>Flutter / Dart · NestJS · PostgreSQL / Redis · 私有对象存储</p><span>客户端、业务后端和管理平台分别维护，通过受控接口连接。</span></div></section>

        <section className="ca-scope ca-wrap" id="status"><div><h2>把边界，<br />一起说清楚。</h2></div><div>{profile.notes.map(note => <details key={note.title}><summary>{note.title}<Plus className="ca-plus" size={19} /><Minus className="ca-minus" size={19} /></summary><p>{note.description}</p></details>)}</div></section>

        <section className="ca-try ca-wrap" id="experience"><div><h2>先从体验开始。</h2><p>{profile.experienceDescription}</p><a className="ca-text-link" href={project.demo_qr_url} target="_blank" rel="noopener noreferrer">查看测试版二维码原图<ArrowUpRight size={17} /></a></div>{project.demo_qr_url && <Image src={project.demo_qr_url} alt={profile.experienceImageAlt} width={210} height={210} unoptimized />}</section>
        <section className="ca-resources ca-wrap" id="resources"><h2>开始了解你的下一款 App。</h2><div>{profile.sources.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer"><span>{source.label}</span><ArrowUpRight size={19} /></a>)}</div></section>
      </main>
      <footer className="ca-footer ca-wrap"><span>custom_app · App 底座与配套平台</span><div>{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={14} /></a>}<a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer">甜宝塔家长<ArrowUpRight size={14} /></a></div></footer>
    </div>
  )
}
