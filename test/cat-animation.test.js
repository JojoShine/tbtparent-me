import assert from 'node:assert/strict'
import test from 'node:test'

import * as catAnimation from '../src/lib/cat-animation.js'

const { getSpriteFrame, getSpriteFrameIndex, shouldShowCatFallback } = catAnimation

test('each cat always uses one signature looping action', () => {
  assert.equal(typeof catAnimation.getSignatureCatAction, 'function')
  const { getSignatureCatAction } = catAnimation

  assert.deepEqual(getSignatureCatAction('雪宝'), {
    id: 'typing',
    src: '/videos/cats/v2/xuebao/typing.png?v=3',
    columns: 4,
    rows: 4,
    frameCount: 16,
    fps: 12,
  })
  assert.equal(getSignatureCatAction('甜枣').id, 'tail')
  assert.equal(getSignatureCatAction('三塔').id, 'look')
  assert.equal(getSignatureCatAction('不存在的小猫'), null)
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

test('static fallback disappears after the first animation frame is ready', () => {
  const action = { id: 'wave' }

  assert.equal(shouldShowCatFallback(false, false, action), true)
  assert.equal(shouldShowCatFallback(true, false, action), false)
  assert.equal(shouldShowCatFallback(true, true, action), true)
  assert.equal(shouldShowCatFallback(true, false, null), true)
})

test('animation frame index is derived from elapsed time', () => {
  assert.equal(getSpriteFrameIndex(0, 12, 16), 0)
  assert.equal(getSpriteFrameIndex(84, 12, 16), 1)
  assert.equal(getSpriteFrameIndex(500, 12, 16), 6)
  assert.equal(getSpriteFrameIndex(1400, 12, 16), 0)
})
