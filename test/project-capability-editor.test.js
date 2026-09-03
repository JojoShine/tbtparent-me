import assert from 'node:assert/strict'
import test from 'node:test'

import {
  addCapability,
  moveCapability,
  removeCapability,
  updateCapability,
} from '../src/lib/project-capability-editor.js'

const rows = [
  { title_zh: '一', icon: 'circle' },
  { title_zh: '二', icon: 'shield' },
  { title_zh: '三', icon: 'database' },
]

test('adding a capability appends a clean editable row without mutating input', () => {
  const result = addCapability(rows)

  assert.equal(rows.length, 3)
  assert.equal(result.length, 4)
  assert.deepEqual(result[3], {
    title_zh: '',
    title_en: '',
    description_zh: '',
    description_en: '',
    icon: 'circle',
  })
})

test('adding a fifth capability is ignored', () => {
  const fourRows = addCapability(rows)
  assert.equal(addCapability(fourRows), fourRows)
})

test('updating a capability changes only the requested row immutably', () => {
  const result = updateCapability(rows, 1, 'title_zh', '已更新')

  assert.equal(rows[1].title_zh, '二')
  assert.notEqual(result, rows)
  assert.equal(result[0], rows[0])
  assert.notEqual(result[1], rows[1])
  assert.equal(result[1].title_zh, '已更新')
})

test('removing a capability deletes only the selected row', () => {
  assert.deepEqual(removeCapability(rows, 1), [rows[0], rows[2]])
  assert.equal(rows.length, 3)
})

test('moving capabilities swaps adjacent rows and respects boundaries', () => {
  assert.deepEqual(moveCapability(rows, 1, -1), [rows[1], rows[0], rows[2]])
  assert.equal(moveCapability(rows, 0, -1), rows)
  assert.equal(moveCapability(rows, rows.length - 1, 1), rows)
})

