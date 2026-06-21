export default function GameRules({ children }) {
  return (
    <div style={{
      marginTop: '24px',
      padding: '12px 16px',
      border: '1px solid var(--border)',
      borderRadius: '4px',
    }}>
      {children}
    </div>
  )
}
