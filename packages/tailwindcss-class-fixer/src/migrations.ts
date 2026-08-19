import type { ClassFixChange } from './types'

// Direct 1-to-1 replacements
const DIRECT_MIGRATIONS: Record<string, string> = {
  'overflow-ellipsis': 'text-ellipsis',
  'overflow-clip': 'text-clip',
  'flex-grow': 'grow',
  'flex-grow-0': 'grow-0',
  'flex-shrink': 'shrink',
  'flex-shrink-0': 'shrink-0',
  'decoration-slice': 'box-decoration-slice',
  'decoration-clone': 'box-decoration-clone',
}

/**
 * Migrates deprecated or legacy Tailwind CSS class names to modern (v3/v4) equivalents.
 */
export function migrateClasses(
  classes: string[],
  targetVersion: 'v3' | 'v4' = 'v4',
): { result: string[]; changes: ClassFixChange[] } {
  const changes: ClassFixChange[] = []
  const result: string[] = []

  // Buffer to handle pairing of background/text colors with standalone opacity utilities
  let pendingBgOpacity: { index: number; opacity: string; variants: string } | null = null
  let pendingTextOpacity: { index: number; opacity: string; variants: string } | null = null
  let pendingBorderOpacity: { index: number; opacity: string; variants: string } | null = null

  for (let i = 0; i < classes.length; i++) {
    const raw = classes[i]
    const lastColon = raw.lastIndexOf(':')
    const variants = lastColon !== -1 ? raw.slice(0, lastColon + 1) : ''
    let base = lastColon !== -1 ? raw.slice(lastColon + 1) : raw
    const important = base.startsWith('!') ? '!' : ''
    if (important) base = base.slice(1)

    // Check direct migrations
    if (DIRECT_MIGRATIONS[base]) {
      const newBase = DIRECT_MIGRATIONS[base]
      const migrated = `${variants}${important}${newBase}`
      changes.push({
        type: 'migration',
        original: raw,
        replacement: migrated,
        reason: `Migrated deprecated class '${raw}' to modern equivalent '${migrated}'`,
      })
      result.push(migrated)
      continue
    }

    // Check opacity helper conversions in v4 (e.g. bg-opacity-50 -> merged with bg color or converted)
    const bgOpacityMatch = base.match(/^bg-opacity-(\d+)$/)
    if (bgOpacityMatch && targetVersion === 'v4') {
      const opacityVal = bgOpacityMatch[1]
      // Check if previous class in result is a bg-color with same variants
      const prevBgIdx = result.findIndex((r, idx) => {
        const pLastColon = r.lastIndexOf(':')
        const pVariants = pLastColon !== -1 ? r.slice(0, pLastColon + 1) : ''
        const pBase = pLastColon !== -1 ? r.slice(pLastColon + 1) : r
        return pVariants === variants && pBase.startsWith('bg-') && !pBase.includes('/') && !pBase.startsWith('bg-opacity')
      })

      if (prevBgIdx !== -1) {
        const oldBg = result[prevBgIdx]
        const mergedBg = `${oldBg}/${opacityVal}`
        result[prevBgIdx] = mergedBg
        changes.push({
          type: 'migration',
          original: `${oldBg} ${raw}`,
          replacement: mergedBg,
          reason: `Combined '${oldBg}' and '${raw}' into modern slash syntax '${mergedBg}'`,
        })
        // Omit the separate bg-opacity class
        continue
      } else {
        // Freestanding opacity migration
        const fallback = `${variants}${important}bg-black/${opacityVal}`
        changes.push({
          type: 'migration',
          original: raw,
          replacement: fallback,
          reason: `Converted deprecated '${raw}' to modern opacity syntax`,
        })
        result.push(fallback)
        continue
      }
    }

    result.push(raw)
  }

  return { result, changes }
}
