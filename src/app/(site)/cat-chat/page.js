'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Send, RotateCcw, Loader2, PawPrint } from 'lucide-react'
import { catPersonas } from '@/data/cat-personas'

const DAILY_LIMIT = 50
const DAILY_KEY = 'cat-chat-daily'

function getDailyUsage() {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    if (date === new Date().toISOString().split('T')[0]) return count
    return 0
  } catch { return 0 }
}

function incrementDaily() {
  const today = new Date().toISOString().split('T')[0]
  const count = getDailyUsage()
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, count: count + 1 }))
}

export default function CatChatPage() {
  const [selectedCat, setSelectedCat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (selectedCat) inputRef.current?.focus()
  }, [selectedCat])

  const selectCat = (cat) => {
    setSelectedCat(cat)
    setMessages([{ role: 'assistant', content: cat.greeting }])
  }

  const backToSelect = () => {
    setSelectedCat(null)
    setMessages([])
    setInput('')
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const chatHistory = newMessages.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/cat-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catId: selectedCat.id, messages: chatHistory }),
      })

      if (res.status === 429) {
        setMessages([...newMessages, { role: 'assistant', content: '今天的聊天次数用完啦，明天再来找我玩吧～' }])
        setLoading(false)
        return
      }

      if (!res.ok) {
        setMessages([...newMessages, { role: 'assistant', content: '喵...信号不太好，等一下再试试？' }])
        setLoading(false)
        return
      }

      const rem = res.headers.get('X-Remaining')
      if (rem !== null) {
        incrementDaily()
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      setMessages([...newMessages, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const content = JSON.parse(data)
              acc += content
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: acc }
                return updated
              })
            } catch {
              // skip
            }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: '网络好像断了，检查一下再试试？' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="cat-chat-page">
      <Link href="/" className="cat-chat-back">
        <ArrowLeft size={16} />
        <span>返回首页</span>
      </Link>
      <h1 className="cat-chat-title">
        <span className="cat-chat-title-icon"><PawPrint size={20} /></span>
        猫猫聊天室
        <span className="cat-chat-title-sub">Cat Chat Room</span>
      </h1>

      <AnimatePresence mode="wait">
        {!selectedCat ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="cat-select"
          >
            <p className="cat-select-hint">选择一只小猫开始聊天</p>
            <div className="cat-select-grid">
              {catPersonas.map(cat => (
                <motion.button
                  key={cat.id}
                  className="cat-select-card"
                  onClick={() => selectCat(cat)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <img src={cat.image} alt={cat.name} className="cat-select-img" />
                  <div className="cat-select-info">
                    <span className="cat-select-name">{cat.name}</span>
                    <span className="cat-select-role">{cat.role}</span>
                    <p className="cat-select-desc">{cat.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="cat-chat-area"
          >
            <div className="cat-chat-topbar">
              <button onClick={backToSelect} className="cat-chat-switch">
                <RotateCcw size={14} />
                换一只猫
              </button>
              <div className="cat-chat-topbar-info">
                <img src={selectedCat.image} alt={selectedCat.name} className="cat-chat-topbar-avatar" />
                <span className="cat-chat-topbar-name">{selectedCat.name}</span>
                <span className="cat-chat-topbar-role">{selectedCat.role}</span>
              </div>
            </div>

            <div className="cat-chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`cat-chat-msg ${msg.role === 'user' ? 'cat-chat-msg-user' : 'cat-chat-msg-cat'}`}>
                  {msg.role === 'assistant' && (
                    <img src={selectedCat.image} alt="" className="cat-chat-msg-avatar" />
                  )}
                  <div className="cat-chat-msg-bubble">
                    {msg.content || (loading && i === messages.length - 1 ? (
                      <Loader2 size={14} className="cat-chat-spinner" />
                    ) : msg.content)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="cat-chat-input-area">
              <textarea
                ref={inputRef}
                className="cat-chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="说点什么..."
                disabled={loading}
                rows={1}
              />
              <button
                className="cat-chat-send"
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                {loading ? <Loader2 size={18} className="cat-chat-spinner" /> : <Send size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .cat-chat-page {
          max-width: 720px;
          margin: 0 auto;
          padding-bottom: 2rem;
        }
        .cat-chat-back {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--muted);
          text-decoration: none;
          font-size: 0.8rem;
          transition: color 0.2s;
          margin-bottom: 0.75rem;
        }
        .cat-chat-back:hover { color: var(--fg); }
        .cat-chat-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1.5rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cat-chat-title-icon { font-size: 1.2rem; }
        .cat-chat-title-sub {
          font-size: 0.7rem;
          color: var(--muted);
          font-weight: 400;
          margin-left: 4px;
        }

        .cat-select-hint {
          text-align: center;
          color: var(--muted);
          font-size: 0.85rem;
          margin: 1rem 0 1.5rem;
        }
        .cat-select-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .cat-select-card {
          background: var(--card-bg, rgba(0,0,0,0.02));
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem 1rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dark .cat-select-card {
          background: rgba(255,255,255,0.03);
        }
        .cat-select-card:hover {
          border-color: var(--fg);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .dark .cat-select-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .cat-select-img {
          width: 120px;
          height: 120px;
          object-fit: contain;
        }
        .cat-select-info {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cat-select-name {
          font-weight: 700;
          font-size: 1rem;
        }
        .cat-select-role {
          font-size: 0.75rem;
          color: var(--muted);
          font-family: monospace;
        }
        .cat-select-desc {
          font-size: 0.78rem;
          color: var(--muted);
          margin: 4px 0 0;
          line-height: 1.4;
        }

        .cat-chat-area {
          background: #f5f5f5;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 75vh;
          margin: 0 auto;
          font-family: 'Menlo', 'Consolas', 'Monaco', monospace;
        }
        .dark .cat-chat-area {
          background: #1a1a1a;
          border-color: #333;
        }
        .cat-chat-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: #eaeaea;
          border-bottom: 1px solid var(--border);
        }
        .dark .cat-chat-topbar {
          background: #111;
          border-bottom-color: #333;
        }
        .cat-chat-switch {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 0.7rem;
          font-family: inherit;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cat-chat-switch:hover {
          color: var(--fg);
          border-color: var(--muted);
        }
        .cat-chat-topbar-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cat-chat-topbar-avatar {
          width: 24px;
          height: 24px;
          object-fit: contain;
          border-radius: 50%;
        }
        .cat-chat-topbar-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--fg);
        }
        .cat-chat-topbar-role {
          font-size: 0.65rem;
          color: var(--muted);
          background: rgba(0,0,0,0.06);
          padding: 1px 6px;
          border-radius: 3px;
        }
        .dark .cat-chat-topbar-role {
          background: rgba(255,255,255,0.06);
        }

        .cat-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scrollbar-width: none;
        }
        .cat-chat-messages::-webkit-scrollbar { display: none; }
        .cat-chat-msg {
          display: flex;
          gap: 8px;
          max-width: 85%;
          animation: msgIn 0.3s ease;
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cat-chat-msg-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .cat-chat-msg-avatar {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .cat-chat-msg-bubble {
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          line-height: 1.6;
          word-break: break-word;
          white-space: pre-wrap;
        }
        .cat-chat-msg-cat .cat-chat-msg-bubble {
          background: #e5e5e5;
          color: #333;
          border-bottom-left-radius: 2px;
        }
        .dark .cat-chat-msg-cat .cat-chat-msg-bubble {
          background: #2a2a2a;
          color: #d4d4d4;
        }
        .cat-chat-msg-user .cat-chat-msg-bubble {
          background: #3b82f6;
          color: #fff;
          border-bottom-right-radius: 2px;
        }

        .cat-chat-input-area {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 12px 14px;
          border-top: 1px solid var(--border);
          background: #eaeaea;
        }
        .dark .cat-chat-input-area {
          background: #111;
          border-top-color: #333;
        }
        .cat-chat-input {
          flex: 1;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          color: #333;
          font-family: inherit;
          font-size: 0.8rem;
          resize: none;
          outline: none;
          line-height: 1.5;
          max-height: 120px;
          transition: border-color 0.2s;
        }
        .dark .cat-chat-input {
          background: #1a1a1a;
          border-color: #333;
          color: #d4d4d4;
        }
        .cat-chat-input:focus { border-color: var(--muted); }
        .dark .cat-chat-input:focus { border-color: #555; }
        .cat-chat-input::placeholder { color: #aaa; }
        .dark .cat-chat-input::placeholder { color: #555; }
        .cat-chat-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .cat-chat-send {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #3b82f6;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .cat-chat-send:hover:not(:disabled) { background: #2563eb; }
        .cat-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .cat-chat-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .cat-select-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .cat-select-card {
            flex-direction: row;
            padding: 1rem;
          }
          .cat-select-img {
            width: 80px;
            height: 80px;
          }
          .cat-select-info { text-align: left; }
          .cat-chat-area {
            width: 92vw;
            height: 65vh;
          }
        }
      `}</style>
    </div>
  )
}
