import { getProductProfileBySlug } from './product-home.js'

export function getProductPageData(slug) {
  const profile = getProductProfileBySlug(slug)
  if (!profile?.ready) return null
  return { project: profile.project, profile }
}
