import { normalizeCapabilities } from './project-capabilities.js'

export function buildCapabilityInitialization(projects, capabilityMap) {
  const operations = []

  for (const project of projects) {
    if (project.capabilities?.length > 0) continue
    const key = capabilityMap[project.name_en]
      ? project.name_en
      : capabilityMap[project.name_zh]
        ? project.name_zh
        : null
    if (!key) continue

    const result = normalizeCapabilities(capabilityMap[key])
    if (result.error) throw new Error(`${key}: ${result.error}`)
    operations.push({
      projectId: project.id,
      projectName: project.name_zh || project.name_en,
      capabilities: result.data,
    })
  }

  return operations
}

