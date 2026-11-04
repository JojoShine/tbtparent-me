import { notFound } from 'next/navigation'
import FlowCraftLanding from '@/components/products/FlowCraftLanding'
import WechatAppLanding from '@/components/products/WechatAppLanding'
import CustomAppLanding from '@/components/products/CustomAppLanding'
import AppPortfolioLanding from '@/components/products/AppPortfolioLanding'
import QingwenLanding from '@/components/products/QingwenLanding'
import OwlLanding from '@/components/products/OwlLanding'
import DataMeshLanding from '@/components/products/DataMeshLanding'
import { getProductPageData } from '@/lib/product-page-data'

const productPages = { flowcraft: FlowCraftLanding, 'custom-wechat-app': WechatAppLanding, 'custom-app': CustomAppLanding, 'app-portfolio': AppPortfolioLanding, qingwen: QingwenLanding, owl: OwlLanding, 'data-mesh': DataMeshLanding }

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await getProductPageData(slug)
  if (!data) return { title: '产品不存在', robots: { index: false } }
  const { project, profile } = data
  return {
    title: { absolute: `${profile.name} · ${profile.category}` },
    description: profile.summary || project.description_zh,
    alternates: { canonical: `/landpage/${slug}` },
    icons: { icon: profile.logo || [] },
    keywords: profile.keywords || [profile.name, '项目管理', '任务看板', 'AI 项目助手', '项目交付'],
    twitter: { card: 'summary', title: profile.name, description: profile.summary, images: [] },
    openGraph: {
      title: `${profile.name} · ${profile.category}`,
      description: profile.summary || project.description_zh,
      url: `/landpage/${slug}`,
      type: 'website',
      locale: 'zh_CN',
      siteName: profile.name,
      images: [],
    },
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const data = await getProductPageData(slug)
  const LandingPage = productPages[slug]
  if (!data || !LandingPage) notFound()
  return <LandingPage project={data.project} profile={data.profile} />
}
