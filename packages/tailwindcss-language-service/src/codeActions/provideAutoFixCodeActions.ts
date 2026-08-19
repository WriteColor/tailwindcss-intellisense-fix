import type { CodeAction, CodeActionParams, Range } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { State } from '../util/state'
import { fixDocument, fixClassString, extractClassRanges } from '@tailwindcss/class-fixer'

export async function provideAutoFixCodeActions(
  _state: State,
  params: CodeActionParams,
  document: TextDocument,
): Promise<CodeAction[]> {
  const actions: CodeAction[] = []
  const requestedKind = params.context.only?.[0]
  const isFixAllRequested =
    !requestedKind ||
    requestedKind === 'source' ||
    requestedKind.startsWith('source.fixAll') ||
    requestedKind === 'source.fixAll.tailwind'

  const docText = document.getText()

  // 1. Source Action: Fix All in Document (for codeActionsOnSave and global commands)
  if (isFixAllRequested) {
    const docResult = fixDocument(docText, { fileName: document.uri })
    if (docResult.hasChanges) {
      actions.push({
        title: 'Fix and optimize all Tailwind CSS issues in document',
        kind: 'source.fixAll.tailwind',
        edit: {
          changes: {
            [document.uri]: docResult.edits.map((edit) => {
              const startPos = document.positionAt(edit.start)
              const endPos = document.positionAt(edit.end)
              return {
                range: { start: startPos, end: endPos },
                newText: edit.newText,
              }
            }),
          },
        },
      })
    }
  }

  // 2. Interactive QuickFixes for targeted range/selection
  const targetRanges = extractClassRanges(docText, document.uri)
  const range = params.range ?? params.context.diagnostics?.[0]?.range
  if (!range) {
    return actions
  }

  const reqStart = document.offsetAt(range.start)
  const reqEnd = document.offsetAt(range.end)


  for (const cr of targetRanges) {
    // Check if cursor/selection intersects this class list
    if (
      (reqStart >= cr.start && reqStart <= cr.end) ||
      (reqEnd >= cr.start && reqEnd <= cr.end) ||
      (reqStart <= cr.start && reqEnd >= cr.end)
    ) {
      const fixAllRes = fixClassString(cr.raw)
      const rangeLsp: Range = {
        start: document.positionAt(cr.start),
        end: document.positionAt(cr.end),
      }

      if (fixAllRes.hasChanges && fixAllRes.fixed !== cr.raw) {
        actions.push({
          title: 'Tailwind CSS: Fix, clean and sort classes',
          kind: 'quickfix',
          isPreferred: true,
          edit: {
            changes: {
              [document.uri]: [
                {
                  range: rangeLsp,
                  newText: fixAllRes.fixed,
                },
              ],
            },
          },
        })

        // Offer granular actions if specific changes exist
        const hasDedupe = fixAllRes.changes.some((c) => c.type === 'dedupe')
        if (hasDedupe) {
          const dedupeRes = fixClassString(cr.raw, {
            dedupe: true,
            resolveConflicts: false,
            sort: false,
            migrateVersion: false,
            fixTypos: false,
          })
          actions.push({
            title: 'Tailwind CSS: Remove duplicate classes',
            kind: 'quickfix',
            edit: {
              changes: {
                [document.uri]: [
                  {
                    range: rangeLsp,
                    newText: dedupeRes.fixed,
                  },
                ],
              },
            },
          })
        }

        const hasConflicts = fixAllRes.changes.some((c) => c.type === 'conflict')
        if (hasConflicts) {
          const conflictRes = fixClassString(cr.raw, {
            dedupe: false,
            resolveConflicts: true,
            sort: false,
            migrateVersion: false,
            fixTypos: false,
          })
          actions.push({
            title: 'Tailwind CSS: Resolve conflicting classes',
            kind: 'quickfix',
            edit: {
              changes: {
                [document.uri]: [
                  {
                    range: rangeLsp,
                    newText: conflictRes.fixed,
                  },
                ],
              },
            },
          })
        }

        const hasMigration = fixAllRes.changes.some((c) => c.type === 'migration')
        if (hasMigration) {
          const migRes = fixClassString(cr.raw, {
            dedupe: false,
            resolveConflicts: false,
            sort: false,
            migrateVersion: 'v4',
            fixTypos: false,
          })
          actions.push({
            title: 'Tailwind CSS: Upgrade deprecated classes to v4',
            kind: 'quickfix',
            edit: {
              changes: {
                [document.uri]: [
                  {
                    range: rangeLsp,
                    newText: migRes.fixed,
                  },
                ],
              },
            },
          })
        }

        const sortRes = fixClassString(cr.raw, {
          dedupe: false,
          resolveConflicts: false,
          sort: true,
          migrateVersion: false,
          fixTypos: false,
        })
        if (sortRes.fixed !== cr.raw) {
          actions.push({
            title: 'Tailwind CSS: Sort classes canonically',
            kind: 'quickfix',
            edit: {
              changes: {
                [document.uri]: [
                  {
                    range: rangeLsp,
                    newText: sortRes.fixed,
                  },
                ],
              },
            },
          })
        }
      }
    }
  }

  return actions
}
