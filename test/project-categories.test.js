import assert from 'node:assert/strict'
import test from 'node:test'
import { getProjectCategory, projectCategories } from '../src/lib/project-categories.js'

test('product categories group current names and legacy aliases by use', () => {
  for (const name of ['Lockora', 'password_manager', 'InkFlow', 'Around Me']) {
    assert.equal(getProjectCategory({ name_en: name }), 'personal')
  }
  for (const name of ['FlowCraft', 'Owl', 'custom_app', 'custom-wechat-app', 'app-portfolio', 'TaskHub']) {
    assert.equal(getProjectCategory({ name_zh: name }), 'development')
  }
  for (const name of ['DataMesh', '轻问', 'Common RAG']) {
    assert.equal(getProjectCategory({ name_zh: name }), 'data')
  }
  for (const name of ['self-guard', 'ant-eyes']) {
    assert.equal(getProjectCategory({ name_en: name }), 'security')
  }
})

test('unknown products remain accessible and categories are language independent', () => {
  assert.equal(getProjectCategory({ name_zh: '新产品', name_en: 'Qingwen' }), 'data')
  assert.equal(getProjectCategory({ name_zh: '新产品' }), 'other')
  assert.equal(getProjectCategory({}), 'other')
  assert.ok(projectCategories.every(category => category.zh && category.en))
  assert.equal(new Set(projectCategories.map(category => category.id)).size, projectCategories.length)
})
