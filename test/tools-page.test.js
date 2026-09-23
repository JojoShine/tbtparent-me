import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('tools page does not reference the removed categories state', async () => {
  const toolsPage = await readFile(
    new URL('../src/app/(site)/tools/page.js', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(toolsPage, /\bcategories\b/)
})
