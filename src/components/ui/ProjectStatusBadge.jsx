import { getProjectStatusLabel } from '@/lib/project-showcase'

const colors = { planning: '#7c7cbd', in_progress: '#b87818', completed: '#25866a' }

export default function ProjectStatusBadge({ status, lang }) {
  const color = colors[status] || colors.planning
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0, padding: '5px 9px', border: '1px solid currentColor', borderRadius: '4px', color, fontSize: '12px', lineHeight: 1.2, fontWeight: 500, whiteSpace: 'nowrap' }}>
      <span aria-hidden="true" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      {getProjectStatusLabel(status, lang)}
    </span>
  )
}
