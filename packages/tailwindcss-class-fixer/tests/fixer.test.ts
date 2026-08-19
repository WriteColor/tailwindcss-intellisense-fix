import { describe, it, expect } from 'vitest'
import { fixClassString, fixDocument, extractClassRanges } from '../src/index'

describe('@tailwindcss/class-fixer Core Engine', () => {
  describe('Deduplication', () => {
    it('removes duplicate classes while preserving non-duplicates', () => {
      const input = 'p-4 flex p-4 text-center flex text-white'
      const result = fixClassString(input, { sort: false })
      expect(result.fixed).toBe('p-4 flex text-center text-white')
      expect(result.changes.some((c) => c.type === 'dedupe')).toBe(true)
    })
  })

  describe('Conflict Resolution', () => {
    it('resolves conflicting utility classes with same variants', () => {
      const input = 'p-2 text-red-500 p-4 text-blue-500'
      const result = fixClassString(input, { sort: false })
      expect(result.fixed).toBe('p-4 text-blue-500')
      expect(result.changes.some((c) => c.type === 'conflict')).toBe(true)
    })

    it('keeps classes when they have different variants', () => {
      const input = 'p-2 md:p-4 hover:p-6'
      const result = fixClassString(input, { sort: false })
      expect(result.fixed).toBe('p-2 md:p-4 hover:p-6')
    })
  })

  describe('Migrations', () => {
    it('migrates deprecated classes to modern v4 equivalents', () => {
      const input = 'overflow-ellipsis flex-grow flex-shrink-0'
      const result = fixClassString(input, { sort: false, migrateVersion: 'v4' })
      expect(result.fixed).toBe('text-ellipsis grow shrink-0')
      expect(result.changes.some((c) => c.type === 'migration')).toBe(true)
    })

    it('converts standalone opacity helpers to modern syntax', () => {
      const input = 'bg-red-500 bg-opacity-50'
      const result = fixClassString(input, { sort: false, migrateVersion: 'v4' })
      expect(result.fixed).toBe('bg-red-500/50')
    })
  })

  describe('Canonical Sorter', () => {
    it('sorts classes in official Tailwind order', () => {
      const input = 'hover:bg-blue-600 bg-blue-500 p-4 block'
      const result = fixClassString(input, { sort: true })
      expect(result.fixed).toBe('block p-4 bg-blue-500 hover:bg-blue-600')
    })
  })

  describe('Typo Corrections', () => {
    it('corrects simple typographical errors', () => {
      const input = 'felx itmes-center'
      const result = fixClassString(input, { sort: false, fixTypos: true })
      expect(result.fixed).toContain('flex')
    })
  })

  describe('Universal Document Fixer', () => {
    it('fixes classes in JSX / TSX files with cn/clsx helpers', () => {
      const tsxCode = `
import React from 'react';
import { cn } from './utils';

export function Button({ active }) {
  return (
    <button className={cn("p-2 p-4 flex-grow px-4 px-4", active && "bg-opacity-50")}>
      Click me
    </button>
  );
}
`
      const result = fixDocument(tsxCode, { fileName: 'Button.tsx' })
      expect(result.hasChanges).toBe(true)
      expect(result.fixedText).toContain('p-4')
      expect(result.fixedText).toContain('grow')
      expect(result.fixedText).not.toContain('flex-grow')
    })

    it('fixes classes in non-JS template files (Blade, HTML, Rust, CSS @apply)', () => {
      const htmlCode = `<div class="p-2 p-4 overflow-ellipsis"></div>`
      const result = fixDocument(htmlCode, { fileName: 'index.html' })
      expect(result.hasChanges).toBe(true)
      expect(result.fixedText).toBe(`<div class="p-4 text-ellipsis"></div>`)

      const cssCode = `.card { @apply p-2 p-4 flex-grow; }`
      const cssResult = fixDocument(cssCode, { fileName: 'styles.css' })
      expect(cssResult.hasChanges).toBe(true)
      expect(cssResult.fixedText).toBe(`.card { @apply p-4 grow; }`)
    })
  })
})
