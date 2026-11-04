import Image from 'next/image'
import { ArrowUpRight, ArrowRight, ChevronDown, Terminal, UserRound, Smartphone, CreditCard, Boxes, FileText } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import './wechat-app-landing.css'

const icons = [UserRound, Smartphone, CreditCard, Boxes]
const reuseSteps = [
  ['复制工程', '为新场景替换名称、门户与业务模块。'],
  ['配置服务', '准备小程序身份、API、数据库和私有 OSS。'],
  ['接入业务', '实现自己的商品、订单、规则与履约。'],
  ['联调交付', '在实际域名、商户和真机环境完成验证。'],
]

export default function WechatAppLanding({ project, profile }) {
  return (
    <div className="wa-page" lang="zh-CN">
      <header className="wa-header wa-wrap"><a className="wa-brand" href="#overview"><Terminal size={25} strokeWidth={1.7} /><span>custom_wechat_app</span></a><nav aria-label="小程序底座导航"><a href="#construction">能力目录</a><a href="#reuse">场景复用</a><a href="#resources">开发文档</a><a className="wa-nav-try" href="#experience">体验<ArrowUpRight size={14} /></a><ThemeToggle /></nav></header>
      <main>
        <section className="wa-hero wa-wrap" id="overview"><div className="wa-spec"><span>微信小程序全栈底座</span><dl><div><dt>CLIENT</dt><dd>Taro + React</dd></div><div><dt>SERVER</dt><dd>NestJS API</dd></div><div><dt>SCOPE</dt><dd>单实例工程</dd></div></dl></div><div className="wa-hero-copy"><h1>先接通能力，<br />再构建业务。</h1><p>从微信登录到原生能力，从文件到支付。把小程序与服务端的基础链路封装好，供团队按场景复制和扩展。</p><div className="wa-actions"><a className="wa-button" href="#construction">查看能力目录<ArrowRight size={17} /></a><a className="wa-inline" href="#experience">微信扫码体验<ArrowUpRight size={17} /></a></div></div></section>

        <section className="wa-architecture wa-wrap" id="technology"><div className="wa-architecture-title"><h2>前后端，同一套工程。</h2><p>共享公开数据契约，平台与业务分层维护。</p></div><div className="wa-layers"><div><span>小程序客户端</span><strong>Taro / React</strong><p>页面、导航、原生能力与用户交互。</p><ArrowRight size={19} /></div><div><span>共享契约</span><strong>TypeScript</strong><p>前后端公开的请求与响应类型。</p><ArrowRight size={19} /></div><div><span>服务端 API</span><strong>NestJS / Prisma</strong><p>身份、文件、支付及独立业务模块。</p></div></div><div className="wa-services"><span>PostgreSQL 数据库</span><span>私有 OSS 文件</span><span>微信登录与支付 API</span></div></section>

        <section className="wa-catalog wa-wrap" id="construction"><div className="wa-catalog-main"><div className="wa-section-title"><span>CAPABILITY INDEX</span><h2>从需要的能力开始。</h2><p>按功能域查看已经封装的接口与流程。</p></div><div className="wa-accordions">{profile.construction.map((group, index) => { const Icon = icons[index]; return <details key={group.title} open={index === 0}><summary><Icon size={23} strokeWidth={1.6} /><span><strong>{group.title}</strong><small>{group.description}</small></span><ChevronDown size={19} /></summary><div className="wa-capability-items">{group.items.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></details> })}</div></div><aside className="wa-demo" id="experience"><span className="wa-demo-label">LIVE MINIAPP</span><h2>在微信里体验。</h2><p>已上线的示例小程序，展示底座现有能力。</p>{project.demo_qr_url && <Image src={project.demo_qr_url} alt="已上线微信小程序的体验码" width={220} height={220} unoptimized />}<a href={project.demo_qr_url} target="_blank" rel="noopener noreferrer">查看小程序码原图<ArrowUpRight size={15} /></a></aside></section>

        <section className="wa-reuse" id="reuse"><div className="wa-wrap"><div className="wa-section-title"><span>BUILD YOUR SCENARIO</span><h2>同一个底座，<br />独立的业务场景。</h2><p>每个复制项目使用自己的小程序身份、服务和数据。</p></div><ol>{reuseSteps.map(([title, text], index) => <li key={title}><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>

        <section className="wa-boundaries wa-wrap" id="collaboration"><h2>把平台能力和业务规则分开。</h2><p className="wa-boundary-intro">底座负责通用接入与工程基础。具体场景决定自己的商品、价格、业务订单、退款条件和履约。</p><div className="wa-relations">{profile.relations.map(item => <article key={item.from}><h3>{item.from}<ArrowRight size={16} />{item.to}</h3><p>{item.description}</p></article>)}</div><dl id="status">{profile.notes.map(note => <div key={note.title}><dt>{note.title}</dt><dd>{note.description}</dd></div>)}</dl></section>

        <section className="wa-docs wa-wrap" id="resources"><div><FileText size={30} strokeWidth={1.5} /><h2>沿着文档，接入自己的业务。</h2><p>从开发指南开始，继续了解环境配置和部署方式。</p></div><div className="wa-doc-links">{profile.sources.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer"><span><strong>{source.label}</strong><small>{source.description}</small></span><ArrowUpRight size={20} /></a>)}{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer"><span><strong>项目仓库</strong><small>客户端、API 与共享契约</small></span><ArrowUpRight size={20} /></a>}</div></section>
      </main>
      <footer className="wa-footer wa-wrap"><span>custom_wechat_app · 微信小程序全栈底座</span><a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer">甜宝塔家长<ArrowUpRight size={14} /></a></footer>
    </div>
  )
}
