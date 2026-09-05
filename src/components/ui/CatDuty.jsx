'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Cake } from 'lucide-react'
import { Solar } from 'lunar-javascript'

import { getCatMotionClass } from '@/lib/cat-animation'

const cats = [
  {
    name: '雪宝',
    image: '/assets/cats/v2/xuebao.png',
    role: '代码猫',
    gender: '♂',
    birthday: '02/18',
    personality: '活泼 · 乖巧',
    quotes: [
      { zh: '今天也要写出没有 bug 的代码！', en: 'No bugs today, fight!' },
      { zh: 'console.log 是最好的调试工具，不接受反驳。', en: 'console.log is the best debugger, no debate.' },
      { zh: '这段代码能跑就行，别动它。', en: 'It runs, don\'t touch it.' },
      { zh: '又是和 TypeScript 搏斗的一天。', en: 'Another day wrestling with TypeScript.' },
      { zh: '代码写得好，下班下得早。', en: 'Clean code means leaving early.' },
      { zh: '今天的 PR，明天再 review。', en: 'Today\'s PR, tomorrow\'s review.' },
      { zh: '不是 bug，是 feature。', en: 'Not a bug, it\'s a feature.' },
      { zh: '先 commit，再想对不对。', en: 'Commit first, think later.' },
      { zh: '编译通过了！…等等，为什么？', en: 'It compiled! ...wait, why?' },
      { zh: 'Stack Overflow 是我的结对编程伙伴。', en: 'Stack Overflow is my pair programmer.' },
    ],
  },
  {
    name: '甜枣',
    image: '/assets/cats/v2/tianzao.png',
    role: '咖啡陪伴猫',
    gender: '♀',
    birthday: '08/18',
    personality: '胆小 · 温柔恬静',
    quotes: [
      { zh: '来杯咖啡，慢慢写。', en: 'Grab a coffee, take your time.' },
      { zh: '休息一下，咖啡要凉了。', en: 'Take a break, your coffee\'s getting cold.' },
      { zh: '今天的拿铁拉花是一只猫哦。', en: 'Today\'s latte art is a cat.' },
      { zh: '写代码累了，就看看窗外吧。', en: 'Tired of coding? Look outside.' },
      { zh: '你今天的状态：半糖去冰。', en: 'Your mood today: half sugar, no ice.' },
      { zh: '咖啡续命，代码续梦。', en: 'Coffee fuels life, code fuels dreams.' },
      { zh: '别急，好代码值得慢慢磨。', en: 'No rush, great code takes time.' },
      { zh: '摸鱼也是生产力的一部分。', en: 'Slacking off is part of productivity.' },
      { zh: '先喝完这杯，再改需求。', en: 'Finish this cup first, then change the specs.' },
      { zh: '今天的你，比昨天更会写代码了。', en: 'You code better today than yesterday.' },
    ],
  },
  {
    name: '三塔',
    image: '/assets/cats/v2/santa.png',
    role: '黑客猫',
    gender: '♂',
    birthday: '04/07',
    personality: '好动 · 粘人贴心',
    quotes: [
      { zh: '今天的漏洞，明天补也行。', en: 'Today\'s vulnerability, tomorrow\'s problem.' },
      { zh: '你的密码是 123456 对吧？', en: 'Your password is 123456, right?' },
      { zh: '我已经在你的路由器里了。', en: 'I\'m already in your router.' },
      { zh: 'sudo rm -rf / 是一种生活态度。', en: 'sudo rm -rf / is a lifestyle.' },
      { zh: '防火墙只是建议，不是限制。', en: 'Firewalls are suggestions, not limits.' },
      { zh: '别连公共 WiFi，听话。', en: 'Don\'t use public WiFi, behave.' },
      { zh: '今天的渗透测试报告：全是红的。', en: 'Today\'s pentest report: all red.' },
      { zh: '安全？什么安全？', en: 'Security? What security?' },
      { zh: '你的摄像头指示灯，可信吗？', en: 'Can you trust your camera light?' },
      { zh: '我看到的不是代码，是矩阵。', en: 'I don\'t see code, I see the Matrix.' },
    ],
  },
]

const dailyQuotes = [
  '你比昨天又强了一点。',
  '慢慢来，比较快。',
  '今天也是值得认真过的一天。',
  '不必完美，完成就好。',
  '每一步都算数。',
  '累了就休息，但别放弃。',
  '你已经在路上了，这本身就很好。',
  '允许自己慢慢变好。',
  '今天的努力，未来的你会感谢。',
  '做不到的事，只是还没做到。',
  '别和别人比，和昨天的自己比。',
  '小步前进，也好过原地踏步。',
  '你已经做得很好了。',
  '休息也是前进的一部分。',
  '不用着急，花会开的。',
  '每一次尝试都有意义。',
  '今天的你，已经很棒了。',
  '坚持不是不累，是累了还继续。',
  '慢慢走，沿途也有风景。',
  '你值得所有美好的事物。',
  '别怕慢，只怕停。',
  '每一个今天，都是余生最年轻的一天。',
  '做自己喜欢的事，永远不晚。',
  '生活不会辜负认真的人。',
  '你比自己想象的更强大。',
  '今天的辛苦，是明天的底气。',
  '允许偶尔的不好状态。',
  '你已经走了很远了，回头看看。',
  '不必光芒万丈，始终温暖有光就好。',
  '把每一天当作新的开始。',
]

function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function getDutyCat() {
  const now = new Date()
  const day = getDayOfYear()
  const catIndex = 1
  const cat = cats[catIndex]
  const quoteIndex = Math.floor(day / cats.length) % cat.quotes.length
  const motionClass = getCatMotionClass(cat.name)
  const dailyQuote = dailyQuotes[day % dailyQuotes.length]

  // 获取农历和节气
  const solar = Solar.fromDate(now)
  const lunar = solar.getLunar()
  const lunarStr = lunar.getMonthInChinese() + '月' + lunar.getDayInChinese()
  const jieQi = lunar.getJieQi() || ''
  const ganZhi = lunar.getYearInGanZhi() + '年'

  // 公历日期格式化
  const month = now.getMonth() + 1
  const date = now.getDate()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[now.getDay()]
  const solarStr = `${month}月${date}日 周${weekDay}`

  return { ...cat, quote: cat.quotes[quoteIndex], motionClass, dailyQuote, solarStr, lunarStr, jieQi, ganZhi }
}

export default function CatDuty() {
  const [cat, setCat] = useState(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCat(getDutyCat()))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!cat) return null

  return (
    <div className="cat-duty">
      <div className="cat-bubble">
        <div className="cat-bubble-bar">
          <span className="cat-bubble-dot cat-bubble-dot-r" />
          <span className="cat-bubble-dot cat-bubble-dot-y" />
          <span className="cat-bubble-dot cat-bubble-dot-g" />
          <span className="cat-bubble-bar-title">cat-duty.sh</span>
        </div>
        <div className="cat-bubble-body">
          <div className="cat-bubble-date">
            <span className="cat-bubble-date-solar">{cat.solarStr}</span>
            <span className="cat-bubble-date-lunar">{cat.ganZhi}{cat.lunarStr}{cat.jieQi ? ' · ' + cat.jieQi : ''}</span>
          </div>
          <p className="cat-bubble-label">今日值班小猫</p>
          <span className="cat-bubble-name">{cat.name}</span>
          <span className="cat-bubble-role">{cat.role}</span>
          <div className="cat-bubble-profile">
            <span className="cat-bubble-profile-item">{cat.gender}</span>
            <span className="cat-bubble-profile-sep">|</span>
            <span className="cat-bubble-profile-item"><span className="cat-bubble-profile-icon-text"><Cake size={11} /><span>{cat.birthday}</span></span></span>
            <span className="cat-bubble-profile-sep">|</span>
            <span className="cat-bubble-profile-item">{cat.personality}</span>
          </div>
          <p className="cat-bubble-daily-quote-label">今日寄语</p>
          <p className="cat-bubble-daily-quote">{cat.dailyQuote}</p>
          <p className="cat-bubble-quote">{cat.quote.zh}</p>
          <p className="cat-bubble-quote-en">{cat.quote.en}</p>
        </div>
      </div>
      <div className="cat-thought-dots">
        <span className="cat-thought-dot cat-thought-dot-sm" />
        <span className="cat-thought-dot cat-thought-dot-md" />
        <span className="cat-thought-dot cat-thought-dot-lg" />
      </div>
      <div className={`cat-animation ${cat.motionClass}`}>
        <Image src={cat.image} alt="" fill sizes="200px" className="cat-image" />
      </div>
      <style jsx global>{`
        .cat-duty {
          position: fixed;
          bottom: clamp(12px, 2vh, 24px);
          right: clamp(16px, 4vw, 60px);
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }
        .cat-animation {
          position: relative;
          width: clamp(150px, 15vw, 200px);
          height: clamp(150px, 15vw, 200px);
          pointer-events: auto;
          transform-origin: 50% 100%;
          will-change: transform;
        }
        .cat-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: transparent;
        }
        .cat-motion-work {
          animation: cat-work 1.8s ease-in-out infinite;
        }
        .cat-motion-gentle {
          animation: cat-gentle 3.2s ease-in-out infinite;
        }
        .cat-motion-watch {
          animation: cat-watch 2.8s ease-in-out infinite;
        }
        @keyframes cat-work {
          0%, 100% { transform: translate3d(0, 0, 0); }
          35% { transform: translate3d(0, 1px, 0); }
          70% { transform: translate3d(0, 0, 0); }
        }
        @keyframes cat-gentle {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(1px, 0, 0); }
        }
        @keyframes cat-watch {
          0%, 30%, 100% { transform: translate3d(0, 0, 0); }
          48%, 62% { transform: translate3d(1px, 0, 0); }
        }
        .cat-thought-dots {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          margin: -2px 0;
          position: relative;
          height: 22px;
          width: 34px;
        }
        .cat-thought-dot {
          position: absolute;
          border-radius: 50%;
          background: #f0f0f0;
          border: 1px solid #d0d0d0;
        }
        .dark .cat-thought-dot {
          background: #1a1a1a;
          border-color: #333;
        }
        .cat-thought-dot-lg {
          width: 13px;
          height: 13px;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .cat-thought-dot-md {
          width: 8px;
          height: 8px;
          bottom: 8px;
          left: 55%;
        }
        .cat-thought-dot-sm {
          width: 5px;
          height: 5px;
          top: 0;
          left: 58%;
        }
        .cat-bubble {
          position: relative;
          background: #f5f5f5;
          border: 1px solid #d0d0d0;
          border-radius: 12px;
          padding: 0;
          margin-bottom: 0;
          width: 280px;
          max-height: 55vh;
          overflow-y: auto;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          pointer-events: auto;
          font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
        }
        .dark .cat-bubble {
          background: #1a1a1a;
          border-color: #333;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .cat-bubble::-webkit-scrollbar {
          width: 3px;
        }
        .cat-bubble::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .dark .cat-bubble::-webkit-scrollbar-thumb {
          background: #444;
        }
        .cat-bubble-bar {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: #e8e8e8;
          border-bottom: 1px solid #d0d0d0;
        }
        .dark .cat-bubble-bar {
          background: #111;
          border-bottom-color: #333;
        }
        .cat-bubble-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .cat-bubble-dot-r { background: #ff5f57; }
        .cat-bubble-dot-y { background: #febc2e; }
        .cat-bubble-dot-g { background: #28c840; }
        .cat-bubble-bar-title {
          font-size: 0.6rem;
          color: #999;
          margin-left: 4px;
          letter-spacing: 0.5px;
        }
        .dark .cat-bubble-bar-title {
          color: #666;
        }
        .cat-bubble-body {
          padding: 8px 12px 10px;
        }
        .cat-bubble-date {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 6px;
          padding-bottom: 6px;
          border-bottom: 1px dashed var(--border);
        }
        .cat-bubble-date-solar {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--fg);
          font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
        }
        .cat-bubble-date-lunar {
          font-size: 0.62rem;
          color: var(--muted);
          font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
        }
        .cat-bubble-label {
          font-size: 0.6rem;
          color: #999;
          margin: 0 0 3px;
          letter-spacing: 0.5px;
        }
        .dark .cat-bubble-label {
          color: #666;
        }
        .cat-bubble-label::before {
          content: '> ';
          color: #16a34a;
        }
        .dark .cat-bubble-label::before {
          color: #4ade80;
        }
        .cat-bubble-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: #333;
          margin-right: 6px;
        }
        .dark .cat-bubble-name {
          color: #e0e0e0;
        }
        .cat-bubble-role {
          font-size: 0.65rem;
          color: #666;
          background: rgba(0,0,0,0.06);
          padding: 1px 6px;
          border-radius: 3px;
        }
        .dark .cat-bubble-role {
          color: #999;
          background: rgba(255,255,255,0.06);
        }
        .cat-bubble-quote {
          font-size: 0.72rem;
          color: #16a34a;
          line-height: 1.5;
          margin: 6px 0 0;
          word-break: break-all;
        }
        .dark .cat-bubble-quote {
          color: #4ade80;
        }
        .cat-bubble-quote::before {
          content: '$ ';
          color: #999;
        }
        .dark .cat-bubble-quote::before {
          color: #555;
        }
        .cat-bubble-quote-en {
          font-size: 0.62rem;
          color: #aaa;
          line-height: 1.4;
          margin: 1px 0 0;
          font-style: italic;
          padding-left: 1.2em;
        }
        .dark .cat-bubble-quote-en {
          color: #555;
        }
        .cat-bubble-daily-quote-label {
          font-size: 0.58rem;
          color: #999;
          margin: 6px 0 3px;
          letter-spacing: 0.5px;
        }
        .dark .cat-bubble-daily-quote-label {
          color: #666;
        }
        .cat-bubble-daily-quote-label::before {
          content: '♥ ';
          color: #e8a838;
        }
        .dark .cat-bubble-daily-quote-label::before {
          color: #f0b840;
        }
        .cat-bubble-daily-quote {
          font-size: 0.72rem;
          color: #555;
          line-height: 1.5;
          margin: 0 0 6px;
          padding: 6px 10px;
          background: rgba(232,168,56,0.08);
          border-radius: 6px;
          font-style: italic;
        }
        .dark .cat-bubble-daily-quote {
          color: #ccc;
          background: rgba(240,184,64,0.1);
        }
        .cat-bubble-profile {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 4px;
          font-size: 0.62rem;
          color: #888;
        }
        .dark .cat-bubble-profile {
          color: #777;
        }
        .cat-bubble-profile-sep {
          color: #ccc;
          font-size: 0.55rem;
        }
        .dark .cat-bubble-profile-sep {
          color: #444;
        }
        .cat-bubble-profile-icon-text {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        @media (max-width: 767px) {
          .cat-duty { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cat-animation { animation: none; }
        }
      `}</style>
    </div>
  )
}
