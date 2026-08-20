<div align="center">

  <img src="icon.png" alt="Tailwind CSS IntelliSense Fix Icon" width="128" />

  # Tailwind CSS IntelliSense (Fork con Auto-Fixer Inteligente y Soporte Universal)

  **Idioma / Language:** [🇪🇸 Español](README.es.md) • [🇺🇸 English](README.md)

</div>


[![CI Test Matrix](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/ci.yml/badge.svg)](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/ci.yml)

[![Upstream Sync](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/upstream-sync.yml/badge.svg)](https://github.com/WriteColor/tailwindcss-intellisense-fix/actions/workflows/upstream-sync.yml)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/mantenido%20con-pnpm-f69220.svg)](https://pnpm.io/)

> **Herramienta de próxima generación para Tailwind CSS, Language Server Protocol (LSP) en tiempo real y motor de análisis y auto-reparación de clases con compatibilidad universal retrocompatible para Antigravity IDE, VS Code, Cursor, Windsurf y VSCodium.**

---

## 📖 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Características Principales](#-características-principales)
  - [1. Deduplicación Automática de Clases](#1-deduplicación-automática-de-clases)
  - [2. Resolución de Conflictos de Especificidad](#2-resolución-de-conflictos-de-especificidad)
  - [3. Motor de Migración de Sintaxis (v3 a v4)](#3-motor-de-migración-de-sintaxis-v3-a-v4)
  - [4. Ordenamiento Canónico Oficial](#4-ordenamiento-canónico-oficial)
  - [5. Corrección Inteligente de Errores Tipográficos (Typos)](#5-corrección-inteligente-de-errores-tipográficos-typos)
  - [6. Soporte Universal Zero-Config para Cualquier Lenguaje y Plantilla](#6-soporte-universal-zero-config-para-cualquier-lenguaje-y-plantilla)
- [Guía de Instalación](#-guía-de-instalación)
  - [Instalación en Antigravity IDE](#instalación-en-antigravity-ide)
  - [Instalación en VS Code / Cursor / Windsurf / VSCodium](#instalación-en-vs-code--cursor--windsurf--vscodium)
- [Herramienta CLI Headless (`pnpm tailwind-fix`)](#-herramienta-cli-headless-pnpm-tailwind-fix)
  - [Opciones y Banderas de la CLI](#opciones-y-banderas-de-la-cli)
  - [Ejemplos de Uso de la CLI](#ejemplos-de-uso-de-la-cli)
  - [Integración en Pre-commit y CI/CD](#integración-en-pre-commit-y-cicd)
- [Configuración y Parámetros](#-configuración-y-parámetros)
  - [Opciones de Auto-Fix](#opciones-de-auto-fix)
  - [Acciones de Código al Guardar (Code Actions on Save)](#acciones-de-código-al-guardar-code-actions-on-save)
  - [Atributos y Funciones Personalizadas](#atributos-y-funciones-personalizadas)
- [Paleta de Comandos del IDE](#-paleta-de-comandos-del-ide)
- [Arquitectura y Estructura del Monorepo](#-arquitectura-y-estructura-del-monorepo)
- [Sincronización Continua Automatizada con Upstream](#-sincronización-continua-automatizada-con-upstream)
- [Guía de Desarrollo y Contribución](#-guía-de-desarrollo-y-contribución)
- [Licencia](#-licencia)

---

## 🌟 Visión General

`tailwindcss-intellisense-fix` es un fork optimizado y 100% retrocompatible de la extensión oficial `tailwindlabs/tailwindcss-intellisense`. Combina todas las capacidades oficiales del Language Server (autocompletado inteligente, previsualización de colores, documentación flotante y linteo) con un **Motor de Corrección de Clases** desacoplado (`@tailwindcss/class-fixer`) y una **CLI Headless** (`@tailwindcss/cli-fixer`).

El sistema detecta, lintea y optimiza clases de Tailwind CSS en **cualquier formato de archivo o lenguaje de programación sin fricción**, ofreciendo soporte completo para Tailwind CSS v4 (`@theme`, `@import "tailwindcss"`), v3 (`tailwind.config.js`) y versiones anteriores.

---

## 🚀 Características Principales

### 1. Deduplicación Automática de Clases
Elimina nombres de clases redundantes conservando intactos los prefijos de variantes (`hover:`, `dark:`, `md:`), valores arbitrarios entre corchetes y el modificador de importancia `!`:
```html
<!-- Antes -->
<div class="px-4 py-2 px-4 text-center py-2 hover:bg-blue-500 hover:bg-blue-500"></div>

<!-- Después -->
<div class="px-4 py-2 text-center hover:bg-blue-500"></div>
```

### 2. Resolución de Conflictos de Especificidad
Resuelve colisiones entre propiedades CSS aplicadas al mismo elemento y ámbito de variantes. Sigue la semántica de cascada CSS y especificidad de Tailwind donde prevalece la clase situada más a la derecha:
```html
<!-- Antes -->
<button class="p-2 text-red-500 p-4 text-blue-600 block hidden"></button>

<!-- Después -->
<button class="p-4 text-blue-600 hidden"></button>
```

### 3. Motor de Migración de Sintaxis (v3 a v4)
Convierte automáticamente utilidades obsoletas y sintaxis de versiones anteriores a sus equivalentes modernos de Tailwind CSS:
- `flex-grow` $\rightarrow$ `grow`
- `flex-grow-0` $\rightarrow$ `grow-0`
- `flex-shrink` $\rightarrow$ `shrink`
- `flex-shrink-0` $\rightarrow$ `shrink-0`
- `overflow-ellipsis` $\rightarrow$ `text-ellipsis`
- `overflow-clip` $\rightarrow$ `text-clip`
- `bg-red-500 bg-opacity-50` $\rightarrow$ `bg-red-500/50`

### 4. Ordenamiento Canónico Oficial
Aplica el orden canónico recomendado por Tailwind CSS de forma nativa directamente en el LSP (Estructura $\rightarrow$ Dimensiones $\rightarrow$ Espaciado $\rightarrow$ Flex/Grid $\rightarrow$ Tipografía $\rightarrow$ Fondos $\rightarrow$ Bordes $\rightarrow$ Efectos $\rightarrow$ Transiciones $\rightarrow$ Variantes de estado):
```html
<!-- Antes -->
<div class="hover:bg-blue-600 p-4 bg-blue-500 block text-white font-bold"></div>

<!-- Después -->
<div class="block p-4 font-bold text-white bg-blue-500 hover:bg-blue-600"></div>
```

### 5. Corrección Inteligente de Errores Tipográficos (Typos)
Calcula la distancia de Levenshtein contra el vocabulario oficial de utilidades de Tailwind para sugerir y reparar automáticamente fallos de escritura:
- `felx` $\rightarrow$ `flex`
- `itmes-center` $\rightarrow$ `items-center`
- `justfiy-between` $\rightarrow$ `justify-between`

### 6. Soporte Universal Zero-Config para Cualquier Lenguaje y Plantilla
Detecta clases en cualquier entorno sin necesidad de configurar expresiones regulares manuales:
- **Frameworks Frontend:** React (JSX/TSX), Vue, Svelte, Angular, Astro, Solid, Qwik.
- **Motores de Plantillas Backend:** PHP (Blade, Twig), Python (Django, Jinja2), Ruby (ERB), Go templates, Rust (Leptos, Yew, Dioxus), Elixir (HEEx, EEx).
- **Hojas de Estilo:** CSS, SCSS, Sass, PostCSS con directivas `@apply`.
- **Helpers de Composición:** Extracción nativa para `clsx()`, `cva()`, `twMerge()`, `cn()`, `classnames()` y plantillas etiquetadas (`tw`...``).

---

## 📥 Guía de Instalación

### Instalación en Antigravity IDE
1. Descarga el paquete `.vsix` más reciente desde la sección de [Releases](https://github.com/WriteColor/tailwindcss-intellisense-fix/releases) (o compílalo localmente).
2. En Antigravity IDE, presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en macOS).
3. Escribe `Extensions: Install from VSIX...` y selecciona el archivo `.vsix`.
4. Recarga la ventana si el editor lo solicita.

### Instalación en VS Code / Cursor / Windsurf / VSCodium
```bash
# Usando CLI de VS Code
code --install-extension tailwindcss-intellisense-fix-0.16.1.vsix

# Usando CLI de Cursor
cursor --install-extension tailwindcss-intellisense-fix-0.16.1.vsix

# Usando CLI de VSCodium
codium --install-extension tailwindcss-intellisense-fix-0.16.1.vsix
```

---

## 🛠 Herramienta CLI Headless (`pnpm tailwind-fix`)

El repositorio incluye una herramienta de línea de comandos independiente para ejecutar diagnósticos y arreglos masivos en entornos sin interfaz gráfica (CI/CD, scripts, pre-commit hooks):

### Opciones y Banderas de la CLI

| Bandera | Alias | Descripción | Valor por Defecto |
|---|---|---|---|
| `--write` | `-w` | Aplica las modificaciones directamente a los archivos en disco | `false` (dry-run) |
| `--check` | `-c` | Audita sin modificar (retorna código de salida 1 si hay problemas) | `false` |
| `--diff` | `-d` | Imprime diffs visuales coloreados en la terminal | `true` |
| `--no-diff` | | Desactiva la salida visual de diffs | `false` |
| `--no-sort` | | Desactiva el ordenamiento canónico | `false` |
| `--no-dedupe` | | Desactiva la deduplicación de clases | `false` |
| `--no-conflicts` | | Desactiva la resolución de conflictos | `false` |
| `--no-typos` | | Desactiva la corrección de errores tipográficos | `false` |
| `--migrate <v>` | `-m` | Versión objetivo de migración (`v4`, `v3` o `off`) | `v4` |
| `--cwd <ruta>` | | Ruta base de ejecución | `process.cwd()` |
| `--help` | `-h` | Muestra la ayuda y opciones disponibles | |

### Ejemplos de Uso de la CLI

```bash
# 1. Auditar todo el proyecto en modo verificación (para CI)
pnpm tailwind-fix --check

# 2. Reparar y formatear todos los archivos del proyecto
pnpm tailwind-fix --write

# 3. Reparar un directorio específico
pnpm tailwind-fix --write src/components/

# 4. Migrar un proyecto v3 a la sintaxis moderna de Tailwind v4
pnpm tailwind-fix --write --migrate=v4
```

### Integración en Pre-commit y CI/CD

#### Hook de Husky (`.husky/pre-commit`)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm tailwind-fix --write
git add -u
```

#### Workflow de GitHub Actions
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
      - name: Validar Clases de Tailwind
        run: pnpm tailwind-fix --check
```

---

## ⚙ Configuración y Parámetros

Agrega estas opciones en tu archivo `.vscode/settings.json` o configuración global (compatible con el prefijo `tailwindFix.*` y con fallback transparente a `tailwindCSS.*`):

```jsonc
{
  // Activa o desactiva las funciones automáticas del motor Fixer
  "tailwindFix.autoFix.enable": true,
  "tailwindFix.autoFix.dedupe": true,
  "tailwindFix.autoFix.resolveConflicts": true,
  "tailwindFix.autoFix.sort": true,
  "tailwindFix.autoFix.migrateVersion": "v4", // "v4", "v3" o false
  "tailwindFix.autoFix.fixTypos": true,

  // Ejecución automática al guardar el archivo (Opcional)
  "editor.codeActionsOnSave": {
    "source.fixAll.tailwind": "explicit"
  },

  // Atributos y funciones personalizadas (clsx, cva, cn, twMerge, etc.)
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

## 🎮 Paleta de Comandos y Menús Contextuales (Clic Derecho)

### A. Acceso Directo por Clic Derecho (Sin abrir la paleta)
- **Clic derecho sobre cualquier archivo, múltiples archivos o carpetas en el Explorador:**
  `Tailwind CSS IntelliSense Fix: Fix Tailwind Issues in Selected File(s) / Folder(s)`
  *(Escanea y repara recursivamente todos los archivos seleccionados con barra de progreso).*
- **Clic derecho dentro de cualquier archivo abierto en el Editor:**
  - `Tailwind CSS IntelliSense Fix: Fix, Optimize & Sort Classes in Current File`
  - `Tailwind CSS IntelliSense Fix: Sort Selected Classes` *(cuando hay texto seleccionado)*
- **Clic derecho en la pestaña del archivo superior (Tab Context):**
  `Tailwind CSS IntelliSense Fix: Fix, Optimize & Sort Classes in Current File`
- **Botón de Acción Rápida en la Barra Superior:**
  Icono de varita mágica/destello (`$(sparkle)`) en la esquina superior derecha del editor para reparar el archivo activo con 1 solo clic.

### B. Paleta de Comandos (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- **`Tailwind CSS IntelliSense Fix: Fix, Optimize & Sort Classes in Current File`** (`tailwindFix.fixAll`): Analiza, deduplica, migra y ordena las clases del documento activo.
- **`Tailwind CSS IntelliSense Fix: Fix All Tailwind Issues in Entire Workspace`** (`tailwindFix.fixWorkspace`): Ejecuta un escaneo masivo interactivo en todos los archivos del proyecto con barra de progreso.
- **`Tailwind CSS IntelliSense Fix: Fix Tailwind Issues in Selected File(s) / Folder(s)`** (`tailwindFix.fixExplorerSelection`): Repara archivos o carpetas seleccionadas en el explorador.
- **`Tailwind CSS IntelliSense Fix: Sort Selected Classes`** (`tailwindFix.sortSelection`): Ordena canónicamente el texto o clases seleccionadas.
- **`Tailwind CSS IntelliSense Fix: Show Output Channel`** (`tailwindFix.showOutput`): Muestra la consola de diagnóstico del Language Server.

---

## 🏗 Arquitectura y Estructura del Monorepo

```
tailwindcss-intellisense-fix/
├── packages/
│   ├── tailwindcss-class-fixer/      # Parser AST/Regex, deduplicador, conflictos y migraciones
│   ├── tailwindcss-cli-fixer/        # CLI Headless para terminal ('pnpm tailwind-fix')
│   ├── tailwindcss-language-service/ # Language service con CodeActions y QuickFixes
│   ├── tailwindcss-language-server/  # Servidor LSP (daemon de comunicación)
│   └── vscode-tailwindcss/           # Extensión cliente VS Code / Antigravity y empaquetador VSIX
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Matriz de tests multi-sistema operativo
│       ├── upstream-sync.yml         # Sincronización continua y rebase automático diario
│       └── release.yml               # Publicación automatizada de releases y artefactos VSIX
├── pnpm-workspace.yaml
└── package.json
```

---

## 🔄 Sincronización Continua Automatizada con Upstream

Este fork cuenta con un flujo de GitHub Actions (`.github/workflows/upstream-sync.yml`) que se ejecuta a diario para:
1. Comprobar nuevos tags y lanzamientos en `tailwindlabs/tailwindcss-intellisense`.
2. Aplicar rebase automático de nuestros módulos (`tailwindcss-class-fixer`, `tailwindcss-cli-fixer`).
3. Ejecutar la suite de pruebas unitarias y de integración.
4. Generar y publicar binarios `.vsix` actualizados.

---

## 💻 Guía de Desarrollo y Contribución

### Requisitos Previos
- [Node.js](https://nodejs.org/) v20 o superior
- [pnpm](https://pnpm.io/) v9 o superior (exclusivamente)

### Compilación y Pruebas Locales
```bash
# Clonar el repositorio
git clone https://github.com/WriteColor/tailwindcss-intellisense-fix.git
cd tailwindcss-intellisense-fix

# Instalar dependencias del monorepo
pnpm install

# Compilar todos los paquetes
pnpm run build

# Ejecutar suite de pruebas
pnpm run test

# Empaquetar la extensión VSIX
pnpm run build:extension
```

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia [MIT](LICENSE), en total conformidad con la licencia del proyecto oficial de Tailwind Labs.
