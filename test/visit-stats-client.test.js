import assert from 'node:assert/strict'
import { test } from 'node:test'
import { recordVisit } from '../src/lib/visit-stats-client.js'

test('overlapping mounts share one visit registration, then later visits can refresh', async (t) => {
  let registrations = 0
  let finish
  t.mock.method(globalThis, 'fetch', () => {
    registrations += 1
    return new Promise(resolve => { finish = resolve })
  })
  const first = recordVisit()
  const remounted = recordVisit()
  assert.equal(registrations, 1)
  finish(Response.json({ todayCount: 3, total: 40 }))
  assert.deepEqual(await first, { todayCount: 3, total: 40 })
  assert.deepEqual(await remounted, { todayCount: 3, total: 40 })
  const later = recordVisit()
  assert.equal(registrations, 2)
  finish(Response.json({ todayCount: 4, total: 41 }))
  assert.deepEqual(await later, { todayCount: 4, total: 41 })
})

test('failed registrations are rejected and do not prevent a later retry', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Unavailable' }, { status: 503 }))
  await assert.rejects(recordVisit())
  t.mock.method(globalThis, 'fetch', async () => Response.json({ todayCount: 0, total: 0 }))
  assert.deepEqual(await recordVisit(), { todayCount: 0, total: 0 })
})

test('invalid successful responses never become visible visitor counts', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Unavailable' }))
  await assert.rejects(recordVisit())
})
