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


test('localized projects preserve explicit open-source visibility in either language', () => {
  for (const lang of ['zh', 'en']) {
    assert.equal(localizeProject({ is_open_source: true }, lang).is_open_source, true)
    assert.equal(localizeProject({ is_open_source: false, github: 'https://github.com/example/project' }, lang).is_open_source, false)
    assert.equal(localizeProject({}, lang).is_open_source, false)
  }
})
