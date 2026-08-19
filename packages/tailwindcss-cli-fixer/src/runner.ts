import * as fs from 'node:fs'
import * as path from 'node:path'
import { fixDocument, type DocumentFixOptions } from '@tailwindcss/class-fixer'
import { type CliSummary, printFileDiff, printSummary } from './reporter'

export interface RunnerOptions extends DocumentFixOptions {
  cwd?: string
  check?: boolean
  write?: boolean
  diff?: boolean
  paths?: string[]
  ignore?: string[]
}

const DEFAULT_EXTENSIONS = new Set([
  '.html', '.htm', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.astro',
  '.php', '.twig', '.jinja', '.jinja2', '.liquid', '.erb',
  '.rs', '.go', '.md', '.mdx', '.css', '.scss', '.postcss', '.heex', '.eex',
])

const DEFAULT_IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.turbo', '.cache',
  'vendor', 'target', '.vs', '.vscode', '.gemini',
])

export function collectFiles(dir: string, ignored: Set<string> = DEFAULT_IGNORE): string[] {
  const results: string[] = []

  function walk(currentDir: string) {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (ignored.has(entry.name) || entry.name.startsWith('.')) {
        continue
      }

      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (DEFAULT_EXTENSIONS.has(ext) || entry.name.endsWith('.blade.php')) {
          results.push(fullPath)
        }
      }
    }
  }

  walk(dir)
  return results
}

export async function runFixer(options: RunnerOptions): Promise<{ summary: CliSummary; hasErrors: boolean }> {
  const rootDir = options.cwd ? path.resolve(options.cwd) : process.cwd()
  let targetFiles: string[] = []

  if (options.paths && options.paths.length > 0) {
    for (const p of options.paths) {
      const resolved = path.resolve(rootDir, p)
      if (fs.existsSync(resolved)) {
        if (fs.statSync(resolved).isDirectory()) {
          targetFiles.push(...collectFiles(resolved))
        } else {
          targetFiles.push(resolved)
        }
      }
    }
  } else {
    targetFiles = collectFiles(rootDir)
  }

  const summary: CliSummary = {
    totalFiles: targetFiles.length,
    modifiedFiles: 0,
    totalChanges: 0,
    changesByType: {},
  }

  const shouldWrite = Boolean(options.write)
  const isCheckMode = Boolean(options.check) || !shouldWrite

  for (const filePath of targetFiles) {
    let content: string
    try {
      content = fs.readFileSync(filePath, 'utf-8')
    } catch {
      continue
    }

    const result = fixDocument(content, {
      fileName: filePath,
      dedupe: options.dedupe,
      resolveConflicts: options.resolveConflicts,
      sort: options.sort,
      migrateVersion: options.migrateVersion,
      fixTypos: options.fixTypos,
      customDictionary: options.customDictionary,
    })

    if (result.hasChanges) {
      summary.modifiedFiles++
      const fileChangesCount = result.edits.reduce((acc, e) => acc + e.changes.length, 0)
      summary.totalChanges += fileChangesCount

      for (const edit of result.edits) {
        for (const change of edit.changes) {
          summary.changesByType[change.type] = (summary.changesByType[change.type] || 0) + 1
        }
      }

      if (options.diff !== false) {
        const relativePath = path.relative(rootDir, filePath)
        printFileDiff(relativePath, result.edits)
      }

      if (shouldWrite) {
        fs.writeFileSync(filePath, result.fixedText, 'utf-8')
      }
    }
  }

  printSummary(summary, isCheckMode)

  return {
    summary,
    hasErrors: isCheckMode && summary.modifiedFiles > 0,
  }
}
