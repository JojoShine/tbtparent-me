'use client'

import { useState, useRef, useEffect } from 'react'

export default function CustomSelect({ value, onChange, options, placeholder = '请选择...', onInputChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const selectedOption = options.find(o => o.value === inputValue)

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (onInputChange) {
      onInputChange(newValue)
    }
  }

  const handleOptionClick = (optValue) => {
    setInputValue(optValue)
    onChange(optValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onClick={() => setIsOpen(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '40px',
          padding: '0 32px 0 10px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: 'normal',
          backgroundColor: 'transparent',
          color: 'var(--fg)',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
      />
      
      {/* 下拉箭头 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--muted)',
          fontSize: '0.6rem',
          transition: 'transform 0.15s ease',
          transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
        }}
      >
        ▼
      </div>
      
      {isOpen && options.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 10,
          marginTop: '2px',
          border: '1px solid var(--border)',
          borderTop: 'none',
          backgroundColor: 'var(--bg)',
          borderRadius: '0 0 4px 4px',
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => handleOptionClick(opt.value)}
              style={{
                padding: '8px 10px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: inputValue === opt.value ? 'var(--border)' : 'transparent',
                color: inputValue === opt.value ? 'var(--fg)' : 'var(--muted)',
                transition: 'background-color 0.1s ease',
              }}
              onMouseEnter={e => {
                if (inputValue !== opt.value) {
                  e.currentTarget.style.backgroundColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--fg)'
                }
              }}
              onMouseLeave={e => {
                if (inputValue !== opt.value) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--muted)'
                }
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
