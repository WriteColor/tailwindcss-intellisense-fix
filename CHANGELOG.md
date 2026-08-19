# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.16.1] - 2026-08-19

### Added
- **Canonical Class Value Engine (`@tailwindcss/class-fixer`):**
  - Converts arbitrary spacing and sizing pixel/rem values to clean numeric scale steps (e.g. `max-h-[600px]` $\rightarrow$ `max-h-150`, `min-w-[96px]` $\rightarrow$ `min-w-24`, `translate-y-[2.5rem]` $\rightarrow$ `translate-y-10`, `-bottom-[-5px]` $\rightarrow$ `-bottom-1.25`).
  - Automatic migration of renamed v4 utilities (e.g. `break-words` $\rightarrow$ `wrap-break-word`).
- **Template String Interpolation Support:**
  - Robust segment extraction in universal parser for dynamic expressions with `${ ... }` template literals.
- **Language Switcher Banners:**
  - Instant navigation between English (`README.md`) and Spanish (`README.es.md`).

### Fixed
- **Fine-Grained Conflict Resolution:**
  - Separated `ring-width` vs `ring-color` and `outline-width` vs `outline-color` to prevent false conflict removals in shadcn/ui components.
  - Separated `text-overflow`, `text-align`, `font-size`, and `text-color`.
- **Levenshtein Typo Guard:**
  - Added pattern recognition for gradient color stops (`from-`, `via-`, `to-`), flexbox utilities (`flex-1`, `flex-none`, `flex-auto`), and arbitrary bracket syntax.
- **LSP `params.range` Null-Safety:**
  - Fallback to diagnostic range when `params.range` is undefined in Language Server code action requests.
- **TypeScript Overwrite Bug:**
  - Added `"noEmit": true` and `"skipLibCheck": true` in `tsconfig.json` to prevent conflicts with `src/watcher/index.js` and global `CSS` type definitions.
- **Git Symlink Checkout on Linux/macOS:**
  - Replaced symlink file mode with direct regular file mode for root documentation.

---

## [0.16.0] - 2026-08-19

### Added
- **Intelligent Auto-Fix Engine (`@tailwindcss/class-fixer`):**
  - Deduplication, conflict resolution, Tailwind v3 $\rightarrow$ v4 migrations, canonical class sorting, and Levenshtein typo fixes.
- **Universal Parser:**
  - Zero-config class extractor for HTML, JSX, TSX, Vue, Svelte, PHP, Blade, Twig, Jinja, Go, Rust (Leptos/Yew), Elixir, CSS `@apply`, and `clsx`/`cva`/`twMerge`/`cn` helpers.
- **Headless CLI (`@tailwindcss/cli-fixer`):**
  - Standalone executable CLI (`pnpm tailwind-fix`) with `--check`, `--write`, `--diff`, and `--migrate` flags.
- **LSP Code Actions Provider (`@tailwindcss/language-service`):**
  - Interactive QuickFixes (lightbulb / `Ctrl+.`) and `source.fixAll.tailwind` support on save.
- **VS Code & Antigravity IDE Extension Commands:**
  - `Tailwind CSS: Fix, Optimize & Sort Classes in Current File`
  - `Tailwind CSS: Fix All Tailwind Issues in Entire Workspace`
- **Continuous Upstream Sync Workflow:**
  - Automated daily tracking and rebase against `tailwindlabs/tailwindcss-intellisense`.
