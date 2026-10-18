export default function ProjectOpenSourceBadge({ isOpenSource, lang }) {
  if (!isOpenSource) return null

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, padding: '5px 9px', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)', fontSize: '12px', lineHeight: 1.2, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {lang === 'en' ? 'Open source' : '开源'}
    </span>
  )
}
