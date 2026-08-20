import type { ClassFixChange } from './types'

// Direct 1-to-1 replacements
const DIRECT_MIGRATIONS: Record<string, string> = {
  // Gradients (Tailwind v4 renamed bg-gradient-to-* to bg-linear-to-*)
  'bg-gradient-to-t': 'bg-linear-to-t',
  'bg-gradient-to-tr': 'bg-linear-to-tr',
  'bg-gradient-to-r': 'bg-linear-to-r',
  'bg-gradient-to-br': 'bg-linear-to-br',
  'bg-gradient-to-b': 'bg-linear-to-b',
  'bg-gradient-to-bl': 'bg-linear-to-bl',
  'bg-gradient-to-l': 'bg-linear-to-l',
  'bg-gradient-to-tl': 'bg-linear-to-tl',

  // Text & Word Break
  'overflow-ellipsis': 'text-ellipsis',
  'overflow-clip': 'text-clip',
  'break-words': 'wrap-break-word',
  'break-normal': 'wrap-normal',
  'break-all': 'wrap-break-all',

  // Flexbox
  'flex-grow': 'grow',
  'flex-grow-0': 'grow-0',
  'flex-shrink': 'shrink',
  'flex-shrink-0': 'shrink-0',

  // Box Decoration
  'decoration-slice': 'box-decoration-slice',
  'decoration-clone': 'box-decoration-clone',
}

const GRADIENT_DIRECTION_REGEX = /^bg-gradient-to-(.+)$/
const GRADIENT_ARBITRARY_REGEX = /^bg-gradient-\[(.+)\]$/

const OPACITY_HELPER_REGEX = /^(bg|text|border|ring|divide|placeholder)-opacity-(\d+)$/

/**
 * Migrates deprecated or legacy Tailwind CSS class names to modern (v3/v4) equivalents.
 * Supports multi-directional search to merge color + opacity classes regardless of their relative declaration order.
 */
export function migrateClasses(
  classes: string[],
  targetVersion: 'v3' | 'v4' = 'v4',
): { result: string[]; changes: ClassFixChange[] } {
  const changes: ClassFixChange[] = []
  let workingList = [...classes]

  // Step 1: Direct 1-to-1 replacements and gradient syntax migration
  const migratedStep1: string[] = []
  for (let i = 0; i < workingList.length; i++) {
    const raw = workingList[i]
    const lastColon = raw.lastIndexOf(':')
    const variants = lastColon !== -1 ? raw.slice(0, lastColon + 1) : ''
    let base = lastColon !== -1 ? raw.slice(lastColon + 1) : raw
    const important = base.startsWith('!') ? '!' : ''
    if (important) base = base.slice(1)

    // 1. Direct dictionary replacement
    if (DIRECT_MIGRATIONS[base]) {
      const newBase = DIRECT_MIGRATIONS[base]
      const migrated = `${variants}${important}${newBase}`
      changes.push({
        type: 'migration',
        original: raw,
        replacement: migrated,
        reason: `Migrated deprecated class '${raw}' to modern equivalent '${migrated}'`,
      })
      migratedStep1.push(migrated)
      continue
    }

    // 2. Generic gradient migration in v4 (bg-gradient-to-* -> bg-linear-to-*, bg-gradient-[*] -> bg-linear-[*])
    if (targetVersion === 'v4') {
      const gradMatch = GRADIENT_DIRECTION_REGEX.exec(base)
      if (gradMatch) {
        const dir = gradMatch[1]
        const migrated = `${variants}${important}bg-linear-to-${dir}`
        changes.push({
          type: 'migration',
          original: raw,
          replacement: migrated,
          reason: `Migrated gradient direction '${raw}' to v4 '${migrated}'`,
        })
        migratedStep1.push(migrated)
        continue
      }

      const gradArbMatch = GRADIENT_ARBITRARY_REGEX.exec(base)
      if (gradArbMatch) {
        const val = gradArbMatch[1]
        const migrated = `${variants}${important}bg-linear-[${val}]`
        changes.push({
          type: 'migration',
          original: raw,
          replacement: migrated,
          reason: `Migrated arbitrary gradient '${raw}' to v4 '${migrated}'`,
        })
        migratedStep1.push(migrated)
        continue
      }
    }

    migratedStep1.push(raw)
  }

  // Step 2: Multi-directional Opacity Helper pairing (e.g. bg-opacity-50 anywhere + bg-red-500 anywhere)
  if (targetVersion === 'v4') {
    const finalResult: (string | null)[] = [...migratedStep1]

    for (let i = 0; i < finalResult.length; i++) {
      const raw = finalResult[i]
      if (!raw) continue

      const lastColon = raw.lastIndexOf(':')
      const variants = lastColon !== -1 ? raw.slice(0, lastColon + 1) : ''
      let base = lastColon !== -1 ? raw.slice(lastColon + 1) : raw
      const important = base.startsWith('!') ? '!' : ''
      if (important) base = base.slice(1)

      const opacityMatch = OPACITY_HELPER_REGEX.exec(base)
      if (!opacityMatch) continue

      const [, prefix, opacityVal] = opacityMatch

      // Search for any target color class with the same prefix and variants across the ENTIRE list
      let pairedColorIdx = -1
      for (let j = 0; j < finalResult.length; j++) {
        if (i === j) continue
        const candidate = finalResult[j]
        if (!candidate) continue

        const cLastColon = candidate.lastIndexOf(':')
        const cVariants = cLastColon !== -1 ? candidate.slice(0, cLastColon + 1) : ''
        let cBase = cLastColon !== -1 ? candidate.slice(cLastColon + 1) : candidate
        if (cBase.startsWith('!')) cBase = cBase.slice(1)

        // Must match same variant scope and start with prefix- (e.g. bg-, text-, border-) without existing /opacity or being another opacity helper
        if (
          cVariants === variants &&
          cBase.startsWith(`${prefix}-`) &&
          !cBase.includes('/') &&
          !OPACITY_HELPER_REGEX.test(cBase)
        ) {
          pairedColorIdx = j
          break
        }
      }

      if (pairedColorIdx !== -1) {
        const oldColor = finalResult[pairedColorIdx]!
        const mergedColor = `${oldColor}/${opacityVal}`
        finalResult[pairedColorIdx] = mergedColor
        finalResult[i] = null // Consume the opacity helper
        changes.push({
          type: 'migration',
          original: `${oldColor} ${raw}`,
          replacement: mergedColor,
          reason: `Combined '${oldColor}' and '${raw}' into modern slash syntax '${mergedColor}'`,
        })
      } else {
        // Freestanding opacity helper without explicit color (e.g. bg-opacity-50 -> bg-black/50)
        const fallback = `${variants}${important}${prefix}-black/${opacityVal}`
        finalResult[i] = fallback
        changes.push({
          type: 'migration',
          original: raw,
          replacement: fallback,
          reason: `Converted standalone '${raw}' to modern opacity syntax '${fallback}'`,
        })
      }
    }

    return {
      result: finalResult.filter((item): item is string => Boolean(item)),
      changes,
    }
  }

  return { result: migratedStep1, changes }
}
