'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowDownLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import './app-portfolio-landing.css'

const categories = ['全部应用', '教育学习', '活动运营', '城市服务']
const atlasLinks = [
  { id: 'enrollment', name: '招生报名', target: 'featured-enrollment' },
  { id: 'coupon', name: '消费券', target: 'app-coupon' },
  { id: 'library', name: '图书馆服务', target: 'app-library' },
]
const assetRoot = '/images/projects/app-portfolio'

export default function AppPortfolioLanding({ project, profile }) {
  const [category, setCategory] = useState('全部应用')
  const applications = profile.applications.filter(app => category === '全部应用' || app.category === category)

  return (
    <div className="ap-page" lang="zh-CN">
      <a className="ap-skip" href="#applications">跳到应用目录</a>
      <header className="ap-header ap-wrap">
        <a className="ap-brand" href="#top"><Image src={`${assetRoot}/brand-mark.png`} alt="" width={44} height={44} /><span>app portfolio</span></a>
        <nav aria-label="App Portfolio 导航">
          <a href="#applications">应用</a>
          <a href="#foundation">产品建设</a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={15} /></a>
          <ThemeToggle />
        </nav>
      </header>

      <main id="top">
        <section className="ap-hero" aria-labelledby="ap-title">
          <div className="ap-hero-top ap-wrap">
            <div className="ap-title-block">
              <h1 id="ap-title"><span>App</span><span>Portfolio</span></h1>
              <a className="ap-launch" href={project.mobile_url} target="_blank" rel="noopener noreferrer">打开应用集<ArrowUpRight size={20} /></a>
            </div>
            <div className="ap-hero-summary"><h2>移动端业务应用集</h2><p>教育、活动运营与城市服务，按具体业务持续构建。</p></div>
            <p className="ap-hero-note">面向移动端 H5<br />独立的业务流程，<br />共用的工程基础。</p>
          </div>
          <div className="ap-atlas">
            <div className="ap-atlas-scene">
              <picture>
                <source media="(max-width: 767px)" srcSet={`${assetRoot}/city-atlas-mobile.webp`} />
                <img src={`${assetRoot}/city-atlas.webp`} width="2172" height="724" alt="学校、商铺与图书馆组成的城市折页插画" fetchPriority="high" decoding="async" />
              </picture>
              {atlasLinks.map(link => <a className={`ap-map-label ap-map-${link.id}`} href={`#${link.target}`} key={link.id} onClick={() => setCategory('全部应用')}><span>{link.name}</span><ArrowDownLeft size={40} strokeWidth={1.2} aria-hidden="true" /></a>)}
            </div>
          </div>
        </section>

        <section className="ap-scenes ap-wrap" aria-labelledby="ap-scenes-title">
          <div className="ap-scenes-intro"><h2 id="ap-scenes-title">应用与场景</h2><p>围绕具体业务，构建可独立运行的移动端 H5 应用，覆盖教育、活动运营与城市服务。</p><a href="#applications">浏览全部 {profile.applications.length} 个应用<ArrowRight size={18} /></a></div>
          <article className="ap-featured" id="featured-enrollment">
            <div><span className="ap-feature-number">01</span><h3>招生报名</h3><p>学校查询、信息填报、材料提交与审核进度。</p><a href="#app-enrollment" onClick={() => setCategory('全部应用')} aria-label="查看招生报名建设内容"><ArrowRight size={26} /></a></div>
            <Image src={`${assetRoot}/enrollment-papers.png`} alt="报名材料与红色文件夹插画" width={1402} height={1122} sizes="(max-width: 767px) 45vw, 340px" />
          </article>
        </section>

        <section className="ap-collection ap-wrap" id="applications">
          <div className="ap-collection-heading"><h2>业务应用图鉴</h2><p role="status">{applications.length} 个应用</p></div>
          <div className="ap-filter" role="group" aria-label="按应用类别筛选">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="ap-applications">
            {applications.map(app => (
              <article className="ap-application" id={`app-${app.id}`} key={app.id}>
                <div className="ap-application-heading"><span className="ap-application-number">{String(profile.applications.indexOf(app) + 1).padStart(2, '0')}</span><span>{app.category}</span></div>
                <h3>{app.name}</h3><p>{app.description}</p>
                <ul aria-label={`${app.name}建设内容`}>{app.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="ap-foundation ap-wrap" id="foundation">
          <div className="ap-foundation-title"><h2>各自构建业务，<br />共用工程基础。</h2><p>应用的页面、流程与规则独立维护，公共能力留在平台。</p></div>
          <dl className="ap-foundation-details">
            <div><dt>应用目录与注册</dt><dd>业务模块显式注册前端路由，目录配置决定展示哪些入口。新增场景可以继续扩展自己的页面和服务。</dd></div>
            <div><dt>身份、文件与 API</dt><dd>复用身份会话、统一请求客户端和文件能力，前后端按业务模块组织。</dd></div>
            <div><dt>构建与部署</dt><dd>pnpm Workspace 维护工程；CI 构建前端产物与后端 Docker 镜像。正式业务独立配置身份、数据和运行参数。</dd></div>
          </dl>
          <dl className="ap-stack"><div><dt>客户端</dt><dd>React · Vite · Ant Design Mobile</dd></div><div><dt>服务与数据</dt><dd>Express · Prisma · PostgreSQL · OSS</dd></div></dl>
        </section>

        <section className="ap-scope ap-wrap" id="scope">
          <h2>体验与接入说明</h2>
          <div><p>演示用于了解产品流程。报名、领券、兑换及政策申报不代表实际业务办理；公共演示数据可能由访客共享，请使用测试信息。</p><p>各模块运行依赖不同。随手拍使用真实 API，AI 与地图需单独配置，未配置时可手动填写内容和文字地址；政策匹配使用演示政策库。App 或小程序内嵌需由载体提供接入。</p><p>当前源码注册了 {profile.applications.length} 个业务模块，应用集中实际展示的入口由目录配置决定。</p></div>
          <div className="ap-resources">{profile.sources.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={15} /></a>)}</div>
        </section>
      </main>

      <footer className="ap-footer ap-wrap"><a className="ap-footer-brand" href="#top"><Image src={`${assetRoot}/brand-mark.png`} alt="" width={30} height={30} />app portfolio</a><a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer">甜宝塔家长<ArrowUpRight size={14} /></a></footer>
    </div>
  )
}
