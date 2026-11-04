import Image from 'next/image'
import { ArrowUpRight, ArrowRight, GitBranch, NotebookPen, Sparkles, FolderCheck, ChevronDown } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import './flowcraft-landing.css'

const icons = [GitBranch, NotebookPen, Sparkles, FolderCheck]
const stageLabels = ['拆分与推进', '记录与构思', '辅助与复用', '整理与交付']

export default function FlowCraftLanding({ project, profile }) {
  return (
    <div className="fc-page" lang="zh-CN">
      <header className="fc-header fc-wrap"><a className="fc-brand" href="#overview"><Image src={profile.logo} alt="" width={32} height={32} /><span>FlowCraft</span></a><nav aria-label="FlowCraft 导航"><a href="#construction">工作流</a><a href="#collaboration">能力关系</a><a href="#technology">技术与部署</a><a className="fc-nav-open" href={project.pc_url} target="_blank" rel="noopener noreferrer">打开工作台<ArrowUpRight size={14} /></a><ThemeToggle /></nav></header>
      <main>
        <section className="fc-hero fc-wrap" id="overview"><p className="fc-product-type">项目交付工作台</p><h1>项目，持续向前。<br /><span>上下文，始终相连。</span></h1><p className="fc-intro">{profile.summary}</p><div className="fc-actions"><a className="fc-button" href={project.pc_url} target="_blank" rel="noopener noreferrer">进入工作台<ArrowUpRight size={17} /></a><a className="fc-link" href="#construction">了解工作流<ArrowRight size={17} /></a></div>
          <div className="fc-path" aria-label="FlowCraft 的项目工作流">{profile.construction.map((group, index) => <a href={`#fc-group-${index}`} key={group.title}><small>{stageLabels[index]}</small><strong>{group.title}</strong>{index < 3 && <ArrowRight size={18} aria-hidden="true" />}</a>)}</div>
        </section>

        <section className="fc-workflow fc-wrap" id="construction"><aside className="fc-outline"><h2>项目里的每一步，<br />都能接着往下走。</h2><p>让执行、资料、AI 与成果保持联系。</p><nav aria-label="工作流章节">{profile.construction.map((group, index) => <a key={group.title} href={`#fc-group-${index}`}>{group.title}<ArrowRight size={14} /></a>)}</nav></aside><div className="fc-workflow-body">{profile.construction.map((group, index) => { const Icon = icons[index]; return <article className="fc-workflow-group" id={`fc-group-${index}`} key={group.title}><div className="fc-group-heading"><span><Icon size={25} strokeWidth={1.6} /></span><div><h3>{group.title}</h3><p>{group.description}</p></div></div><div className="fc-feature-list">{group.items.map(item => <div key={item.title}><h4>{item.title}</h4><p>{item.description}</p></div>)}</div></article> })}</div></section>

        <section className="fc-context" id="collaboration"><div className="fc-wrap"><div className="fc-context-heading"><span>CONNECTED CONTEXT</span><h2>信息留下来，<br />关系也留下来。</h2><p>项目是主要的数据边界。任务、文档、画布与交付产物保留各自的职责，并在同一个项目中关联。</p></div><dl>{profile.relations.map(item => <div key={item.from}><dt><span>{item.from}</span><ArrowRight size={16} /><span>{item.to}</span></dt><dd>{item.description}</dd></div>)}</dl></div></section>

        <section className="fc-engineering fc-wrap" id="technology"><div><h2>理解它，也能部署它。</h2><p>前后端独立组织，数据、文件与模型服务各有清晰职责。</p></div><div className="fc-stack">{profile.technology.map(item => <article key={item.title}><h3>{item.title}</h3><span>{item.stack}</span><p>{item.description}</p></article>)}</div><div className="fc-foundations">{profile.foundations.map(item => <span key={item}>{item}</span>)}</div></section>

        <section className="fc-bottom fc-wrap"><div className="fc-boundaries" id="status"><h2>当前建设范围</h2>{profile.notes.map(note => <details key={note.title} open={note.title === '当前状态'}><summary>{note.title}<ChevronDown size={17} /></summary><p>{note.description}</p></details>)}</div><div className="fc-resources" id="resources"><h2>接着了解 FlowCraft</h2><p>从源码、使用文档到自己的项目工作台。</p>{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">项目仓库<ArrowUpRight size={18} /></a>}{profile.sources.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={18} /></a>)}<a className="fc-button" href={project.pc_url} target="_blank" rel="noopener noreferrer">打开工作台<ArrowUpRight size={17} /></a></div></section>
      </main>
      <footer className="fc-footer fc-wrap"><span>FlowCraft · 项目交付工作台</span><a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer">由甜宝塔家长持续构建<ArrowUpRight size={14} /></a></footer>
    </div>
  )
}
