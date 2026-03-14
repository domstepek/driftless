---
id: T02
parent: S01
milestone: M001
provides:
  - CLI entry point with `main()` that prints `driftless v0.0.0`
  - S02 boundary contract types: `DriftlessConfig`, `InitOptions`, `DocFramework`
  - Smoke tests for both packages (5 tests total)
  - Working `vp check` (format + lint) via standalone JSON configs
key_files:
  - packages/cli/src/index.ts
  - packages/core/src/types.ts
  - packages/core/src/index.ts
  - packages/cli/test/cli.test.ts
  - packages/core/test/types.test.ts
  - .oxfmtrc.json
  - .oxlintrc.json
key_decisions:
  - "D021: Standalone .oxfmtrc.json + .oxlintrc.json instead of root vite.config.ts — oxfmt/oxlint can't load .ts configs on Node 20"
  - "D022: CLI main() auto-invokes at module level; tests mock console.log before dynamic import"
patterns_established:
  - "Core types in packages/core/src/types.ts, re-exported from index.ts — boundary contract pattern for downstream slices"
  - "CLI reads version from package.json via createRequire — works with ESM + tsdown bundling"
  - "Test pattern: spy/mock setup before dynamic import for modules with side effects"
observability_surfaces:
  - "`node packages/cli/dist/index.mjs` — prints version, confirms CLI wiring"
  - "`grep -l 'DriftlessConfig' packages/core/dist/index.d.mts` — confirms type exports in build output"
  - "`npx vp test` — 5 passing tests across 2 files"
  - "`npx vp check` — format + lint green"
duration: ~15min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Wire CLI entry point, core types, smoke tests, and verify full toolchain

**Replaced placeholders with real implementations: CLI prints `driftless v0.0.0`, core exports S02 boundary types, 5 smoke tests pass, full toolchain verified end-to-end.**

## What Happened

Implemented the three source files: `packages/core/src/types.ts` with `DriftlessConfig`, `InitOptions`, and `DocFramework` type definitions; `packages/core/src/index.ts` re-exporting all types; and `packages/cli/src/index.ts` with a `main()` function that reads version from `package.json` via `createRequire` and prints `driftless v{version}`.

Added `bin.driftless` to CLI `package.json` pointing to `dist/index.mjs`.

Wrote 5 smoke tests across 2 files: core tests verify type shapes and `DocFramework` values, CLI tests verify `main()` output and version match.

Fixed a pre-existing `vp check` failure — oxfmt and oxlint couldn't load `vite.config.ts` on Node 20 (requires Node 22.6+ for native TS import). Removed the root `vite.config.ts` and created standalone `.oxfmtrc.json` + `.oxlintrc.json` configs. `vp check` now passes cleanly.

## Verification

All task-level and slice-level checks pass:

- ✅ `npx vp run -r build` exits 0 — both packages produce dist/ with `.mjs` and `.d.mts`
- ✅ `npx vp check` exits 0 — format and lint clean
- ✅ `npx vp test` exits 0 — 5 tests passing across 2 files
- ✅ `node packages/cli/dist/index.mjs` prints `driftless v0.0.0`
- ✅ `grep -l 'DriftlessConfig' packages/core/dist/index.d.mts` finds declaration file
- ✅ Diagnostic check: `vp fmt --check` on malformed input produces non-zero exit with file list

## Diagnostics

- `npx vp test` — Vitest reporter shows pass/fail counts and failure stack traces
- `node packages/cli/dist/index.mjs` — prints version; no output or wrong version means broken import resolution
- `npx vp check` — exits non-zero with per-category output (format issues list files, lint shows rule violations)
- `cat packages/core/dist/index.d.mts` — shows exported type declarations for S02 boundary contract

## Deviations

- **Removed root `vite.config.ts`**: Was causing `vp check` to fail on Node 20 due to oxfmt/oxlint inability to load `.ts` config files without native TS support. Replaced with `.oxfmtrc.json` and `.oxlintrc.json`. The `lint.options.typeAware` and `lint.options.typeCheck` settings from the original config are available as CLI flags if needed later. (D021)
- **`.gitignore` already complete**: T01 and the GSD baseline already covered `dist/`, `node_modules/`, and cache directories. No changes needed.

## Known Issues

- `vp check` does not include typecheck (only format + lint). TypeScript checking works via `npx tsc --noEmit` separately. The `vp` toolchain may support a `--typecheck` flag in `vp check` in future versions.

## Files Created/Modified

- `packages/core/src/types.ts` — S02 boundary contract: DriftlessConfig, InitOptions, DocFramework
- `packages/core/src/index.ts` — re-exports all types from types.ts
- `packages/cli/src/index.ts` — CLI entry point with main() and version printing
- `packages/cli/package.json` — added bin.driftless field
- `packages/cli/test/cli.test.ts` — smoke tests for CLI version output
- `packages/core/test/types.test.ts` — smoke tests for core type exports
- `.oxfmtrc.json` — oxfmt config (replaces vite.config.ts for formatter)
- `.oxlintrc.json` — oxlint config (replaces vite.config.ts for linter)
- `vite.config.ts` — removed (replaced by standalone JSON configs)
- `.gsd/DECISIONS.md` — appended D021, D022
- `.gsd/milestones/M001/slices/S01/tasks/T02-PLAN.md` — added Observability Impact section
