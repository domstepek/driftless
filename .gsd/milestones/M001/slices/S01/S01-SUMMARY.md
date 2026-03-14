---
id: S01
parent: M001
milestone: M001
provides:
  - pnpm monorepo with packages/cli and packages/core
  - Vite+ (vp v0.1.11) toolchain — build, check, test all operational
  - CLI entry point with main() that prints `driftless v0.0.0`
  - S02 boundary contract types — DriftlessConfig, InitOptions, DocFramework
  - bin.driftless wired to built CLI output
  - 5 smoke tests across 2 packages
requires:
  - slice: none
    provides: first slice
affects:
  - S02 (consumes CLI entry point, core types, command routing)
  - S03 (consumes core types)
  - S04 (consumes CLI entry point, core types)
  - S05 (consumes CLI entry point)
key_files:
  - pnpm-workspace.yaml
  - package.json
  - tsconfig.json
  - .oxfmtrc.json
  - .oxlintrc.json
  - .nvmrc
  - packages/cli/package.json
  - packages/cli/vite.config.ts
  - packages/cli/tsconfig.json
  - packages/cli/src/index.ts
  - packages/cli/test/cli.test.ts
  - packages/core/package.json
  - packages/core/vite.config.ts
  - packages/core/tsconfig.json
  - packages/core/src/index.ts
  - packages/core/src/types.ts
  - packages/core/test/types.test.ts
key_decisions:
  - "D017: vp pack (not vp build) for library packages"
  - "D018: npm global install for vp (curl installer returns 403)"
  - "D019: dts:true without tsgo (tsgo fails resolving @typescript/native-preview from global vp)"
  - "D020: Independent per-package tsconfigs matching Vite+ scaffold convention"
  - "D021: Standalone .oxfmtrc.json + .oxlintrc.json instead of root vite.config.ts"
  - "D022: CLI main() auto-invokes at module level; tests mock console.log before dynamic import"
patterns_established:
  - "pnpm catalog mode with pinned Vite+ 0.1.11 and overrides aliasing vite/vitest"
  - "vp pack config in vite.config.ts using defineConfig from vite-plus"
  - "Oxfmt formatting convention (semicolons, double quotes) via standalone JSON configs"
  - "Package exports field: dist/index.mjs with types at dist/index.d.mts"
  - "Core types in packages/core/src/types.ts, re-exported from index.ts — boundary contract pattern"
  - "CLI reads version from package.json via createRequire — works with ESM + tsdown bundling"
  - "Test pattern: spy/mock setup before dynamic import for modules with side effects"
observability_surfaces:
  - "vp --version → v0.1.11 (toolchain health)"
  - "pnpm ls -r (workspace topology — missing/phantom packages visible)"
  - "npx vp check (categorized format + lint errors)"
  - "npx vp test (Vitest pass/fail with stack traces)"
  - "npx vp run -r build (per-package build timing and tsdown errors)"
  - "node packages/cli/dist/index.mjs (CLI version output)"
  - "grep DriftlessConfig packages/core/dist/index.d.mts (type export check)"
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
duration: ~35min
verification_result: passed
completed_at: 2026-03-14
---

# S01: Monorepo scaffold + Vite+ toolchain

**Working pnpm monorepo with Vite+ toolchain — two library packages building with declarations, CLI prints `driftless v0.0.0`, core exports S02 boundary types, 5 smoke tests passing.**

## What Happened

Upgraded Node to v22.22.1 (LTS Jod) for Vite+ compatibility. Installed Vite+ v0.1.11 globally via npm (the official curl installer returned HTTP 403). Scaffolded a reference monorepo with `vp create vite:monorepo` to learn conventions, then built the driftless structure manually from those patterns.

Created two library packages: `packages/core` (shared types and utilities) and `packages/cli` (the CLI tool). Both use `vp pack` with `dts: true` for ESM output with TypeScript declaration files. The root uses pnpm catalog mode to pin Vite+ versions centrally, with overrides aliasing `vite`/`vitest` to their Vite+ equivalents.

Implemented the S02 boundary contract: `DriftlessConfig`, `InitOptions`, and `DocFramework` types in core, re-exported from the package index. CLI entry point reads its version from `package.json` via `createRequire` and prints `driftless v0.0.0`. `bin.driftless` wired to the built output.

Wrote 5 smoke tests (2 CLI, 3 core) proving type exports and CLI output. Fixed a `vp check` failure where oxfmt/oxlint couldn't load `.ts` config on Node 20 — replaced root `vite.config.ts` with standalone `.oxfmtrc.json` and `.oxlintrc.json`.

## Verification

All slice-level checks pass:

- ✅ `npx vp run -r build` exits 0 — both packages produce dist/index.mjs and dist/index.d.mts
- ✅ `npx vp check` exits 0 — format and lint clean (16 files formatted, 7 linted)
- ✅ `npx vp test` exits 0 — 5 tests passing across 2 files
- ✅ `node packages/cli/dist/index.mjs` prints `driftless v0.0.0`
- ✅ `packages/core/dist/index.d.mts` contains DriftlessConfig, InitOptions, DocFramework
- ✅ Diagnostic check: `vp fmt --check` on malformed input exits non-zero with actionable error output

## Requirements Advanced

- R033 (Vite+ as unified toolchain) — `vp pack`, `vp check`, `vp test`, `vp run` all operational on the monorepo
- R034 (pnpm workspaces) — monorepo with packages/cli and packages/core, workspace protocol linking
- R035 (TypeScript strict + ESM-first) — strict mode in all tsconfigs, `"type": "module"` in all packages

## Requirements Validated

- R033 — `vp pack` builds both packages, `vp check` passes format + lint, `vp test` runs Vitest, `vp run -r build` orchestrates across workspace. All commands verified with real source code, not placeholders.
- R034 — `pnpm ls -r` shows correct workspace topology with workspace protocol linking between cli → core.
- R035 — All tsconfig.json files have `"strict": true`, all package.json files have `"type": "module"`, build output is ESM (`.mjs`).

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- **Removed root `vite.config.ts`** — oxfmt/oxlint couldn't load `.ts` config on Node 20. Replaced with standalone JSON configs (D021). Format/lint still works; type-aware lint options available as CLI flags if needed later.
- **npm global install instead of curl** — official Vite+ installer returned HTTP 403 (D018). Functionally equivalent via `npm install -g vite-plus`.
- **`dts: true` instead of `dts: { tsgo: true }`** — tsgo can't resolve `@typescript/native-preview` from global vp (D019). Standard TypeScript declaration generation works fine.

## Known Limitations

- `vp check` runs format + lint only, not typecheck. TypeScript checking requires separate `npx tsc --noEmit`. May be addressed in future Vite+ versions.
- Node 22+ is required by the engines field but the current shell runs Node 20.19.5. `nvm use 22` is needed for the global `vp` binary. CI should pin Node 22.
- The curl Vite+ installer is broken (HTTP 403 as of 2026-03-14). CI must use npm/pnpm global install.

## Follow-ups

- none

## Files Created/Modified

- `pnpm-workspace.yaml` — workspace config with catalog, overrides, packages/* glob
- `package.json` — root package with build/check/test scripts, engines ≥22.12.0
- `tsconfig.json` — root strict TypeScript config
- `.oxfmtrc.json` — oxfmt formatting config (semicolons, double quotes)
- `.oxlintrc.json` — oxlint linting config
- `.nvmrc` — pins Node 22
- `.gitignore` — dist/, node_modules/, cache dirs, .bg-shell/
- `packages/core/package.json` — @driftless/core library package
- `packages/core/vite.config.ts` — pack config with dts:true
- `packages/core/tsconfig.json` — strict TypeScript for library
- `packages/core/src/types.ts` — DriftlessConfig, InitOptions, DocFramework types
- `packages/core/src/index.ts` — re-exports all types
- `packages/core/test/types.test.ts` — 3 smoke tests for type exports
- `packages/cli/package.json` — driftless CLI with bin field and workspace dep on core
- `packages/cli/vite.config.ts` — pack config with dts:true
- `packages/cli/tsconfig.json` — strict TypeScript for library
- `packages/cli/src/index.ts` — CLI entry point with main() and version output
- `packages/cli/test/cli.test.ts` — 2 smoke tests for CLI output

## Forward Intelligence

### What the next slice should know
- CLI entry point at `packages/cli/src/index.ts` currently auto-invokes `main()` at module level. S02 will need to restructure this for command routing (e.g., introduce a commander/yargs-style dispatcher or use `@clack/prompts` directly from `main()`).
- Core types in `packages/core/src/types.ts` are the boundary contract. S02 should extend these types (add `Capability`, flesh out `DriftlessConfig` fields) rather than redefining them.
- The `bin.driftless` field in CLI package.json points to `dist/index.mjs`. After S02 adds the init command, the built output must still be a single executable entry point.

### What's fragile
- `vp check` does not include typecheck — a type error won't be caught by `vp check` alone. Run `npx tsc --noEmit` separately if type safety matters for a change.
- The global `vp` binary requires Node ≥22.12.0. If the shell defaults to an older Node, `vp` commands may silently fail or behave differently.

### Authoritative diagnostics
- `npx vp test` — 5 tests in 2 files, ~125ms. Any regression is immediately visible.
- `node packages/cli/dist/index.mjs` — should print `driftless v0.0.0`. No output or wrong output means broken import resolution or build.
- `pnpm ls -r` — workspace topology. If @driftless/core shows as `link:../core`, the workspace protocol is working.

### What assumptions changed
- Assumed Vite+ scaffold would provide a usable template directly — had to manually create the structure after studying the scaffold output, because the scaffold is designed for a different project shape.
- Assumed `vp check` includes typecheck — it only runs format + lint via oxfmt/oxlint.
