import type { ClassFixChange } from './types'

const SPACING_PREFIX_REGEX =
  /^(-?)(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|w|h|min-w|min-h|max-w|max-h|size|gap|gap-x|gap-y|top|bottom|left|right|start|end|inset|inset-x|inset-y|translate-x|translate-y)-\[(-?)([\d.]+)(px|rem)\]$/

/**
 * Converts arbitrary pixel/rem dimensions to canonical numeric scale utilities in Tailwind v4.
 * e.g. max-h-[600px] -> max-h-150, min-w-[96px] -> min-w-24, translate-y-[2.5rem] -> translate-y-10
 */
export function convertToCanonicalValue(className: string): string | null {
  const lastColon = className.lastIndexOf(':')
  const variants = lastColon !== -1 ? className.slice(0, lastColon + 1) : ''
  let base = lastColon !== -1 ? className.slice(lastColon + 1) : className
  const important = base.startsWith('!') || base.endsWith('!') ? '!' : ''
  base = base.replace(/!/g, '')

  // 1. Check v4 utility renames
  if (base === 'break-words') {
    return `${variants}${important}wrap-break-word`
  }

  // 2. Check spacing & sizing arbitrary values [Npx] or [Nrem]
  const match = SPACING_PREFIX_REGEX.exec(base)
  if (match) {
    const [, outerNeg, prefix, innerNeg, numStr, unit] = match
    const isNegative = outerNeg === '-' || innerNeg === '-'
    const num = parseFloat(numStr)

    let numericScale: number | null = null

    if (unit === 'px') {
      // 1 unit in Tailwind = 4px (0.25rem)
      const scale = num / 4
      // Only simplify if it results in clean half/quarter steps (e.g. 1.25, 2.5, 45, 150)
      if (Number.isInteger(scale) || scale % 0.25 === 0 || scale % 0.5 === 0) {
        numericScale = scale
      }
    } else if (unit === 'rem') {
      // 1rem = 16px = 4 units
      const scale = num * 4
      if (Number.isInteger(scale) || scale % 0.25 === 0 || scale % 0.5 === 0) {
        numericScale = scale
      }
    }

    if (numericScale !== null) {
      const formattedScale = numericScale.toString()
      const negPrefix = isNegative ? '-' : ''
      return `${variants}${important}${negPrefix}${prefix}-${formattedScale}`
    }
  }

  return null
}

/**
 * Normalizes all classes to canonical Tailwind representations.
 */
export function canonicalizeValues(classes: string[]): {
  result: string[]
  changes: ClassFixChange[]
} {
  const result: string[] = []
  const changes: ClassFixChange[] = []

  for (const cls of classes) {
    const canonical = convertToCanonicalValue(cls)
    if (canonical && canonical !== cls) {
      changes.push({
        type: 'migration',
        original: cls,
        replacement: canonical,
        reason: `Canonicalized class '${cls}' to '${canonical}'`,
      })
      result.push(canonical)
    } else {
      result.push(cls)
    }
  }

  return { result, changes }
}
