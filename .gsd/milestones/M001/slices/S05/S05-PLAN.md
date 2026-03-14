# S05: Rollback, debug logging, dry-run

**Goal:** Init is fail-safe and transparent — filesystem rollback on error, structured debug log every run, real dry-run preview.
**Demo:** `driftless init --dry-run` prints what would be created without writing files. A forced mid-init failure rolls back all created artifacts. Every run writes `.driftless/debug.log` with structured diagnostics.

## Must-Haves

- `FileTransaction` tracks all files/dirs created during init; rollback deletes them in reverse order on failure
- Rollback only removes files created by the current run — never deletes pre-existing files
- Debug log written to `.driftless/debug.log` on every run (success and failure) with timestamped entries
- Debug log captures: config, detection result, per-file agent results (stderr, duration, cost, exitCode), skill installs, errors
- Debug log flush happens before rollback (rollback preserves `.driftless/debug.log`)
- `--dry-run` previews: config, test files that would be processed (glob resolution), output filenames, skill paths — without spawning Claude Code
- `GenerateResult.filesWritten: string[]` added so rollback knows which doc files were created
- Init is idempotent — safe to re-run on a repo that already has driftless artifacts

## Proof Level

- This slice proves: operational
- Real runtime required: no (all verified via unit + integration tests with mocked agent)
- Human/UAT required: no

## Verification

- `npx vp test` — all existing tests still pass (no regressions), plus new tests for:
  - `packages/core/test/transaction.test.ts` — FileTransaction create/rollback/commit, pre-existing file safety, reverse-order cleanup, directory cleanup
  - `packages/core/test/logger.test.ts` — DebugLogger accumulate entries, flush to disk, structured output, error resilience (flush failure doesn't throw)
  - `packages/core/test/generator.test.ts` — GenerateResult.filesWritten populated correctly
  - `packages/cli/test/init.test.ts` — rollback on failure, debug log written, dry-run preview output with file listing
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass

## Observability / Diagnostics

- Runtime signals: `.driftless/debug.log` JSON-lines file with timestamped entries per init phase (detect, config, generate, skills, error, rollback)
- Inspection surfaces: `cat .driftless/debug.log` shows full structured run history; each entry has `phase`, `timestamp`, `data`
- Failure visibility: debug log captures rollback actions taken, original error, and which files were cleaned up
- Redaction constraints: none (no secrets flow through init)

## Integration Closure

- Upstream surfaces consumed: `initCommand` (S02), `generateDocs` + `AgentResult` (S03), `installSkills` + `InstallSkillsResult` (S04)
- New wiring introduced: `FileTransaction` wraps all write calls in init; `DebugLogger` injected at each init phase; dry-run runs glob resolution + path computation without agent spawn
- What remains before the milestone is truly usable end-to-end: nothing — S05 is the final slice

## Tasks

- [x] **T01: Build FileTransaction and DebugLogger core primitives** `est:40m`
  - Why: These are the reusable building blocks that S05 features depend on. Both are pure `node:fs/promises` utilities with no external deps, testable in isolation.
  - Files: `packages/core/src/transaction.ts`, `packages/core/src/logger.ts`, `packages/core/src/types.ts`, `packages/core/src/generator.ts`, `packages/core/src/index.ts`, `packages/core/test/transaction.test.ts`, `packages/core/test/logger.test.ts`, `packages/core/test/generator.test.ts`
  - Do: (1) Build `FileTransaction` class with `writeFile(path, content)`, `mkdir(path)`, `commit()`, `rollback()` — tracks created files/dirs, records whether each path pre-existed, rollback deletes only new files in reverse order, skips `.driftless/debug.log`. (2) Build `DebugLogger` class with `log(phase, data)`, `flush(logPath)` — accumulates timestamped JSON entries, flush writes to disk, flush failure is caught and warned (never throws). (3) Add `filesWritten: string[]` to `GenerateResult` and populate it in `generateDocs()`. (4) Export both from core barrel. (5) Write unit tests for transaction (create/rollback/commit, pre-existing safety, reverse order, dir cleanup) and logger (accumulate, flush, error resilience).
  - Verify: `npx vp test` — new tests pass, existing generator tests updated for `filesWritten`
  - Done when: `FileTransaction` and `DebugLogger` are importable from `@driftless/core`, all unit tests pass, `GenerateResult.filesWritten` is populated by `generateDocs()`

- [x] **T02: Wire transaction, logger, and dry-run into initCommand** `est:40m`
  - Why: The primitives from T01 need to wrap the init flow. This is where rollback, debug logging, and real dry-run preview become user-facing behavior.
  - Files: `packages/cli/src/commands/init.ts`, `packages/cli/test/init.test.ts`
  - Do: (1) Wrap init's write operations (writeConfig, generateDocs output dir+files, installSkills) with `FileTransaction` — replace direct fs calls with transaction-tracked calls where needed. (2) Add try/catch around entire init flow: on error, flush debug log then rollback transaction (excluding debug log path). (3) Inject `DebugLogger` at each phase — detection, config write, per-file generation results (capturing AgentResult diagnostics), skill install, errors. Flush at end of run regardless of success/failure. (4) Implement real `--dry-run`: run glob resolution to show which test files would be processed, compute output filenames, compute skill paths, render all as a structured preview via `p.log` — no agent spawn, no file writes. (5) Add integration tests: rollback removes created files on failure, debug log written to `.driftless/debug.log`, dry-run shows file listing without writing.
  - Verify: `npx vp test` — all tests pass including new integration tests; `npx vp run -r build` and `npx vp check` clean
  - Done when: (1) Forced failure mid-init leaves repo clean (only debug log remains), (2) every init run produces `.driftless/debug.log`, (3) `--dry-run` lists files/skills that would be created without writing them

## Files Likely Touched

- `packages/core/src/transaction.ts`
- `packages/core/src/logger.ts`
- `packages/core/src/types.ts`
- `packages/core/src/generator.ts`
- `packages/core/src/index.ts`
- `packages/core/test/transaction.test.ts`
- `packages/core/test/logger.test.ts`
- `packages/core/test/generator.test.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/test/init.test.ts`
