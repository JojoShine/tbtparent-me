// 数据库种子脚本 - 迁移现有静态数据到 PostgreSQL
// 运行: npx prisma db seed

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据...')

  // ========== 首页数据 ==========
  await prisma.home.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name_zh: 'tbtparent',
      name_en: 'tbtparent',
      nameZh: '甜宝塔家长',
      title_zh: '独立开发者 / 开源爱好者',
      title_en: 'Indie Developer / Open Source Enthusiast',
      bio_zh: `一名独立开发者，平时喜欢琢磨架构，更热衷于把想法做出来。

做过需求分析、数据库和产品相关工作，现在主要负责从解决方案的提出、执行到验收的完整过程。

有幸成为国内 OPC 社区的一员。

不写代码的时候，会打王者（V区 iOS，ID: 甜枣0818），偶尔也会和朋友搓麻将。

家里有三只可爱的小猫：甜枣、雪宝、三塔。ID「tbtparent」也是因他们而起。

如果你觉得我能在业务或技术上帮到你，可以通过「关于」联系我。`,
      bio_en: `An indie developer who enjoys thinking about architecture and turning ideas into reality.

I've worked in requirements analysis, databases, and product roles. Now I'm mainly responsible for the full process—from proposing solutions to execution and acceptance.

Fortunate to be part of the OPC community in China.

When I'm not coding, I play Honor of Kings (ID: 甜枣0818) or mahjong with friends.

I have three cats at home: Tianzao, Xuebao, and Santa. The ID "tbtparent" comes from their names.

If you think I can help you with business or tech, feel free to reach out via the "About" page.`,
    },
  })
  console.log('✓ 首页数据')

  // ========== 社交链接 ==========
  await prisma.socialLink.createMany({
    data: [
      { name: 'tbtparent@163.com', url: 'mailto:tbtparent@163.com', icon: 'mail', sortOrder: 1 },
      { name: '微信: tbtparent', url: '#', icon: 'wechat', sortOrder: 2 },
    ],
  })
  console.log('✓ 社交链接')

  // ========== 项目 ==========
  await prisma.project.createMany({
    data: [
      {
        name_zh: 'DataMesh',
        name_en: 'DataMesh',
        description_zh: '一体化数据治理服务平台，以统一SSO认证贯穿全局，涵盖数据共享交换、治理管理、资产管理和安全管理四大核心模块，致力于打通数据壁垒、释放数据价值。',
        description_en: 'An integrated data governance platform unified by SSO authentication across all services, covering four core modules: data sharing & exchange, governance management, asset management, and security management—breaking down data silos and unlocking data value.',
        tags_zh: ['SSO认证', '数据共享交换', '数据治理', '数据资产管理', '数据安全管理'],
        tags_en: ['SSO Auth', 'Data Exchange', 'Data Governance', 'Data Asset Mgmt', 'Data Security'],
        deadline_zh: '计划 2026.12 完成',
        deadline_en: 'Target completion: Dec 2026',
        link: '#',
        github: 'https://github.com/JojoShine/DataMesh',
        demo_url: '',
        project_type: 'pc',
        sortOrder: 1,
      },
      {
        name_zh: 'app-portfolio',
        name_en: 'app-portfolio',
        description_zh: '移动端应用矩阵，聚合APP、H5、小程序等多种移动载体。既有日常工作中沉淀的工具，也有为企业打造的轻量级通用服务。',
        description_en: 'A mobile application matrix combining apps, H5 pages, and mini-programs. Ranging from tools born out of daily work to lightweight, general-purpose services built for enterprises.',
        tags_zh: ['移动APP', 'H5', '小程序', '应用矩阵'],
        tags_en: ['Mobile App', 'H5', 'Mini Program', 'App Matrix'],
        deadline_zh: '长期项目，每月上新 3-4 个应用',
        deadline_en: 'Ongoing project, 3-4 new apps per month',
        link: '#',
        github: 'https://github.com/JojoShine/app-portfolio',
        demo_url: 'https://tbtparent.me/app-portfolio/',
        project_type: 'mobile',
        sortOrder: 2,
      },
    ],
  })
  console.log('✓ 项目数据')

  // ========== 关于 ==========
  await prisma.about.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      bio_zh: '关于我',
      bio_en: 'About Me',
    },
  })
  console.log('✓ 关于数据')

  // ========== 技术栈 ==========
  const techItems = ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Python']
  await prisma.techStack.createMany({
    data: techItems.map((name, i) => ({ name, sortOrder: i + 1 })),
  })
  console.log('✓ 技术栈')

  // ========== 工具（占位） ==========
  await prisma.tool.createMany({
    data: [
      {
        name_zh: '工具名称 A',
        name_en: 'Tool A',
        description_zh: '这是一个实用工具的描述',
        description_en: 'A description for a useful tool',
        link: '#',
        available: true,
        sortOrder: 1,
      },
      {
        name_zh: '工具名称 B',
        name_en: 'Tool B',
        description_zh: '这是另一个工具的描述',
        description_en: 'A description for another tool',
        link: '#',
        available: false,
        sortOrder: 2,
      },
    ],
  })
  console.log('✓ 工具数据')

  console.log('\n种子数据完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
