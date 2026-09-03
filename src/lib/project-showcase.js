export function getProjectYear(project) {
  if (!project?.createdAt) return null
  const date = new Date(project.createdAt)
  return Number.isNaN(date.getTime()) ? null : date.getFullYear()
}

export function getYearOptions(currentYear = new Date().getFullYear()) {
  return [currentYear, currentYear - 1, currentYear - 2]
}

export function getInitialProjectYear(currentYear = new Date().getFullYear()) {
  return currentYear
}

export function filterProjectsByYear(projects, activeYear) {
  if (!activeYear) return [...projects]
  return projects.filter(project => getProjectYear(project) === activeYear)
}

export function filterProjectCatalog(
  projects,
  { activeYear = null, projectType = 'all', query = '' } = {},
) {
  const normalizedQuery = query.trim().toLowerCase()

  return projects.filter(project => {
    if (activeYear && getProjectYear(project) !== activeYear) return false
    if (projectType !== 'all' && project.project_type !== projectType) return false
    if (!normalizedQuery) return true

    const searchableValues = [
      project.name_zh,
      project.name_en,
      project.description_zh,
      project.description_en,
      ...(Array.isArray(project.tags_zh) ? project.tags_zh : []),
      ...(Array.isArray(project.tags_en) ? project.tags_en : []),
    ]

    return searchableValues.some(value =>
      String(value ?? '').toLowerCase().includes(normalizedQuery),
    )
  })
}

export function getProjectYearCounts(projects) {
  return projects.reduce((counts, project) => {
    const year = getProjectYear(project)
    if (year) counts[year] = (counts[year] || 0) + 1
    return counts
  }, {})
}

export function shouldShowProjectCatalogTools(projects, threshold = 15) {
  return projects.length > threshold
}

export function selectDefaultProject(projects) {
  return projects.find(project => project.recent_focus) || projects[0] || null
}

export function isProjectShowcaseStyleReady(element, readStyle = globalThis.getComputedStyle) {
  if (!element || typeof readStyle !== 'function') return false
  return readStyle(element).getPropertyValue('--project-showcase-ready').trim() === '1'
}

export function sortProjectsByYearAndOrder(projects) {
  return [...projects].sort((left, right) => {
    const yearDifference = (getProjectYear(right) ?? -Infinity) - (getProjectYear(left) ?? -Infinity)
    if (yearDifference !== 0) return yearDifference

    const orderDifference = (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
    if (orderDifference !== 0) return orderDifference

    return (left.id ?? 0) - (right.id ?? 0)
  })
}

export function isProjectTrialAllowed(projectType, isMobileViewport) {
  return projectType !== 'pc' || !isMobileViewport
}

export function getProjectTrialMode(projectType, isMobileViewport) {
  if (projectType === 'pc' && isMobileViewport) return 'hidden'
  if (projectType === 'mobile' && !isMobileViewport) return 'qr'
  return 'link'
}
