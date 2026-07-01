/**
 * 六爻算法库
 * 实现铜钱起卦 + 装卦全流程（纳甲、六亲、六神、世应）
 */
import hexagramsData from '@/data/hexagrams.json'
import liuyaoData from '@/data/liuyao-data.json'

const { guaGong, naJia, diZhi, liuShen, liuShenByDayStem, liuQin, yongShen } = liuyaoData

// 八卦爻线（从下到上）
const TRIGRAM_LINES = {
  '乾': [true, true, true],
  '兑': [false, true, true],
  '离': [true, false, true],
  '震': [true, false, false],
  '巽': [false, true, true],
  '坎': [false, true, false],
  '艮': [false, false, true],
  '坤': [false, false, false],
}

const BAGUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
const BAGUA_ELEMENT = { '乾': '金', '兑': '金', '离': '火', '震': '木', '巽': '木', '坎': '水', '艮': '土', '坤': '土' }

// 五行生克
const WUXING_SHENG = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const WUXING_KE = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 爻名
const YAO_NAMES = ['初', '二', '三', '四', '五', '上']

/**
 * 模拟投掷三枚铜钱
 * 返回: { yang: boolean, changing: boolean, type: string }
 * yang = 阳爻, changing = 变爻
 */
export function castCoins() {
  // 正面(阴)=false, 背面(阳)=true
  const coins = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5]
  const yangCount = coins.filter(c => c).length

  const base = { coins }
  switch (yangCount) {
    case 3: // 三背 = 老阳
      return { ...base, yang: true, changing: true, type: '老阳', symbol: '○' }
    case 2: // 两背一字 = 少阴
      return { ...base, yang: false, changing: false, type: '少阴', symbol: '' }
    case 1: // 一背两字 = 少阳
      return { ...base, yang: true, changing: false, type: '少阳', symbol: '' }
    case 0: // 三字 = 老阴
      return { ...base, yang: false, changing: true, type: '老阴', symbol: '×' }
  }
}

/**
 * 六爻起卦（摇卦6次）
 * 返回6个爻，从初爻到上爻
 */
export function castHexagram() {
  const lines = []
  for (let i = 0; i < 6; i++) {
    lines.push(castCoins())
  }
  return lines
}

/**
 * 手动输入起卦
 * lines: [{ yang: boolean, changing: boolean }]
 */
export function manualCast(lines) {
  return lines.map(l => ({
    ...l,
    type: l.changing ? (l.yang ? '老阳' : '老阴') : (l.yang ? '少阳' : '少阴'),
    symbol: l.changing ? (l.yang ? '○' : '×') : '',
  }))
}

/**
 * 从6爻获取上下卦名
 */
function getGuaFromLines(lines) {
  const lowerLines = lines.slice(0, 3).map(l => l.yang)
  const upperLines = lines.slice(3, 6).map(l => l.yang)

  const linesToName = (arr) => {
    const binary = arr.map(l => l ? '1' : '0').reverse().join('')
    const map = { '111': '乾', '011': '兑', '101': '离', '001': '震', '110': '巽', '010': '坎', '100': '艮', '000': '坤' }
    return map[binary]
  }

  return {
    lower: linesToName(lowerLines),
    upper: linesToName(upperLines),
  }
}

/**
 * 查找卦宫信息
 */
function findGuaGong(hexagramId) {
  for (const [gongName, gongData] of Object.entries(guaGong)) {
    const hex = gongData.hexagrams.find(h => h.id === hexagramId)
    if (hex) {
      return {
        gong: gongName,
        element: gongData.element,
        shi: hex.shi,
        ying: hex.shi <= 3 ? hex.shi + 3 : hex.shi - 3,
        type: hex.type,
      }
    }
  }
  return null
}

/**
 * 获取纳甲地支
 */
function getNaJia(guaName, isInner) {
  const data = naJia[guaName]
  return isInner ? data.inner : data.outer
}

/**
 * 获取六亲
 */
function getLiuQin(guaElement, zhiElement) {
  if (guaElement === zhiElement) return liuQin.same // 兄弟
  if (WUXING_SHENG[zhiElement] === guaElement) return liuQin.sheng // 父母（生我者）
  if (WUXING_KE[zhiElement] === guaElement) return liuQin.ke // 官鬼（克我者）
  if (WUXING_KE[guaElement] === zhiElement) return liuQin.woKe // 妻财（我克者）
  if (WUXING_SHENG[guaElement] === zhiElement) return liuQin.woSheng // 子孙（我生者）
  return '未知'
}

/**
 * 获取爻名
 */
function getYaoName(position, yang) {
  const prefix = YAO_NAMES[position - 1]
  return prefix + (yang ? '九' : '六')
}

/**
 * 装卦（核心函数）
 * lines: 6个爻 [{ yang, changing, type, symbol }]
 * dayStem: 日天干（如 '甲'）
 * category: 占事类别
 */
export function installHexagram(lines, dayStem, category = '') {
  // 1. 确定上下卦
  const { upper, lower } = getGuaFromLines(lines)

  // 2. 查找六十四卦
  const benGua = hexagramsData.find(h => h.upper === upper && h.lower === lower)
  if (!benGua) return null

  // 3. 查找卦宫
  const gongInfo = findGuaGong(benGua.id)

  // 4. 纳甲（装地支）
  const lowerZhi = getNaJia(lower, true)
  const upperZhi = getNaJia(upper, false)
  const allZhi = [...lowerZhi, ...upperZhi]

  // 5. 配六亲
  const guaElement = gongInfo?.element || '金'
  const liuQinArr = allZhi.map(zhi => {
    const zhiElement = diZhi[zhi]?.element || '土'
    return getLiuQin(guaElement, zhiElement)
  })

  // 6. 配六神
  const liuShenStart = liuShenByDayStem[dayStem] ?? 0
  const liuShenArr = []
  for (let i = 0; i < 6; i++) {
    liuShenArr.push(liuShen[(liuShenStart + i) % 6])
  }

  // 7. 确定变卦
  const bianLines = lines.map(l => ({
    yang: l.changing ? !l.yang : l.yang,
    changing: false,
    type: l.changing ? (l.yang ? '老阳→阴' : '老阴→阳') : l.type,
    symbol: '',
  }))
  const { upper: bianUpper, lower: bianLower } = getGuaFromLines(bianLines)
  const bianGua = hexagramsData.find(h => h.upper === bianUpper && h.lower === bianLower)

  // 8. 变卦纳甲
  const bianLowerZhi = getNaJia(bianLower, true)
  const bianUpperZhi = getNaJia(bianUpper, false)
  const bianAllZhi = [...bianLowerZhi, ...bianUpperZhi]

  // 9. 确定用神
  const yongShenName = category ? yongShen[category] : null

  // 10. 组装每爻数据
  const yaoData = []
  for (let i = 0; i < 6; i++) {
    const pos = i + 1
    const line = lines[i]
    const bianLine = bianLines[i]
    yaoData.push({
      position: pos,
      name: getYaoName(pos, line.yang),
      yang: line.yang,
      changing: line.changing,
      type: line.type,
      symbol: line.symbol,
      zhi: allZhi[i],
      zhiElement: diZhi[allZhi[i]]?.element,
      liuQin: liuQinArr[i],
      liuShen: liuShenArr[i],
      bianZhi: bianAllZhi[i],
      bianYang: bianLine.yang,
      isShi: gongInfo && pos === gongInfo.shi,
      isYing: gongInfo && pos === gongInfo.ying,
      isYongShen: yongShenName ? liuQinArr[i] === yongShenName : false,
    })
  }

  // 动爻列表
  const dongYao = yaoData.filter(y => y.changing)

  return {
    // 本卦
    benGua,
    upper,
    lower,

    // 变卦
    bianGua,
    bianUpper,
    bianLower,

    // 卦宫
    gong: gongInfo?.gong,
    gongElement: gongInfo?.element,
    gongType: gongInfo?.type,

    // 世应
    shiPos: gongInfo?.shi,
    yingPos: gongInfo?.ying,

    // 六爻数据
    yaoData,

    // 用神
    yongShen: yongShenName,

    // 动爻
    dongYao,

    // 古籍原文
    judgement: benGua.judgement,
    judgementSource: benGua.judgement_source,
    xiang: benGua.xiang,
    xiangSource: benGua.xiang_source,
  }
}

/**
 * 获取日天干（简易版，基于公历日期）
 * 注意：精确计算需要万年历，这里用简化算法
 */
export function getDayStem(date = new Date()) {
  // 简化算法：基于已知基准日推算
  const baseDate = new Date(2000, 0, 1) // 2000-01-01 为甲子日基准
  const diffDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24))
  const idx = ((diffDays % 10) + 10) % 10
  return TIANGAN[idx]
}

/**
 * 获取日地支
 */
export function getDayZhi(date = new Date()) {
  const baseDate = new Date(2000, 0, 1)
  const diffDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24))
  const idx = ((diffDays % 12) + 12) % 12
  return DIZHI[idx]
}
