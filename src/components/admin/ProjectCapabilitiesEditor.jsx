'use client'

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  inputStyle,
  labelStyle,
  secondaryButtonStyle,
  textareaStyle,
  translateButtonStyle,
} from '@/lib/admin-utils'
import { CAPABILITY_ICONS, MAX_PROJECT_CAPABILITIES } from '@/lib/project-capabilities'
import {
  addCapability,
  moveCapability,
  removeCapability,
  updateCapability,
} from '@/lib/project-capability-editor'

const iconLabels = {
  circle: '圆点',
  workflow: '流程',
  shield: '安全',
  database: '数据',
  layers: '分层',
  monitor: '桌面端',
  mobile: '移动端',
  box: '模块',
}

export default function ProjectCapabilitiesEditor({ value = [], onChange, translating, onTranslate }) {
  const update = (index, field, nextValue) => {
    onChange(updateCapability(value, index, field, nextValue))
  }

  return (
    <section className="capability-editor" aria-labelledby="capability-editor-title">
      <div className="capability-editor-heading">
        <div>
          <h3 id="capability-editor-title">核心能力</h3>
          <p>独立维护中英文标题与说明，前台按此顺序展示（最多 {MAX_PROJECT_CAPABILITIES} 项）</p>
        </div>
        <button
          type="button"
          style={secondaryButtonStyle}
          disabled={value.length >= MAX_PROJECT_CAPABILITIES}
          onClick={() => onChange(addCapability(value))}
        >
          <Plus size={15} /> 添加能力
        </button>
      </div>

      {value.length === 0 ? (
        <p className="capability-editor-empty">尚未维护核心能力，公开页面会隐藏该区块。</p>
      ) : (
        <div className="capability-editor-list">
          {value.map((capability, index) => {
            const zhKey = `capabilities.${index}.title_zh->title_en`
            const enKey = `capabilities.${index}.title_en->title_zh`
            const zhDescriptionKey = `capabilities.${index}.description_zh->description_en`
            const enDescriptionKey = `capabilities.${index}.description_en->description_zh`

            return (
              <article key={capability.id || `capability-${index}`} className="capability-editor-item">
                <div className="capability-editor-item-heading">
                  <strong>能力 {String(index + 1).padStart(2, '0')}</strong>
                  <div className="capability-editor-actions">
                    <button type="button" aria-label="上移" disabled={index === 0} onClick={() => onChange(moveCapability(value, index, -1))}>
                      <ArrowUp size={15} />
                    </button>
                    <button type="button" aria-label="下移" disabled={index === value.length - 1} onClick={() => onChange(moveCapability(value, index, 1))}>
                      <ArrowDown size={15} />
                    </button>
                    <button type="button" aria-label="删除能力" onClick={() => onChange(removeCapability(value, index))}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="capability-editor-grid">
                  <div>
                    <label style={labelStyle}>
                      标题（中文）
                      <button type="button" style={translateButtonStyle} disabled={translating[zhKey]} onClick={() => onTranslate(index, 'title_zh', 'title_en')}>
                        {translating[zhKey] ? '...' : '译→'}
                      </button>
                    </label>
                    <input style={inputStyle} value={capability.title_zh || ''} onChange={event => update(index, 'title_zh', event.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Title (English)
                      <button type="button" style={translateButtonStyle} disabled={translating[enKey]} onClick={() => onTranslate(index, 'title_en', 'title_zh')}>
                        {translating[enKey] ? '...' : '←译'}
                      </button>
                    </label>
                    <input style={inputStyle} value={capability.title_en || ''} onChange={event => update(index, 'title_en', event.target.value)} />
                  </div>
                </div>

                <div className="capability-editor-grid">
                  <div>
                    <label style={labelStyle}>
                      说明（中文）
                      <button type="button" style={translateButtonStyle} disabled={translating[zhDescriptionKey]} onClick={() => onTranslate(index, 'description_zh', 'description_en')}>
                        {translating[zhDescriptionKey] ? '...' : '译→'}
                      </button>
                    </label>
                    <textarea style={{ ...textareaStyle, minHeight: '88px' }} value={capability.description_zh || ''} onChange={event => update(index, 'description_zh', event.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Description (English)
                      <button type="button" style={translateButtonStyle} disabled={translating[enDescriptionKey]} onClick={() => onTranslate(index, 'description_en', 'description_zh')}>
                        {translating[enDescriptionKey] ? '...' : '←译'}
                      </button>
                    </label>
                    <textarea style={{ ...textareaStyle, minHeight: '88px' }} value={capability.description_en || ''} onChange={event => update(index, 'description_en', event.target.value)} />
                  </div>
                </div>

                <div className="capability-editor-icon">
                  <label style={labelStyle}>图标</label>
                  <select style={inputStyle} value={capability.icon || 'circle'} onChange={event => update(index, 'icon', event.target.value)}>
                    {CAPABILITY_ICONS.map(icon => <option key={icon} value={icon}>{iconLabels[icon]}</option>)}
                  </select>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <style jsx>{`
        .capability-editor {
          padding: 18px;
          border: 1px solid var(--border);
        }
        .capability-editor-heading,
        .capability-editor-item-heading,
        .capability-editor-actions {
          display: flex;
          align-items: center;
        }
        .capability-editor-heading,
        .capability-editor-item-heading {
          justify-content: space-between;
          gap: 16px;
        }
        .capability-editor-heading h3,
        .capability-editor-item-heading strong {
          color: var(--fg);
          font-family: monospace;
        }
        .capability-editor-heading h3 { font-size: 1rem; }
        .capability-editor-heading p,
        .capability-editor-empty {
          margin-top: 4px;
          color: var(--muted);
          font-size: 0.78rem;
        }
        .capability-editor-heading button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .capability-editor-heading button:disabled,
        .capability-editor-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }
        .capability-editor-list {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }
        .capability-editor-item {
          display: grid;
          gap: 12px;
          padding: 14px;
          border: 1px solid var(--border);
        }
        .capability-editor-actions { gap: 6px; }
        .capability-editor-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: transparent;
          cursor: pointer;
        }
        .capability-editor-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .capability-editor-icon { max-width: 220px; }
        @media (max-width: 768px) {
          .capability-editor { padding: 12px; }
          .capability-editor-heading { align-items: flex-start; flex-direction: column; }
          .capability-editor-grid { grid-template-columns: 1fr; }
          .capability-editor-actions button { width: 44px; height: 44px; }
        }
      `}</style>
    </section>
  )
}

