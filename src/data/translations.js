// 多语言翻译文件
export const translations = {
  zh: {
    // 导航
    nav: {
      home: '首页',
      blog: '博客',
      projects: '项目',
      tools: '工具',
      about: '关于',
    },
    // 首页
    home: {
      name: 'tbtparent',
      nameZh: '甜宝塔家长',
      title: '独立开发者 / 开源爱好者',
      bio: `一名独立开发者，平时喜欢琢磨架构，更热衷于把想法做出来。

做过需求分析、数据库和产品相关工作，现在主要负责从解决方案的提出、执行到验收的完整过程。

有幸成为国内 OPC 社区的一员。

不写代码的时候，会打王者（V区 iOS，ID: 甜枣0818），偶尔也会和朋友搓麻将。

家里有三只可爱的小猫：甜枣、雪宝、三塔。ID「tbtparent」也是因他们而起。

如果你觉得我能在业务或技术上帮到你，可以通过「关于」联系我。`,
      projects: '近期聚焦',
      viewAllProjects: '查看全部项目 →',
    },
    // 项目
    project: {
      dataMesh: {
        name: 'DataMesh',
        description: '一体化数据治理服务平台，以统一SSO认证贯穿全局，涵盖数据共享交换、治理管理、资产管理和安全管理四大核心模块，致力于打通数据壁垒、释放数据价值。',
        tags: ['SSO认证', '数据共享交换', '数据治理', '数据资产管理', '数据安全管理'],
      },
      appPortfolio: {
        name: 'app-portfolio',
        description: '移动端应用矩阵，聚合APP、H5、小程序等多种移动载体。既有日常工作中沉淀的工具，也有为企业打造的轻量级通用服务。',
        tags: ['移动APP', 'H5', '小程序', '应用矩阵'],
      },
    },
    // 计划完成时间
    deadline: {
      dataMesh: '计划 2026.12 完成',
      appPortfolio: '长期项目，每月上新 3-4 个应用',
    },
    // 关于
    about: {
      bio: '关于我',
      techStack: '技术栈',
      now: '最近在做什么',
    },
    // 通用
    common: {
      language: '语言',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      blog: 'Blog',
      projects: 'Projects',
      tools: 'Tools',
      about: 'About',
    },
    // Homepage
    home: {
      name: 'tbtparent',
      nameZh: '甜宝塔家长',
      title: 'Indie Developer / Open Source Enthusiast',
      bio: `An indie developer who enjoys thinking about architecture and turning ideas into reality.

I've worked in requirements analysis, databases, and product roles. Now I'm mainly responsible for the full process—from proposing solutions to execution and acceptance.

Fortunate to be part of the OPC community in China.

When I'm not coding, I play Honor of Kings (ID: 甜枣0818) or mahjong with friends.

I have three cats at home: Tianzao, Xuebao, and Santa. The ID "tbtparent" comes from their names.

If you think I can help you with business or tech, feel free to reach out via the "About" page.`,
      projects: 'Recent Focus',
      viewAllProjects: 'View all projects →',
    },
    // Projects
    project: {
      dataMesh: {
        name: 'DataMesh',
        description: 'An integrated data governance platform unified by SSO authentication across all services, covering four core modules: data sharing & exchange, governance management, asset management, and security management—breaking down data silos and unlocking data value.',
        tags: ['SSO Auth', 'Data Exchange', 'Data Governance', 'Data Asset Mgmt', 'Data Security'],
      },
      appPortfolio: {
        name: 'app-portfolio',
        description: 'A mobile application matrix combining apps, H5 pages, and mini-programs. Ranging from tools born out of daily work to lightweight, general-purpose services built for enterprises.',
        tags: ['Mobile App', 'H5', 'Mini Program', 'App Matrix'],
      },
    },
    // Deadlines
    deadline: {
      dataMesh: 'Target completion: Dec 2026',
      appPortfolio: 'Ongoing project, 3-4 new apps per month',
    },
    // About
    about: {
      bio: 'About Me',
      techStack: 'Tech Stack',
      now: 'What I\'m doing now',
    },
    // Common
    common: {
      language: 'Language',
    },
  },
}

export const languages = [
  { code: 'zh', label: '中' },
  { code: 'en', label: 'EN' },
]
