import { window as Window, workspace as Workspace, Range, Position } from 'vscode'
import { fixDocument } from '@tailwindcss/class-fixer'

export async function fixCurrentFileCommand(): Promise<void> {
  const editor = Window.activeTextEditor
  if (!editor) {
    Window.showInformationMessage('No active editor found to fix Tailwind classes.')
    return
  }

  const doc = editor.document
  const fixConfig = Workspace.getConfiguration('tailwindFix.autoFix', doc.uri)
  const legacyConfig = Workspace.getConfiguration('tailwindCSS.autoFix', doc.uri)
  const isEnabled = fixConfig.get<boolean>('enable', legacyConfig.get<boolean>('enable', true))

  if (!isEnabled) {
    Window.showWarningMessage('Tailwind autoFix is disabled in settings.')
    return
  }

  const migSetting = fixConfig.get<string>('migrateVersion', legacyConfig.get<string>('migrateVersion', 'v4'))
  const migrateVersion: 'v3' | 'v4' | false =
    migSetting === 'v3' || migSetting === 'v4' ? migSetting : false

  const options = {
    fileName: doc.fileName,
    dedupe: fixConfig.get<boolean>('dedupe', legacyConfig.get<boolean>('dedupe', true)),
    resolveConflicts: fixConfig.get<boolean>('resolveConflicts', legacyConfig.get<boolean>('resolveConflicts', true)),
    sort: fixConfig.get<boolean>('sort', legacyConfig.get<boolean>('sort', true)),
    migrateVersion,
    fixTypos: fixConfig.get<boolean>('fixTypos', legacyConfig.get<boolean>('fixTypos', true)),
  }



  const text = doc.getText()
  const result = fixDocument(text, options)

  if (!result.hasChanges) {
    Window.setStatusBarMessage('Tailwind CSS: All classes are already clean and optimized.', 3000)
    return
  }

  const success = await editor.edit((editBuilder) => {
    for (const edit of result.edits) {
      const startPos = doc.positionAt(edit.start)
      const endPos = doc.positionAt(edit.end)
      editBuilder.replace(new Range(startPos, endPos), edit.newText)
    }
  })

  if (success) {
    const totalChanges = result.edits.reduce((acc, e) => acc + e.changes.length, 0)
    Window.setStatusBarMessage(
      `Tailwind CSS: Fixed and optimized ${totalChanges} class issues across ${result.edits.length} elements.`,
      4000,
    )
  }
}
