import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const commit = 'a'.repeat(40)
const digest = `sha256:${'b'.repeat(64)}`
const image = 'ghcr.io/jojoshine/tbtparent-me'

function release(overrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'tbtparent-release-'))
  const commands = `#!${process.execPath}
import { appendFileSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
const args = process.argv.slice(2)
const command = basename(process.argv[1])
const dir = process.env.TEST_DIRECTORY
appendFileSync(join(dir, 'calls'), JSON.stringify({command, args}) + '\\n')
if (command === 'git') {
  if (args[0] === 'rev-parse') console.log(process.env.RELEASE_SHA)
  if (args[0] === 'merge-base' && process.env.TEST_NOT_MAIN) process.exit(1)
}
if (command === 'gh') {
  if (args[0] === 'run') console.log(process.env.TEST_CI_COUNT || '1')
  if (args[0] === 'release' && args[1] === 'view') process.exit(1)
  if (args[0] === 'release' && args[1] === 'create') {
    const files = Object.fromEntries(args.filter(p => existsSync(p)).map(p => [basename(p), readFileSync(p, 'utf8')]))
    writeFileSync(join(dir, 'release'), JSON.stringify(files))
  }
}
if (command === 'docker') {
  if (args[2] === 'inspect') {
    const version = args[3].includes(':v')
    if (version && process.env.TEST_REGISTRY_ERROR) { console.error('registry temporarily unavailable'); process.exit(1) }
    if (version && !process.env.TEST_EXISTING_VERSION && !existsSync(join(dir, 'promoted'))) { console.error('image: not found'); process.exit(1) }
    console.log(JSON.stringify({digest: version && process.env.TEST_WRONG_DIGEST ? 'sha256:' + 'c'.repeat(64) : process.env.TEST_DIGEST}))
  }
  if (args[2] === 'create') writeFileSync(join(dir, 'promoted'), 'yes')
}
`
  for (const name of ['git', 'gh', 'docker']) {
    writeFileSync(join(directory, name), commands, { mode: 0o755 })
  }
  try {
    const result = spawnSync('bash', ['deploy/release.sh'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, RELEASE_TAG: 'v1.2.3', RELEASE_SHA: commit,
        GITHUB_REPOSITORY: 'JojoShine/tbtparent-me', TEST_DIRECTORY: directory, TEST_DIGEST: digest, ...overrides },
    })
    return {
      ...result,
      calls: readFileSync(join(directory, 'calls'), 'utf8').trim().split('\n').map(line => JSON.parse(line)),
      files: existsSync(join(directory, 'release')) ? JSON.parse(readFileSync(join(directory, 'release'), 'utf8')) : null,
    }
  } finally { rmSync(directory, { recursive: true, force: true }) }
}

test('release promotes the verified digest unchanged and attaches matching deployment assets', () => {
  const result = release()
  assert.equal(result.status, 0, result.stderr)
  const promotion = result.calls.find(call => call.command === 'docker' && call.args[2] === 'create')
  assert.deepEqual(promotion.args, ['buildx', 'imagetools', 'create', '--prefer-index=false', '--tag', `${image}:v1.2.3`, `${image}@${digest}`])
  assert.match(result.files['version.txt'], new RegExp(commit))
  assert.ok(result.files['.env.prod.example'].includes(`APP_IMAGE=${image}@${digest}`))
  assert.ok(result.files['compose.prod.yaml'].includes('${APP_IMAGE:?APP_IMAGE is required}'))
})

for (const [name, env] of [
  ['a commit outside main', { TEST_NOT_MAIN: '1' }],
  ['a commit with no successful main CI', { TEST_CI_COUNT: '0' }],
  ['a promotion with a changed digest', { TEST_WRONG_DIGEST: '1' }],
]) {
  test(`release refuses ${name}`, () => {
    const result = release(env)
    assert.notEqual(result.status, 0)
    assert.equal(result.files, null)
  })
}


test('release stops on registry lookup errors instead of treating them as missing tags', () => {
  const result = release({ TEST_REGISTRY_ERROR: '1' })
  assert.notEqual(result.status, 0)
  assert.equal(result.calls.some(call => call.command === 'docker' && call.args[2] === 'create'), false)
  assert.equal(result.files, null)
})

test('release can resume after the version tag was already created with the exact digest', () => {
  const result = release({ TEST_EXISTING_VERSION: '1' })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.calls.some(call => call.command === 'docker' && call.args[2] === 'create'), false)
  assert.ok(result.files['version.txt'].includes(digest))
})
