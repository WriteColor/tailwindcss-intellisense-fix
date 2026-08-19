#!/usr/bin/env node

import minimist from 'minimist'
import { runFixer } from './runner'

const argv = minimist(process.argv.slice(2), {
  boolean: ['write', 'check', 'diff', 'help', 'sort', 'dedupe', 'conflicts', 'typos'],
  string: ['migrate', 'cwd'],
  alias: {
    w: 'write',
    c: 'check',
    d: 'diff',
    h: 'help',
    m: 'migrate',
  },
  default: {
    sort: true,
    dedupe: true,
    conflicts: true,
    typos: true,
    diff: true,
    migrate: 'v4',
  },
})

if (argv.help) {
  console.log(`
Tailwind CSS IntelliSense Fixer CLI
Universal automated class optimization and fixer

Usage:
  tailwind-fix [options] [files/directories...]

Options:
  -w, --write          Apply fixes directly to files on disk (default: false / dry-run)
  -c, --check          Check for Tailwind issues without modifying (exits with code 1 if issues found)
  -d, --diff           Display visual diffs for all modified class lists (default: true)
  --no-diff            Disable visual diff output
  --no-sort            Disable canonical class sorting
  --no-dedupe          Disable duplicate class removal
  --no-conflicts       Disable conflict resolution
  --no-typos           Disable typo detection & correction
  -m, --migrate <v>    Migration target version: 'v4' (default), 'v3', or 'off'
  --cwd <path>         Working directory path
  -h, --help           Show this help message

Examples:
  pnpm tailwind-fix --check
  pnpm tailwind-fix --write src/
  pnpm tailwind-fix --write --migrate=v4
`)
  process.exit(0)
}

async function main() {
  const migrateOption =
    argv.migrate === 'v4' || argv.migrate === 'v3' ? argv.migrate : false

  const { hasErrors } = await runFixer({
    cwd: argv.cwd,
    paths: argv._.length > 0 ? argv._ : undefined,
    write: argv.write,
    check: argv.check,
    diff: argv.diff,
    sort: argv.sort,
    dedupe: argv.dedupe,
    resolveConflicts: argv.conflicts,
    fixTypos: argv.typos,
    migrateVersion: migrateOption,
  })

  if (hasErrors) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Error running Tailwind Fixer:', err)
  process.exit(1)
})
