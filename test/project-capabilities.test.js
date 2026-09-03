import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CAPABILITY_ICONS,
  MAX_PROJECT_CAPABILITIES,
  normalizeCapabilities,
} from '../src/lib/project-capabilities.js'

const validCapability = {
  title_zh: '数据治理',
  title_en: 'Data Governance',
  description_zh: '统一标准与质量规则。',
  description_en: 'Unifies standards and quality rules.',
  icon: 'shield',
}

test('capability configuration exposes the supported icon keys and row limit', () => {
  assert.equal(MAX_PROJECT_CAPABILITIES, 4)
  assert.deepEqual(CAPABILITY_ICONS, [
    'circle',
    'workflow',
    'shield',
    'database',
    'layers',
    'monitor',
    'mobile',
    'box',
  ])
})

test('omitted capabilities preserve existing rows while an empty array clears them', () => {
  assert.deepEqual(normalizeCapabilities(undefined), { data: undefined })
  assert.deepEqual(normalizeCapabilities([]), { data: [] })
})

test('capabilities must be submitted as an array', () => {
  assert.equal(normalizeCapabilities('invalid').error, '核心能力格式无效')
})

test('projects cannot contain more than four capabilities', () => {
  assert.equal(
    normalizeCapabilities(new Array(5).fill(validCapability)).error,
    '最多只能添加 4 项核心能力',
  )
})

test('every capability requires complete bilingual content', () => {
  assert.equal(
    normalizeCapabilities([{ ...validCapability, title_en: '  ' }]).error,
    '核心能力第 1 项的中英文标题和说明不能为空',
  )
})

test('capability icon keys must use the supported allowlist', () => {
  assert.equal(
    normalizeCapabilities([{ ...validCapability, icon: 'unknown' }]).error,
    '核心能力图标无效',
  )
})

test('capabilities are trimmed and ordered from their submitted position', () => {
  const result = normalizeCapabilities([{
    title_zh: '  数据治理 ',
    title_en: ' Data Governance  ',
    description_zh: ' 统一标准与质量规则。 ',
    description_en: ' Unifies standards and quality rules. ',
    icon: 'shield',
    sortOrder: 99,
  }])

  assert.deepEqual(result.data[0], {
    title_zh: '数据治理',
    title_en: 'Data Governance',
    description_zh: '统一标准与质量规则。',
    description_en: 'Unifies standards and quality rules.',
    icon: 'shield',
    sortOrder: 0,
  })
})

