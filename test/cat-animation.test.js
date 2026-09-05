import assert from 'node:assert/strict'
import test from 'node:test'

import { getCatActionForHour, getSpriteFrame } from '../src/lib/cat-animation.js'

const actions = [
  { id: 'wave' },
  { id: 'idle' },
  { id: 'yawn' },
  { id: 'tail' },
]

test('cat actions rotate every two hours and wrap after the last action', () => {
  assert.equal(getCatActionForHour(actions, 0).id, 'wave')
  assert.equal(getCatActionForHour(actions, 1).id, 'wave')
  assert.equal(getCatActionForHour(actions, 2).id, 'idle')
  assert.equal(getCatActionForHour(actions, 8).id, 'wave')
  assert.equal(getCatActionForHour(actions, 23).id, 'tail')
})

test('sprite frames map left-to-right then top-to-bottom', () => {
  const action = { columns: 4, rows: 4, frameCount: 16 }

  assert.deepEqual(getSpriteFrame(0, action, 1024, 1024), {
    sx: 0,
    sy: 0,
    sw: 256,
    sh: 256,
  })
  assert.deepEqual(getSpriteFrame(5, action, 1024, 1024), {
    sx: 256,
    sy: 256,
    sw: 256,
    sh: 256,
  })
  assert.deepEqual(getSpriteFrame(15, action, 1024, 1024), {
    sx: 768,
    sy: 768,
    sw: 256,
    sh: 256,
  })
  assert.deepEqual(getSpriteFrame(16, action, 1024, 1024), {
    sx: 0,
    sy: 0,
    sw: 256,
    sh: 256,
  })
})

test('empty action collections return no selected action', () => {
  assert.equal(getCatActionForHour([], 12), null)
})
