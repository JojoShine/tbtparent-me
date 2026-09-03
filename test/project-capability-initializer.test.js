import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCapabilityInitialization } from '../src/lib/project-capability-initializer.js'

const capabilities = [{
  title_zh: '数据治理',
  title_en: 'Data Governance',
  description_zh: '统一标准与质量规则。',
  description_en: 'Unifies standards and quality rules.',
  icon: 'shield',
}]

test('initialization plans ordered rows for a matching project without capabilities', () => {
  const result = buildCapabilityInitialization(
    [{ id: 1, name_zh: 'DataMesh', name_en: 'DataMesh', capabilities: [] }],
    { DataMesh: capabilities },
  )

  assert.deepEqual(result, [{
    projectId: 1,
    projectName: 'DataMesh',
    capabilities: [{ ...capabilities[0], sortOrder: 0 }],
  }])
})

test('initialization never overwrites a project with existing capability rows', () => {
  const result = buildCapabilityInitialization(
    [{ id: 1, name_zh: 'DataMesh', name_en: 'DataMesh', capabilities: [{ id: 99 }] }],
    { DataMesh: capabilities },
  )

  assert.deepEqual(result, [])
})

test('initialization skips projects without a curated capability entry', () => {
  const result = buildCapabilityInitialization(
    [{ id: 2, name_zh: 'Unknown', name_en: 'Unknown', capabilities: [] }],
    { DataMesh: capabilities },
  )

  assert.deepEqual(result, [])
})

test('initialization can match a curated entry by Chinese name', () => {
  const result = buildCapabilityInitialization(
    [{ id: 3, name_zh: '密码管理器', name_en: '', capabilities: [] }],
    { 密码管理器: capabilities },
  )

  assert.equal(result[0].projectId, 3)
})

test('invalid checked-in capability data stops initialization', () => {
  assert.throws(
    () => buildCapabilityInitialization(
      [{ id: 1, name_zh: 'DataMesh', name_en: 'DataMesh', capabilities: [] }],
      { DataMesh: [{ ...capabilities[0], title_en: '' }] },
    ),
    /DataMesh: 核心能力第 1 项的中英文标题和说明不能为空/,
  )
})

