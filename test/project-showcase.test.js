import assert from 'node:assert/strict'
import test from 'node:test'

import * as projectShowcase from '../src/lib/project-showcase.js'

const {
  filterProjectsByYear,
  getProjectYear,
  getYearOptions,
  selectDefaultProject,
} = projectShowcase

const projects = [
  { id: 1, createdAt: '2025-05-01T00:00:00.000Z', recent_focus: false },
  { id: 2, createdAt: '2026-03-01T00:00:00.000Z', recent_focus: true },
  { id: 3, createdAt: '2026-01-01T00:00:00.000Z', recent_focus: false },
]

test('project years are parsed defensively', () => {
  assert.equal(getProjectYear(projects[0]), 2025)
  assert.equal(getProjectYear({ createdAt: 'not-a-date' }), null)
  assert.equal(getProjectYear({}), null)
})

test('year options retain the current and previous two years', () => {
  assert.deepEqual(getYearOptions(2026), [2026, 2025, 2024])
})

test('project catalog initially focuses the current year', () => {
  assert.equal(
    typeof projectShowcase.getInitialProjectYear,
    'function',
    'initial project year helper must exist',
  )
  assert.equal(projectShowcase.getInitialProjectYear(2026), 2026)
})

test('year filtering returns a new list without changing project order', () => {
  assert.deepEqual(filterProjectsByYear(projects, 2026).map(project => project.id), [2, 3])
  assert.deepEqual(filterProjectsByYear(projects, null), projects)
  assert.notEqual(filterProjectsByYear(projects, null), projects)
})

test('default selection prefers the first recent-focus project', () => {
  assert.equal(selectDefaultProject(projects).id, 2)
})

test('default selection falls back to the first visible project', () => {
  assert.equal(selectDefaultProject(projects.filter(project => !project.recent_focus)).id, 1)
  assert.equal(selectDefaultProject([]), null)
})

test('showcase content remains gated until its CSS readiness marker is applied', () => {
  assert.equal(
    typeof projectShowcase.isProjectShowcaseStyleReady,
    'function',
    'style readiness guard must exist',
  )

  const readWithoutMarker = () => ({ getPropertyValue: () => '' })
  const readWithMarker = () => ({ getPropertyValue: () => ' 1 ' })

  assert.equal(projectShowcase.isProjectShowcaseStyleReady({}, readWithoutMarker), false)
  assert.equal(projectShowcase.isProjectShowcaseStyleReady({}, readWithMarker), true)
})

test('projects sort by year descending, then sort order ascending, then id', () => {
  assert.equal(
    typeof projectShowcase.sortProjectsByYearAndOrder,
    'function',
    'project ordering helper must exist',
  )

  const unordered = [
    { id: 1, createdAt: '2025-12-20T00:00:00.000Z', sortOrder: 0 },
    { id: 2, createdAt: '2026-01-02T00:00:00.000Z', sortOrder: 2 },
    { id: 4, createdAt: '2026-06-10T00:00:00.000Z', sortOrder: 1 },
    { id: 3, createdAt: '2026-12-28T00:00:00.000Z', sortOrder: 1 },
    { id: 5, createdAt: 'invalid', sortOrder: -10 },
  ]

  assert.deepEqual(
    projectShowcase.sortProjectsByYearAndOrder(unordered).map(project => project.id),
    [3, 4, 2, 1, 5],
  )
  assert.deepEqual(unordered.map(project => project.id), [1, 2, 4, 3, 5])
})

test('PC project trials are unavailable only in a mobile viewport', () => {
  assert.equal(
    typeof projectShowcase.isProjectTrialAllowed,
    'function',
    'project trial visibility helper must exist',
  )

  assert.equal(projectShowcase.isProjectTrialAllowed('pc', true), false)
  assert.equal(projectShowcase.isProjectTrialAllowed('pc', false), true)
  assert.equal(projectShowcase.isProjectTrialAllowed('mobile', true), true)
  assert.equal(projectShowcase.isProjectTrialAllowed('dashboard', true), true)
})

test('mobile projects use QR on desktop and direct links on mobile', () => {
  assert.equal(
    typeof projectShowcase.getProjectTrialMode,
    'function',
    'project trial presentation helper must exist',
  )

  assert.equal(projectShowcase.getProjectTrialMode('mobile', false), 'qr')
  assert.equal(projectShowcase.getProjectTrialMode('mobile', true), 'link')
  assert.equal(projectShowcase.getProjectTrialMode('pc', false), 'link')
  assert.equal(projectShowcase.getProjectTrialMode('pc', true), 'hidden')
  assert.equal(projectShowcase.getProjectTrialMode('dashboard', true), 'link')
})

test('catalog filtering combines year, carrier, and text without changing source order', () => {
  assert.equal(
    typeof projectShowcase.filterProjectCatalog,
    'function',
    'catalog filtering helper must exist',
  )

  const catalog = [
    { id: 1, createdAt: '2026-03-01', project_type: 'pc', name_zh: '数据平台', name_en: 'Data Platform', tags_zh: ['治理'], tags_en: ['Governance'] },
    { id: 2, createdAt: '2026-01-01', project_type: 'mobile', name_zh: '移动工具', name_en: 'Mobile Kit', tags_zh: ['效率'], tags_en: ['Utility'] },
    { id: 3, createdAt: '2025-01-01', project_type: 'pc', name_zh: '旧项目', name_en: 'Legacy', tags_zh: ['治理'], tags_en: ['Governance'] },
  ]

  assert.deepEqual(
    projectShowcase.filterProjectCatalog(catalog, { activeYear: 2026, projectType: 'mobile', query: '' }).map(project => project.id),
    [2],
  )
  assert.deepEqual(
    projectShowcase.filterProjectCatalog(catalog, { activeYear: null, projectType: 'all', query: 'governance' }).map(project => project.id),
    [1, 3],
  )
  assert.deepEqual(catalog.map(project => project.id), [1, 2, 3])
})

test('year counts and catalog tool threshold support larger project collections', () => {
  assert.equal(typeof projectShowcase.getProjectYearCounts, 'function')
  assert.equal(typeof projectShowcase.shouldShowProjectCatalogTools, 'function')

  assert.deepEqual(projectShowcase.getProjectYearCounts(projects), { 2025: 1, 2026: 2 })
  assert.equal(projectShowcase.shouldShowProjectCatalogTools(new Array(15)), false)
  assert.equal(projectShowcase.shouldShowProjectCatalogTools(new Array(16)), true)
})

test('mobile project selector keyboard navigation moves and wraps across projects', () => {
  assert.equal(
    typeof projectShowcase.getProjectSelectionForKey,
    'function',
    'project selector keyboard helper must exist',
  )

  const projectIds = [11, 22, 33]
  assert.equal(projectShowcase.getProjectSelectionForKey(projectIds, 22, 'ArrowDown'), 33)
  assert.equal(projectShowcase.getProjectSelectionForKey(projectIds, 33, 'ArrowDown'), 11)
  assert.equal(projectShowcase.getProjectSelectionForKey(projectIds, 11, 'ArrowUp'), 33)
  assert.equal(projectShowcase.getProjectSelectionForKey(projectIds, 22, 'Home'), 11)
  assert.equal(projectShowcase.getProjectSelectionForKey(projectIds, 22, 'End'), 33)
})
