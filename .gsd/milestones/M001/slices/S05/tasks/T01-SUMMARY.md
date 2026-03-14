---
id: T01
parent: S05
milestone: M001
provides:
  - FileTransaction class for tracked filesystem writes with rollback
  - DebugLogger class for structured diagnostic output
  - GenerateResult.filesWritten field populated by generateDocs()
key_files:
  - packages/core/src/transaction.ts
  - packages/core/src/logger.ts
  - packages/core/src/types.ts
  - packages/core/src/generator.ts
  - packages/core/src/index.ts
key_decisions:
  - FileTransaction stores entries as { path, type, preExisted } — rollback uses preExisted flag rather than snapshotting original content
  - DebugLogger.flush() writes a JSON array (not JSON-lines) for simpler parsing
  - rollback() silently skips already-deleted paths instead of throwing
patterns_established:
  - Core utility classes that are pure node:fs/promises with no external deps, consumed by CLI layer
  - flush-never-throws pattern for diagnostic output that must not crash the primary operation
observability_surfaces:
  - DebugLogger produces structured JSON entries with { timestamp, phase, data } shape readable via cat + jq
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Build FileTransaction and DebugLogger core primitives

**Built FileTransaction (tracked fs writes with rollback), DebugLogger (structured diagnostics), and GenerateResult.filesWritten.**

## What Happened

Created two core utility classes and extended the GenerateResult type:

1. **FileTransaction** (`packages/core/src/transaction.ts`) — tracks file/dir creation with pre-existence checks. `writeFile()` and `mkdir()` record whether each path already existed. `rollback()` iterates in reverse order, removing only new entries (respecting an optional `excludePaths` set). `commit()` clears tracking. Already-deleted paths are silently skipped.

2. **DebugLogger** (`packages/core/src/logger.ts`) — accumulates `{ timestamp, phase, data }` entries. `flush(logPath)` writes them as a JSON array, creating parent dirs as needed. Write failures are caught and downgraded to `console.warn` so logging never crashes the primary operation.

3. **GenerateResult.filesWritten** — added `string[]` field to the type and wired it into `generateDocs()` to push each output path after successful write.

Both classes exported from `@driftless/core` barrel.

## Verification

- `npx vp test` — 132 tests pass (11 test files), including:
  - `transaction.test.ts`: 8 tests (create/rollback, pre-existing safety, reverse order, excludePaths, commit clears, no-throw on deleted)
  - `logger.test.ts`: 5 tests (accumulate, flush to disk, create parent dir, error resilience, entries getter)
  - `generator.test.ts`: 9 tests (existing 8 + new filesWritten-empty-on-failure test, plus filesWritten assertions in success test)
- `npx vp run -r build` — both core and cli packages build clean
- `npx vp check` — no format or lint issues

### Slice-level verification status
- ✅ `packages/core/test/transaction.test.ts` — passing
- ✅ `packages/core/test/logger.test.ts` — passing
- ✅ `packages/core/test/generator.test.ts` — passing
- ⬜ `packages/cli/test/init.test.ts` — not yet updated (T02 scope)
- ✅ `npx vp run -r build` — passing
- ✅ `npx vp check` — passing

## Diagnostics

- `DebugLogger.entries` getter exposes accumulated entries for test inspection
- Future agent reads `.driftless/debug.log` → parse as JSON array → filter by `.phase` field
- FileTransaction rollback cleanup is observable when wired into DebugLogger in T02

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/transaction.ts` — new FileTransaction class
- `packages/core/src/logger.ts` — new DebugLogger class with DebugEntry type
- `packages/core/src/types.ts` — added `filesWritten: string[]` to GenerateResult
- `packages/core/src/generator.ts` — populate filesWritten after each successful doc write
- `packages/core/src/index.ts` — export FileTransaction, DebugLogger, DebugEntry
- `packages/core/test/transaction.test.ts` — 8 test cases
- `packages/core/test/logger.test.ts` — 5 test cases
- `packages/core/test/generator.test.ts` — added filesWritten assertions + all-fail test
