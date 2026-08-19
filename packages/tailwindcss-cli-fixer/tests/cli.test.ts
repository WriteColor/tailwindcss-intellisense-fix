import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { runFixer } from '../src/runner'

describe('@tailwindcss/cli-fixer Headless Runner', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tailwind-cli-test-'))
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('detects fixes in check mode without writing to disk', async () => {
    const filePath = path.join(tempDir, 'test.html')
    const originalContent = '<div class="p-2 p-4 flex-grow px-4 px-4"></div>'
    fs.writeFileSync(filePath, originalContent, 'utf-8')

    const result = await runFixer({
      cwd: tempDir,
      check: true,
      diff: false,
    })

    expect(result.summary.totalFiles).toBe(1)
    expect(result.summary.modifiedFiles).toBe(1)
    expect(result.summary.totalChanges).toBeGreaterThan(0)
    expect(result.hasErrors).toBe(true)

    // Verify file on disk was NOT changed in check mode
    const contentOnDisk = fs.readFileSync(filePath, 'utf-8')
    expect(contentOnDisk).toBe(originalContent)
  })

  it('applies fixes to disk when write option is true', async () => {
    const filePath = path.join(tempDir, 'Component.tsx')
    const initialContent = 'export const Card = () => <div className="p-2 p-4 overflow-ellipsis">Card</div>;'
    fs.writeFileSync(filePath, initialContent, 'utf-8')

    const result = await runFixer({
      cwd: tempDir,
      write: true,
      diff: false,
    })

    expect(result.summary.modifiedFiles).toBe(1)
    expect(result.hasErrors).toBe(false)

    // Verify file on disk WAS changed
    const contentOnDisk = fs.readFileSync(filePath, 'utf-8')
    expect(contentOnDisk).toContain('p-4')
    expect(contentOnDisk).toContain('text-ellipsis')
    expect(contentOnDisk).not.toContain('overflow-ellipsis')
  })
})
