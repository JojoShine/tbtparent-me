// 英语练习单元索引
// 新增单元时只需在此添加 id 并创建对应的 {id}.json 文件即可
export const unitIds = [
  'greetings',
  'introductions',
  'dining',
  'shopping',
  'directions',
  'travel',
  'feelings',
  'social',
  'phone',
  'work',
  'health',
  'weather',
  'home',
  'school',
  'hobbies',
  'banking',
  'emergency',
  'technology',
  'environment',
  'relationships',
]

// 动态加载所有单元数据
export async function loadAllUnits() {
  const units = await Promise.all(
    unitIds.map(id => import(`./${id}.json`).then(m => m.default))
  )
  return units
}
