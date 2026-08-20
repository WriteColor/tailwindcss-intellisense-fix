import type { ExtractedClassRange } from './types'

// Regex for HTML / JSX / Vue / Alpine / Svelte / Astro class attributes
const ATTR_REGEX =
  /(?::class|v-bind:class|x-bind:class|class|className|ngClass|class:list|\[class\]|\[ngClass\])\s*=\s*(["'`{])([\s\S]*?)\1/gi

// Regex for Blade directive: @class([...])
const BLADE_CLASS_REGEX = /@class\s*\(\s*(\[[\s\S]*?\])\s*\)/gi

// Regex for helper function calls: clsx, cva, twMerge, cn, classnames, tw`...`, tv`...`
const HELPER_REGEX =
  /\b(?:clsx|cva|twMerge|cn|classnames|tw|tv)\s*(?:\(\s*|\`)([\s\S]*?)(?:\)|\`)/gi

// Regex for string literals inside code or helpers
const STRING_LITERAL_REGEX = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g

// Regex for @apply directives in CSS/SCSS/Sass/PostCSS
const APPLY_REGEX = /@apply\s+([^;}]+?)(?:\s*!important)?\s*[;}]/gi

// Regex for Rust leptos/yew classes!("...") / class! { "..." }
const RUST_CLASSES_REGEX = /(?:classes!|class!)\s*[\(\{]\s*["']([^"']+)["']\s*[\)\}]/gi

/**
 * Extracts class strings and exact byte ranges from any source code or template file.
 */
export function extractClassRanges(
  content: string,
  _fileName?: string,
): ExtractedClassRange[] {
  const results: ExtractedClassRange[] = []
  const seenRanges = new Set<string>()

  function addRange(range: ExtractedClassRange) {
    const key = `${range.start}-${range.end}`
    if (!seenRanges.has(key) && range.raw.trim().length > 0) {
      seenRanges.add(key)
      results.push(range)
    }
  }

  // 1. Check CSS @apply directives
  let applyMatch: RegExpExecArray | null
  while ((applyMatch = APPLY_REGEX.exec(content)) !== null) {
    const raw = applyMatch[1]
    const start = applyMatch.index + applyMatch[0].indexOf(raw)
    const end = start + raw.length
    addRange({
      start,
      end,
      raw,
      context: 'css',
    })
  }

  // Helper to extract segments from strings containing template interpolation ${...}
  function extractTemplateSegments(
    text: string,
    baseOffset: number,
    delimiter: string,
    context: ExtractedClassRange['context'],
  ) {
    if (!text.includes('${')) {
      addRange({
        start: baseOffset,
        end: baseOffset + text.length,
        raw: text,
        delimiter,
        context,
      })
      return
    }

    // Split around ${...} interpolations
    const interpolationRegex = /\$\{([\s\S]*?)\}/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = interpolationRegex.exec(text)) !== null) {
      // 1. Static text before ${
      const staticChunk = text.slice(lastIndex, match.index)
      if (staticChunk.trim().length > 0) {
        const chunkStart = baseOffset + lastIndex
        addRange({
          start: chunkStart,
          end: chunkStart + staticChunk.length,
          raw: staticChunk,
          delimiter,
          context,
        })
      }

      // 2. Extract string literals inside the ${ ... } expression
      const exprContent = match[1]
      const exprStart = baseOffset + match.index + 2
      let innerStrMatch: RegExpExecArray | null
      while ((innerStrMatch = STRING_LITERAL_REGEX.exec(exprContent)) !== null) {
        const subRaw = innerStrMatch[2]
        const subStart = exprStart + innerStrMatch.index + 1
        addRange({
          start: subStart,
          end: subStart + subRaw.length,
          raw: subRaw,
          delimiter: innerStrMatch[1],
          context: 'jsx',
        })
      }

      lastIndex = match.index + match[0].length
    }

    // Static text after last }
    const tailChunk = text.slice(lastIndex)
    if (tailChunk.trim().length > 0) {
      const tailStart = baseOffset + lastIndex
      addRange({
        start: tailStart,
        end: tailStart + tailChunk.length,
        raw: tailChunk,
        delimiter,
        context,
      })
    }
  }

  // 2. Check HTML / JSX / Vue / Alpine / Svelte class attributes
  let attrMatch: RegExpExecArray | null
  while ((attrMatch = ATTR_REGEX.exec(content)) !== null) {
    const rawAttrValue = attrMatch[2]
    const delimiter = attrMatch[1]
    const valueStart = attrMatch.index + attrMatch[0].indexOf(rawAttrValue)

    if (delimiter === '"' || delimiter === "'") {
      addRange({
        start: valueStart,
        end: valueStart + rawAttrValue.length,
        raw: rawAttrValue,
        delimiter,
        context: 'html',
      })
    } else if (delimiter === '`') {
      extractTemplateSegments(rawAttrValue, valueStart, delimiter, 'html')
    } else {
      // Dynamic expression like class={...} or :class="{...}"
      let strMatch: RegExpExecArray | null
      while ((strMatch = STRING_LITERAL_REGEX.exec(rawAttrValue)) !== null) {
        const subRaw = strMatch[2]
        const subStart = valueStart + strMatch.index + 1
        if (strMatch[1] === '`') {
          extractTemplateSegments(subRaw, subStart, strMatch[1], 'jsx')
        } else {
          addRange({
            start: subStart,
            end: subStart + subRaw.length,
            raw: subRaw,
            delimiter: strMatch[1],
            context: 'jsx',
          })
        }
      }
    }
  }

  // 3. Check Blade Directive @class([...])
  let bladeMatch: RegExpExecArray | null
  while ((bladeMatch = BLADE_CLASS_REGEX.exec(content)) !== null) {
    const arrayContent = bladeMatch[1]
    const arrayStart = bladeMatch.index + bladeMatch[0].indexOf(arrayContent)
    let strMatch: RegExpExecArray | null
    while ((strMatch = STRING_LITERAL_REGEX.exec(arrayContent)) !== null) {
      const subRaw = strMatch[2]
      const subStart = arrayStart + strMatch.index + 1
      addRange({
        start: subStart,
        end: subStart + subRaw.length,
        raw: subRaw,
        delimiter: strMatch[1],
        context: 'template',
      })
    }
  }

  // 4. Check Helper Functions (clsx, cva, twMerge, cn, tw`...`, tv`...`)
  let helperMatch: RegExpExecArray | null
  while ((helperMatch = HELPER_REGEX.exec(content)) !== null) {
    const helperArgs = helperMatch[1]
    const argsStart = helperMatch.index + helperMatch[0].indexOf(helperArgs)

    if (helperMatch[0].includes('`')) {
      extractTemplateSegments(helperArgs, argsStart, '`', 'helper')
    } else {
      let strMatch: RegExpExecArray | null
      while ((strMatch = STRING_LITERAL_REGEX.exec(helperArgs)) !== null) {
        const subRaw = strMatch[2]
        const subStart = argsStart + strMatch.index + 1
        if (strMatch[1] === '`') {
          extractTemplateSegments(subRaw, subStart, strMatch[1], 'helper')
        } else {
          addRange({
            start: subStart,
            end: subStart + subRaw.length,
            raw: subRaw,
            delimiter: strMatch[1],
            context: 'helper',
          })
        }
      }
    }
  }

  // 5. Check Rust / Leptos / Yew / Dioxus macros
  let rustMatch: RegExpExecArray | null
  while ((rustMatch = RUST_CLASSES_REGEX.exec(content)) !== null) {
    const raw = rustMatch[1]
    const start = rustMatch.index + rustMatch[0].indexOf(raw)
    const end = start + raw.length
    addRange({
      start,
      end,
      raw,
      context: 'template',
    })
  }

  // Sort ranges in ascending order of start position
  return results.sort((a, b) => a.start - b.start)
}
