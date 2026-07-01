/**
 * 梅花易数算法库
 * 基于邵雍先天八卦数理体系
 */
import { Solar, Lunar } from 'lunar-javascript'
import hexagramsData from '@/data/hexagrams.json'

// 先天八卦数
const XIANTIAN = { '乾': 1, '兑': 2, '离': 3, '震': 4, '巽': 5, '坎': 6, '艮': 7, '坤': 8 }
const BAGUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
const BAGUA_SYMBOLS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷']
const BAGUA_NATURE = ['天', '泽', '火', '雷', '风', '水', '山', '地']
const BAGUA_ELEMENT = ['金', '金', '火', '木', '木', '水', '土', '土']

// 五行生克
const WUXING_SHENG = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' }
const WUXING_KE = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' }

// 地支数（时辰）
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const DIZHI_NUM = { '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6, '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12 }

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

/**
 * 取余数（返回 1-8 或 1-6）
 */
function mod(n, m) {
  const r = n % m
  return r === 0 ? m : r
}

/**
 * 根据先天八卦数获取卦名（1-8）
 */
function numToGua(n) {
  return BAGUA_NAMES[mod(n, 8) - 1]
}

/**
 * 通过上下卦名查找六十四卦数据
 */
function findHexagram(upperName, lowerName) {
  return hexagramsData.find(h => h.upper === upperName && h.lower === lowerName)
}

/**
 * 通过六爻二进制查找六十四卦（爻1-6，从下到上）
 */
function findHexagramByLines(lines) {
  const lowerBits = [lines[0] ? '1' : '0', lines[1] ? '1' : '0', lines[2] ? '1' : '0'].join('')
  const upperBits = [lines[3] ? '1' : '0', lines[4] ? '1' : '0', lines[5] ? '1' : '0'].join('')
  const lowerIdx = parseInt(lowerBits.split('').reverse().join(''), 2)
  const upperIdx = parseInt(upperBits.split('').reverse().join(''), 2)
  // Map binary to trigram name
  const binaryToGua = { '111': '乾', '011': '兑', '101': '离', '001': '震', '110': '巽', '010': '坎', '100': '艮', '000': '坤' }
  return findHexagram(binaryToGua[upperBits], binaryToGua[lowerBits])
}

/**
 * 获取八卦的爻（从下到上，3个爻）
 */
function getTrigramLines(name) {
  const idx = BAGUA_NAMES.indexOf(name)
  const binary = ['111', '011', '101', '001', '110', '010', '100', '000'][idx]
  return binary.split('').reverse().map(b => b === '1')
}

/**
 * 获取当前农历信息
 */
function getLunarInfo(date = new Date()) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    hour: DIZHI[new Date().getHours() === 23 ? 0 : Math.floor((new Date().getHours() + 1) / 2)],
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    hourGanZhi: lunar.getTimeInGanZhi(),
    yearZhi: lunar.getYearZhi(),
    monthZhi: lunar.getMonthZhi(),
    dayZhi: lunar.getDayZhi(),
    hourZhi: lunar.getTimeZhi(),
    dayTianGan: lunar.getDayGan(),
  }
}

/**
 * 时间起卦
 * 以当前农历 年+月+日 之和除以 8 取余 → 上卦
 * 以当前农历 年+月+日+时 之和除以 8 取余 → 下卦
 * 以 年+月+日+时 之和除以 6 取余 → 动爻
 */
export function divineByTime(date = new Date()) {
  const lunar = getLunarInfo(date)
  const yearNum = DIZHI_NUM[lunar.yearZhi]
  const monthNum = lunar.month
  const dayNum = lunar.day
  const hourNum = DIZHI_NUM[lunar.hourZhi]

  const upperNum = yearNum + monthNum + dayNum
  const lowerNum = yearNum + monthNum + dayNum + hourNum
  const movingNum = lowerNum

  return {
    upper: mod(upperNum, 8),
    lower: mod(lowerNum, 8),
    moving: mod(movingNum, 6),
    lunar,
  }
}

/**
 * 数字起卦
 * 第一个数 ÷ 8 取余 → 上卦
 * 第二个数 ÷ 8 取余 → 下卦
 * 两数之和 ÷ 6 取余 → 动爻
 */
export function divineByNumbers(n1, n2) {
  return {
    upper: mod(n1, 8),
    lower: mod(n2, 8),
    moving: mod(n1 + n2, 6),
  }
}

/**
 * 文字起卦
 * 字数少时按笔画数起卦
 * 字数多时按字数均分
 */
export function divineByText(text, getStrokeCount) {
  // 如果提供了笔画数函数，使用笔画数
  if (getStrokeCount) {
    const chars = text.split('')
    if (chars.length === 1) {
      const strokes = getStrokeCount(chars[0])
      return {
        upper: mod(strokes, 8),
        lower: mod(strokes, 8),
        moving: mod(strokes, 6),
      }
    }
    if (chars.length === 2) {
      const s1 = getStrokeCount(chars[0])
      const s2 = getStrokeCount(chars[1])
      return {
        upper: mod(s1, 8),
        lower: mod(s2, 8),
        moving: mod(s1 + s2, 6),
      }
    }
    // 多字：前半为上卦，后半为下卦
    const mid = Math.ceil(chars.length / 2)
    const first = chars.slice(0, mid)
    const second = chars.slice(mid)
    const strokes1 = first.reduce((sum, c) => sum + getStrokeCount(c), 0)
    const strokes2 = second.reduce((sum, c) => sum + getStrokeCount(c), 0)
    return {
      upper: mod(strokes1, 8),
      lower: mod(strokes2, 8),
      moving: mod(strokes1 + strokes2, 6),
    }
  }

  // 默认：按字数起卦
  const len = text.length
  if (len <= 2) {
    // 按字符编码值
    const codes = text.split('').map(c => c.charCodeAt(0))
    return {
      upper: mod(codes[0], 8),
      lower: mod(codes[codes.length - 1], 8),
      moving: mod(codes.reduce((a, b) => a + b, 0), 6),
    }
  }
  const mid = Math.ceil(len / 2)
  const first = text.slice(0, mid)
  const second = text.slice(mid)
  const sum1 = first.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const sum2 = second.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return {
    upper: mod(sum1, 8),
    lower: mod(sum2, 8),
    moving: mod(sum1 + sum2, 6),
  }
}

/**
 * 随机起卦
 */
export function divineByRandom() {
  return {
    upper: Math.floor(Math.random() * 8) + 1,
    lower: Math.floor(Math.random() * 8) + 1,
    moving: Math.floor(Math.random() * 6) + 1,
  }
}

/**
 * 五行生克关系判断
 */
export function getWuxingRelation(ti, yong) {
  if (ti === yong) return { relation: '比和', desc: '和谐共处', luck: '吉' }
  if (WUXING_SHENG[yong] === ti) return { relation: '用生体', desc: '外力助我', luck: '大吉' }
  if (WUXING_SHENG[ti] === yong) return { relation: '体生用', desc: '我消耗精力', luck: '泄气' }
  if (WUXING_KE[ti] === yong) return { relation: '体克用', desc: '我能掌控', luck: '小吉' }
  if (WUXING_KE[yong] === ti) return { relation: '用克体', desc: '外力压制', luck: '大凶' }
  return { relation: '未知', desc: '', luck: '平' }
}

/**
 * 卦象推演（核心）
 * 输入：上卦数(1-8)、下卦数(1-8)、动爻(1-6)
 * 输出：完整盘面数据
 */
export function deriveHexagram(upperNum, lowerNum, movingLine) {
  const upperName = numToGua(upperNum)
  const lowerName = numToGua(lowerNum)
  const upperIdx = mod(upperNum, 8) - 1
  const lowerIdx = mod(lowerNum, 8) - 1

  // 本卦
  const benGua = findHexagram(upperName, lowerName)

  // 体用分辨
  // 动爻在下卦(1-3)：下卦为用，上卦为体
  // 动爻在上卦(4-6)：上卦为用，下卦为体
  const tiIsUpper = movingLine > 3
  const tiGua = tiIsUpper ? upperName : lowerName
  const yongGua = tiIsUpper ? lowerName : upperName
  const tiElement = BAGUA_ELEMENT[BAGUA_NAMES.indexOf(tiGua)]
  const yongElement = BAGUA_ELEMENT[BAGUA_NAMES.indexOf(yongGua)]

  // 五行关系
  const wuxingRelation = getWuxingRelation(tiElement, yongElement)

  // 互卦：取本卦 2,3,4 爻为下卦，3,4,5 爻为上卦
  const benLines = [...getTrigramLines(lowerName), ...getTrigramLines(upperName)]
  const huLowerLines = [benLines[1], benLines[2], benLines[3]]
  const huUpperLines = [benLines[2], benLines[3], benLines[4]]

  // 将爻线转为卦名
  const linesToGuaName = (lines) => {
    const binary = lines.map(l => l ? '1' : '0').reverse().join('')
    const map = { '111': '乾', '011': '兑', '101': '离', '001': '震', '110': '巽', '010': '坎', '100': '艮', '000': '坤' }
    return map[binary]
  }

  const huLowerName = linesToGuaName(huLowerLines)
  const huUpperName = linesToGuaName(huUpperLines)
  const huGua = findHexagram(huUpperName, huLowerName)

  // 变卦：动爻阴阳互换
  const bianLines = [...benLines]
  bianLines[movingLine - 1] = !bianLines[movingLine - 1]
  const bianLowerLines = bianLines.slice(0, 3)
  const bianUpperLines = bianLines.slice(3, 6)
  const bianLowerName = linesToGuaName(bianLowerLines)
  const bianUpperName = linesToGuaName(bianUpperLines)
  const bianGua = findHexagram(bianUpperName, bianLowerName)

  // 变卦与体卦关系
  const bianElement = tiIsUpper
    ? BAGUA_ELEMENT[BAGUA_NAMES.indexOf(bianUpperName)]
    : BAGUA_ELEMENT[BAGUA_NAMES.indexOf(bianLowerName)]
  const bianRelation = getWuxingRelation(tiElement, bianElement)

  // 动爻辞
  const movingLineData = benGua?.lines?.[movingLine - 1]

  return {
    // 起卦参数
    upper: upperName,
    lower: lowerName,
    upperSymbol: BAGUA_SYMBOLS[upperIdx],
    lowerSymbol: BAGUA_SYMBOLS[lowerIdx],
    movingLine,

    // 本卦
    benGua,

    // 体用
    tiGua,
    tiElement,
    yongGua,
    yongElement,
    wuxingRelation,

    // 互卦
    huGua,
    huUpper: huUpperName,
    huLower: huLowerName,

    // 变卦
    bianGua,
    bianUpper: bianUpperName,
    bianLower: bianLowerName,
    bianRelation,

    // 动爻
    movingLineData,

    // 爻线数据（用于可视化）
    lines: benLines,
    bianLines,
  }
}

/**
 * 获取季节和卦气旺衰
 */
export function getGuaQiWangShuai(guaName) {
  const month = new Date().getMonth() + 1
  let season
  if (month >= 1 && month <= 3) season = '春'
  else if (month >= 4 && month <= 6) season = '夏'
  else if (month >= 7 && month <= 9) season = '秋'
  else season = '冬'

  const element = BAGUA_ELEMENT[BAGUA_NAMES.indexOf(guaName)]
  const seasonElement = { '春': '木', '夏': '火', '秋': '金', '冬': '水' }[season]

  let status = '平'
  if (element === seasonElement) status = '旺'
  else if (WUXING_SHENG[seasonElement] === element) status = '相'
  else if (WUXING_SHENG[element] === seasonElement) status = '休'
  else if (WUXING_KE[seasonElement] === element) status = '囚'
  else status = '死'

  return { season, element, status }
}
