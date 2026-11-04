'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { getProjectSelectionForKey } from '@/lib/project-showcase'
import styles from './ProjectYearFilter.module.css'

export default function ProjectYearFilter({ value, years, onChange, lang }) {
  const [open, setOpen] = useState(false)
  const [activeValue, setActiveValue] = useState(value)
  const rootRef = useRef(null)
  const listId = useId()
  const options = [{ value: '', label: lang === 'zh' ? '全部年份' : 'All years' }, ...years.map(year => ({ value: String(year), label: String(year) }))]
  const activeIndex = options.findIndex(option => option.value === activeValue)

  useEffect(() => {
    if (!open) return
    const closeOutside = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  const select = nextValue => {
    onChange(nextValue)
    setOpen(false)
  }

  const handleKeyDown = event => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false)
      if (event.key === 'Escape') event.preventDefault()
      return
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      setActiveValue(getProjectSelectionForKey(options.map(option => option.value), open ? activeValue : value, event.key))
      setOpen(true)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) select(activeValue)
      else { setActiveValue(value); setOpen(true) }
    }
  }

  return (
    <div ref={rootRef} className={styles.root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button type="button" role="combobox" aria-label={lang === 'zh' ? '作品年份' : 'Project year'} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        className={styles.trigger} onKeyDown={handleKeyDown} onClick={() => { setActiveValue(value); setOpen(!open) }}>
        <span>{options.find(option => option.value === value)?.label}</span><ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && <div id={listId} role="listbox" aria-label={lang === 'zh' ? '作品年份' : 'Project year'} className={styles.menu}>
        {options.map((option, index) => <div key={option.value} id={`${listId}-${index}`} role="option" aria-selected={value === option.value}
          className={`${styles.option} ${activeValue === option.value ? styles.active : ''}`}
          onPointerMove={() => setActiveValue(option.value)} onMouseDown={event => event.preventDefault()} onClick={() => select(option.value)}>
          <span>{option.label}</span>{value === option.value && <Check size={14} aria-hidden="true" />}
        </div>)}
      </div>}
    </div>
  )
}
