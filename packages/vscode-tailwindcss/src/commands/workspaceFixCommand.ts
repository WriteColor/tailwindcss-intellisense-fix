import {
  window as Window,
  workspace as Workspace,
  ProgressLocation,
  WorkspaceEdit,
  Range,
  Uri,
} from 'vscode'
import { fixDocument } from '@tailwindcss/class-fixer'

const SUPPORTED_EXTENSIONS = [
  'html', 'htm', 'jsx', 'tsx', 'js', 'ts', 'vue', 'svelte', 'astro',
  'php', 'blade.php', 'twig', 'jinja', 'jinja2', 'liquid', 'erb',
  'rs', 'go', 'md', 'mdx', 'css', 'scss', 'postcss', 'heex', 'eex',
]

export async function fixWorkspaceCommand(): Promise<void> {
  const folders = Workspace.workspaceFolders
  if (!folders || folders.length === 0) {
    Window.showInformationMessage('No open workspace folder found.')
    return
  }

  const confirm = await Window.showInformationMessage(
    'This will scan and optimize Tailwind CSS classes across the entire workspace. Continue?',
    'Yes, Fix Workspace',
    'Cancel',
  )

  if (confirm !== 'Yes, Fix Workspace') {
    return
  }

  await Window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: 'Tailwind CSS: Optimizing workspace classes...',
      cancellable: true,
    },
    async (progress, token) => {
      const globPattern = `**/*.{${SUPPORTED_EXTENSIONS.join(',')}}`
      const files = await Workspace.findFiles(
        globPattern,
        '**/{node_modules,.git,dist,build,.next,.nuxt,.cache}/**',
      )

      if (files.length === 0) {
        Window.showInformationMessage('No template or code files found in workspace.')
        return
      }

      const workspaceEdit = new WorkspaceEdit()
      let modifiedFilesCount = 0
      let totalIssuesFixed = 0

      for (let i = 0; i < files.length; i++) {
        if (token.isCancellationRequested) {
          Window.showInformationMessage('Tailwind workspace fix cancelled.')
          return
        }

        const fileUri = files[i]
        progress.report({
          message: `Checking ${i + 1}/${files.length}: ${Workspace.asRelativePath(fileUri)}`,
          increment: (1 / files.length) * 100,
        })

        try {
          const doc = await Workspace.openTextDocument(fileUri)
          const config = Workspace.getConfiguration('tailwindCSS.autoFix', fileUri)

          const migSetting = config.get<string>('migrateVersion', 'v4')
          const migrateVersion: 'v3' | 'v4' | false =
            migSetting === 'v3' || migSetting === 'v4' ? migSetting : false

          const options = {
            fileName: fileUri.fsPath,
            dedupe: config.get<boolean>('dedupe', true),
            resolveConflicts: config.get<boolean>('resolveConflicts', true),
            sort: config.get<boolean>('sort', true),
            migrateVersion,
            fixTypos: config.get<boolean>('fixTypos', true),
          }


          const text = doc.getText()
          const result = fixDocument(text, options)

          if (result.hasChanges) {
            modifiedFilesCount++
            for (const edit of result.edits) {
              totalIssuesFixed += edit.changes.length
              const startPos = doc.positionAt(edit.start)
              const endPos = doc.positionAt(edit.end)
              workspaceEdit.replace(fileUri, new Range(startPos, endPos), edit.newText)
            }
          }
        } catch (err) {
          console.error(`Error processing file ${fileUri.fsPath}:`, err)
        }
      }

      if (modifiedFilesCount > 0) {
        const applied = await Workspace.applyEdit(workspaceEdit)
        if (applied) {
          Window.showInformationMessage(
            `Tailwind CSS: Successfully fixed ${totalIssuesFixed} issues across ${modifiedFilesCount} files.`,
          )
        }
      } else {
        Window.showInformationMessage('Tailwind CSS: All workspace classes are already clean and optimized.')
      }
    },
  )
}
