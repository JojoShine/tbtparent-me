import assert from 'node:assert/strict'
import test from 'node:test'

import { getCatMotionClass } from '../src/lib/cat-animation.js'

test('each cat uses one stable single-image motion', () => {
  assert.equal(getCatMotionClass('雪宝'), 'cat-motion-work')
  assert.equal(getCatMotionClass('甜枣'), 'cat-motion-gentle')
  assert.equal(getCatMotionClass('三塔'), 'cat-motion-watch')
  assert.equal(getCatMotionClass('不存在的小猫'), '')
})
