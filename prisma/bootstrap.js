import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  await prisma.$transaction(async tx => {
    await tx.home.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name_zh: 'tbtparent', name_en: 'tbtparent', nameZh: '甜宝塔家长',
        title_zh: '独立创作者', title_en: 'Independent Creator',
        bio_zh: '欢迎来到我的个人站。', bio_en: 'Welcome to my personal site.',
      },
    })
    await tx.about.upsert({
      where: { id: 1 }, update: {},
      create: { id: 1, bio_zh: '关于我', bio_en: 'About Me' },
    })
  })
  console.log('Bootstrap complete; existing content preserved.')
} catch {
  console.error('Bootstrap failed; check database access and migrations.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
