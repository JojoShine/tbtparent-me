import { notFound } from 'next/navigation'
import { PUBLIC_BLOG_ENABLED } from '@/lib/site-features'

export default function BlogLayout({ children }) {
  if (!PUBLIC_BLOG_ENABLED) notFound()
  return children
}
