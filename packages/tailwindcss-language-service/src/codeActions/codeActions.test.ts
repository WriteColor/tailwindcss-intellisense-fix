import { describe, it, expect } from 'vitest'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { provideAutoFixCodeActions } from './provideAutoFixCodeActions'
import type { State } from '../util/state'

describe('Auto-Fix Code Actions Provider', () => {
  const dummyState = { enabled: true } as unknown as State

  it('generates source.fixAll.tailwind code action with all document fixes', async () => {
    const doc = TextDocument.create(
      'file:///test.html',
      'html',
      1,
      '<div class="p-2 p-4 overflow-ellipsis flex-grow"></div>',
    )

    const params = {
      textDocument: { uri: doc.uri },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [], only: ['source.fixAll'] },
    }

    const actions = await provideAutoFixCodeActions(dummyState, params, doc)
    expect(actions.length).toBeGreaterThan(0)
    const fixAll = actions.find((a) => a.kind === 'source.fixAll.tailwind')
    expect(fixAll).toBeDefined()
    expect(fixAll?.edit?.changes?.[doc.uri]).toBeDefined()
  })

  it('generates quickfix actions when cursor intersects a class list', async () => {
    const doc = TextDocument.create(
      'file:///test.html',
      'html',
      1,
      '<div class="p-2 p-4"></div>',
    )

    const params = {
      textDocument: { uri: doc.uri },
      range: { start: { line: 0, character: 14 }, end: { line: 0, character: 14 } },
      context: { diagnostics: [] },
    }

    const actions = await provideAutoFixCodeActions(dummyState, params, doc)
    const quickFixes = actions.filter((a) => a.kind === 'quickfix')
    expect(quickFixes.length).toBeGreaterThan(0)
    expect(quickFixes.some((q) => q.title.includes('Fix'))).toBe(true)
  })
})
