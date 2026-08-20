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
import { canonicalizeValues } from './canonical-values'
import { sortClasses } from './sorter'
import { fixTypos } from './typo-fixer'
import { extractClassRanges } from './universal-parser'

export * from './types'
export * from './dedupe'
export * from './conflicts'
export * from './migrations'
export * from './canonical-values'
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

/**
 * Executes a single optimization pass across a list of classes.
 */
function executePass(
  inputClasses: string[],
  options: ClassFixOptions,
): { classes: string[]; changes: ClassFixChange[] } {
  let classes = [...inputClasses]
  const passChanges: ClassFixChange[] = []

  // 1. Migrations & Canonical Values (v3 to v4, gradient syntax, arbitrary radius/border/text)
  if (options.migrateVersion) {
    const migResult = migrateClasses(classes, options.migrateVersion)
    classes = migResult.result
    passChanges.push(...migResult.changes)

    const canonResult = canonicalizeValues(classes)
    classes = canonResult.result
    passChanges.push(...canonResult.changes)
  }

  // 2. Deduplication
  if (options.dedupe) {
    const dedupeResult = dedupeClasses(classes)
    classes = dedupeResult.result
    passChanges.push(...dedupeResult.changes)
  }

  // 3. Conflict Resolution
  if (options.resolveConflicts) {
    const conflictResult = resolveClassConflicts(classes)
    classes = conflictResult.result
    passChanges.push(...conflictResult.changes)
  }

  // 4. Typo corrections
  if (options.fixTypos) {
    const typoResult = fixTypos(classes, options.customDictionary)
    classes = typoResult.result
    passChanges.push(...typoResult.changes)
  }

  // 5. Canonical sorting
  if (options.sort) {
    const sortResult = sortClasses(classes)
    classes = sortResult.result
    passChanges.push(...sortResult.changes)
  }

  return { classes, changes: passChanges }
}

/**
 * Optimizes, fixes, migrates, deduplicates, and sorts a class string using
 * a multi-pass fixed-point convergence algorithm.
 */
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

  let classes = input.trim().split(/\s+/).filter(Boolean)
  if (classes.length === 0) {
    return {
      original: input,
      fixed: input,
      hasChanges: false,
      changes: [],
    }
  }

  const allChanges: ClassFixChange[] = []
  const MAX_PASSES = 4

  // Fixed-point convergence loop
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const beforeStr = classes.join(' ')
    const passRes = executePass(classes, options)
    classes = passRes.classes
    allChanges.push(...passRes.changes)

    const afterStr = classes.join(' ')
    if (beforeStr === afterStr) {
      // Reached steady state / fixed point
      break
    }
  }

  const fixedString = classes.join(' ')
  return {
    original: input,
    fixed: fixedString,
    hasChanges: fixedString !== input.trim() || allChanges.length > 0,
    changes: allChanges,
  }
}

/**
 * Optimizes an entire source document with multi-pass AST range extraction and editing.
 */
export function fixDocument(
  content: string,
  options?: DocumentFixOptions,
): DocumentFixResult {
  let currentText = content
  const aggregatedEdits: TextEditChange[] = []
  const MAX_DOC_PASSES = 3

  for (let docPass = 0; docPass < MAX_DOC_PASSES; docPass++) {
    const ranges = extractClassRanges(currentText, options?.fileName)
    if (ranges.length === 0) break

    const editsInPass: TextEditChange[] = []

    for (const range of ranges) {
      const fixResult = fixClassString(range.raw, options)
      if (fixResult.hasChanges && fixResult.fixed !== range.raw) {
        editsInPass.push({
          start: range.start,
          end: range.end,
          newText: fixResult.fixed,
          originalText: range.raw,
          changes: fixResult.changes,
        })
      }
    }

    if (editsInPass.length === 0) {
      // Document is completely clean and stable
      break
    }

    // Apply edits from back to front to preserve byte offsets
    editsInPass.sort((a, b) => b.start - a.start)
    let updated = currentText
    for (const edit of editsInPass) {
      updated = updated.slice(0, edit.start) + edit.newText + updated.slice(edit.end)
    }

    aggregatedEdits.push(...editsInPass)
    currentText = updated
  }

  return {
    originalText: content,
    fixedText: currentText,
    hasChanges: currentText !== content,
    edits: aggregatedEdits,
  }
}
