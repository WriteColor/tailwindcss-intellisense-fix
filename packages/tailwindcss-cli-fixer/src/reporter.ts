import type { ClassFixChange, TextEditChange } from '@tailwindcss/class-fixer'

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
}

export interface FileReport {
  filePath: string
  hasChanges: boolean
  edits: TextEditChange[]
}

export interface CliSummary {
  totalFiles: number
  modifiedFiles: number
  totalChanges: number
  changesByType: Record<string, number>
}

export function printFileDiff(filePath: string, edits: TextEditChange[]): void {
  console.log(`\n${colors.cyan}${colors.bold}● ${filePath}${colors.reset}`)
  for (const edit of edits) {
    for (const change of edit.changes) {
      const typeBadge = {
        dedupe: `${colors.yellow}[DEDUPE]${colors.reset}`,
        conflict: `${colors.red}[CONFLICT]${colors.reset}`,
        migration: `${colors.magenta}[MIGRATE]${colors.reset}`,
        typo: `${colors.blue}[TYPO]${colors.reset}`,
        sort: `${colors.gray}[SORT]${colors.reset}`,
      }[change.type] || `[${change.type}]`

      console.log(`  ${typeBadge} ${colors.gray}${change.reason}${colors.reset}`)
      if (change.replacement !== null) {
        console.log(`    ${colors.red}- ${change.original}${colors.reset}`)
        console.log(`    ${colors.green}+ ${change.replacement}${colors.reset}`)
      } else {
        console.log(`    ${colors.red}- ${change.original}${colors.reset}`)
      }
    }
  }
}

export function printSummary(summary: CliSummary, isCheckMode: boolean): void {
  console.log(`\n${colors.bold}----------------------------------------${colors.reset}`)
  console.log(`${colors.bold}Tailwind CSS Fixer Summary:${colors.reset}`)
  console.log(`  Total files scanned:    ${summary.totalFiles}`)
  console.log(`  Files requiring fixes:  ${summary.modifiedFiles}`)
  console.log(`  Total issues fixed:     ${summary.totalChanges}`)

  if (summary.totalChanges > 0) {
    console.log(`\n${colors.dim}Breakdown:${colors.reset}`)
    for (const [type, count] of Object.entries(summary.changesByType)) {
      console.log(`    • ${type}: ${count}`)
    }
  }

  console.log(`${colors.bold}----------------------------------------${colors.reset}`)

  if (summary.modifiedFiles > 0) {
    if (isCheckMode) {
      console.log(
        `${colors.yellow}${colors.bold}⚠ Found ${summary.totalChanges} Tailwind issues across ${summary.modifiedFiles} files.${colors.reset}`,
      )
      console.log(`  Run with ${colors.green}--write${colors.reset} to apply all fixes automatically.\n`)
    } else {
      console.log(
        `${colors.green}${colors.bold}✔ Successfully fixed and formatted ${summary.totalChanges} issues across ${summary.modifiedFiles} files!${colors.reset}\n`,
      )
    }
  } else {
    console.log(`${colors.green}${colors.bold}✔ All Tailwind CSS classes are clean and optimized!${colors.reset}\n`)
  }
}
