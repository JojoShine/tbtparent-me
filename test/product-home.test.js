import assert from 'node:assert/strict'
import test from 'node:test'
import { getProductHomePath, getProductProfile, getProductProfileBySlug, getProductAvailability, getProductActions, getProductExploreUrl } from '../src/lib/product-home.js'

const flow = { id: 10, name_zh: 'FlowCraft', name_en: 'FlowCraft', status: 'completed', pc_url: 'https://tbtparent.me/flowcraft/login', github: 'https://github.com/JojoShine/FlowCraft' }

test('product pages have stable readable routes and exclude PasswordManager', () => {
  assert.equal(getProductHomePath(flow), '/landpage/flowcraft')
  assert.equal(getProductHomePath({ id: 5, name_zh: 'PasswordManager', name_en: 'password_manager' }), null)
  assert.equal(getProductHomePath({ name_zh: 'AroundMe' }), null)
  assert.equal(getProductHomePath({ id: 999, name_zh: 'New project' }), null)
  assert.equal(getProductProfile({ name_en: 'Qingwen' }).slug, 'qingwen')
  assert.equal(getProductProfileBySlug('FLOWCRAFT'), null)
  assert.equal(getProductProfileBySlug('../flowcraft'), null)
})

test('historical and planned pages never expose stale launch actions', () => {
  const retired = { name_zh: 'TaskHub', status: 'completed', deadline_zh: '已下架', pc_url: 'https://old.example.com', github: 'https://github.com/example/old' }
  assert.equal(getProductAvailability(retired), 'retired')
  assert.deepEqual(getProductActions(retired), [])
  assert.equal(getProductAvailability({ name_zh: 'Common RAG', status: 'completed' }), 'retired')
  assert.deepEqual(getProductActions({ name_zh: 'AroundMe', status: 'planning', pc_url: 'https://stale.example.com' }), [])
  assert.equal(getProductAvailability({ name_zh: 'DataMesh', status: 'in_progress' }), 'building')
})

test('product actions use real URLs and reject placeholders or unsafe protocols', () => {
  assert.equal(getProductActions(flow)[0].href, flow.pc_url)
  assert.equal(getProductActions(flow)[0].label, '进入工作台')
  assert.deepEqual(getProductActions({ ...flow, pc_url: '#', github: 'javascript:alert(1)' }), [])
  assert.deepEqual(getProductActions({ ...flow, pc_url: 'data:text/html,x', github: '' }), [])
  const qr = getProductActions({ name_zh: 'custom_wechat_app', status: 'completed', demo_qr_url: '/api/archive/files?path=demo' })
  assert.equal(qr[0].type, 'qr')
  assert.equal(qr[0].label, '扫码体验小程序')
})


test('exploration uses ready landing pages and keeps the existing PasswordManager website', () => {
  assert.equal(getProductExploreUrl(flow), '/landpage/flowcraft')
  assert.equal(getProductExploreUrl({ name: 'FlowCraft' }), '/landpage/flowcraft')
  assert.equal(getProductExploreUrl({ name: 'FlowCraft', archived: true }), null)
  assert.equal(getProductExploreUrl({ name: 'PasswordManager', pc_url: 'https://tbtparent.me/password-manager/' }), 'https://tbtparent.me/password-manager/')
  assert.equal(getProductExploreUrl({ name: 'password_manager', pc_url: 'javascript:alert(1)' }), null)
  assert.equal(getProductExploreUrl({ name: 'Lockora', pc_url: 'https://tbtparent.me/lockora/' }), 'https://tbtparent.me/lockora/')
  assert.equal(getProductHomePath({ name: 'Lockora' }), null)
  assert.equal(getProductExploreUrl({ name: 'Lockora', pc_url: 'javascript:alert(1)' }), null)
  assert.equal(getProductExploreUrl({ name: 'AroundMe', status: 'planning' }), null)
})


test('the WeChat miniapp gets its own landing page without exposing unfinished products', () => {
  const miniapp = { name_zh: 'custom_wechat_app', status: 'completed' }
  assert.equal(getProductHomePath(miniapp), '/landpage/custom-wechat-app')
  assert.equal(getProductExploreUrl(miniapp), '/landpage/custom-wechat-app')
  assert.equal(getProductExploreUrl({ name: 'ant-eyes', status: 'completed' }), null)
  assert.equal(getProductProfileBySlug('custom-wechat-app').experience, true)
})


test('custom_app has a separate landing page from the WeChat miniapp', () => {
  assert.equal(getProductHomePath({ name_zh: 'custom_app' }), '/landpage/custom-app')
  assert.equal(getProductExploreUrl({ name: 'custom_app', status: 'completed' }), '/landpage/custom-app')
  assert.equal(getProductHomePath({ name: 'custom_wechat_app' }), '/landpage/custom-wechat-app')
  assert.equal(getProductHomePath({ name: 'ant-eyes' }), null)
})

test('app-portfolio explores its landing page while keeping its mobile entry', () => {
  const project = { name_zh: 'app-portfolio', status: 'completed', mobile_url: 'https://tbtparent.me/app-portfolio/' }
  assert.equal(getProductExploreUrl(project), '/landpage/app-portfolio')
  assert.equal(getProductActions(project)[0].href, project.mobile_url)
  assert.equal(getProductHomePath({ name: 'ant-eyes' }), null)
})

test('Qingwen explores its own product website and keeps the existing workspace URL', () => {
  const project = { name_zh: '轻问', name_en: 'Qingwen', status: 'completed', pc_url: 'https://tbtparent.me/surveys' }
  assert.equal(getProductExploreUrl(project), '/landpage/qingwen')
  assert.equal(getProductHomePath({ name: 'Qingwen' }), '/landpage/qingwen')
  assert.equal(getProductActions(project)[0].href, project.pc_url)
  assert.equal(getProductExploreUrl({ name: 'ant-eyes' }), null)
})

test('Owl explores its own landing while preserving its management entry', () => {
  const project = { name_zh: 'Owl', status: 'completed', pc_url: 'https://tbtparent.me/owl', github: 'https://github.com/JojoShine/owl' }
  assert.equal(getProductExploreUrl(project), '/landpage/owl')
  assert.equal(getProductHomePath({ name: 'Owl' }), '/landpage/owl')
  assert.equal(getProductActions(project)[0].href, project.pc_url)
  assert.equal(getProductActions(project).find(action => action.label === '查看项目仓库').href, project.github)
})

test('DataMesh gets a construction-stage website without inventing an app entry', () => {
  const project = { name_zh: 'DataMesh', status: 'in_progress', github: 'https://github.com/JojoShine/DataMesh' }
  assert.equal(getProductExploreUrl(project), '/landpage/data-mesh')
  assert.equal(getProductAvailability(project), 'building')
  assert.deepEqual(getProductActions(project), [{ type: 'link', label: '查看项目仓库', href: project.github }])
  for (const name of ['AroundMe', 'ant-eyes', 'Common RAG', 'TaskHub']) {
    assert.equal(getProductHomePath({ name }), null)
  }
})
