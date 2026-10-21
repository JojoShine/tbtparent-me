import assert from 'node:assert/strict'
import test from 'node:test'
import * as showcase from '../src/lib/project-showcase.js'

const { getProjectEntrypoints } = showcase

test('experience entries take priority over project demo videos', () => {
  assert.equal(typeof showcase.shouldShowProjectVideo, 'function')
  assert.equal(showcase.shouldShowProjectVideo({ video_url: 'https://example.com/demo.mp4' }), true)
  for (const entry of [
    { mobile_url: 'https://example.com/mobile' },
    { pc_url: 'https://example.com/pc' },
    { demo_qr_url: '/code.png' },
  ]) {
    assert.equal(showcase.shouldShowProjectVideo({ video_url: 'https://example.com/demo.mp4', ...entry }), false)
  }
  assert.equal(showcase.shouldShowProjectVideo({ video_url: ' ', mobile_url: '#' }), false)
  assert.equal(showcase.shouldShowProjectVideo({ video_url: 'https://example.com/demo.mp4', pc_url: '#', mobile_url: ' ' }), true)
})

test('mobile and PC destinations remain independent of project name and category', () => {
  assert.equal(typeof getProjectEntrypoints, 'function')
  for (const project_type of ['mobile', 'pc', 'dashboard', 'integrated']) {
    assert.deepEqual(getProjectEntrypoints({
      name_en: 'custom_app', project_type,
      mobile_url: 'https://example.com/app', pc_url: 'https://example.com/console',
    }), {
      mobileUrl: 'https://example.com/app', mobileQrUrl: '', pcUrl: 'https://example.com/console',
    })
  }
})

test('a QR attachment alone supplies a mobile entry alongside an optional PC entry', () => {
  assert.deepEqual(getProjectEntrypoints({ demo_qr_url: '/code.png', pc_url: 'https://example.com/pc' }), {
    mobileUrl: '', mobileQrUrl: '/code.png', pcUrl: 'https://example.com/pc',
  })
})

test('missing entries stay absent instead of falling back to unrelated legacy links', () => {
  assert.deepEqual(getProjectEntrypoints({ mobile_url: ' ', pc_url: '#', demo_url: 'https://example.com/old', link: 'https://example.com/info' }), {
    mobileUrl: '', mobileQrUrl: '', pcUrl: '',
  })
  assert.deepEqual(getProjectEntrypoints({ pc_url: 'https://example.com/pc' }), {
    mobileUrl: '', mobileQrUrl: '', pcUrl: 'https://example.com/pc',
  })
  assert.deepEqual(getProjectEntrypoints({ mobile_url: ' https://example.com/mobile ' }), {
    mobileUrl: 'https://example.com/mobile', mobileQrUrl: '', pcUrl: '',
  })
})
