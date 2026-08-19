import type { ClassFixChange } from './types'

/**
 * Deduplicates class names while preserving ordering and variant prefixes.
 */
export function dedupeClasses(classes: string[]): { result: string[]; changes: ClassFixChange[] } {
  const seen = new Set<string>()
  const result: string[] = []
  const changes: ClassFixChange[] = []

  for (const cls of classes) {
    const trimmed = cls.trim()
    if (!trimmed) continue

    if (seen.has(trimmed)) {
      changes.push({
        type: 'dedupe',
        original: trimmed,
        replacement: null,
        reason: `Removed duplicate class '${trimmed}'`,
      })
    } else {
      seen.add(trimmed)
      result.push(trimmed)
    }
  }

  return { result, changes }
}
