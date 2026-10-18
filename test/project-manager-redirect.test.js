import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'

function openPage() {
  const path = new URL('../nginx/project-manager-redirect.html', import.meta.url)
  assert.ok(existsSync(path), 'The retired project needs its migration page')
  const html = readFileSync(path, 'utf8')
  const elements = new Map()
  const intervals = new Set()
  const destinations = []
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        textContent: '', hidden: true, value: 0,
        addEventListener(event, callback) { this[event] = callback },
        setAttribute() {},
      })
      return elements.get(id)
    },
  }
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    document,
    window: { location: { replace(url) { destinations.push(url) } } },
    setInterval(callback) { intervals.add(callback); return callback },
    clearInterval(callback) { intervals.delete(callback) },
  })
  return {
    destinations, elements,
    seconds(count) {
      for (let n = 0; n < count; n++) for (const callback of [...intervals]) callback()
    },
    pause() { elements.get('pause').click() },
  }
}

test('the retired project waits five seconds then replaces its URL with FlowCraft', () => {
  const page = openPage()
  page.seconds(4)
  assert.deepEqual(page.destinations, [])
  page.seconds(1)
  assert.deepEqual(page.destinations, ['https://tbtparent.me/flowcraft/'])
  page.seconds(5)
  assert.equal(page.destinations.length, 1)
})

test('pausing prevents navigation and resuming keeps the remaining time', () => {
  const page = openPage()
  page.seconds(2)
  page.pause()
  const paused = page.elements.get('redirect-status').textContent
  page.seconds(10)
  assert.equal(page.elements.get('redirect-status').textContent, paused)
  assert.deepEqual(page.destinations, [])
  page.pause()
  page.seconds(2)
  assert.deepEqual(page.destinations, [])
  page.seconds(1)
  assert.deepEqual(page.destinations, ['https://tbtparent.me/flowcraft/'])
})
