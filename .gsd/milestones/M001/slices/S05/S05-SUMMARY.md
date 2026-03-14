---
id: S05
parent: M001
milestone: M001
provides:
  - FileTransaction class for tracked filesystem writes with rollback on failure
  - DebugLogger class for structured JSON diagnostic output (.driftless/debug.log)
  - GenerateResult.filesWritten populated by generateDocs()
  - Transaction-wrapped initCommand with automatic rollback on error
  - Real --dry-run preview (glob resolution, output paths, skill paths — no agent spawn)
  - Structured debug log written every init run (success and failure)
requires:
  - slice: S02
    provides: initCommand, CLI routing with --dry-run flag
  - slice: S03
    provides: generateDocs(), AgentResult, adapter pipeline
  - slice: S04
    provides: installSkills(), InstallSkillsResult
affects: []
key_files:
  - packages/core/src/transaction.ts
  - packages/core/src/logger.ts
  - packages/core/src/types.ts
  - packages/core/src/generator.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/cli/test/init.test.ts
  - packages/core/test/transaction.test.ts
  - packages/core/test/logger.test.ts
  - packages/core/test/generator.test.ts
key_decisions:
  - FileTransaction tracks { path, type, preExisted } — rollback uses preExisted flag rather than content snapshots
  - DebugLogger.flush() writes JSON array (not JSON-lines) for simpler parsing
  - rollback() checks file existence before rm to avoid reporting already-deleted files as cleaned
  - Init integration tests use real temp directories with real FileTransaction/DebugLogger instead of mocking — true integration coverage
patterns_established:
  - Core utility classes as pure node:fs/promises with no external deps, consumed by CLI layer
  - flush-never-throws pattern for diagnostic output that must not crash the primary operation
  - Integration tests using mkdtemp tmpdir with real fs operations rather than mocking the transaction layer
observability_surfaces:
  - .driftless/debug.log — JSON array with timestamped entries per init phase (detect, config, generate, skills, error, rollback, complete, dry-run)
drill_down_paths:
  - .gsd/milestones/M001/slices/S05/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S05/tasks/T02-SUMMARY.md
duration: 30m
verification_result: passed
completed_at: 2026-03-14
---

# S05: Rollback, debug logging, dry-run

**Init is fail-safe and transparent: FileTransaction rollback on errors, structured debug log every run, real dry-run preview without agent spawn.**

## What Happened

Built two core utility classes in `@driftless/core` and wired them through the init command:

1. **FileTransaction** (`transaction.ts`) — tracks all file/dir creation with pre-existence checks. `writeFile()` and `mkdir()` record whether each path already existed before creation. `rollback()` iterates entries in reverse order, removing only newly-created paths (respecting an `excludePaths` set for the debug log). A bug was found and fixed during T02: rollback now checks existence before `rm` so the `cleaned` array accurately reflects what was actually removed.

2. **DebugLogger** (`logger.ts`) — accumulates `{ timestamp, phase, data }` entries. `flush(logPath)` writes a JSON array, creating parent dirs as needed. Write failures are caught and downgraded to `console.warn` — logging never crashes the primary operation.

3. **Init wiring** — the init command wraps all write operations (config, generated docs, skills) through FileTransaction. On error: debug log flushes first, then transaction rolls back (excluding the debug log path). `--dry-run` runs glob resolution and path computation to show what would be created, without spawning Claude Code or writing files.

4. **GenerateResult.filesWritten** — added to the type and populated by `generateDocs()` so rollback knows which doc files to clean up.

## Verification

- `npx vp test` — 146 tests pass (11 test files), 0 failures
  - `transaction.test.ts`: 10 tests (create/rollback, pre-existing safety, reverse order, excludePaths, commit, directory cleanup, existence-check)
  - `logger.test.ts`: 5 tests (accumulate, flush to disk, create parent dir, error resilience, entries getter)
  - `generator.test.ts`: 9 tests (existing + filesWritten assertions + all-fail test)
  - `init.test.ts`: 33 tests (rollback on failure, pre-existing file safety, debug log on success/failure, dry-run preview, dry-run no-writes, full integration)
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass (0 errors, 0 warnings)

## Requirements Advanced

- R007 (Debug logging) — every init run writes `.driftless/debug.log` with structured JSON entries per phase
- R008 (Fail-clean rollback) — failed init rolls back all created files, preserving only the debug log
- R011 (Dry-run) — `--dry-run` previews test files, output docs, and skill paths without writing

## Requirements Validated

- R007 — debug log tested on both success and failure paths, entries verified to contain correct phases and data
- R008 — rollback tested: forced failure mid-init removes config and generated files, pre-existing files survive
- R011 — dry-run tested: shows file listing, writes nothing to disk, handles 0-file case gracefully

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

The init command implementation was already partially wired from prior slice work. T02 became primarily a test alignment and bug fix task (transaction rollback existence-check fix, full test rewrite for real temp dirs) rather than a greenfield implementation task.

## Known Limitations

- Debug log is JSON array format — appending to an existing log from a previous run overwrites it rather than appending. Each run gets a fresh log. This is acceptable for v1 (init is typically run once or a few times).
- Rollback doesn't restore pre-existing file contents if they were overwritten — it uses a "was it new?" flag, not content snapshots. Since init targets fresh directories, this is the right tradeoff for v1.

## Follow-ups

- none — S05 is the final slice for M001

## Files Created/Modified

- `packages/core/src/transaction.ts` — FileTransaction class with rollback existence check
- `packages/core/src/logger.ts` — DebugLogger class with flush-never-throws pattern
- `packages/core/src/types.ts` — GenerateResult.filesWritten field
- `packages/core/src/generator.ts` — populate filesWritten in generateDocs()
- `packages/core/src/index.ts` — barrel exports for FileTransaction, DebugLogger, DebugEntry
- `packages/core/test/transaction.test.ts` — 10 test cases
- `packages/core/test/logger.test.ts` — 5 test cases
- `packages/core/test/generator.test.ts` — filesWritten assertions added
- `packages/cli/src/commands/init.ts` — transaction/logger/dry-run wiring
- `packages/cli/test/init.test.ts` — 33 tests with real temp dirs

## Forward Intelligence

### What the next slice should know
- S05 is the final slice of M001. The next work is M001 milestone audit, then M002.
- The full init pipeline is now: detect → prompt → config write → generate docs → install skills → flush debug log. All wrapped in FileTransaction.

### What's fragile
- Debug log overwrites on re-run — if idempotent re-run behavior becomes important, the log format would need to support append (switch to JSON-lines or rotate files)

### Authoritative diagnostics
- `.driftless/debug.log` — parse as JSON array, filter by `.phase` field. Phase values: detect, config, generate, skills, complete, error, rollback, dry-run
- Test output via `npx vp test` — 146 tests across 11 files is the full verification surface

### What assumptions changed
- Assumed T02 would be primarily implementation work — the init command already had the wiring. T02 was test alignment and a bug fix instead.
