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
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

const COMMON_TAILWIND_UTILITIES = new Set([
  // Layout & Display
  'container',
  'block',
  'inline-block',
  'inline',
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'table',
  'table-caption',
  'table-cell',
  'table-column',
  'table-row',
  'contents',
  'flow-root',
  'hidden',
  'visible',
  'invisible',
  'collapse',
  // Position
  'static',
  'fixed',
  'absolute',
  'relative',
  'sticky',
  'isolate',
  'isolation-auto',
  // Flex & Grid
  'flex-1',
  'flex-auto',
  'flex-initial',
  'flex-none',
  'flex-row',
  'flex-row-reverse',
  'flex-col',
  'flex-col-reverse',
  'flex-wrap',
  'flex-wrap-reverse',
  'flex-nowrap',
  'items-center',
  'items-start',
  'items-end',
  'items-baseline',
  'items-stretch',
  'justify-normal',
  'justify-start',
  'justify-end',
  'justify-center',
  'justify-between',
  'justify-around',
  'justify-evenly',
  'justify-stretch',
  'justify-items-start',
  'justify-items-end',
  'justify-items-center',
  'justify-items-stretch',
  'justify-self-auto',
  'justify-self-start',
  'justify-self-end',
  'justify-self-center',
  'justify-self-stretch',
  'content-normal',
  'content-start',
  'content-end',
  'content-center',
  'content-between',
  'content-around',
  'content-evenly',
  'content-baseline',
  'content-stretch',
  'self-auto',
  'self-start',
  'self-end',
  'self-center',
  'self-stretch',
  'self-baseline',
  'grow',
  'grow-0',
  'shrink',
  'shrink-0',
  // Typography
  'text-center',
  'text-left',
  'text-right',
  'text-justify',
  'text-start',
  'text-end',
  'text-ellipsis',
  'text-clip',
  'truncate',
  'text-wrap',
  'text-nowrap',
  'text-balance',
  'text-pretty',
  'wrap-break-word',
  'wrap-normal',
  'wrap-break-all',
  'uppercase',
  'lowercase',
  'capitalize',
  'normal-case',
  'italic',
  'not-italic',
  'underline',
  'overline',
  'line-through',
  'no-underline',
  'font-thin',
  'font-extralight',
  'font-light',
  'font-normal',
  'font-medium',
  'font-semibold',
  'font-bold',
  'font-extrabold',
  'font-black',
  'font-sans',
  'font-serif',
  'font-mono',
  // Sizing & Spacing keywords
  'w-full',
  'w-screen',
  'w-auto',
  'w-fit',
  'w-min',
  'w-max',
  'h-full',
  'h-screen',
  'h-auto',
  'h-fit',
  'h-min',
  'h-max',
  'min-w-0',
  'min-w-full',
  'min-w-min',
  'min-w-max',
  'min-w-fit',
  'min-h-0',
  'min-h-full',
  'min-h-screen',
  'min-h-min',
  'min-h-max',
  'min-h-fit',
  'max-w-none',
  'max-w-full',
  'max-w-min',
  'max-w-max',
  'max-w-fit',
  'max-w-prose',
  // Colors & Backgrounds
  'text-white',
  'text-black',
  'text-transparent',
  'text-current',
  'text-inherit',
  'bg-white',
  'bg-black',
  'bg-transparent',
  'bg-current',
  'bg-inherit',
  'border-transparent',
  'border-current',
  'border-white',
  'border-black',
  'outline-none',
  'outline-hidden',
  'outline-transparent',
  // Shapes & Borders (including Tailwind v4 rounded-xs, rounded-2xs, rounded-4xl)
  'rounded',
  'rounded-none',
  'rounded-2xs',
  'rounded-xs',
  'rounded-sm',
  'rounded-md',
  'rounded-lg',
  'rounded-xl',
  'rounded-2xl',
  'rounded-3xl',
  'rounded-4xl',
  'rounded-full',
  'border',
  'border-0',
  'border-2',
  'border-4',
  'border-8',
  'border-solid',
  'border-dashed',
  'border-dotted',
  'border-double',
  'border-none',
  // Effects & Interactivity (including shadow-2xs, shadow-xs)
  'shadow',
  'shadow-none',
  'shadow-2xs',
  'shadow-xs',
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-inner',
  'opacity-0',
  'opacity-5',
  'opacity-10',
  'opacity-20',
  'opacity-25',
  'opacity-30',
  'opacity-40',
  'opacity-50',
  'opacity-60',
  'opacity-70',
  'opacity-75',
  'opacity-80',
  'opacity-90',
  'opacity-95',
  'opacity-100',
  'cursor-auto',
  'cursor-default',
  'cursor-pointer',
  'cursor-wait',
  'cursor-text',
  'cursor-move',
  'cursor-help',
  'cursor-not-allowed',
  'cursor-none',
  'select-none',
  'select-text',
  'select-all',
  'select-auto',
  'pointer-events-none',
  'pointer-events-auto',
  'transition',
  'transition-all',
  'transition-colors',
  'transition-opacity',
  'transition-shadow',
  'transition-transform',
  'transition-none',
  'sr-only',
  'not-sr-only',
  'group',
  'peer',
])

// Prefix patterns that are valid Tailwind utilities
const VALID_PREFIX_PATTERNS = [
  // Sizing & Spacing
  /^-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|w|h|min-w|min-h|max-w|max-h|size|gap|gap-x|gap-y|space-x|space-y|top|bottom|left|right|start|end|inset|inset-x|inset-y)-/,
  // Grid & Flex
  /^(grid-cols|grid-rows|col-span|row-span|col-start|col-end|row-start|row-end|basis|order|auto-cols|auto-rows)-/,
  // Typography
  /^(text|font|leading|tracking|line-clamp|indent|decoration|underline-offset)-/,
  // Colors & Gradients
  /^(bg|text|border|outline|ring|ring-offset|divide|fill|stroke|accent|caret|from|via|to|bg-gradient|bg-linear|bg-radial|bg-conic)-/,
  // Effects & Filters
  /^(shadow|opacity|z|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop-blur|backdrop-brightness|backdrop-contrast|backdrop-grayscale|backdrop-invert|backdrop-opacity|backdrop-saturate|backdrop-sepia)-/,
  // Transitions & Transforms
  /^(duration|ease|delay|animate|scale|scale-x|scale-y|rotate|translate-x|translate-y|skew-x|skew-y|origin)-/,
  // Borders & Rounded
  /^(rounded|rounded-t|rounded-r|rounded-b|rounded-l|rounded-tl|rounded-tr|rounded-br|rounded-bl|rounded-s|rounded-e|rounded-ss|rounded-se|rounded-es|rounded-ee)-/,
  // Arbitrary variants & properties
  /^\[.+\]$/,
  /^\(.+\)$/,
  /^aria-/,
  /^data-/,
]

function isValidTailwindUtility(base: string): boolean {
  if (COMMON_TAILWIND_UTILITIES.has(base)) {
    return true
  }

  // Any arbitrary value, CSS variable, modifier, or opacity slash syntax
  if (
    base.includes('[') ||
    base.includes(']') ||
    base.includes('/') ||
    base.includes('(') ||
    base.includes(')')
  ) {
    return true
  }

  for (const pattern of VALID_PREFIX_PATTERNS) {
    if (pattern.test(base)) {
      return true
    }
  }

  return false
}

/**
 * Finds closest matching valid utility for a suspected typo.
 */
export function suggestTypoFix(
  className: string,
  dictionary?: string[],
): string | null {
  // If className contains non-standard characters like quotes, commas, or code punctuation, ignore
  if (/[',";?:]/.test(className.replace(/^.*:/, ''))) {
    return null
  }

  const lastColon = className.lastIndexOf(':')
  const variants = lastColon !== -1 ? className.slice(0, lastColon + 1) : ''
  let base = lastColon !== -1 ? className.slice(lastColon + 1) : className
  const important = base.startsWith('!') || base.endsWith('!') ? '!' : ''
  base = base.replace(/!/g, '')

  // If already a valid Tailwind class, don't touch it
  if (isValidTailwindUtility(base)) {
    return null
  }

  const dict = dictionary ? new Set(dictionary) : COMMON_TAILWIND_UTILITIES

  let bestMatch: string | null = null
  let minDistance = 3 // Max threshold

  for (const candidate of dict) {
    const dist = levenshteinDistance(base, candidate)
    if (dist > 0 && dist <= 2 && dist < minDistance) {
      // Avoid matching completely different short words (e.g. 'pt-1' vs 'pl-1')
      if (base.length <= 3 && dist > 1) continue
      // Don't match words of very different lengths
      if (Math.abs(base.length - candidate.length) > 2) continue
      minDistance = dist
      bestMatch = candidate
    }
  }

  if (bestMatch) {
    return `${variants}${important}${bestMatch}`
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
