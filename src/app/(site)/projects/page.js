import ProjectsClient from '@/components/projects/ProjectsClient'
import { connection } from 'next/server'
import { getCachedProjects } from '@/lib/project-data'

export default async function ProjectsPage() {
  await connection()
  const projects = await getCachedProjects()

  return <ProjectsClient projects={projects} />
}
