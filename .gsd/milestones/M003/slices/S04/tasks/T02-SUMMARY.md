---
id: T02
parent: S04
milestone: M003
provides:
  - Pre-command auto-update hook in CLI entry point (tryAutoUpdate)
  - Auto-update confirm prompt in init wizard
  - autoUpdate field threaded through config construction and persistence
key_files:
  - packages/cli/src/index.ts
  - packages/cli/src/prompts/init-prompts.ts
  - packages/cli/test/cli.test.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - Auto-update hook uses dynamic import of @driftless-ai/core to keep --version/--help instant (no eagerly loaded modules)
  - Auto-update confirm placed after p.group() rather than inside it — keeps the group focused on project config, asks auto-update as a standalone follow-up
patterns_established:
  - Try/catch swallow pattern for pre-command hooks — any failure in tryAutoUpdate is silently caught so the user's command always runs
observability_surfaces:
  - performUpdate writes to stderr on npx notification, major version warning, permission error hint
  - autoUpdate field visible in .driftless.json after init
  - No visible signal on hook failure (by design — update checks must never block CLI)
duration: 12 min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Wire auto-update into CLI entry point and init wizard

**Connected core auto-update modules to CLI: pre-command hook calls performUpdate when config has autoUpdate: true, init wizard prompts for auto-update preference, field persists to .driftless.json.**

## What Happened

Added `tryAutoUpdate()` function to `packages/cli/src/index.ts` — a try/catch wrapper that dynamically imports `configExists`, `readConfig`, and `performUpdate` from core. Placed the call after --version/--help early returns but before command routing. The function silently skips when: no config file exists, `autoUpdate` is not `true`, or `performUpdate` throws.

Added `p.confirm()` prompt to `packages/cli/src/prompts/init-prompts.ts` after the `p.group()` call. Defaults to `true`. Handles cancellation with `p.isCancel()` + `process.exit(0)`. Returns the choice as `autoUpdate` in the `DriftlessConfig` return value.

No changes needed to `packages/cli/src/commands/init.ts` — the config object from `gatherConfig()` already gets serialized as-is via `JSON.stringify`, so the `autoUpdate` field flows through automatically.

Added 8 new tests across cli.test.ts and init.test.ts. Updated existing tests to handle the new confirm call in gatherConfig (overwrite prompt tests now mock both confirm calls).

## Verification

- `pnpm run test` — 268 tests pass across 14 files (baseline was 222+, T01 added ~33, this task adds 8)
- `pnpm run build` — both packages build clean
- `node packages/cli/dist/index.mjs --version` returns in 74ms (no network call, no auto-update check)
- Slice-level checks:
  - ✅ `packages/core/test/auto-update.test.ts` — 17 tests pass (T01)
  - ✅ `packages/core/test/package-manager.test.ts` — 16 tests pass (T01)
  - ✅ `packages/cli/test/cli.test.ts` — 15 tests pass (existing + auto-update hook tests)
  - ✅ `packages/cli/test/init.test.ts` — 50 tests pass (existing + auto-update prompt tests)
  - ✅ Both packages build clean

## Diagnostics

- `performUpdate()` writes to stderr: npx notification, major version warning, permission error hint
- Inspect `.driftless.json` for `autoUpdate` field to confirm preference was persisted
- `--version` returns instantly — confirms fast-path exits bypass the hook
- Hook errors are silently swallowed — no visible diagnostic on hook failure (intentional)

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/cli/src/index.ts` — added tryAutoUpdate() pre-command hook with dynamic imports and try/catch
- `packages/cli/src/prompts/init-prompts.ts` — added p.confirm() for auto-update preference after p.group()
- `packages/cli/test/cli.test.ts` — added 8 auto-update hook tests + mocks for @driftless-ai/core
- `packages/cli/test/init.test.ts` — added 7 auto-update prompt tests, updated existing confirm mocks for new call ordering
- `.gsd/milestones/M003/slices/S04/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
