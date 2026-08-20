<div align="center">

  <img src="icon.png" alt="Tailwind CSS IntelliSense Fix Icon" width="128" />

  # Tailwind CSS IntelliSense (Fix & Auto-Optimize Fork)

  **Language / Idioma:** [🇺🇸 English](README.md) • [🇪🇸 Español](README.es.md)

</div>


[![CI Test Matrix](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/ci.yml/badge.svg)](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/ci.yml)

[![Upstream Sync](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/upstream-sync.yml/badge.svg)](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/upstream-sync.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-f69220.svg)](https://pnpm.io/)

> **Next-generation Tailwind CSS tooling, real-time Language Server Protocol (LSP), and automated class repair & optimization engine with universal language and template support for Antigravity IDE, VS Code, Cursor, Windsurf, and VSCodium.**

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Automated Class Deduplication](#1-automated-class-deduplication)
  - [2. Utility Conflict Resolution](#2-utility-conflict-resolution)
  - [3. Modern Migration Engine (v3 to v4)](#3-modern-migration-engine-v3-to-v4)
  - [4. Canonical Class Sorting](#4-canonical-class-sorting)
  - [5. Intelligent Typo Correction](#5-intelligent-typo-correction)
  - [6. Universal Zero-Config Language & Template Support](#6-universal-zero-config-language--template-support)
- [Installation Guide](#-installation-guide)
  - [Installing in Antigravity IDE](#installing-in-antigravity-ide)
  - [Installing in VS Code / Cursor / Windsurf / VSCodium](#installing-in-vs-code--cursor--windsurf--vscodium)
- [Headless CLI (`pnpm tailwind-fix`)](#-headless-cli-pnpm-tailwind-fix)
  - [CLI Flags & Options](#cli-flags--options)
  - [CLI Usage Examples](#cli-usage-examples)
  - [Pre-commit & CI/CD Integration](#pre-commit--cicd-integration)
- [Configuration & Settings](#-configuration--settings)
  - [Auto-Fix Options](#auto-fix-options)
  - [Code Actions on Save](#code-actions-on-save)
  - [Custom Class Attributes & Helper Functions](#custom-class-attributes--helper-functions)
- [IDE Commands Palette](#-ide-commands-palette)
- [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
- [Automated Upstream Synchronization](#-automated-upstream-synchronization)
- [Development & Contribution Guide](#-development--contribution-guide)
- [License](#-license)

---

## 🌟 Overview

`tailwindcss-intellisense-fix` is an enhanced, fully retrocompatible fork of the official `tailwindlabs/tailwindcss-intellisense` extension. It combines the full official Language Server capabilities (autocomplete, hover documentation, syntax highlighting, and color decorators) with a decoupled, high-performance **Class Fixer Engine** (`@tailwindcss/class-fixer`) and a **Headless CLI** (`@tailwindcss/cli-fixer`).

It automatically detects and optimizes Tailwind CSS classes in **any file format or programming language without friction**, supporting Tailwind CSS v4 (`@theme`, `@import "tailwindcss"`), v3 (`tailwind.config.js`), and legacy versions.

---

## 🚀 Key Features

### 1. Automated Class Deduplication
Eliminates duplicate class names while preserving their active variant prefixes, arbitrary brackets, and important modifiers:
```html
<!-- Before -->
<div class="px-4 py-2 px-4 text-center py-2 hover:bg-blue-500 hover:bg-blue-500"></div>

<!-- After -->
<div class="px-4 py-2 text-center hover:bg-blue-500"></div>
```

### 2. Utility Conflict Resolution
Resolves conflicting CSS properties targeting the same element and variant scope. Follows CSS cascade and Tailwind specificity semantics where the rightmost class takes precedence:
```html
<!-- Before -->
<button class="p-2 text-red-500 p-4 text-blue-600 block hidden"></button>

<!-- After -->
<button class="p-4 text-blue-600 hidden"></button>
```

### 3. Modern Migration Engine (v3 to v4)
Automatically migrates deprecated and legacy utilities to their modern equivalents:
- `flex-grow` $\rightarrow$ `grow`
- `flex-grow-0` $\rightarrow$ `grow-0`
- `flex-shrink` $\rightarrow$ `shrink`
- `flex-shrink-0` $\rightarrow$ `shrink-0`
- `overflow-ellipsis` $\rightarrow$ `text-ellipsis`
- `overflow-clip` $\rightarrow$ `text-clip`
- `bg-red-500 bg-opacity-50` $\rightarrow$ `bg-red-500/50`

### 4. Canonical Class Sorting
Enforces the official recommended class sorting order natively inside the LSP (Layout $\rightarrow$ Sizing $\rightarrow$ Spacing $\rightarrow$ Flex/Grid $\rightarrow$ Typography $\rightarrow$ Backgrounds $\rightarrow$ Borders $\rightarrow$ Effects $\rightarrow$ Transitions $\rightarrow$ Variants):
```html
<!-- Before -->
<div class="hover:bg-blue-600 p-4 bg-blue-500 block text-white font-bold"></div>

<!-- After -->
<div class="block p-4 font-bold text-white bg-blue-500 hover:bg-blue-600"></div>
```

### 5. Intelligent Typo Correction
Uses Levenshtein distance calculations against active Tailwind utility vocabularies to identify and correct typographical errors:
- `felx` $\rightarrow$ `flex`
- `itmes-center` $\rightarrow$ `items-center`
- `justfiy-between` $\rightarrow$ `justify-between`

### 6. Universal Zero-Config Language & Template Support
Works seamlessly across all frameworks and languages without manual regex configuration:
- **Frontend Frameworks:** React (JSX/TSX), Vue, Svelte, Angular, Astro, Solid, Qwik.
- **Backend Template Engines:** PHP (Blade, Twig), Python (Django, Jinja2), Ruby (ERB), Go templates, Rust (Leptos, Yew, Dioxus), Elixir (HEEx, EEx).
- **Stylesheets & Preprocessors:** CSS, SCSS, Sass, PostCSS with `@apply` directives.
- **Class Composition Helpers:** Built-in extraction for `clsx()`, `cva()`, `twMerge()`, `cn()`, `classnames()`, and tagged template literals (`tw`...``).

---

## 📥 Installation Guide

### Installing in Antigravity IDE
1. Download the latest `.vsix` package from [Releases](https://github.com/WriteColor/tailwindcss-intellisense-fix/releases) (or build locally).
2. In Antigravity IDE, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
3. Type `Extensions: Install from VSIX...` and select the downloaded `.vsix` file.
4. Reload the window if prompted.

### Installing in VS Code / Cursor / Windsurf / VSCodium
```bash
# Using VS Code CLI
code --install-extension tailwindcss-intellisense-fix-0.16.1.vsix

# Using Cursor CLI
cursor --install-extension tailwindcss-intellisense-fix-0.16.1.vsix

# Using VSCodium CLI
codium --install-extension tailwindcss-intellisense-fix-0.16.1.vsix

```

---

## 🛠 Headless CLI (`pnpm tailwind-fix`)

The project includes a standalone CLI that can run in headless environments (CI/CD pipelines, pre-commit hooks, local scripts) without opening an editor:

### CLI Flags & Options

| Flag | Alias | Description | Default |
|---|---|---|---|
| `--write` | `-w` | Apply fixes and format files directly on disk | `false` (dry-run) |
| `--check` | `-c` | Check for issues without modifying (exits with code 1 if issues found) | `false` |
| `--diff` | `-d` | Display colored terminal diffs of modified class lists | `true` |
| `--no-diff` | | Suppress visual diff output | `false` |
| `--no-sort` | | Disable canonical class sorting | `false` |
| `--no-dedupe` | | Disable duplicate class removal | `false` |
| `--no-conflicts` | | Disable utility conflict resolution | `false` |
| `--no-typos` | | Disable typo detection and corrections | `false` |
| `--migrate <v>` | `-m` | Migration target version (`v4`, `v3`, or `off`) | `v4` |
| `--cwd <path>` | | Custom root directory path | `process.cwd()` |
| `--help` | `-h` | Display help and usage information | |

### CLI Usage Examples

```bash
# 1. Check entire repository for Tailwind issues (CI check mode)
pnpm tailwind-fix --check

# 2. Fix and format all files in the current repository
pnpm tailwind-fix --write

# 3. Fix specific folder or files
pnpm tailwind-fix --write src/components/

# 4. Migrate an existing v3 project to Tailwind v4 syntax
pnpm tailwind-fix --write --migrate=v4
```

### Pre-commit & CI/CD Integration

#### Husky Pre-commit Hook (`.husky/pre-commit`)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm tailwind-fix --write
git add -u
```

#### GitHub Actions Workflow Example
```yaml
name: Tailwind Class Lint Check

on: [push, pull_request]

jobs:
  tailwind-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - name: Verify Tailwind Classes
        run: pnpm tailwind-fix --check
```

---

## ⚙ Configuration & Settings

Add these options to your `.vscode/settings.json` or global user settings (supports `tailwindFix.*` with automatic fallback to `tailwindCSS.*`):

```jsonc
{
  // Enable or disable auto-fixing features
  "tailwindFix.autoFix.enable": true,
  "tailwindFix.autoFix.dedupe": true,
  "tailwindFix.autoFix.resolveConflicts": true,
  "tailwindFix.autoFix.sort": true,
  "tailwindFix.autoFix.migrateVersion": "v4", // "v4", "v3", or false
  "tailwindFix.autoFix.fixTypos": true,

  // Automatically fix, deduplicate and sort on Save
  "editor.codeActionsOnSave": {
    "source.fixAll.tailwind": "explicit"
  },

  // Custom attributes and functions to inspect
  "tailwindFix.classAttributes": [
    "class",
    "className",
    "ngClass",
    ":class"
  ],
  "tailwindFix.classFunctions": [
    "cva",
    "clsx",
    "twMerge",
    "cn",
    "classnames",
    "tw"
  ]
}
```

---

## 🎮 IDE Command Palette & Right-Click Context Menus

### A. Right-Click Context Menus (No need to open Command Palette)
- **Right-Click on any file(s) or folder(s) in the File Explorer:**
  `Tailwind CSS IntelliSense Fix: Fix Tailwind Issues in Selected File(s) / Folder(s)`
  *(Recursively processes all selected files and folders with a progress bar).*
- **Right-Click inside any open file in the Editor:**
  - `Tailwind CSS IntelliSense Fix: Fix, Optimize & Sort Classes in Current File`
  - `Tailwind CSS IntelliSense Fix: Sort Selected Classes` *(when text is selected)*
- **Right-Click on the File Tab header (Tab Context):**
  `Tailwind CSS IntelliSense Fix: Fix, Optimize & Sort Classes in Current File`
- **Quick-Action Button in Top Editor Title Bar:**
  Magic Sparkle icon (`$(sparkle)`) in the top-right corner to fix the active file with a single click.

### B. Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- **`Tailwind CSS IntelliSense Fix: Fix, Optimize & Sort Classes in Current File`** (`tailwindFix.fixAll`): Analyzes, deduplicates, migrates, and sorts classes in the active document.
- **`Tailwind CSS IntelliSense Fix: Fix All Tailwind Issues in Entire Workspace`** (`tailwindFix.fixWorkspace`): Runs an interactive batch scan across all project files with progress tracking.
- **`Tailwind CSS IntelliSense Fix: Fix Tailwind Issues in Selected File(s) / Folder(s)`** (`tailwindFix.fixExplorerSelection`): Recursively fixes selected items in the explorer.
- **`Tailwind CSS IntelliSense Fix: Sort Selected Classes`** (`tailwindFix.sortSelection`): Canonicalizes selected class names.
- **`Tailwind CSS IntelliSense Fix: Show Output Channel`** (`tailwindFix.showOutput`): Opens the Language Server diagnostic log.


---

## 🏗 Architecture & Monorepo Structure

```
tailwindcss-intellisense-fix/
├── packages/
│   ├── tailwindcss-class-fixer/      # Core AST & Regex parser, deduplicator, conflict resolver & migrations
│   ├── tailwindcss-cli-fixer/        # Standalone Node.js CLI runner ('pnpm tailwind-fix')
│   ├── tailwindcss-language-service/ # Language service with CodeActionProvider & quickfixes
│   ├── tailwindcss-language-server/  # Language Server Protocol (LSP) daemon
│   └── vscode-tailwindcss/           # VS Code / Antigravity client extension & VSIX builder
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Multi-OS test matrix (Ubuntu, Windows, macOS)
│       ├── upstream-sync.yml         # Daily upstream release tracking and automated rebase
│       └── release.yml               # Automated release tagging and VSIX asset publisher
├── pnpm-workspace.yaml
└── package.json
```

---

## 🔄 Automated Upstream Synchronization

This fork includes an automated GitHub Actions pipeline (`.github/workflows/upstream-sync.yml`) that runs daily to:
1. Fetch latest release tags and commits from official `tailwindlabs/tailwindcss-intellisense`.
2. Cleanly rebase custom modules (`tailwindcss-class-fixer`, `tailwindcss-cli-fixer`) on top of upstream changes.
3. Run the automated test suite across all packages.
4. Publish updated `.vsix` binaries when a new official release is detected.

---

## 💻 Development & Contribution Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or newer
- [pnpm](https://pnpm.io/) v9 or newer

### Setup & Build
```bash
# Clone the repository
git clone https://github.com/WriteColor/tailwindcss-intellisense-fix.git
cd tailwindcss-intellisense-fix

# Install all workspace dependencies
pnpm install

# Build all packages
pnpm run build

# Run unit and integration tests
pnpm run test

# Package VSIX extension locally
pnpm run build:extension
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE), matching the upstream Tailwind Labs license.