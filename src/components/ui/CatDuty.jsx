'use client'

import { useState, useEffect } from 'react'

const cats = [
  {
    name: '雪宝',
    image: '/assets/cats/雪宝-removebg-preview.png',
    role: '代码猫',
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
    image: '/assets/cats/甜枣-removebg-preview.png',
    role: '咖啡陪伴猫',
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
    image: '/assets/cats/三塔-removebg-preview.png',
    role: '黑客猫',
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

function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function getDutyCat() {
  const day = getDayOfYear()
  const catIndex = day % cats.length
  const quoteIndex = Math.floor(day / cats.length) % cats[catIndex].quotes.length
  return { ...cats[catIndex], quote: cats[catIndex].quotes[quoteIndex] }
}

export default function CatDuty() {
  const [cat, setCat] = useState(null)

  useEffect(() => {
    setCat(getDutyCat())
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
          <p className="cat-bubble-label">今日值班小猫</p>
          <span className="cat-bubble-name">{cat.name}</span>
          <span className="cat-bubble-role">{cat.role}</span>
          <p className="cat-bubble-quote">{cat.quote.zh}</p>
          <p className="cat-bubble-quote-en">{cat.quote.en}</p>
        </div>
      </div>
      <div className="cat-thought-dots">
        <span className="cat-thought-dot cat-thought-dot-sm" />
        <span className="cat-thought-dot cat-thought-dot-md" />
        <span className="cat-thought-dot cat-thought-dot-lg" />
      </div>
      <img
        src={cat.image}
        alt={cat.name}
        className="cat-image"
        draggable={false}
      />
      <style jsx global>{`
        .cat-duty {
          position: fixed;
          bottom: 24px;
          right: 60px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        }
        .cat-image {
          width: 200px;
          height: 200px;
          object-fit: contain;
          pointer-events: auto;
          filter: drop-shadow(0 4px 16px rgba(0,0,0,0.25));
        }
        .cat-thought-dots {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          margin: -2px 0;
          position: relative;
          height: 28px;
          width: 40px;
        }
        .cat-thought-dot {
          position: absolute;
          border-radius: 50%;
          background: #1e1e2e;
          border: 1px solid #383850;
        }
        .cat-thought-dot-lg {
          width: 14px;
          height: 14px;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .cat-thought-dot-md {
          width: 9px;
          height: 9px;
          bottom: 10px;
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
          background: #1e1e2e;
          border: 1px solid #383850;
          border-radius: 12px;
          padding: 0;
          margin-bottom: 0;
          width: 280px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
          pointer-events: auto;
          overflow: hidden;
          font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
        }
        .cat-bubble-bar {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          background: #181825;
          border-bottom: 1px solid #383850;
        }
        .cat-bubble-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .cat-bubble-dot-r { background: #f38ba8; }
        .cat-bubble-dot-y { background: #f9e2af; }
        .cat-bubble-dot-g { background: #a6e3a1; }
        .cat-bubble-bar-title {
          font-size: 0.6rem;
          color: #6c7086;
          margin-left: 4px;
          letter-spacing: 0.5px;
        }
        .cat-bubble-body {
          padding: 10px 12px 12px;
        }
        .cat-bubble-label {
          font-size: 0.6rem;
          color: #6c7086;
          margin: 0 0 4px;
          letter-spacing: 0.5px;
        }
        .cat-bubble-label::before {
          content: '> ';
          color: #a6e3a1;
        }
        .cat-bubble-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: #89b4fa;
          margin-right: 6px;
        }
        .cat-bubble-role {
          font-size: 0.65rem;
          color: #cba6f7;
          background: rgba(203,166,247,0.1);
          padding: 1px 6px;
          border-radius: 3px;
        }
        .cat-bubble-quote {
          font-size: 0.72rem;
          color: #a6e3a1;
          line-height: 1.6;
          margin: 8px 0 0;
          word-break: break-all;
        }
        .cat-bubble-quote::before {
          content: '$ ';
          color: #6c7086;
        }
        .cat-bubble-quote-en {
          font-size: 0.62rem;
          color: #585b70;
          line-height: 1.5;
          margin: 2px 0 0;
          font-style: italic;
          padding-left: 1.2em;
        }
        @media (max-width: 767px) {
          .cat-duty { display: none; }
        }
      `}</style>
    </div>
  )
}
