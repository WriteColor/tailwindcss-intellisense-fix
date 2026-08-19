import { exec } from 'node:child_process'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { glob } from 'tinyglobby'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const root = path.resolve(__dirname, '..')

const fixtures = await glob({
  cwd: root,
  patterns: ['tests/fixtures/*/package.json', 'tests/fixtures/v4/*/package.json'],
  absolute: true,
})

const execAsync = promisify(exec)

for (const fixture of fixtures) {
  console.log(`Installing dependencies for ${path.relative(root, fixture)}`)
  try {
    await execAsync('pnpm install --no-frozen-lockfile --ignore-workspace', { cwd: path.dirname(fixture) })
  } catch (err) {
    console.warn(`Warning: Fixture install issue in ${fixture}:`, err.message)
  }
}

