import test from 'node:test'
import assert from 'node:assert/strict'
import { getProjectQrCode } from '../src/lib/project-qr-code.js'
import { getProjectTrialMode } from '../src/lib/project-showcase.js'
import { localizeProject } from '../src/lib/i18n-helpers.js'

const attachment = '/api/archive/files?path=tbtparent-me%2Fprojects%2Fwechat-code.jpg'

test('an uploaded code is displayed unchanged, including when a demo link is also supplied', async () => {
  assert.equal(await getProjectQrCode({ demo_qr_url: attachment }), attachment)
  assert.equal(await getProjectQrCode({ demo_qr_url: attachment, demo_url: 'https://example.com/demo' }), attachment)
})

test('ordinary app demo URLs still generate a PNG QR code', async () => {
  const code = await getProjectQrCode({ demo_url: 'https://tbtparent.me/app-portfolio/' }, { width: 220, margin: 1 })
  assert.match(code, /^data:image\/png;base64,/)
  assert.equal(Buffer.from(code.split(',')[1], 'base64').subarray(1, 4).toString(), 'PNG')
})

test('an empty demo produces no code', async () => {
  assert.equal(await getProjectQrCode({}), '')
  assert.equal(await getProjectQrCode({ link: '#' }), '')
})

test('uploaded codes stay available on phones and desktop regardless of project type', () => {
  assert.equal(getProjectTrialMode('mobile', true, true), 'qr')
  assert.equal(getProjectTrialMode('pc', true, true), 'qr')
  assert.equal(getProjectTrialMode('mobile', false, true), 'qr')
  assert.equal(getProjectTrialMode('mobile', true), 'link')
})

test('localized projects retain their QR attachment for rendering', () => {
  assert.equal(localizeProject({ demo_qr_url: attachment }, 'zh').demo_qr_url, attachment)
})
