'use client'

export default function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div
      style={{
        padding: '4rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* 极简空状态图标：虚线圆 + 短横线 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'var(--fg)', opacity: 0.2 }}
      >
        <circle cx="12" cy="12" r="10" strokeDasharray="4 3" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>

      {/* 提示文字 */}
      <p
        className="font-mono"
        style={{
          fontSize: '0.8rem',
          color: 'var(--muted)',
          letterSpacing: '0.03em',
        }}
      >
        {message}
      </p>

      {/* 操作按钮 */}
      {actionLabel && onAction && (
        <button
          className="font-mono"
          onClick={onAction}
          style={{
            marginTop: '4px',
            fontSize: '0.75rem',
            padding: '4px 14px',
            border: '1px solid var(--border)',
            borderRadius: '2px',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--fg)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
