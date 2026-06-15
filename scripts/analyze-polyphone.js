import { pinyin } from 'pinyin-pro'
import { readFileSync, writeFileSync } from 'fs'

const idioms = JSON.parse(readFileSync('src/data/idioms.json', 'utf-8'))

// 常见多音字
const polyChars = '乐长重调弹难中撒奇传为行好还相数发干地朝都差藏曾乘将给称处当分种更间落恶强假模便倒兴冲量监应角解背薄泊参宿折了空得没看说和扇转舍创禁漂供'.split('')

const results = []
const polyMap = {} // { 成语: { 字: 拼音 } }

idioms.forEach(idiom => {
  const chars = idiom.split('')
  const pyArr = pinyin(idiom, { toneType: 'symbol', type: 'array' })
  const polyInfo = {}
  
  chars.forEach((c, i) => {
    if (polyChars.includes(c)) {
      polyInfo[c] = pyArr[i]
    }
  })
  
  if (Object.keys(polyInfo).length > 0) {
    results.push(`${idiom} | ${pyArr.join(' ')} | ${Object.entries(polyInfo).map(([k,v]) => `${k}→${v}`).join(', ')}`)
    polyMap[idiom] = polyInfo
  }
})

console.log(`总成语数: ${idioms.length}`)
console.log(`含多音字成语: ${results.length}`)
console.log('')
console.log('--- 前60条 ---')
results.slice(0, 60).forEach(r => console.log(r))

// 输出统计
const charCount = {}
Object.values(polyMap).forEach(info => {
  Object.keys(info).forEach(c => {
    charCount[c] = (charCount[c] || 0) + 1
  })
})
console.log('\n--- 多音字出现频次 ---')
Object.entries(charCount).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
  console.log(`  ${c}: ${n}次`)
})
