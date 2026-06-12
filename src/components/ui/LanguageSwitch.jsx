'use client'

import { useLang } from '@/hooks/useLang'
import { languages } from '@/data/translations'

export default function LanguageSwitch() {
  const { lang, setLang, mounted } = useLang()

  if (!mounted) {
    return (
      <div className="flex gap-1 font-mono text-sm">
        <span className="px-1.5 py-0.5 opacity-0">中</span>
        <span className="px-1.5 py-0.5 opacity-0">EN</span>
      </div>
    )
  }

  return (
    <div className="flex gap-1 font-mono text-sm">
      {languages.map((l, index) => (
        <span key={l.code} className="flex items-center">
          <button
            onClick={() => setLang(l.code)}
            className="px-1.5 py-0.5 transition-colors cursor-pointer"
            style={{
              color: lang === l.code ? 'var(--fg)' : 'var(--muted)',
              fontWeight: lang === l.code ? 700 : 400,
            }}
          >
            {l.label}
          </button>
          {index < languages.length - 1 && (
            <span style={{ color: 'var(--border)' }}>/</span>
          )}
        </span>
      ))}
    </div>
  )
}
