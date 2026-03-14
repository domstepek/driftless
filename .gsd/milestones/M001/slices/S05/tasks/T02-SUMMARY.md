---
id: T02
parent: S05
milestone: M001
provides:
  - Transaction-wrapped init command with rollback on failure
  - Structured debug log (.driftless/debug.log) written every init run
  - Real dry-run preview showing test files, output docs, and skill paths
key_files:
  - packages/cli/src/commands/init.ts
  - packages/cli/test/init.test.ts
  - packages/core/src/transaction.ts
key_decisions:
  - FileTransaction.rollback checks file existence before rm to avoid counting already-deleted files as cleaned
  - Init tests use real temp directories with real FileTransaction/DebugLogger instead of mocking them — gives true integration coverage of the rollback and debug log paths
patterns_established:
  - Integration tests for init use mkdtemp tmpdir with real fs operations rather than mocking the transaction layer
observability_surfaces:
  - .driftless/debug.log — JSON array with timestamped entries per init phase (detect, config, generate, skills, error, rollback, complete)
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Wire transaction, logger, and dry-run into initCommand

**Wired FileTransaction rollback, DebugLogger diagnostics, and real dry-run preview into initCommand; fixed stale tests and a transaction rollback bug.**

## What Happened

The init command already had the transaction/logger/dry-run wiring in place from prior work. The bulk of this task was bringing the test suite into alignment with the new implementation and fixing a bug in `FileTransaction.rollback`.

1. **Transaction rollback bug fix** (`packages/core/src/transaction.ts`): `rollback()` used `rm(path, {force: true})` which silently succeeds on already-deleted files, causing them to be reported as "cleaned" even when they were already gone. Added an existence check before removal so the `cleaned` array is accurate.

2. **Init test rewrite** (`packages/cli/test/init.test.ts`): The existing tests were completely stale — they mocked `writeConfig` (no longer called), expected old dry-run messages, and didn't include `filesWritten` in mock `GenerateResult`. Rewrote all `initCommand` tests to use real temp directories with real `FileTransaction` and `DebugLogger` instances, while still mocking the heavy subsystems (`generateDocs`, `installSkills`, `detectTestFramework`). Added 12 new tests covering:
   - Rollback on failure (config removed, debug log preserved)
   - Pre-existing file safety on rollback
   - Debug log written on success with phase entries
   - Debug log written on failure with error entry
   - Debug log includes generate and skills entries
   - Dry-run shows test files, output docs, skill paths
   - Dry-run graceful "0 test files found" message
   - Dry-run writes no files to disk

## Verification

- `npx vp test` — 146 tests pass (11 test files), 0 failures
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass (0 errors, 0 warnings)
- Rollback test: mock generateDocs to throw → config removed, debug log preserved ✅
- Pre-existing file test: config survives rollback when it existed before init ✅
- Dry-run test: no files written, output includes file listing ✅
- Debug log test: success and failure paths both produce structured entries ✅

## Diagnostics

- `.driftless/debug.log` at `{cwd}/.driftless/debug.log` — parse as JSON array, filter by `.phase` field
- Phase values: `detect`, `config`, `generate`, `skills`, `complete`, `error`, `rollback`, `dry-run`
- On failure: entries include `error` phase with `{message, stack}` and `rollback` phase with `{cleaned: [paths]}`

## Deviations

- The init command implementation was already complete — T02 became primarily a test alignment and bug fix task rather than an implementation task. The transaction rollback existence-check fix was discovered during test development.

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/transaction.ts` — Added existence check in rollback before rm to fix cleaned-path accuracy
- `packages/cli/test/init.test.ts` — Full rewrite: 33 tests using real temp dirs, covering rollback, debug log, dry-run, and all prior test scenarios
