import type { ClassFixChange } from './types'

interface ParsedClass {
  raw: string
  variants: string
  important: boolean
  base: string
  group: string | null
}

// Utility group patterns that conflict when sharing identical variants
const CONFLICT_GROUPS: Array<{ name: string; pattern: RegExp }> = [
  // Display
  { name: 'display', pattern: /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/ },
  // Position
  { name: 'position', pattern: /^(static|fixed|absolute|relative|sticky)$/ },
  // Overflow
  { name: 'overflow-all', pattern: /^overflow-(auto|hidden|clip|visible|scroll)$/ },
  { name: 'overflow-x', pattern: /^overflow-x-(auto|hidden|clip|visible|scroll)$/ },
  { name: 'overflow-y', pattern: /^overflow-y-(auto|hidden|clip|visible|scroll)$/ },
  // Padding
  { name: 'p-all', pattern: /^p(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'px', pattern: /^px(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'py', pattern: /^py(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'pt', pattern: /^pt(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'pr', pattern: /^pr(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'pb', pattern: /^pb(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'pl', pattern: /^pl(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  // Margin
  { name: 'm-all', pattern: /^-?m(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'mx', pattern: /^-?mx(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'my', pattern: /^-?my(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'mt', pattern: /^-?mt(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'mr', pattern: /^-?mr(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'mb', pattern: /^-?mb(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'ml', pattern: /^-?ml(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  // Sizing
  { name: 'width', pattern: /^w-(auto|px|full|screen|min|max|fit|\d+|\d+\/\d+|-\[[^\]]+\]|\[[^\]]+\])$/ },
  { name: 'min-w', pattern: /^min-w-(0|full|min|max|fit|\[[^\]]+\])$/ },
  { name: 'max-w', pattern: /^max-w-(0|none|xs|sm|md|lg|xl|\d+xl|full|min|max|fit|prose|screen-[a-z0-9]+|\[[^\]]+\])$/ },
  { name: 'height', pattern: /^h-(auto|px|full|screen|min|max|fit|\d+|\d+\/\d+|-\[[^\]]+\]|\[[^\]]+\])$/ },
  { name: 'min-h', pattern: /^min-h-(0|full|screen|min|max|fit|\[[^\]]+\])$/ },
  { name: 'max-h', pattern: /^max-h-(0|px|full|screen|min|max|fit|\d+|\[[^\]]+\])$/ },
  // Colors & Backgrounds
  { name: 'bg-color', pattern: /^bg-(?!repeat|no-repeat|auto|cover|contain|bottom|center|left|right|top|fixed|local|scroll|clip|origin)([a-z0-9\-]+|\[[^\]]+\])(\/[a-z0-9.%]+)?$/ },
  { name: 'text-color', pattern: /^text-(?!left|center|right|justify|start|end|wrap|nowrap|balance|pretty|xs|sm|base|lg|xl|\d+xl)([a-z0-9\-]+|\[[^\]]+\])(\/[a-z0-9.%]+)?$/ },
  { name: 'border-color', pattern: /^border-(?!collapse|separate|solid|dashed|dotted|double|hidden|none|0|2|4|8|t|r|b|l|x|y)([a-z0-9\-]+|\[[^\]]+\])(\/[a-z0-9.%]+)?$/ },
  // Typography
  { name: 'font-size', pattern: /^text-(xs|sm|base|lg|xl|\d+xl|\[[^\]]+\])$/ },
  { name: 'font-weight', pattern: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[[^\]]+\])$/ },
  { name: 'text-align', pattern: /^text-(left|center|right|justify|start|end)$/ },
  { name: 'line-height', pattern: /^leading-(none|tight|snug|normal|relaxed|loose|\d+|\[[^\]]+\])$/ },
  { name: 'letter-spacing', pattern: /^tracking-(tighter|tight|normal|wide|wider|widest|\[[^\]]+\])$/ },
  // Flex & Grid
  { name: 'flex-direction', pattern: /^flex-(row|row-reverse|col|col-reverse)$/ },
  { name: 'flex-wrap', pattern: /^flex-(wrap|wrap-reverse|nowrap)$/ },
  { name: 'justify-content', pattern: /^justify-(start|end|center|between|around|evenly|normal|stretch)$/ },
  { name: 'justify-items', pattern: /^justify-items-(start|end|center|stretch)$/ },
  { name: 'justify-self', pattern: /^justify-self-(auto|start|end|center|stretch)$/ },
  { name: 'align-content', pattern: /^content-(normal|center|start|end|between|around|evenly|baseline|stretch)$/ },
  { name: 'align-items', pattern: /^items-(start|end|center|baseline|stretch)$/ },
  { name: 'align-self', pattern: /^self-(auto|start|end|center|stretch|baseline)$/ },
  { name: 'gap-all', pattern: /^gap(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'gap-x', pattern: /^gap-x(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  { name: 'gap-y', pattern: /^gap-y(-\d+|\/[^/]+|-[a-z0-9.]+|-\[[^\]]+\])$/ },
  // Border Radius
  { name: 'rounded-all', pattern: /^rounded(-none|-sm|-md|-lg|-xl|-\d+xl|-full|-\[[^\]]+\])?$/ },
  { name: 'rounded-t', pattern: /^rounded-t(-none|-sm|-md|-lg|-xl|-\d+xl|-full|-\[[^\]]+\])?$/ },
  { name: 'rounded-r', pattern: /^rounded-r(-none|-sm|-md|-lg|-xl|-\d+xl|-full|-\[[^\]]+\])?$/ },
  { name: 'rounded-b', pattern: /^rounded-b(-none|-sm|-md|-lg|-xl|-\d+xl|-full|-\[[^\]]+\])?$/ },
  { name: 'rounded-l', pattern: /^rounded-l(-none|-sm|-md|-lg|-xl|-\d+xl|-full|-\[[^\]]+\])?$/ },
  // Opacity & Effects
  { name: 'opacity', pattern: /^opacity-(\d+|\[[^\]]+\])$/ },
  { name: 'shadow', pattern: /^shadow(-inner|-none|-sm|-md|-lg|-xl|-\d+xl|-\[[^\]]+\])?$/ },
  { name: 'z-index', pattern: /^-?z-(\d+|auto|\[[^\]]+\])$/ },
  { name: 'cursor', pattern: /^cursor-(auto|default|pointer|wait|text|move|help|not-allowed|none|context-menu|progress|cell|crosshair|vertical-text|alias|copy|no-drop|grab|grabbing|all-scroll|col-resize|row-resize|n-resize|e-resize|s-resize|w-resize|ne-resize|nw-resize|se-resize|sw-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|zoom-in|zoom-out)$/ },
  { name: 'visibility', pattern: /^(visible|invisible|collapse)$/ },
]

function parseClass(raw: string): ParsedClass {
  let str = raw
  let important = false

  if (str.startsWith('!')) {
    important = true
    str = str.slice(1)
  }

  // Extract variants (e.g. md:hover:dark:)
  const lastColon = str.lastIndexOf(':')
  let variants = ''
  let base = str

  if (lastColon !== -1) {
    variants = str.slice(0, lastColon + 1)
    base = str.slice(lastColon + 1)
  }

  if (base.startsWith('!')) {
    important = true
    base = base.slice(1)
  }

  let group: string | null = null
  for (const cg of CONFLICT_GROUPS) {
    if (cg.pattern.test(base)) {
      group = cg.name
      break
    }
  }

  return { raw, variants, important, base, group }
}

/**
 * Resolves conflicting utility classes within the same variant scope.
 * The rightmost class wins and previous conflicting classes are removed.
 */
export function resolveClassConflicts(classes: string[]): { result: string[]; changes: ClassFixChange[] } {
  const parsed = classes.map(parseClass)
  const changes: ClassFixChange[] = []
  const toRemoveIndices = new Set<number>()

  // Map of `variants + important + group` to index of latest occurrence
  const latestGroupIndex = new Map<string, number>()

  // Traverse from right to left to keep the last occurrence
  for (let i = parsed.length - 1; i >= 0; i--) {
    const item = parsed[i]
    if (!item.group) continue

    const key = `${item.variants}__${item.important}__${item.group}`

    if (latestGroupIndex.has(key)) {
      // An earlier (more left) item conflicts with a later (more right) item
      toRemoveIndices.add(i)
      const winningIndex = latestGroupIndex.get(key)!
      changes.push({
        type: 'conflict',
        original: item.raw,
        replacement: null,
        reason: `Removed '${item.raw}' because it conflicts with '${parsed[winningIndex].raw}'`,
      })
    } else {
      latestGroupIndex.set(key, i)
    }
  }

  const result = classes.filter((_, idx) => !toRemoveIndices.has(idx))
  return { result, changes }
}
