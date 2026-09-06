import assert from 'node:assert/strict'
import test from 'node:test'

import * as catAnimation from '../src/lib/cat-animation.js'

const { getCatMotionClass } = catAnimation

test('each cat uses one stable single-image motion', () => {
  assert.equal(getCatMotionClass('雪宝'), 'cat-motion-work')
  assert.equal(getCatMotionClass('甜枣'), 'cat-motion-gentle')
  assert.equal(getCatMotionClass('三塔'), 'cat-motion-watch')
  assert.equal(getCatMotionClass('不存在的小猫'), '')
})

test('duty cats rotate once per day and wrap after every cat', () => {
  assert.equal(typeof catAnimation.getDutyCatIndex, 'function')
  const { getDutyCatIndex } = catAnimation

  assert.equal(getDutyCatIndex(0, 3), 0)
  assert.equal(getDutyCatIndex(1, 3), 1)
  assert.equal(getDutyCatIndex(2, 3), 2)
  assert.equal(getDutyCatIndex(3, 3), 0)
  assert.equal(getDutyCatIndex(4, 3), 1)
})
