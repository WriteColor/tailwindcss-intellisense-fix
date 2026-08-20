import {
  window as Window,
  workspace as Workspace,
  ProgressLocation,
  WorkspaceEdit,
  Range,
  FileType,
  Uri,
} from 'vscode'
import * as path from 'path'
import { fixDocument } from '@tailwindcss/class-fixer'

const SUPPORTED_EXTENSIONS = new Set([
  'html', 'htm', 'jsx', 'tsx', 'js', 'ts', 'vue', 'svelte', 'astro',
  'php', 'blade.php', 'twig', 'jinja', 'jinja2', 'liquid', 'erb',
  'rs', 'go', 'md', 'mdx', 'css', 'scss', 'postcss', 'heex', 'eex',
])

function isSupportedFile(filePath: string): boolean {
  const lower = filePath.toLowerCase()
  for (const ext of SUPPORTED_EXTENSIONS) {
    if (lower.endsWith(`.${ext}`)) return true
  }
  return false
}

async function collectFilesRecursively(uri: Uri): Promise<Uri[]> {
  try {
    const stat = await Workspace.fs.stat(uri)
    if (stat.type & FileType.File) {
      return isSupportedFile(uri.fsPath) ? [uri] : []
    }
    if (stat.type & FileType.Directory) {
      const entries = await Workspace.fs.readDirectory(uri)
      const results: Uri[] = []
      for (const [name, type] of entries) {
        if (
          name === 'node_modules' ||
          name === '.git' ||
          name === 'dist' ||
          name === 'build' ||
          name === '.next' ||
          name === '.nuxt' ||
          name === '.cache'
        ) {
          continue
        }
        const childUri = Uri.file(path.join(uri.fsPath, name))
        if (type & FileType.Directory) {
          const children = await collectFilesRecursively(childUri)
          results.push(...children)
        } else if (type & FileType.File) {
          if (isSupportedFile(childUri.fsPath)) {
            results.push(childUri)
          }
        }
      }
      return results
    }
  } catch {
    return []
  }
  return []
}

export async function fixExplorerSelectionCommand(
  clickedUri?: Uri,
  selectedUris?: Uri[],
): Promise<void> {
  const targets: Uri[] = []
  if (selectedUris && selectedUris.length > 0) {
    targets.push(...selectedUris)
  } else if (clickedUri) {
    targets.push(clickedUri)
  } else if (Window.activeTextEditor) {
    targets.push(Window.activeTextEditor.document.uri)
  }

  if (targets.length === 0) {
    Window.showInformationMessage('No file or folder selected to fix.')
    return
  }

  await Window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: 'Tailwind CSS IntelliSense Fix: Processing selected items...',
      cancellable: true,
    },
    async (progress, token) => {
      const allFileUris: Uri[] = []
      for (const target of targets) {
        const files = await collectFilesRecursively(target)
        allFileUris.push(...files)
      }

      // Deduplicate file URIs
      const uniqueUris = Array.from(new Set(allFileUris.map((u) => u.fsPath))).map((p) =>
        Uri.file(p),
      )

      if (uniqueUris.length === 0) {
        Window.showInformationMessage('No supported template or style files found in selection.')
        return
      }

      let totalFixedFiles = 0
      let totalIssuesFixed = 0
      const totalCount = uniqueUris.length

      for (let i = 0; i < totalCount; i++) {
        if (token.isCancellationRequested) break

        const fileUri = uniqueUris[i]
        const fileName = path.basename(fileUri.fsPath)
        progress.report({
          message: `[${i + 1}/${totalCount}] ${fileName}`,
          increment: 100 / totalCount,
        })

        try {
          const doc = await Workspace.openTextDocument(fileUri)
          const fixConfig = Workspace.getConfiguration('tailwindFix.autoFix', fileUri)
          const legacyConfig = Workspace.getConfiguration('tailwindCSS.autoFix', fileUri)

          const isEnabled = fixConfig.get<boolean>('enable', legacyConfig.get<boolean>('enable', true))
          if (!isEnabled) continue

          const migSetting = fixConfig.get<string>(
            'migrateVersion',
            legacyConfig.get<string>('migrateVersion', 'v4'),
          )
          const migrateVersion: 'v3' | 'v4' | false =
            migSetting === 'v3' || migSetting === 'v4' ? migSetting : false

          const options = {
            fileName: fileUri.fsPath,
            dedupe: fixConfig.get<boolean>('dedupe', legacyConfig.get<boolean>('dedupe', true)),
            resolveConflicts: fixConfig.get<boolean>(
              'resolveConflicts',
              legacyConfig.get<boolean>('resolveConflicts', true),
            ),
            sort: fixConfig.get<boolean>('sort', legacyConfig.get<boolean>('sort', true)),
            migrateVersion,
            fixTypos: fixConfig.get<boolean>('fixTypos', legacyConfig.get<boolean>('fixTypos', true)),
          }

          const originalText = doc.getText()
          const fixResult = fixDocument(originalText, options)

          if (fixResult.hasChanges) {
            const edit = new WorkspaceEdit()
            const fullRange = new Range(
              doc.positionAt(0),
              doc.positionAt(originalText.length),
            )
            edit.replace(fileUri, fullRange, fixResult.fixedText)
            const applied = await Workspace.applyEdit(edit)
            if (applied) {
              await doc.save()
              totalFixedFiles++
              const changesCount = fixResult.edits.reduce(
                (acc, e) => acc + e.changes.length,
                0,
              )
              totalIssuesFixed += changesCount
            }
          }

        } catch (err) {
          console.error(`Failed to fix file ${fileUri.fsPath}:`, err)
        }
      }

      if (totalFixedFiles > 0) {
        Window.showInformationMessage(
          `✔ Tailwind CSS IntelliSense Fix: Fixed ${totalIssuesFixed} issue(s) across ${totalFixedFiles} file(s) in selection!`,
        )
      } else {
        Window.showInformationMessage(
          `✔ Tailwind CSS IntelliSense Fix: All ${totalCount} selected file(s) are already clean!`,
        )
      }
    },
  )
}
