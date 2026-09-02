import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { translations } from '../src/data/translations.js'

test('public navigation uses the approved section names in both languages', () => {
  assert.deepEqual(
    [translations.zh.nav.projects, translations.zh.nav.game, translations.zh.nav.hobbies],
    ['作品', '游戏', '书影'],
  )
  assert.deepEqual(
    [translations.en.nav.projects, translations.en.nav.game, translations.en.nav.hobbies],
    ['Works', 'Games', 'Library'],
  )
})

test('project videos are only rendered after confirming a desktop viewport', async () => {
  const projectPage = await readFile(
    new URL('../src/app/(site)/projects/[id]/page.js', import.meta.url),
    'utf8',
  )

  assert.match(projectPage, /\{hasVideo && viewportReady && !isSmallScreen && \(/)
})
