import assert from 'node:assert/strict'
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

function publish(overrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'tbtparent-publish-'))
  const commit = 'a'.repeat(40)
  const digest = `sha256:${'b'.repeat(64)}`
  mkdirSync(join(directory, 'deploy'))
  for (const file of ['publish-candidate.sh', 'image-digest.sh']) copyFileSync(`deploy/${file}`, join(directory, 'deploy', file))
  writeFileSync(join(directory, 'deploy/verify-image.sh'), 'printf "%s" "$1" > "$TEST_DIRECTORY/verified"\n')
  writeFileSync(join(directory, 'docker'), `#!${process.execPath}
import { appendFileSync } from 'node:fs'
const args = process.argv.slice(2)
appendFileSync(process.env.TEST_DIRECTORY + '/calls', JSON.stringify(args) + '\\n')
if (args[0] === 'buildx') {
  if (process.env.TEST_REGISTRY_ERROR) { console.error('503 registry unavailable'); process.exit(1) }
  console.log(JSON.stringify({ digest: process.env.TEST_DIGEST }))
}
if (args[0] === 'image') console.log(args.at(-1).includes('revision') ? (process.env.TEST_REVISION || process.env.COMMIT_SHA) : 'https://github.com/JojoShine/tbtparent-me')
`, { mode: 0o755 })
  try {
    const result = spawnSync('bash', ['deploy/publish-candidate.sh'], {
      cwd: directory, encoding: 'utf8',
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, TEST_DIRECTORY: directory, COMMIT_SHA: commit,
        TEST_DIGEST: digest, GITHUB_STEP_SUMMARY: join(directory, 'summary'), ...overrides },
    })
    return { ...result, calls: readFileSync(join(directory, 'calls'), 'utf8'),
      verified: existsSync(join(directory, 'verified')) ? readFileSync(join(directory, 'verified'), 'utf8') : null,
      expectedImage: `ghcr.io/jojoshine/tbtparent-me@${digest}` }
  } finally { rmSync(directory, { recursive: true, force: true }) }
}

test('candidate publication resumes by validating the original image without overwriting its tag', () => {
  const result = publish()
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.verified, result.expectedImage)
  assert.doesNotMatch(result.calls, /"push"|"tag"|"load"/)
})

for (const [name, env] of [
  ['registry lookup failure', { TEST_REGISTRY_ERROR: '1' }],
  ['a candidate from another commit', { TEST_REVISION: 'c'.repeat(40) }],
]) {
  test(`candidate publication stops on ${name}`, () => {
    const result = publish(env)
    assert.notEqual(result.status, 0)
    assert.equal(result.verified, null)
    assert.doesNotMatch(result.calls, /"push"|"tag"|"load"/)
  })
}
