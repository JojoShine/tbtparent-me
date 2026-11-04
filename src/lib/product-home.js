import { productProfiles } from '../data/product-profiles.js'
import { localizeProject } from './i18n-helpers.js'

const normalizeName = name => String(name ?? '').trim().toLowerCase().replace(/[\s_-]/g, '')

export function getProductProfile(project) {
  const names = [project?.name_zh, project?.name_en, project?.name].map(normalizeName)
  return productProfiles.find(profile => profile.aliases.some(alias => names.includes(normalizeName(alias)))) || null
}

export function getProductProfileBySlug(slug) {
  return productProfiles.find(profile => profile.slug === slug) || null
}

export function getProductHomePath(project) {
  const profile = getProductProfile(project)
  return profile?.ready ? `/landpage/${profile.slug}` : null
}

export function getProductAvailability(project) {
  if (project.archived || localizeProject(project, 'zh')?.archived) return 'retired'
  if (project.status === 'planning') return 'planned'
  if (project.status === 'in_progress') return 'building'
  return 'available'
}

function webUrl(value) {
  try {
    const url = new URL(String(value ?? '').trim())
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export function getProductActions(project) {
  if (['retired', 'planned'].includes(getProductAvailability(project))) return []
  const profile = getProductProfile(project)
  const actions = []
  const pc = webUrl(project.pc_url)
  const mobile = webUrl(project.mobile_url)
  if (pc) actions.push({ type: 'link', label: profile?.actionLabel || '打开产品', href: pc, primary: true })
  if (mobile) actions.push({ type: 'link', label: '打开移动版', href: mobile, primary: !pc })
  const qr = String(project.demo_qr_url ?? '').trim()
  if (webUrl(qr) || qr.startsWith('/api/archive/files?path=')) {
    actions.push({ type: 'qr', label: profile?.qrLabel || '扫码体验', href: qr })
  }
  const github = webUrl(project.github)
  if (github) actions.push({ type: 'link', label: '查看项目仓库', href: github })
  return actions
}

export function getProductExploreUrl(project) {
  if (getProductAvailability(project) === 'retired') return null
  const landingPage = getProductHomePath(project)
  if (landingPage) return landingPage
  const names = [project.name, project.name_zh, project.name_en].map(normalizeName)
  return names.some(name => ['passwordmanager', 'lockora'].includes(name)) ? webUrl(project.pc_url) || null : null
}
