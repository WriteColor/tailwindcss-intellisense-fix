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

  const latestUpstreamTag = run('git describe --tags --abbrev=0 upstream/main') || 'v0.16.0'
  const currentTag = run('git describe --tags --abbrev=0') || 'v0.0.0'

  console.log(`Current local tag: ${currentTag}`)
  console.log(`Latest upstream tag: ${latestUpstreamTag}`)

  if (latestUpstreamTag !== currentTag) {
    console.log(`New upstream version detected: ${latestUpstreamTag}. Re-basing upstream changes...`)
    
    // Attempt merge/rebase
    const mergeOutput = run('git merge upstream/main -m "chore(upstream): sync with ' + latestUpstreamTag + '"')
    console.log(mergeOutput)

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_updates=true\nnew_version=${latestUpstreamTag}\n`)
    }
  } else {
    console.log('Already up-to-date with upstream.')
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_updates=false\n`)
    }
  }
}

main().catch((err) => {
  console.error('Upstream sync script error:', err)
  process.exit(1)
})
