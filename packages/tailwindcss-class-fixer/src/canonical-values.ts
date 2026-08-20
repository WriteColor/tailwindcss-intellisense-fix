import type { ClassFixChange } from './types'

const SPACING_PREFIX_REGEX =
  /^(-?)(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|w|h|min-w|min-h|max-w|max-h|size|gap|gap-x|gap-y|top|bottom|left|right|start|end|inset|inset-x|inset-y|translate-x|translate-y|space-x|space-y|scroll-m|scroll-p)-\[(-?)([\d.]+)(px|rem)\]$/

const RADIUS_PREFIX_REGEX =
  /^(rounded|rounded-t|rounded-b|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|rounded-s|rounded-e|rounded-ss|rounded-se|rounded-es|rounded-ee)-\[([\d.]+)(px|rem)\]$/

const BORDER_WIDTH_PREFIX_REGEX =
  /^(border|border-t|border-b|border-l|border-r|border-x|border-y|border-s|border-e|divide-x|divide-y|outline|ring)-\[(\d+)px\]$/

const FONT_SIZE_REGEX = /^text-\[([\d.]+)(px|rem)\]$/
const FONT_WEIGHT_REGEX = /^font-\[(\d+)\]$/
const TRACKING_REGEX = /^tracking-\[(-?[\d.]+)em\]$/
const LEADING_REGEX = /^leading-\[([\d.]+)\]$/
const OPACITY_REGEX = /^opacity-\[([\d.]+)%?\]$/
const Z_INDEX_REGEX = /^z-\[(\d+|auto)\]$/
const BLUR_REGEX = /^blur-\[(\d+)px\]$/

// Radius mapping (Tailwind CSS v4 & standard scale)
const RADIUS_MAP_PX: Record<number, string> = {
  0: 'none',
  2: 'xs',
  4: 'lg', // In v4 / shadcn --radius: 4px = rounded-lg (or rounded-md)
  6: 'md',
  8: 'lg',
  12: 'xl',
  16: '2xl',
  24: '3xl',
  9999: 'full',
}

const RADIUS_MAP_REM: Record<number, string> = {
  0: 'none',
  0.125: 'xs',
  0.25: 'lg',
  0.375: 'md',
  0.5: 'lg',
  0.75: 'xl',
  1: '2xl',
  1.5: '3xl',
}

// Font sizes
const FONT_SIZE_MAP_PX: Record<number, string> = {
  12: 'xs',
  14: 'sm',
  16: 'base',
  18: 'lg',
  20: 'xl',
  24: '2xl',
  30: '3xl',
  36: '4xl',
  48: '5xl',
  60: '6xl',
  72: '7xl',
  96: '8xl',
  128: '9xl',
}

const FONT_SIZE_MAP_REM: Record<number, string> = {
  0.75: 'xs',
  0.875: 'sm',
  1: 'base',
  1.125: 'lg',
  1.25: 'xl',
  1.5: '2xl',
  1.875: '3xl',
  2.25: '4xl',
  3: '5xl',
  3.75: '6xl',
  4.5: '7xl',
  6: '8xl',
  8: '9xl',
}

// Font weights
const FONT_WEIGHT_MAP: Record<number, string> = {
  100: 'thin',
  200: 'extralight',
  300: 'light',
  400: 'normal',
  500: 'medium',
  600: 'semibold',
  700: 'bold',
  800: 'extrabold',
  900: 'black',
}

// Tracking
const TRACKING_MAP: Record<string, string> = {
  '-0.05': 'tighter',
  '-0.025': 'tight',
  '0': 'normal',
  '0.025': 'wide',
  '0.05': 'wider',
  '0.1': 'widest',
}

// Leading
const LEADING_MAP: Record<string, string> = {
  '1': 'none',
  '1.25': 'tight',
  '1.375': 'snug',
  '1.5': 'normal',
  '1.625': 'relaxed',
  '2': 'loose',
}

// Blur
const BLUR_MAP_PX: Record<number, string> = {
  0: 'none',
  4: 'sm',
  8: '', // blur
  12: 'md',
  16: 'lg',
  24: 'xl',
  40: '2xl',
  64: '3xl',
}

/**
 * Converts arbitrary pixel/rem dimensions to canonical numeric scale utilities in Tailwind v4.
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
  const spacingMatch = SPACING_PREFIX_REGEX.exec(base)
  if (spacingMatch) {
    const [, outerNeg, prefix, innerNeg, numStr, unit] = spacingMatch
    const isNegative = outerNeg === '-' || innerNeg === '-'
    const num = parseFloat(numStr)

    let numericScale: number | null = null

    if (unit === 'px') {
      const scale = num / 4
      if (Number.isInteger(scale) || scale % 0.25 === 0 || scale % 0.5 === 0) {
        numericScale = scale
      }
    } else if (unit === 'rem') {
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

  // 3. Check border radius [Npx] / [Nrem]
  const radiusMatch = RADIUS_PREFIX_REGEX.exec(base)
  if (radiusMatch) {
    const [, prefix, numStr, unit] = radiusMatch
    const num = parseFloat(numStr)
    let canonicalSuffix: string | undefined

    if (unit === 'px') {
      canonicalSuffix = RADIUS_MAP_PX[num]
    } else if (unit === 'rem') {
      canonicalSuffix = RADIUS_MAP_REM[num]
    }

    if (canonicalSuffix !== undefined) {
      const formatted = canonicalSuffix === '' ? prefix : `${prefix}-${canonicalSuffix}`
      return `${variants}${important}${formatted}`
    }
  }

  // 4. Check border width / outline / ring
  const borderMatch = BORDER_WIDTH_PREFIX_REGEX.exec(base)
  if (borderMatch) {
    const [, prefix, numStr] = borderMatch
    const num = parseInt(numStr, 10)
    if (num === 0) {
      return `${variants}${important}${prefix}-0`
    }
    if (num === 1) {
      const res = prefix === 'border' ? 'border' : `${prefix}-1`
      return `${variants}${important}${res}`
    }
    if ([2, 3, 4, 8].includes(num)) {
      return `${variants}${important}${prefix}-${num}`
    }
  }

  // 5. Check font size
  const fontMatch = FONT_SIZE_REGEX.exec(base)
  if (fontMatch) {
    const [, numStr, unit] = fontMatch
    const num = parseFloat(numStr)
    const sizeName = unit === 'px' ? FONT_SIZE_MAP_PX[num] : FONT_SIZE_MAP_REM[num]
    if (sizeName) {
      return `${variants}${important}text-${sizeName}`
    }
  }

  // 6. Check font weight
  const weightMatch = FONT_WEIGHT_REGEX.exec(base)
  if (weightMatch) {
    const [, numStr] = weightMatch
    const weightName = FONT_WEIGHT_MAP[parseInt(numStr, 10)]
    if (weightName) {
      return `${variants}${important}font-${weightName}`
    }
  }

  // 7. Check tracking
  const trackingMatch = TRACKING_REGEX.exec(base)
  if (trackingMatch) {
    const [, val] = trackingMatch
    const trackName = TRACKING_MAP[val]
    if (trackName) {
      return `${variants}${important}tracking-${trackName}`
    }
  }

  // 8. Check leading
  const leadingMatch = LEADING_REGEX.exec(base)
  if (leadingMatch) {
    const [, val] = leadingMatch
    const leadName = LEADING_MAP[val]
    if (leadName) {
      return `${variants}${important}leading-${leadName}`
    }
  }

  // 9. Check opacity
  const opacityMatch = OPACITY_REGEX.exec(base)
  if (opacityMatch) {
    const [, valStr] = opacityMatch
    const val = parseFloat(valStr)
    if (val <= 1 && !base.includes('%')) {
      const pct = Math.round(val * 100)
      return `${variants}${important}opacity-${pct}`
    } else if (val >= 0 && val <= 100) {
      return `${variants}${important}opacity-${Math.round(val)}`
    }
  }

  // 10. Check z-index
  const zMatch = Z_INDEX_REGEX.exec(base)
  if (zMatch) {
    const [, val] = zMatch
    return `${variants}${important}z-${val}`
  }

  // 11. Check blur
  const blurMatch = BLUR_REGEX.exec(base)
  if (blurMatch) {
    const [, numStr] = blurMatch
    const suffix = BLUR_MAP_PX[parseInt(numStr, 10)]
    if (suffix !== undefined) {
      return `${variants}${important}${suffix === '' ? 'blur' : `blur-${suffix}`}`
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
