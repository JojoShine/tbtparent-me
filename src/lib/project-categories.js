export const projectCategories = [
  { id: 'personal', zh: '个人工具与创作', en: 'Personal & Creative', names: ['lockora', 'passwordmanager', 'inkflow', 'aroundme'] },
  { id: 'development', zh: '产品与开发底座', en: 'Product & Development', names: ['flowcraft', 'owl', 'customapp', 'customwechatapp', 'appportfolio', 'taskhub'] },
  { id: 'data', zh: '数据与业务服务', en: 'Data & Business', names: ['datamesh', '轻问', 'qingwen', 'commonrag'] },
  { id: 'security', zh: '运维与安全', en: 'Operations & Security', names: ['selfguard', 'anteyes'] },
  { id: 'other', zh: '其他作品', en: 'Other Works', names: [] },
]

export function getProjectCategory(project) {
  const names = [project.name_zh, project.name_en, project.name]
    .map(name => String(name ?? '').trim().toLowerCase().replace(/[\s_-]/g, ''))
  return projectCategories.find(category => category.names.some(name => names.includes(name)))?.id || 'other'
}
