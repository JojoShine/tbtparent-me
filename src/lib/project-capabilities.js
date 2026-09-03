export const CAPABILITY_ICONS = [
  'circle',
  'workflow',
  'shield',
  'database',
  'layers',
  'monitor',
  'mobile',
  'box',
]

export const MAX_PROJECT_CAPABILITIES = 4

export function normalizeCapabilities(value) {
  if (value === undefined) return { data: undefined }
  if (!Array.isArray(value)) return { error: '核心能力格式无效' }
  if (value.length > MAX_PROJECT_CAPABILITIES) {
    return { error: `最多只能添加 ${MAX_PROJECT_CAPABILITIES} 项核心能力` }
  }

  const data = []
  for (const [index, capability] of value.entries()) {
    const normalized = {
      title_zh: typeof capability?.title_zh === 'string' ? capability.title_zh.trim() : '',
      title_en: typeof capability?.title_en === 'string' ? capability.title_en.trim() : '',
      description_zh: typeof capability?.description_zh === 'string' ? capability.description_zh.trim() : '',
      description_en: typeof capability?.description_en === 'string' ? capability.description_en.trim() : '',
      icon: typeof capability?.icon === 'string' ? capability.icon.trim() : 'circle',
      sortOrder: index,
    }

    if (!normalized.title_zh || !normalized.title_en || !normalized.description_zh || !normalized.description_en) {
      return { error: `核心能力第 ${index + 1} 项的中英文标题和说明不能为空` }
    }
    if (!CAPABILITY_ICONS.includes(normalized.icon)) {
      return { error: '核心能力图标无效' }
    }
    data.push(normalized)
  }

  return { data }
}

