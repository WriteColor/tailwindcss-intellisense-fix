import type { ClassFixChange, ParsedClass } from './types'

export function parseClass(rawClass: string): ParsedClass {
  const lastColon = rawClass.lastIndexOf(':')
  const variants = lastColon !== -1 ? rawClass.slice(0, lastColon + 1) : ''
  let base = lastColon !== -1 ? rawClass.slice(lastColon + 1) : rawClass
  const important = base.startsWith('!') || base.endsWith('!')
  base = base.replace(/!/g, '')

  return {
    raw: rawClass,
    variants,
    base,
    important,
  }
}

/**
 * Maps a base Tailwind class to its CSS conflict group.
 */
export function getConflictGroup(base: string): string | null {
  // 1. Spacing - Padding
  if (/^p-\S+$/.test(base)) return 'padding-all'
  if (/^px-\S+$/.test(base)) return 'padding-x'
  if (/^py-\S+$/.test(base)) return 'padding-y'
  if (/^pt-\S+$/.test(base)) return 'padding-t'
  if (/^pr-\S+$/.test(base)) return 'padding-r'
  if (/^pb-\S+$/.test(base)) return 'padding-b'
  if (/^pl-\S+$/.test(base)) return 'padding-l'
  if (/^ps-\S+$/.test(base)) return 'padding-s'
  if (/^pe-\S+$/.test(base)) return 'padding-e'

  // 2. Spacing - Margin
  if (/^-?m-\S+$/.test(base)) return 'margin-all'
  if (/^-?mx-\S+$/.test(base)) return 'margin-x'
  if (/^-?my-\S+$/.test(base)) return 'margin-y'
  if (/^-?mt-\S+$/.test(base)) return 'margin-t'
  if (/^-?mr-\S+$/.test(base)) return 'margin-r'
  if (/^-?mb-\S+$/.test(base)) return 'margin-b'
  if (/^-?ml-\S+$/.test(base)) return 'margin-l'
  if (/^-?ms-\S+$/.test(base)) return 'margin-s'
  if (/^-?me-\S+$/.test(base)) return 'margin-e'

  // 3. Sizing
  if (/^w-\S+$/.test(base)) return 'width'
  if (/^min-w-\S+$/.test(base)) return 'min-width'
  if (/^max-w-\S+$/.test(base)) return 'max-width'
  if (/^h-\S+$/.test(base)) return 'height'
  if (/^min-h-\S+$/.test(base)) return 'min-height'
  if (/^max-h-\S+$/.test(base)) return 'max-height'
  if (/^size-\S+$/.test(base)) return 'size'

  // 4. Layout & Display
  if (/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|table|table-row|table-cell|contents|flow-root|hidden)$/.test(base)) {
    return 'display'
  }
  if (/^(static|fixed|absolute|relative|sticky)$/.test(base)) return 'position'
  if (/^(visible|invisible|collapse)$/.test(base)) return 'visibility'

  // 5. Flexbox & Grid
  if (/^flex-(row|row-reverse|col|col-reverse)$/.test(base)) return 'flex-direction'
  if (/^flex-(wrap|wrap-reverse|nowrap)$/.test(base)) return 'flex-wrap'
  if (/^flex-(1|auto|initial|none|\[.+\])$/.test(base)) return 'flex-basis-grow-shrink'
  if (/^grow(-\d+)?$/.test(base)) return 'flex-grow'
  if (/^shrink(-\d+)?$/.test(base)) return 'flex-shrink'
  if (/^items-(start|end|center|baseline|stretch)$/.test(base)) return 'align-items'
  if (/^justify-(normal|start|end|center|between|around|evenly|stretch)$/.test(base)) return 'justify-content'
  if (/^justify-items-(start|end|center|stretch)$/.test(base)) return 'justify-items'
  if (/^justify-self-(auto|start|end|center|stretch)$/.test(base)) return 'justify-self'
  if (/^self-(auto|start|end|center|stretch|baseline)$/.test(base)) return 'align-self'
  if (/^content-(normal|start|end|center|between|around|evenly|baseline|stretch)$/.test(base)) return 'align-content'

  // 6. Typography
  if (/^text-(left|center|right|justify|start|end)$/.test(base)) return 'text-align'
  if (/^(text-ellipsis|text-clip|truncate)$/.test(base)) return 'text-overflow'
  if (/^text-(wrap|nowrap|balance|pretty)$/.test(base)) return 'text-wrap'
  if (/^font-(sans|serif|mono)$/.test(base)) return 'font-family'
  if (/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(base)) return 'font-weight'
  if (/^leading-\S+$/.test(base)) return 'line-height'
  if (/^tracking-\S+$/.test(base)) return 'letter-spacing'
  if (/^(uppercase|lowercase|capitalize|normal-case)$/.test(base)) return 'text-transform'
  if (/^(underline|overline|line-through|no-underline)$/.test(base)) return 'text-decoration'

  // Font Size (text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-[...px|rem|clamp...])
  if (/^text-(xs|sm|base|lg|xl|\d+xl|\[(\d+|clamp|rem|em|px|vw|vh|\.).+\])$/.test(base)) {
    return 'font-size'
  }

  // Text Color (text-white, text-black, text-red-500, text-foreground, etc.)
  if (/^text-/.test(base)) {
    return 'text-color'
  }

  // 7. Backgrounds & Colors
  if (/^bg-(linear|radial|conic)-to-\S+$/.test(base) || /^bg-gradient-to-\S+$/.test(base)) return 'bg-gradient-direction'
  if (/^bg-/.test(base)) return 'bg-color'

  // 8. Borders & Outline
  if (/^rounded(-\S+)?$/.test(base)) return 'border-radius'
  if (/^border-(solid|dashed|dotted|double|hidden|none)$/.test(base)) return 'border-style'
  if (/^border-(\d+|\[\S+\])$/.test(base) || base === 'border') return 'border-width'
  if (/^border-/.test(base)) return 'border-color'
  if (/^outline-none|outline|outline-\S+$/.test(base)) return 'outline'
  if (/^ring(-\S+)?$/.test(base)) return 'ring'

  // 9. Effects & Interactivity
  if (/^opacity-\S+$/.test(base)) return 'opacity'
  if (/^shadow(-\S+)?$/.test(base)) return 'box-shadow'
  if (/^cursor-\S+$/.test(base)) return 'cursor'
  if (/^select-(none|text|all|auto)$/.test(base)) return 'user-select'
  if (/^pointer-events-(none|auto)$/.test(base)) return 'pointer-events'
  if (/^z-\S+$/.test(base)) return 'z-index'
  if (/^overflow-(auto|hidden|clip|visible|scroll|x-auto|x-hidden|x-clip|x-visible|x-scroll|y-auto|y-hidden|y-clip|y-visible|y-scroll)$/.test(base)) {
    return 'overflow'
  }

  return null
}

/**
 * Resolves conflicting Tailwind classes.
 * Follows rightmost-wins semantics (the last occurrence overrides previous conflicting ones).
 */
export function resolveConflicts(classes: string[]): {
  result: string[]
  changes: ClassFixChange[]
} {
  const seen = new Map<string, number>()
  const parsed = classes.map(parseClass)
  const changes: ClassFixChange[] = []
  const toRemove = new Set<number>()

  // Scan backwards to find the winning (rightmost) class for each conflict group
  for (let i = parsed.length - 1; i >= 0; i--) {
    const item = parsed[i]
    const group = getConflictGroup(item.base)

    if (!group) continue

    // The key combines the variant scope and conflict group (e.g. "hover:bg-color")
    const key = `${item.variants}::${group}`

    if (seen.has(key)) {
      toRemove.add(i)
      const winningIdx = seen.get(key)!
      const winningClass = classes[winningIdx]
      changes.push({
        type: 'conflict',
        original: item.raw,
        reason: `Removed '${item.raw}' because it conflicts with '${winningClass}'`,
      })
    } else {
      seen.set(key, i)
    }
  }

  const result = classes.filter((_, i) => !toRemove.has(i))
  return { result, changes }
}
