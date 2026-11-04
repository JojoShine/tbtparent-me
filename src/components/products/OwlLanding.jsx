'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown, Plus } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import './owl-landing.css'

export default function OwlLanding({ project, profile }) {
  const [builderIndex, setBuilderIndex] = useState(0)
  const tabs = useRef([])
  const builder = profile.builders[builderIndex]

  function handleTabKey(event, index) {
    let next
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = 1
    else return
    event.preventDefault()
    setBuilderIndex(next)
    tabs.current[next]?.focus()
  }

  return (
    <div className="owl-page" lang="zh-CN">
      <a className="owl-skip" href="#building">跳到产品功能</a>
      <header className="owl-header owl-wrap">
        <a className="owl-brand" href="#top" aria-label="Owl 官网首页"><Image className="owl-logo-light" src={profile.logo} alt="" width={36} height={36} /><Image className="owl-logo-dark" src="/images/projects/owl/logo-dark.png" alt="" width={36} height={36} /><span>Owl<span className="owl-brand-platform">Platform</span></span></a>
        <nav aria-label="Owl 官网导航"><a href="#building">业务构建</a><a href="#foundation">平台能力</a><a href={project.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={14} /></a><ThemeToggle /></nav>
      </header>

      <main id="top">
        <section className="owl-hero owl-wrap" aria-labelledby="owl-title">
          <div className="owl-masthead"><div className="owl-name"><p>前后端一体的管理后台基础框架</p><span aria-hidden="true">Owl</span></div><div className="owl-hero-copy"><h1 id="owl-title">通用能力就位。<br />业务从这里展开。</h1><p>{profile.summary}</p><div className="owl-actions"><a className="owl-button" href={project.pc_url} target="_blank" rel="noopener noreferrer">进入 Owl<ArrowUpRight size={17} /></a><a className="owl-inline-link" href={profile.sources[0].href} target="_blank" rel="noopener noreferrer">阅读文档<ArrowUpRight size={16} /></a></div></div></div>
          <figure className="owl-structure"><div className="owl-layer-list"><a href="#building"><span>业务构建</span><strong><span>动态 CRUD</span><span>SQL 接口</span></strong><ArrowDown size={16} /></a><a href="#foundation"><span>平台能力</span><strong><span>权限 · 文件</span><span>日志 · 通知</span></strong><ArrowDown size={16} /></a><a href="#delivery"><span>运行支撑</span><strong><span>前端 · 服务端</span><span>数据与存储</span></strong><ArrowDown size={16} /></a></div><div className="owl-structure-art"><Image src="/images/projects/owl/structure.webp" alt="" width={1536} height={1024} sizes="(max-width: 767px) 100vw, (max-width: 1440px) 65vw, 820px" preload /></div><figcaption>平台分层示意</figcaption></figure>
        </section>

        <section className="owl-building" id="building"><div className="owl-wrap"><div className="owl-heading"><h2>让一张业务表，<br />长出自己的管理能力。</h2><p>两种构建方式，分别处理标准业务页面和数据接口。</p></div><div className="owl-builder-tabs" role="tablist" aria-label="业务构建方式">{profile.builders.map((item, index) => <button key={item.id} id={`owl-tab-${item.id}`} type="button" role="tab" aria-selected={index === builderIndex} aria-controls="owl-builder-panel" tabIndex={index === builderIndex ? 0 : -1} onClick={() => setBuilderIndex(index)} onKeyDown={event => handleTabKey(event, index)} ref={node => { tabs.current[index] = node }}><span>{item.label}</span><ArrowRight size={20} /></button>)}</div><div className="owl-builder-panel" id="owl-builder-panel" role="tabpanel" aria-labelledby={`owl-tab-${builder.id}`}><div className="owl-builder-intro"><h3>{builder.title}</h3><p>{builder.description}</p><ul>{builder.features.map(item => <li key={item}><Plus size={13} aria-hidden="true" />{item}</li>)}</ul><a className="owl-inline-link" href={builder.href} target="_blank" rel="noopener noreferrer">了解{builder.label}<ArrowUpRight size={16} /></a></div><ol className="owl-build-steps">{builder.steps.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{step.title}</h4><p>{step.description}</p></div></li>)}</ol><p className="owl-builder-note">{builder.note}</p></div></div></section>

        <section className="owl-foundation owl-wrap" id="foundation"><div className="owl-heading"><h2>每个业务都会遇到的事，<br />先在底座里做好。</h2><p>复用公共模块，把业务功能接入同一套管理方式。</p></div><div className="owl-identity"><div><h3>从用户身份，连接到业务权限。</h3><p>维护用户、角色、部门和菜单，为页面入口与后端操作配置权限。账号支持密码或短信登录，登录方式按项目配置。</p><a className="owl-inline-link" href="https://github.com/JojoShine/owl/blob/main/docs/features/12-menu-permission.md" target="_blank" rel="noopener noreferrer">了解权限体系<ArrowUpRight size={16} /></a></div><div className="owl-permission-flow" aria-label="用户通过角色关联权限，控制菜单和接口"><ol><li>用户</li><li>角色</li><li>权限</li></ol><p>菜单入口<span>+</span>接口操作</p><p className="owl-security-note">维护敏感字段脱敏规则、明文访问记录和页面水印；业务数据范围按模块接入。</p></div></div><div className="owl-service-grid">{profile.services.map((service, index) => <article key={service.title}><span className="owl-service-index">{String(index + 1).padStart(2, '0')}</span><div><h3>{service.title}</h3><p>{service.description}</p><ul>{service.items.map(item => <li key={item}>{item}</li>)}</ul></div></article>)}</div></section>

        <section className="owl-integration" id="integration"><div className="owl-wrap"><div className="owl-heading"><h2>让外部系统接进来，<br />把调用边界分清楚。</h2><p>SQL 接口和第三方系统使用各自的凭证与授权关系。</p></div><div className="owl-integration-rows"><article><div><span className="owl-mono">API Builder</span><h3>SQL 接口密钥</h3></div><p>给厂商或业务应用分配密钥，明确授权到具体 SQL 接口，校验有效期、启停状态与调用频率。</p><a className="owl-inline-link" href="https://github.com/JojoShine/owl/blob/main/docs/features/05-api-builder.md" target="_blank" rel="noopener noreferrer">接口说明<ArrowUpRight size={16} /></a></article><article><div><span className="owl-mono">System Integration</span><h3>第三方签名接入</h3></div><p>为开放业务接口配置 Scope，通过 HMAC-SHA256 签名、时间戳与 Nonce 校验系统间请求。</p><a className="owl-inline-link" href="https://github.com/JojoShine/owl/blob/main/docs/features/06-third-party-integration.md" target="_blank" rel="noopener noreferrer">接入说明<ArrowUpRight size={16} /></a></article></div><p className="owl-integration-note">两类凭证相互独立，也不能换取后台用户 Token。</p></div></section>

        <section className="owl-delivery owl-wrap" id="delivery"><div className="owl-heading"><h2>从本地开发，<br />到自己的部署环境。</h2><p>前后端独立构建，数据与存储连接自己的服务。</p></div><div className="owl-delivery-layout"><dl><div><dt>前端</dt><dd><strong>React · Vite · Ant Design</strong><span>构建为静态文件，由 Nginx 托管。</span></dd></div><div><dt>服务端</dt><dd><strong>NestJS · Prisma</strong><span>模块化 API、数据模型与版本迁移。</span></dd></div><div><dt>数据与存储</dt><dd><strong>PostgreSQL · MinIO · Redis</strong><span>关系数据、文件对象与相关缓存能力。</span></dd></div></dl><div className="owl-deploy-copy"><h3>同一版本，按环境配置。</h3><p>后端通过 Docker 镜像与 Compose 交付，支持 amd64 / arm64。前端静态部署；数据库与对象存储作为外部服务配置。</p><p>首次初始化、历史库接管与后续迁移有各自流程，部署前按文档准备依赖与配置。</p><a className="owl-inline-link" href={profile.sources[1].href} target="_blank" rel="noopener noreferrer">查看部署指南<ArrowUpRight size={16} /></a></div></div></section>

        <section className="owl-questions owl-wrap"><h2>开始之前，了解这几件事。</h2><div>{profile.questions.map(item => <details key={item.title}><summary>{item.title}<ChevronDown size={18} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div></section>

        <section className="owl-start owl-wrap"><div><p>Owl Platform</p><h2>从通用底座，<br />开始你的业务系统。</h2></div><div><a className="owl-button" href={project.pc_url} target="_blank" rel="noopener noreferrer">进入 Owl<ArrowUpRight size={17} /></a><a className="owl-inline-link" href={project.github} target="_blank" rel="noopener noreferrer">查看 GitHub 仓库<ArrowUpRight size={16} /></a></div></section>
      </main>

      <footer className="owl-footer owl-wrap"><span>Owl Platform</span><div><a href={profile.sources[2].href} target="_blank" rel="noopener noreferrer">MIT 许可证<ArrowUpRight size={13} /></a><a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer">甜宝塔家长<ArrowUpRight size={13} /></a></div></footer>
    </div>
  )
}
