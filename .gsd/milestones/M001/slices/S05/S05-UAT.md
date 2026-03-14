# S05: Rollback, debug logging, dry-run — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All S05 features (rollback, debug log, dry-run) are filesystem behaviors testable via unit/integration tests with mocked agent. No live Claude Code invocation needed — the agent spawn is mocked while real FileTransaction and DebugLogger run against real temp directories.

## Preconditions

- Repository cloned and dependencies installed (`pnpm install`)
- Vite+ available (`vp` command works)
- `npx vp run -r build` completes successfully (both packages build)
- No prior `.driftless/` directory in the test working directory

## Smoke Test

Run `npx vp test` — all 146 tests pass across 11 test files, including the S05-specific files: `transaction.test.ts` (10), `logger.test.ts` (5), `generator.test.ts` (9), `init.test.ts` (33).

## Test Cases

### 1. FileTransaction tracks and rolls back created files

1. Create a `FileTransaction` instance
2. Call `writeFile('a.txt', 'hello')` and `writeFile('b.txt', 'world')`
3. Call `rollback()`
4. **Expected:** Both `a.txt` and `b.txt` are deleted from disk. Rollback reports both paths in its `cleaned` array.

### 2. Rollback preserves pre-existing files

1. Create a file `existing.txt` manually on disk
2. Create a `FileTransaction` instance
3. Call `writeFile('existing.txt', 'overwritten')` — transaction records it as pre-existing
4. Call `writeFile('new.txt', 'created')`
5. Call `rollback()`
6. **Expected:** `new.txt` is deleted. `existing.txt` is NOT deleted (it existed before the transaction). Rollback cleaned array contains only `new.txt`.

### 3. Rollback respects excludePaths

1. Create a `FileTransaction`, write `config.json` and `debug.log`
2. Call `rollback(new Set(['debug.log']))`
3. **Expected:** `config.json` is deleted. `debug.log` is preserved on disk.

### 4. Rollback processes entries in reverse order

1. Create a `FileTransaction`, write files in order: `a.txt`, `b.txt`, `c.txt`
2. Call `rollback()`
3. **Expected:** Files are cleaned in order `c.txt`, `b.txt`, `a.txt` (reverse of creation).

### 5. Commit clears tracking

1. Create a `FileTransaction`, write `file.txt`
2. Call `commit()`
3. Call `rollback()`
4. **Expected:** `file.txt` remains on disk. Rollback has nothing to clean.

### 6. DebugLogger accumulates and flushes structured entries

1. Create a `DebugLogger`
2. Call `log('detect', { framework: 'playwright' })`
3. Call `log('config', { path: '.driftless.json' })`
4. Call `flush('/tmp/test/debug.log')`
5. **Expected:** File at `/tmp/test/debug.log` contains a JSON array with 2 entries. Each entry has `timestamp` (ISO string), `phase`, and `data` fields. Parent directory created automatically.

### 7. DebugLogger flush failure does not throw

1. Create a `DebugLogger` with an entry
2. Call `flush('/nonexistent/readonly/path/debug.log')` (or mock fs.writeFile to reject)
3. **Expected:** No error thrown. `console.warn` called with the failure. Caller can continue without catching.

### 8. GenerateResult.filesWritten populated on success

1. Call `generateDocs()` with a mocked agent that returns successful results for 2 test files
2. **Expected:** `GenerateResult.filesWritten` contains the 2 output file paths that were written to disk.

### 9. GenerateResult.filesWritten empty on all failures

1. Call `generateDocs()` with a mocked agent that fails for all test files
2. **Expected:** `GenerateResult.filesWritten` is an empty array. `GenerateResult.errors` is non-empty.

### 10. Init rollback on failure removes created artifacts

1. Run `initCommand` with mocked `generateDocs` that throws an error mid-run
2. Config file should have been written before the error
3. **Expected:** After the error, config file is removed from disk. `.driftless/debug.log` is preserved. Debug log contains an `error` phase entry with message and stack, and a `rollback` phase entry listing cleaned paths.

### 11. Init debug log written on successful run

1. Run `initCommand` to completion (all mocks succeed)
2. **Expected:** `.driftless/debug.log` exists. Parsed as JSON array, it contains entries with phases: `detect`, `config`, `generate`, `skills`, `complete`.

### 12. Init debug log written on failed run

1. Run `initCommand` with mocked failure
2. **Expected:** `.driftless/debug.log` exists despite the failure. Contains `error` phase entry with the failure details.

### 13. Dry-run shows test files and output paths without writing

1. Run `initCommand` with `dryRun: true` and mock test file glob that resolves to `['tests/login.spec.ts', 'tests/checkout.spec.ts']`
2. **Expected:** Output includes the test file names and computed output doc paths. No files are written to disk — no `.driftless.json`, no generated docs, no `.skills/` directory. Agent is never spawned.

### 14. Dry-run with zero test files shows graceful message

1. Run `initCommand` with `dryRun: true` and mock glob that resolves to `[]`
2. **Expected:** Output includes a "0 test files found" message. No error thrown.

## Edge Cases

### Rollback when files already deleted externally

1. Create a `FileTransaction`, write `temp.txt`
2. Manually delete `temp.txt` from disk before calling `rollback()`
3. **Expected:** Rollback completes without error. `temp.txt` is not in the `cleaned` array (it was already gone).

### Directory cleanup during rollback

1. Create a `FileTransaction`, call `mkdir('newdir')` then `writeFile('newdir/file.txt', 'content')`
2. Call `rollback()`
3. **Expected:** Both `newdir/file.txt` and `newdir/` are removed.

### Debug log with many entries

1. Create a `DebugLogger`, add 100 entries across different phases
2. Call `flush()`
3. **Expected:** All 100 entries present in the written JSON array. No truncation.

## Failure Signals

- Any test failure in `transaction.test.ts`, `logger.test.ts`, `generator.test.ts`, or `init.test.ts`
- `npx vp run -r build` fails (type errors in new code)
- `npx vp check` reports lint/format issues in new files
- `init.test.ts` rollback tests show files remaining after rollback
- Debug log tests show missing phase entries or malformed JSON

## Requirements Proved By This UAT

- R007 — Debug logging: every init run (success and failure) writes `.driftless/debug.log` with structured phases (test cases 6, 11, 12)
- R008 — Fail-clean rollback: failed init removes partial artifacts, preserves pre-existing files and debug log (test cases 1-5, 10)
- R011 — Dry-run: `--dry-run` previews files without writing, handles edge cases gracefully (test cases 13, 14)

## Not Proven By This UAT

- Live end-to-end `npx driftless init --dry-run` with a real repo (requires M001 milestone-level UAT with actual Claude Code)
- Debug log contents from a real agent invocation (agent is mocked in all tests)
- Rollback behavior during actual Claude Code timeout or crash (requires live integration)

## Notes for Tester

- All init tests use real temp directories (`mkdtemp`) with real `FileTransaction` and `DebugLogger` instances. Only `generateDocs`, `installSkills`, and `detectTestFramework` are mocked. This means filesystem behavior (rollback, debug log writes) is genuinely tested.
- The debug log is a JSON array, not JSON-lines. Each `flush()` overwrites the file. This is by design for v1.
- Test cases 1-9 correspond to unit tests in `packages/core/test/`. Test cases 10-14 correspond to integration tests in `packages/cli/test/init.test.ts`.
