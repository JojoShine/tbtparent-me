// 多语言翻译文件 - 仅保留 UI 标签
// 页面内容（首页/项目/博客/关于/工具）从中英文双语字段获取
export const translations = {
  zh: {
    nav: {
      home: '首页',
      blog: '博客',
      projects: '项目',
      tools: '工具',
      about: '关于',
    },
    home: {
      projects: '近期聚焦',
      viewAllProjects: '查看全部项目 →',
    },
    about: {
      bio: '关于我',
      techStack: '技术栈',
    },
    common: {
      language: '语言',
    },
  },
  en: {
    nav: {
      home: 'Home',
      blog: 'Blog',
      projects: 'Projects',
      tools: 'Tools',
      about: 'About',
    },
    home: {
      projects: 'Recent Focus',
      viewAllProjects: 'View all projects →',
    },
    about: {
      bio: 'About Me',
      techStack: 'Tech Stack',
    },
    common: {
      language: 'Language',
    },
  },
}

export const languages = [
  { code: 'zh', label: '中' },
  { code: 'en', label: 'EN' },
]
