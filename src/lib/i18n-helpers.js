/**
 * 根据当前语言选择双语字段
 * API 返回的数据有 _zh / _en 后缀字段，此工具根据 lang 选择对应值
 */
export function localizedField(obj, baseName, lang) {
  if (!obj) return ''
  return obj[`${baseName}_${lang}`] || obj[`${baseName}_zh`] || ''
}

/**
 * 将 API 返回的项目数据转为前端渲染格式
 */
export function localizeProject(project, lang) {
  if (!project) return null
  return {
    id: project.id,
    name: localizedField(project, 'name', lang),
    description: localizedField(project, 'description', lang),
    tags: project[`tags_${lang}`] || project.tags_zh || [],
    deadline: localizedField(project, 'deadline', lang),
    link: project.link || '#',
    github: project.github || '',
    demo_url: project.demo_url || '',
    project_type: project.project_type || 'pc',
  }
}
