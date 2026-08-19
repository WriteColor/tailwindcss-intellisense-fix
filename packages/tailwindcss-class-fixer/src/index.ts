import type {
  ClassFixOptions,
  ClassFixResult,
  ClassFixChange,
  DocumentFixOptions,
  DocumentFixResult,
  TextEditChange,
} from './types'
import { dedupeClasses } from './dedupe'
import { resolveClassConflicts } from './conflicts'
import { migrateClasses } from './migrations'
import { sortClasses } from './sorter'
import { fixTypos } from './typo-fixer'
import { extractClassRanges } from './universal-parser'

export * from './types'
export * from './dedupe'
export * from './conflicts'
export * from './migrations'
export * from './sorter'
export * from './typo-fixer'
export * from './universal-parser'

const DEFAULT_OPTIONS: ClassFixOptions = {
  dedupe: true,
  resolveConflicts: true,
  migrateVersion: 'v4',
  sort: true,
  fixTypos: true,
}

export function fixClassString(
  input: string,
  userOptions?: ClassFixOptions,
): ClassFixResult {
  const options: ClassFixOptions = {
    dedupe: userOptions?.dedupe ?? DEFAULT_OPTIONS.dedupe,
    resolveConflicts: userOptions?.resolveConflicts ?? DEFAULT_OPTIONS.resolveConflicts,
    migrateVersion:
      userOptions?.migrateVersion !== undefined
        ? userOptions.migrateVersion
        : DEFAULT_OPTIONS.migrateVersion,
    sort: userOptions?.sort ?? DEFAULT_OPTIONS.sort,
    fixTypos: userOptions?.fixTypos ?? DEFAULT_OPTIONS.fixTypos,
    customDictionary: userOptions?.customDictionary ?? DEFAULT_OPTIONS.customDictionary,
    tailwindVersion: userOptions?.tailwindVersion ?? DEFAULT_OPTIONS.tailwindVersion,
  }
  const changes: ClassFixChange[] = []


  let classes = input.trim().split(/\s+/).filter(Boolean)
  if (classes.length === 0) {
    return {
      original: input,
      fixed: input,
      hasChanges: false,
      changes: [],
    }
  }

  // 1. Migrations (e.g. deprecated utilities to modern v3/v4)
  if (options.migrateVersion) {
    const migResult = migrateClasses(classes, options.migrateVersion)
    classes = migResult.result
    changes.push(...migResult.changes)
  }

  // 2. Deduplication
  if (options.dedupe) {
    const dedupeResult = dedupeClasses(classes)
    classes = dedupeResult.result
    changes.push(...dedupeResult.changes)
  }

  // 3. Conflict Resolution
  if (options.resolveConflicts) {
    const conflictResult = resolveClassConflicts(classes)
    classes = conflictResult.result
    changes.push(...conflictResult.changes)
  }

  // 4. Typo corrections
  if (options.fixTypos) {
    const typoResult = fixTypos(classes, options.customDictionary)
    classes = typoResult.result
    changes.push(...typoResult.changes)
  }

  // 5. Canonical sorting
  if (options.sort) {
    const sortResult = sortClasses(classes)
    classes = sortResult.result
    changes.push(...sortResult.changes)
  }

  const fixed = classes.join(' ')
  const hasChanges = fixed !== input.trim() || changes.length > 0

  return {
    original: input,
    fixed,
    hasChanges,
    changes,
  }
}

/**
 * Parses and fixes all Tailwind classes in any code/template document across any language.
 */
export function fixDocument(
  content: string,
  options?: DocumentFixOptions,
): DocumentFixResult {
  const ranges = extractClassRanges(content, options?.fileName)
  const edits: TextEditChange[] = []
  let fixedText = content
  let offsetShift = 0

  for (const range of ranges) {
    const fixResult = fixClassString(range.raw, options)
    if (fixResult.hasChanges && fixResult.fixed !== range.raw) {
      edits.push({
        start: range.start,
        end: range.end,
        originalText: range.raw,
        newText: fixResult.fixed,
        changes: fixResult.changes,
      })
    }
  }

  // Apply edits from end to start to avoid offset misalignment
  const sortedEdits = [...edits].sort((a, b) => b.start - a.start)
  for (const edit of sortedEdits) {
    fixedText =
      fixedText.slice(0, edit.start) + edit.newText + fixedText.slice(edit.end)
  }

  return {
    originalText: content,
    fixedText,
    hasChanges: edits.length > 0,
    edits,
  }
}
