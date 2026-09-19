import assert from 'node:assert/strict'
import test from 'node:test'

import { localizeProject } from '../src/lib/i18n-helpers.js'

test('Common RAG is treated as discontinued even when legacy database status is stale', () => {
  const project = {
    id: 6,
    name_zh: 'Common RAG',
    name_en: 'Common RAG',
    deadline_zh: '已发布',
    deadline_en: '',
  }

  assert.equal(localizeProject(project, 'zh').archived, true)
  assert.equal(localizeProject(project, 'zh').deadline, '已下架')
  assert.equal(localizeProject(project, 'en').deadline, 'Discontinued')
})
