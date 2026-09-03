// 数据库种子脚本 - 迁移现有静态数据到 PostgreSQL
// 运行: npx prisma db seed

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { projectCapabilities } from './project-capabilities-data.js'
import { buildCapabilityInitialization } from '../src/lib/project-capability-initializer.js'

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
        description_zh: '由数据交换、数据治理、数据资产和数据安全四个平台组成的一体化数据服务体系，AI 智能问数作为旁路能力贯穿全局。',
        description_en: 'An integrated data service system spanning four platforms—exchange, governance, assets, and security—with sidecar AI data Q&A across all four.',
        tags_zh: ['数据共享交换', '数据治理', '数据资产管理', '数据安全管理', 'AI智能问数'],
        tags_en: ['Data Exchange', 'Data Governance', 'Data Asset Mgmt', 'Data Security', 'AI Data Q&A'],
        deadline_zh: '计划 2026.12 完成',
        deadline_en: 'Target completion: Dec 2026',
        link: '#',
        github: 'https://github.com/JojoShine/DataMesh',
        demo_url: '',
        content_zh: `## 做了什么

DataMesh 是一套面向企业的一体化数据服务体系，由数据交换、数据治理、数据资产和数据安全四个独立平台组成。统一身份认证连接四个平台，AI 智能问数以旁路方式接入并贯穿全局。

## 解决的问题

四个平台承担不同的数据工作，但入口、权限和数据上下文容易割裂。DataMesh 保留各平台的专业边界，同时统一身份、权限和跨平台使用体验。

## 核心能力

1. **数据交换平台**：负责数据共享、交换任务和传输过程管理。
2. **数据治理平台**：覆盖元数据、数据血缘、数据标准、数据质量、治理规则和治理任务等完整的数据治理工作。
3. **数据资产平台**：负责数据目录、资产检索、业务含义和使用申请。
4. **数据安全平台**：负责安全策略、访问控制、风险排查和操作审计。
5. **AI 智能问数**：作为旁路能力贯穿四个平台，结合数据上下文、指标口径和访问权限提供自然语言问数。

## 带来的价值

使用者能更快找到数据、理解数据并发起使用；管理者也能在一处掌握资产状态、流转过程和安全风险。`,
        content_en: `## What it is

DataMesh is an integrated enterprise data service system composed of four independent platforms: data exchange, governance, assets, and security. Unified identity connects them, while AI data Q&A works as a sidecar across all four.

## The problem

The four platforms serve different data workflows but can become fragmented in identity, permissions, and context. DataMesh preserves their boundaries while unifying access and cross-platform experience.

## Core capabilities

1. **Data exchange platform**: Manage sharing, exchange jobs, and transfer processes.
2. **Data governance platform**: Cover the full governance lifecycle, including metadata, lineage, standards, quality, governance rules, and execution tasks.
3. **Data asset platform**: Manage catalogs, discovery, business definitions, and access requests.
4. **Data security platform**: Manage security policies, access control, risk investigation, and auditing.
5. **AI data Q&A**: A sidecar capability across all four platforms, grounding natural-language questions in data context, metric definitions, and permissions.

## Value

Users can find, understand, and request data faster, while administrators get a clearer view of assets, movement, and risk.`,
        project_type: 'pc',
        sortOrder: 1,
      },
      {
        name_zh: 'FlowCraft',
        name_en: 'FlowCraft',
        description_zh: '面向独立开发者的项目交付工作台，AI 通过 Function Calling 提供基础查询与统计，并结合 HTML 模板生成多种项目文档。',
        description_en: 'A project delivery workspace where AI uses Function Calling for basic queries and statistics, then combines with HTML templates to generate multiple document types.',
        tags_zh: ['项目管理', 'Function Calling', 'HTML模板', 'AI文档生成'],
        tags_en: ['Project Management', 'Function Calling', 'HTML Templates', 'AI Documents'],
        deadline_zh: '已发布',
        deadline_en: 'Released',
        link: '#',
        github: 'https://github.com/JojoShine/FlowCraft',
        demo_url: 'https://tbtparent.me/flowcraft/login',
      video_url: 'https://tbtparent-me.oss-cn-hangzhou.aliyuncs.com/flowcraft-demo.mp4',
        content_zh: `## 做了什么

FlowCraft 是面向独立开发者和小团队的项目交付工作台，将想法、计划、执行、产物与汇报集中在一个项目空间中。

## 解决的问题

项目数据常分散在任务、文件、文档和聊天记录里，手工整理计划、汇报和复盘既耗时又容易遗漏。FlowCraft 用连续工作流保存上下文，并把这些信息转化为可复用文档。

## 核心能力

1. **项目空间**：集中呈现项目阶段、当前进度、任务和关键产物。
2. **任务推进**：通过看板、日历、优先级和状态管理日常执行。
3. **AI 查询与统计**：AI 通过 Function Calling 调用基础能力，完成项目、任务和进度的查询与统计交互。
4. **HTML 文档模板**：用 HTML 模板定义文档结构和呈现样式，覆盖计划、方案、周报、汇报和复盘等类型。
5. **AI 文档生成**：AI 结合项目上下文与 HTML 模板，一键生成不同类型的项目文档。

## 项目价值

减少重复整理与空白文档写作，让项目数据可以直接转化为计划、汇报和复盘成果。`,
        content_en: `## What it is

FlowCraft is a project delivery workspace for indie developers and small teams, bringing ideas, planning, execution, artifacts, and reporting into one project space.

## The problem

Project context is often scattered across tasks, files, documents, and chats. Manually preparing plans, reports, and reviews takes time and loses important details.

## Core capabilities

1. **Project space**: See stages, progress, tasks, and key artifacts together.
2. **Task execution**: Manage work with boards, calendars, priorities, and statuses.
3. **AI queries and statistics**: AI uses Function Calling to provide basic project, task, and progress queries and statistics.
4. **HTML document templates**: HTML templates define structure and presentation for plans, proposals, weekly reports, summaries, and reviews.
5. **AI document generation**: AI combines project context with HTML templates to generate different document types in one click.

## Value

Turn live project data into plans, reports, and reviews without repeatedly collecting context or starting from a blank page.`,
        project_type: 'pc',
        sortOrder: 2,
      },
      {
        name_zh: 'app-portfolio',
        name_en: 'app-portfolio',
        description_zh: '把常用的小工具和轻量服务集中到一个移动端入口，打开即用，无需安装。',
        description_en: 'A single mobile entry for practical tools and lightweight services—open and use, with no installation.',
        tags_zh: ['移动APP', 'H5', '小程序', '应用矩阵'],
        tags_en: ['Mobile App', 'H5', 'Mini Program', 'App Matrix'],
        deadline_zh: '长期项目，每月上新 3-4 个应用',
        deadline_en: 'Ongoing project, 3-4 new apps per month',
        link: '#',
        github: 'https://github.com/JojoShine/app-portfolio',
        demo_url: 'https://tbtparent.me/app-portfolio/',
        content_zh: `## 做了什么

app-portfolio 是一个持续更新的移动应用集合，收录 H5、小程序和轻量应用。每个应用都围绕一个具体场景设计，打开页面就能直接使用。

## 为什么做

很多日常问题只需要一个简单工具，却常常要下载完整 App、注册账号或忍受复杂流程。这个项目把常见能力拆成独立的小应用，降低使用门槛。

## 使用方式

- 在作品页直接打开在线版本
- 手机端无需安装，适合临时使用
- 应用之间保持一致的操作和视觉体验

## 带来的价值

使用者可以更快完成单一任务；项目也沉淀了一套可复用的移动端产品与开发模式，便于快速验证新的想法。`,
        content_en: `## What it is

app-portfolio is a growing collection of H5 pages, mini programs, and lightweight mobile apps. Each app focuses on one practical task and is ready to use in the browser.

## Why it exists

Many everyday problems need only a small tool, yet users are often asked to install a full app, create an account, or follow a long workflow. This project turns common capabilities into focused, independent apps.

## How it works

- Open the live version directly from the portfolio
- Use it on mobile without installation
- Move between apps with consistent interaction patterns

## Value

Users finish focused tasks faster, while the project provides a reusable way to validate and ship new mobile ideas.`,
        project_type: 'mobile',
        sortOrder: 2,
      },
    ],
  })
  const seededProjects = await prisma.project.findMany({
    select: {
      id: true,
      name_zh: true,
      name_en: true,
      capabilities: { select: { id: true } },
    },
  })
  const capabilityOperations = buildCapabilityInitialization(seededProjects, projectCapabilities)
  if (capabilityOperations.length > 0) {
    await prisma.$transaction(
      capabilityOperations.map(operation => prisma.projectCapability.createMany({
        data: operation.capabilities.map(capability => ({
          ...capability,
          projectId: operation.projectId,
        })),
      })),
    )
  }
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
