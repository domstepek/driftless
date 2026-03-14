---
id: T01
parent: S04
milestone: M003
provides:
  - PackageManager type and config fields on DriftlessConfig
  - detectPackageManager(), getGlobalInstallCommand(), isNpxContext() utilities
  - checkForUpdate() with 5s timeout and safe error handling
  - performUpdate() orchestration (CI skip, npx notify, major warn, install, permission hint)
  - 33 new unit tests covering all branches
key_files:
  - packages/core/src/package-manager.ts
  - packages/core/src/auto-update.ts
  - packages/core/src/types.ts
  - packages/core/src/index.ts
  - packages/core/test/package-manager.test.ts
  - packages/core/test/auto-update.test.ts
key_decisions:
  - No external semver library — 10-line parseSemver + isNewerVersion covers exact x.y.z comparison
  - checkForUpdate accepts optional registryUrl for testability without mocking fetch globally
patterns_established:
  - Structured return types for fallible operations (UpdateCheckResult always returns, never throws)
  - stderr for user-facing warnings/hints, structured return values for programmatic callers
observability_surfaces:
  - checkForUpdate() returns { current, latest, isNewer, isMajor } — inspectable by callers
  - performUpdate() writes stderr hints on permission errors, notifications in npx context
duration: 12m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Build auto-update and package-manager modules in core

**Created two new core modules with full test coverage for auto-update version checking, package manager detection, and update orchestration.**

## What Happened

Added `PackageManager` type (`"npm" | "pnpm" | "yarn" | "bun"`) and optional `autoUpdate`/`packageManager` fields to `DriftlessConfig` in types.ts — both optional for backward compat.

Created `package-manager.ts` with three utilities: `detectPackageManager()` parses `npm_config_user_agent` (splits on `/`, takes first token) with fallback to config then npm; `getGlobalInstallCommand()` returns the correct install string per PM; `isNpxContext()` checks `npm_execpath` for `npx-cli` and `_` for `npx`.

Created `auto-update.ts` with `checkForUpdate()` (fetches registry with 5s AbortController timeout, parses version, compares via local `isNewerVersion()`, returns structured result, never throws) and `performUpdate()` (skips on CI, notifies on npx, warns on major, detects PM, runs global install, hints on permission error).

Exported all new public symbols from the core barrel. Wrote 33 new tests across two test files covering all branches from the research doc.

## Verification

- `pnpm run test` — **255 tests pass** (222 existing + 33 new, 0 failures)
- `pnpm run build` — both packages build clean, no type errors
- `packages/core/test/package-manager.test.ts` — 16 tests: npm/pnpm/yarn/bun user agent parsing, missing user agent with config fallback, unrecognized user agent, missing everything falls to npm, install commands per PM, npx detection positive/negative
- `packages/core/test/auto-update.test.ts` — 17 tests: newer/same/older version, minor bump, patch bump, network timeout, HTTP 404, malformed JSON, json() throws, CI skip, npx notification, major version warning, execSync install, permission error hint, config packageManager fallback, npm default

### Slice-level verification (partial — T01 of 2):
- ✅ `pnpm run test` — all 255 tests pass
- ✅ `packages/core/test/auto-update.test.ts` — all listed branches covered
- ✅ `packages/core/test/package-manager.test.ts` — all listed branches covered
- ⬜ `packages/cli/test/cli.test.ts` — existing tests pass (8/8); auto-update hook wiring is T02
- ✅ `pnpm run build` — both packages build clean

## Diagnostics

- `checkForUpdate()` returns `{ current, latest, isNewer, isMajor }` — call directly to inspect version state
- `performUpdate()` writes to stderr on: npx notification, major version warning, permission error hint
- All error paths in `checkForUpdate()` return the safe default (never throws) — timeout, non-200, bad JSON all produce `{ isNewer: false }`

## Deviations

- Added optional `registryUrl` parameter to `checkForUpdate()` and `PerformUpdateOptions` for test injection — cleaner than requiring global fetch stubs in integration tests. Not in the original plan but a natural extension.

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/types.ts` — added `PackageManager` type, `autoUpdate` and `packageManager` optional fields to `DriftlessConfig`
- `packages/core/src/package-manager.ts` — new module: PM detection, install commands, npx detection
- `packages/core/src/auto-update.ts` — new module: version check, semver comparison, update orchestration
- `packages/core/src/index.ts` — added exports for all new public symbols
- `packages/core/test/package-manager.test.ts` — 16 tests for PM module
- `packages/core/test/auto-update.test.ts` — 17 tests for auto-update module
