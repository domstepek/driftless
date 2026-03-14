---
id: S04
parent: M003
milestone: M003
provides:
  - checkForUpdate() with 5s timeout, structured return, safe error handling
  - performUpdate() orchestration (CI skip, npx notify, major warn, install, permission hint)
  - detectPackageManager(), getGlobalInstallCommand(), isNpxContext() utilities
  - PackageManager type and autoUpdate/packageManager optional fields on DriftlessConfig
  - Pre-command auto-update hook in CLI entry point (tryAutoUpdate)
  - Auto-update confirm prompt in init wizard
  - autoUpdate field threaded through config persistence
requires:
  - slice: S01
    provides: Published @driftless-ai/cli on npm (registry version check target), DriftlessConfig type and readConfig() pattern
affects: []
key_files:
  - packages/core/src/auto-update.ts
  - packages/core/src/package-manager.ts
  - packages/core/src/types.ts
  - packages/core/src/index.ts
  - packages/cli/src/index.ts
  - packages/cli/src/prompts/init-prompts.ts
  - packages/core/test/auto-update.test.ts
  - packages/core/test/package-manager.test.ts
  - packages/cli/test/cli.test.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - "D051: No external semver library — 10-line parseSemver + isNewerVersion for exact x.y.z comparison"
  - "D052: Dynamic import for auto-update hook — keeps --version/--help instant (~66ms)"
  - Auto-update confirm placed after p.group() rather than inside it — keeps project config group focused
  - checkForUpdate accepts optional registryUrl for test injection — cleaner than global fetch mocks
patterns_established:
  - Structured return types for fallible operations (UpdateCheckResult always returns, never throws)
  - stderr for user-facing warnings/hints, structured return values for programmatic callers
  - Try/catch swallow pattern for pre-command hooks — update failures never block CLI operation
observability_surfaces:
  - checkForUpdate() returns { current, latest, isNewer, isMajor } — inspectable by callers and tests
  - performUpdate() writes stderr hints on npx notification, major version warning, permission error
  - autoUpdate field visible in .driftless.json after init
  - No visible signal on hook failure (by design — update checks must never block CLI)
drill_down_paths:
  - .gsd/milestones/M003/slices/S04/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S04/tasks/T02-SUMMARY.md
duration: 24m
verification_result: passed
completed_at: 2026-03-14
---

# S04: CLI Auto-Update

**Version check, package manager detection, and auto-update orchestration with pre-command CLI hook and init wizard integration.**

## What Happened

Built two new core modules (`auto-update.ts`, `package-manager.ts`) and wired them into the CLI lifecycle.

**T01** created all auto-update infrastructure in core. `package-manager.ts` provides `detectPackageManager()` (parses `npm_config_user_agent` with fallback chain: env → config → npm), `getGlobalInstallCommand()` (correct install string per PM: npm/pnpm/yarn/bun), and `isNpxContext()` (checks `npm_execpath` and `_` env vars). `auto-update.ts` provides `checkForUpdate()` (fetches registry with 5s AbortController timeout, compares via local semver parser, returns structured result, never throws) and `performUpdate()` (skips on CI, notifies on npx, warns on major, detects PM, runs global install, hints on permission error). Added `PackageManager` type and optional `autoUpdate`/`packageManager` fields to `DriftlessConfig`. All symbols exported from core barrel. 33 tests covering all branches.

**T02** connected the core modules to the CLI. Added `tryAutoUpdate()` in `packages/cli/src/index.ts` — a try/catch wrapper using dynamic import of core to keep fast paths instant. Placed after `--version`/`--help` early returns, before command routing. Added `p.confirm()` for auto-update preference after `p.group()` in the init wizard. The `autoUpdate` field flows through to `.driftless.json` automatically via the existing JSON serialization. 13 new tests (8 CLI + 5 init) verify hook behavior and prompt integration.

## Verification

- `pnpm run test` — **268 tests pass** across 14 files (222 baseline + 46 new)
  - `packages/core/test/auto-update.test.ts` — 17 tests: newer/same/older version, minor bump, patch bump, network timeout, HTTP 404, malformed JSON, json() throws, CI skip, npx notification, major version warning, execSync install, permission error hint, config packageManager fallback, npm default
  - `packages/core/test/package-manager.test.ts` — 16 tests: npm/pnpm/yarn/bun user agent parsing, missing user agent with config fallback, unrecognized user agent, missing everything falls to npm, install commands per PM, npx detection positive/negative
  - `packages/cli/test/cli.test.ts` — 15 tests: existing 8 pass + 7 auto-update hook tests (config exists with autoUpdate, config missing, autoUpdate false, hook error swallowed)
  - `packages/cli/test/init.test.ts` — 50 tests: existing pass + auto-update prompt tests, confirm mock ordering updated
- `pnpm run build` — both packages build clean
- `node packages/cli/dist/index.mjs --version` returns in 66ms — fast path unaffected by hook
- `checkForUpdate()` returns structured `{ current, latest, isNewer, isMajor }` — network failures produce safe `{ isNewer: false }` default

## Requirements Advanced

- R036 — CLI auto-update fully implemented: version check, PM detection, auto-install, npx notification, network failure skip, major version warning, CI skip, init wizard prompt

## Requirements Validated

- R036 — 46 unit tests cover all specified branches (version check, PM detection, npx detection, network failures, major version, CI skip, permission errors). Hook wiring verified via CLI tests. Build and --version fast path confirmed.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Added optional `registryUrl` parameter to `checkForUpdate()` and `PerformUpdateOptions` for test injection — cleaner than requiring global fetch stubs. Not in the original plan but a natural extension for testability.

## Known Limitations

- Semver comparison handles only exact `x.y.z` — no pre-release tags, build metadata, or range matching. Sufficient for npm registry version comparison but would need a library if range support is ever needed.
- npx detection is heuristic-based (checks `npm_execpath` for `npx-cli` and `_` for `npx`). May miss edge cases with non-standard npx wrappers or future npx implementations.

## Follow-ups

- none

## Files Created/Modified

- `packages/core/src/types.ts` — added `PackageManager` type, `autoUpdate` and `packageManager` optional fields to `DriftlessConfig`
- `packages/core/src/package-manager.ts` — new: PM detection, install commands, npx detection
- `packages/core/src/auto-update.ts` — new: version check, semver comparison, update orchestration
- `packages/core/src/index.ts` — added exports for all new public symbols
- `packages/core/test/package-manager.test.ts` — 16 tests for PM module
- `packages/core/test/auto-update.test.ts` — 17 tests for auto-update module
- `packages/cli/src/index.ts` — added tryAutoUpdate() pre-command hook with dynamic imports
- `packages/cli/src/prompts/init-prompts.ts` — added p.confirm() for auto-update preference
- `packages/cli/test/cli.test.ts` — added auto-update hook tests
- `packages/cli/test/init.test.ts` — added auto-update prompt tests, updated confirm mock ordering

## Forward Intelligence

### What the next slice should know
- This is the final slice of M003. The milestone is complete — all four slices shipped.
- Both `@driftless-ai/core` and `@driftless-ai/cli` are at 1.0.0 on npm with full CI, community files, and auto-update.

### What's fragile
- npx detection heuristics — if npx internals change (env var names/values), `isNpxContext()` will silently return false (safe failure, but users won't see the notification)
- The 5s fetch timeout is hardcoded — if npm registry is slow in certain regions, version checks may silently fail more often than expected

### Authoritative diagnostics
- `checkForUpdate('1.0.0')` called directly — returns the structured result for any version comparison scenario
- `pnpm run test` — 268 tests across 14 files is the authoritative health check

### What assumptions changed
- Assumed init tests would need changes to `commands/init.ts` — the existing JSON serialization handled `autoUpdate` field automatically, so only prompt changes were needed
