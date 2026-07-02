/**
 * 英语常用语音频生成脚本
 * 使用 edge-tts (Microsoft Edge TTS) 生成 mp3 音频
 * 安装: pip3 install edge-tts
 * 运行: node scripts/generate-english-audio.js
 *
 * 数据源: src/data/english/*.json (每个单元一个文件)
 * 索引: src/data/english/index.js
 */
import { execSync } from 'child_process'
import { readFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const dataDir = join(projectRoot, 'src/data/english')
const outputDir = join(projectRoot, 'public/audio/english')

// Microsoft Edge 英式女声 (音质优秀)
const VOICE = 'en-GB-SoniaNeural'

mkdirSync(outputDir, { recursive: true })

let total = 0
let generated = 0

// 遍历 src/data/english/ 下所有 json 文件
const jsonFiles = readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()

for (const file of jsonFiles) {
  const unit = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'))

  for (let i = 0; i < unit.phrases.length; i++) {
    const phrase = unit.phrases[i]
    const filename = `${unit.id}_${i}`
    const mp3Path = join(outputDir, `${filename}.mp3`)

    total++

    // 跳过已存在的文件
    if (existsSync(mp3Path)) {
      console.log(`[跳过] ${filename}.mp3 已存在`)
      generated++
      continue
    }

    try {
      // 使用 edge-tts 生成 mp3
      execSync(
        `edge-tts --voice "${VOICE}" --text ${JSON.stringify(phrase.en)} --write-media ${mp3Path}`,
        { stdio: 'pipe', timeout: 15000 }
      )

      generated++
      console.log(`[生成] ${filename}.mp3 — "${phrase.en}"`)
    } catch (err) {
      console.error(`[失败] ${filename}: ${err.message}`)
    }
  }
}

console.log(`\n完成！共 ${total} 句，已生成 ${generated} 个音频文件`)
console.log(`输出目录: ${outputDir}`)
