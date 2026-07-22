'use client'

import { useEffect, useState } from 'react'
import mermaid from 'mermaid'

let currentTheme = null

function getMermaidConfig(theme) {
  const isDark = theme === 'dark'
  return {
    theme: isDark ? 'dark' : 'default',
    themeVariables: isDark
      ? {
          primaryColor: '#4a9eff',
          primaryTextColor: '#e5e5e5',
          primaryBorderColor: '#555',
          lineColor: '#888',
          secondaryColor: '#2a4a6b',
          tertiaryColor: '#1a2a3b',
        }
      : {},
  }
}

let counter = 0

export default function MermaidBlock({ chart, theme }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    if (!chart) return
    if (currentTheme !== theme) {
      currentTheme = theme
      mermaid.initialize(getMermaidConfig(theme))
    }
    const id = `mermaid-render-${Date.now()}-${counter++}`
    mermaid.render(id, chart)
      .then(({ svg }) => setSvg(svg))
      .catch(err => {
        console.error('Mermaid render error:', err)
        setSvg('')
      })
  }, [chart, theme])

  if (!chart) return null

  return (
    <div
      className="mermaid-block"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
