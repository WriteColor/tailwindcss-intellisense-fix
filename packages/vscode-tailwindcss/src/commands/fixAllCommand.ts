import { window as Window, workspace as Workspace, Range, Position } from 'vscode'
import { fixDocument } from '@tailwindcss/class-fixer'

export async function fixCurrentFileCommand(): Promise<void> {
  const editor = Window.activeTextEditor
  if (!editor) {
    Window.showInformationMessage('No active editor found to fix Tailwind classes.')
    return
  }

  const doc = editor.document
  const config = Workspace.getConfiguration('tailwindCSS.autoFix', doc.uri)
  const isEnabled = config.get<boolean>('enable', true)

  if (!isEnabled) {
    Window.showWarningMessage('Tailwind autoFix is disabled in settings.')
    return
  }

  const migSetting = config.get<string>('migrateVersion', 'v4')
  const migrateVersion: 'v3' | 'v4' | false =
    migSetting === 'v3' || migSetting === 'v4' ? migSetting : false

  const options = {
    fileName: doc.fileName,
    dedupe: config.get<boolean>('dedupe', true),
    resolveConflicts: config.get<boolean>('resolveConflicts', true),
    sort: config.get<boolean>('sort', true),
    migrateVersion,
    fixTypos: config.get<boolean>('fixTypos', true),
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
