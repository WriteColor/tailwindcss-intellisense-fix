import type { ClassFixChange } from './types'

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1,     // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

const COMMON_TAILWIND_UTILITIES = [
  'flex', 'grid', 'block', 'inline-block', 'inline', 'hidden',
  'absolute', 'relative', 'fixed', 'sticky',
  'w-full', 'w-screen', 'w-auto', 'w-fit', 'h-full', 'h-screen', 'h-auto', 'h-fit',
  'text-center', 'text-left', 'text-right', 'text-justify',
  'text-white', 'text-black', 'text-transparent',
  'bg-white', 'bg-black', 'bg-transparent',
  'font-bold', 'font-semibold', 'font-medium', 'font-normal', 'font-light',
  'rounded', 'rounded-md', 'rounded-lg', 'rounded-full', 'rounded-sm', 'rounded-xl', 'rounded-2xl',
  'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-none',
  'cursor-pointer', 'cursor-not-allowed', 'cursor-default',
  'items-center', 'items-start', 'items-end',
  'justify-center', 'justify-between', 'justify-start', 'justify-end',
  'flex-col', 'flex-row', 'flex-wrap',
  'truncate', 'text-ellipsis', 'grow', 'grow-0', 'shrink', 'shrink-0',
]

// Common valid pattern prefix check
const VALID_PREFIX_PATTERN = /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|min-w|min-h|max-w|max-h|gap|gap-x|gap-y|top|bottom|left|right|z|opacity|order|col|row|inset)-(\d+|\[[^\]]+\]|\d+\/\d+|auto|full|screen|px|fit)$/


/**
 * Finds closest matching valid utility for a suspected typo.
 */
export function suggestTypoFix(
  className: string,
  dictionary: string[] = COMMON_TAILWIND_UTILITIES,
): string | null {
  const lastColon = className.lastIndexOf(':')
  const variants = lastColon !== -1 ? className.slice(0, lastColon + 1) : ''
  const base = lastColon !== -1 ? className.slice(lastColon + 1) : className

  let bestMatch: string | null = null
  let minDistance = 3 // Max threshold

  // Exact match or valid pattern means no typo
  if (dictionary.includes(base) || VALID_PREFIX_PATTERN.test(base)) return null

  for (const candidate of dictionary) {
    const dist = levenshteinDistance(base, candidate)
    if (dist > 0 && dist <= 2 && dist < minDistance) {
      // Avoid matching completely different short words (e.g. 'pt-1' vs 'pl-1')
      if (base.length <= 3 && dist > 1) continue
      minDistance = dist
      bestMatch = candidate
    }
  }

  if (bestMatch) {
    return `${variants}${bestMatch}`
  }

  return null
}

/**
 * Detects and corrects typos in a class list.
 */
export function fixTypos(
  classes: string[],
  dictionary?: string[],
): { result: string[]; changes: ClassFixChange[] } {
  const result: string[] = []
  const changes: ClassFixChange[] = []

  for (const cls of classes) {
    const suggestion = suggestTypoFix(cls, dictionary)
    if (suggestion && suggestion !== cls) {
      changes.push({
        type: 'typo',
        original: cls,
        replacement: suggestion,
        reason: `Corrected typo '${cls}' to '${suggestion}'`,
      })
      result.push(suggestion)
    } else {
      result.push(cls)
    }
  }

  return { result, changes }
}
