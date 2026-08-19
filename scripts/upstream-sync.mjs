import { execSync } from 'node:child_process'
import * as fs from 'node:fs'

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
  } catch (err) {
    console.error(`Command failed: ${cmd}`, err.message)
    return null
  }
}

async function main() {
  console.log('Checking for upstream updates from tailwindlabs/tailwindcss-intellisense...')

  // Fetch upstream tags and main branch
  run('git fetch upstream main --tags')

  const behindCountStr = run('git rev-list --count HEAD..upstream/main') || '0'
  const behindCount = parseInt(behindCountStr, 10)

  console.log(`Commits behind upstream/main: ${behindCount}`)

  if (behindCount > 0) {
    console.log(`New upstream changes detected (${behindCount} commits). Merging upstream changes...`)
    
    // Attempt merge
    const mergeOutput = run('git merge upstream/main -m "chore(upstream): sync latest changes from upstream"')
    console.log(mergeOutput)

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_updates=true\n`)
    }
  } else {
    console.log('Already up-to-date with upstream/main.')
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_updates=false\n`)
    }
  }
}

main().catch((err) => {
  console.error('Upstream sync script error:', err)
  process.exit(1)
})
