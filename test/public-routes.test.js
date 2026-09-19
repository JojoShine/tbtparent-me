import assert from 'node:assert/strict'
import test from 'node:test'

import { getLibraryPath } from '../src/lib/public-routes.js'

test('library routes use the semantic public path for both the index and chapters', () => {
  assert.equal(getLibraryPath(), '/library')
  assert.equal(getLibraryPath(42), '/library/42')
})
