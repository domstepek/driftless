---
estimated_steps: 8
estimated_files: 8
---

# T01: Build FileTransaction and DebugLogger core primitives

**Slice:** S05 — Rollback, debug logging, dry-run
**Milestone:** M001

## Description

Build the two reusable utilities that power S05's three features. `FileTransaction` tracks filesystem mutations during init and can undo them on failure. `DebugLogger` accumulates structured diagnostic entries and flushes them to `.driftless/debug.log`. Also extend `GenerateResult` with `filesWritten` so the transaction knows which doc files were created.

Both are pure `node:fs/promises` utilities with no new dependencies, following the established pattern of core utilities consumed by the CLI layer.

## Steps

1. Create `packages/core/src/transaction.ts` with `FileTransaction` class:
   - Constructor takes no args; initializes empty tracking arrays
   - `writeFile(filePath, content)` — checks if file pre-exists via `stat()`, writes file, records `{ path, preExisted: boolean }` in tracking array
   - `mkdir(dirPath)` — checks if dir pre-exists, creates with `{ recursive: true }`, records in tracking array
   - `commit()` — no-op (files already on disk), clears tracking state
   - `rollback(excludePaths?: string[])` — iterates tracked entries in reverse, deletes files that didn't pre-exist (skips those in excludePaths), removes directories that didn't pre-exist (only if empty after file cleanup), clears tracking state
   - Track entries as `{ path: string; type: 'file' | 'dir'; preExisted: boolean }` internally

2. Create `packages/core/src/logger.ts` with `DebugLogger` class:
   - `log(phase, data)` — pushes `{ timestamp: ISO string, phase: string, data: unknown }` to internal array
   - `flush(logPath)` — writes all entries as JSON (array of entry objects) to the given path. Catches write errors and emits a console.warn instead of throwing. Creates parent directory if needed.
   - `entries` getter for test inspection

3. Add `filesWritten: string[]` to `GenerateResult` in `packages/core/src/types.ts`. Initialize as empty array in `generateDocs()` and push each written output path after successful `writeFile`.

4. Update `packages/core/src/generator.ts` to populate `filesWritten` — push `outPath` into the result array after each successful doc write.

5. Export `FileTransaction` and `DebugLogger` from `packages/core/src/index.ts` barrel.

6. Write `packages/core/test/transaction.test.ts`:
   - writeFile creates file and tracks it; rollback removes it
   - writeFile on pre-existing file tracks it; rollback leaves it in place
   - mkdir creates directory and tracks it; rollback removes it
   - mkdir on pre-existing directory leaves it on rollback
   - Rollback processes in reverse creation order
   - Rollback skips paths in excludePaths
   - commit() clears tracking (subsequent rollback is no-op)
   - Rollback doesn't throw on already-deleted files

7. Write `packages/core/test/logger.test.ts`:
   - log() accumulates entries with timestamps
   - flush() writes JSON file to disk
   - flush() creates parent directory if missing
   - flush() catches write errors and warns instead of throwing
   - entries getter returns accumulated entries

8. Update `packages/core/test/generator.test.ts` — verify `filesWritten` is populated on success and empty when generation fails for all files.

## Must-Haves

- [ ] `FileTransaction` tracks file and directory creation with pre-existence checks
- [ ] `rollback()` removes only files/dirs created by the current run, in reverse order
- [ ] `rollback()` respects `excludePaths` parameter
- [ ] `DebugLogger.flush()` never throws — catches and warns on write failure
- [ ] `GenerateResult.filesWritten` populated by `generateDocs()`
- [ ] Both classes exported from `@driftless/core` barrel

## Verification

- `npx vp test` — all tests pass including new transaction, logger, and updated generator tests
- `npx vp run -r build` — core package builds clean with new exports
- `npx vp check` — no lint/format issues

## Observability Impact

- Signals added: `DebugLogger` produces structured JSON entries with `{ timestamp, phase, data }` shape
- How a future agent inspects this: read `.driftless/debug.log`, parse as JSON array, filter by `phase` field
- Failure state exposed: `FileTransaction` rollback logs which paths it cleaned up (visible in debug log when wired in T02)

## Inputs

- `packages/core/src/types.ts` — `GenerateResult` type to extend
- `packages/core/src/generator.ts` — `generateDocs()` to add `filesWritten` tracking
- `packages/core/src/index.ts` — barrel to update with new exports
- S05 research findings on rollback safety (pre-existence checks, reverse order, debug log exclusion)

## Expected Output

- `packages/core/src/transaction.ts` — FileTransaction class with writeFile/mkdir/commit/rollback
- `packages/core/src/logger.ts` — DebugLogger class with log/flush/entries
- `packages/core/src/types.ts` — GenerateResult extended with filesWritten
- `packages/core/src/generator.ts` — filesWritten populated during generation
- `packages/core/src/index.ts` — updated barrel exports
- `packages/core/test/transaction.test.ts` — ~8 test cases
- `packages/core/test/logger.test.ts` — ~5 test cases
- `packages/core/test/generator.test.ts` — updated with filesWritten assertions
