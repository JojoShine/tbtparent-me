'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Check, RotateCcw, Star } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import './qingwen-landing.css'

const examples = [{ id: 'choice', label: '单选' }, { id: 'rating', label: '评分' }, { id: 'conditional', label: '条件显示' }]
const ratingLabels = ['很不满意', '不太满意', '一般', '比较满意', '非常满意']

function QuestionDemo({ example, setExample }) {
  const [choice, setChoice] = useState('')
  const [rating, setRating] = useState(0)
  const [attended, setAttended] = useState('')
  const tabs = useRef([])

  function handleTabKey(event, index) {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % examples.length
    else if (event.key === 'ArrowLeft') next = (index + examples.length - 1) % examples.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = examples.length - 1
    else return
    event.preventDefault()
    setExample(examples[next].id)
    tabs.current[next]?.focus()
  }

  function reset() {
    setChoice('')
    setRating(0)
    setAttended('')
  }

  return (
    <div className="qw-demo" id="try">
      <div className="qw-demo-header"><span>试一试题目交互</span><button type="button" onClick={reset} aria-label="重置示例回答"><RotateCcw size={16} /></button></div>
      <div className="qw-example-tabs" role="tablist" aria-label="问卷题型交互示例">{examples.map((item, index) => <button type="button" role="tab" id={`qw-tab-${item.id}`} aria-selected={example === item.id} aria-controls="qw-demo-panel" tabIndex={example === item.id ? 0 : -1} ref={node => { tabs.current[index] = node }} onKeyDown={event => handleTabKey(event, index)} onClick={() => setExample(item.id)} key={item.id}>{item.label}</button>)}</div>
      <div className="qw-demo-panel" id="qw-demo-panel" role="tabpanel" aria-labelledby={`qw-tab-${example}`}>
        {example === 'choice' && <fieldset><legend>你通常用问卷收集什么？</legend><p className="qw-question-hint">选一个更接近你的场景。</p><div className="qw-options">{['产品反馈', '活动评价', '内部调研'].map(item => <label key={item} className={choice === item ? 'is-selected' : ''}><input type="radio" name="qw-demo-choice" value={item} checked={choice === item} onChange={() => setChoice(item)} /><span>{item}</span>{choice === item && <Check size={16} aria-hidden="true" />}</label>)}</div><p className="qw-demo-response" role="status">{choice ? `已选择：${choice}` : '选择一项，体验单选交互。'}</p></fieldset>}
        {example === 'rating' && <fieldset><legend>你对这次活动的体验满意吗？</legend><p className="qw-question-hint">用评分表达你的感受。</p><div className="qw-rating">{ratingLabels.map((label, index) => <button type="button" aria-label={`评分 ${index + 1}：${label}`} aria-pressed={rating === index + 1} onClick={() => setRating(index + 1)} key={label}><Star size={24} fill={rating >= index + 1 ? 'currentColor' : 'none'} /><span>{index + 1}</span></button>)}</div><p className="qw-demo-response" role="status">{rating ? ratingLabels[rating - 1] : '点击星标试一试。'}</p></fieldset>}
        {example === 'conditional' && <fieldset><legend>你参加过线下活动吗？</legend><p className="qw-question-hint">后续题目可以随回答显示。</p><div className="qw-options">{['参加过', '还没有'].map(item => <label key={item} className={attended === item ? 'is-selected' : ''}><input type="radio" name="qw-demo-attended" value={item} checked={attended === item} onChange={() => setAttended(item)} /><span>{item}</span>{attended === item && <Check size={16} aria-hidden="true" />}</label>)}</div>{attended === '参加过' && <label className="qw-follow-up"><span>哪一部分最值得保留？</span><textarea placeholder="写一条示例建议" rows={2} maxLength={200} /></label>}<p className="qw-demo-response" role="status">{attended === '参加过' ? '因为选择了“参加过”，显示这道后续题。' : attended ? '这道后续题已隐藏。' : '选择“参加过”，看看后续题目。'}</p></fieldset>}
      </div>
      <p className="qw-demo-note">本页示例不会提交或保存回答。</p>
    </div>
  )
}

export default function QingwenLanding({ project, profile }) {
  const [example, setExample] = useState('choice')
  return (
    <div className="qw-page" lang="zh-CN">
      <a className="qw-skip" href="#capabilities">跳到产品功能</a>
      <header className="qw-header qw-wrap">
        <a className="qw-brand" href="#overview"><Image src={profile.logo} alt="" width={36} height={36} /><strong>轻问<span>.</span></strong><span className="qw-brand-en">QINGWEN</span></a>
        <nav aria-label="轻问官网导航"><a href="#capabilities">功能</a><a href="#deployment">自部署</a><a href={project.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={14} /></a><ThemeToggle /></nav>
      </header>

      <main>
        <section className="qw-hero" id="overview"><div className="qw-wrap qw-hero-layout">
          <div className="qw-hero-copy"><p className="qw-product-type">轻量开源问卷工具</p><h1>从一个好问题<br /><span>开始。</span></h1><p className="qw-intro">{profile.summary}</p><div className="qw-actions"><a className="qw-button" href={project.pc_url} target="_blank" rel="noopener noreferrer">进入轻问<ArrowUpRight size={18} /></a><a className="qw-text-link" href="#workflow">了解使用流程<ArrowRight size={17} /></a></div></div>
          <QuestionDemo example={example} setExample={setExample} />
        </div></section>

        <section className="qw-workflow qw-wrap" id="workflow"><div className="qw-section-heading"><h2>一份问卷，从创建到结果。</h2><p>把题目、收集规则和答卷整理放在同一套流程里。</p></div><ol>{profile.workflow.map((step, index) => <li key={step.title}><span className="qw-step-number">{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol></section>

        <section className="qw-capabilities" id="capabilities"><div className="qw-wrap qw-capability-layout">
          <div className="qw-question-types"><h2>问什么，<br />就选合适的题型。</h2><p className="qw-section-intro">基础填写、评价比较和附件采集，都能按实际问题组合。</p><dl>{profile.questionGroups.map(group => <div key={group.title}><dt>{group.title}</dt><dd><strong>{group.types}</strong><p>{group.description}</p></dd></div>)}</dl></div>
          <aside className="qw-rules"><h3>不止添加题目。</h3>{profile.rules.map(rule => <div key={rule.title}><h4>{rule.title}</h4><p>{rule.description}</p></div>)}<a className="qw-text-link" href="#try" onClick={() => setExample('conditional')}>试试条件显示<ArrowRight size={17} /></a></aside>
        </div></section>

        <section className="qw-results qw-wrap" id="results"><div className="qw-section-heading"><h2>收回来的答案，方便继续整理。</h2><p>从各题统计回到原始答卷，再把需要的数据导出去。</p></div><div className="qw-result-columns">{profile.results.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>

        <section className="qw-deployment" id="deployment"><div className="qw-wrap qw-deployment-layout"><div><p className="qw-license">MIT 开源许可</p><h2>也可以，<br />部署在自己的环境里。</h2><p>应用、问卷和答卷由自己维护。当前 Docker 镜像内置 PostgreSQL，无需另配 Redis、对象存储或独立后端。</p><a className="qw-text-link" href={profile.sources[1].href} target="_blank" rel="noopener noreferrer">查看部署文档<ArrowUpRight size={17} /></a></div><div className="qw-deployment-steps"><ol><li><strong>准备运行环境</strong><span>Linux x86_64、Docker 与 Docker Compose v2。</span></li><li><strong>配置初始账号</strong><span>按文档生成并保存管理员账号与部署配置。</span></li><li><strong>启动与维护</strong><span>镜像自动初始化数据库；数据和附件保存在持久化卷中。</span></li></ol><p>手机扫码或对外收集时，需配置可访问的 HTTPS 域名。更新与迁移请按文档备份数据库和附件。</p></div></div></section>

        <section className="qw-scope qw-wrap"><h2>使用前，了解当前范围。</h2><dl>{profile.notes.map(note => <div key={note.title}><dt>{note.title}</dt><dd>{note.description}</dd></div>)}</dl></section>

        <section className="qw-resources qw-wrap"><h2>开始创建自己的问卷。</h2><div><a className="qw-button" href={project.pc_url} target="_blank" rel="noopener noreferrer">进入轻问<ArrowUpRight size={18} /></a><a href={profile.sources[0].href} target="_blank" rel="noopener noreferrer">使用说明<ArrowUpRight size={15} /></a><a href={profile.sources[2].href} target="_blank" rel="noopener noreferrer">MIT 许可证<ArrowUpRight size={15} /></a></div><p>创建与管理问卷需要账号，账号由管理员维护。</p></section>
      </main>

      <footer className="qw-footer qw-wrap"><span>轻问 · QINGWEN</span><div><a href={project.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={14} /></a><a href="https://tbtparent.me" target="_blank" rel="noopener noreferrer">甜宝塔家长<ArrowUpRight size={14} /></a></div></footer>
    </div>
  )
}
