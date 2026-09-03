import { MAX_PROJECT_CAPABILITIES } from '@/lib/project-capabilities'

export const emptyCapability = {
  title_zh: '',
  title_en: '',
  description_zh: '',
  description_en: '',
  icon: 'circle',
}

export function addCapability(rows) {
  if (rows.length >= MAX_PROJECT_CAPABILITIES) return rows
  return [...rows, { ...emptyCapability }]
}

export function updateCapability(rows, index, field, value) {
  return rows.map((row, rowIndex) => (
    rowIndex === index ? { ...row, [field]: value } : row
  ))
}

export function removeCapability(rows, index) {
  return rows.filter((_, rowIndex) => rowIndex !== index)
}

export function moveCapability(rows, index, direction) {
  const target = index + direction
  if (target < 0 || target >= rows.length) return rows
  const result = [...rows]
  ;[result[index], result[target]] = [result[target], result[index]]
  return result
}

