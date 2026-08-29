import ProjectsClient from '@/components/projects/ProjectsClient'
import { getCachedProjects } from '@/lib/project-data'

export default async function ProjectsPage() {
  const projects = await getCachedProjects()

  return <ProjectsClient projects={projects} />
}
