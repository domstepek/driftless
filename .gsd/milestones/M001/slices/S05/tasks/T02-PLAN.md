---
estimated_steps: 6
estimated_files: 2
---

# T02: Wire transaction, logger, and dry-run into initCommand

**Slice:** S05 — Rollback, debug logging, dry-run
**Milestone:** M001

## Description

Wire `FileTransaction` and `DebugLogger` from T01 into the init command orchestrator. This makes rollback, debug logging, and dry-run preview into real user-facing behavior. The init command becomes fail-safe (rollback on error), transparent (debug log every run), and previewable (dry-run shows planned changes without writing).

## Steps

1. Refactor `initCommand` in `packages/cli/src/commands/init.ts` to wrap the entire write flow in a `FileTransaction`:
   - Create transaction at start of init
   - Replace `writeConfig(cwd, config)` with transaction-tracked write: `transaction.writeFile(configPath, JSON.stringify(config, null, 2) + "\n")` (preserve atomic write semantics — transaction's writeFile is already atomic enough for this context since rollback handles cleanup)
   - Pass transaction into `generateDocs` via a new optional `transaction` field on `GenerateDocsOptions`, OR track generated files post-hoc via `genResult.filesWritten` — the latter is simpler since we don't need to modify the generator's internal write calls. Use `filesWritten` from `GenerateResult` to register files with the transaction after generation completes.
   - Track skill files via `installSkills` result — register each `{skillsDir}/{capability}/SKILL.md` path with the transaction after install completes
   - Track created directories: `.driftless/`, output dir, skill dirs
   - On success: `transaction.commit()`
   - On error: flush debug log first, then `transaction.rollback([debugLogPath])` to preserve the log

2. Inject `DebugLogger` throughout init phases:
   - After detection: `logger.log("detect", { framework: detectedFramework })`
   - After config gathered: `logger.log("config", config)` (the full DriftlessConfig)
   - After each generation file: `logger.log("generate", { file, result: agentResult })` — captures stderr, duration, cost, exitCode
   - After skill install: `logger.log("skills", { installed, skillsDir })`
   - On error: `logger.log("error", { message, stack })`
   - On rollback: `logger.log("rollback", { cleaned: [...paths] })`
   - Flush to `.driftless/debug.log` at end of run (success or failure), creating `.driftless/` dir if needed

3. Implement real `--dry-run` preview:
   - Run `resolveGlobs()` (imported from generator or reimplemented as a utility) to discover which test files match the configured patterns
   - Compute output filenames for each matched test file (reuse `outputFilename` logic or extract it)
   - Compute skill install paths from capabilities
   - Render preview via `p.log.info` / `p.log.message`:
     - Config file: `.driftless.json`
     - Test files found: list of matched paths
     - Docs that would be generated: list of output filenames in output dir
     - Skills that would be installed: list of skill paths
   - No agent spawn, no file writes, no transaction needed

4. Ensure `resolveGlobs` and output filename logic are accessible to the dry-run code. If `resolveGlobs` is not exported from core, either export it or extract the glob+filename logic into a shared utility. Keep changes minimal — prefer exporting existing functions over creating new ones.

5. Write integration tests in `packages/cli/test/init.test.ts`:
   - **Rollback on failure**: mock `generateDocs` to throw mid-run, verify that `.driftless.json` and any created files are removed, but `.driftless/debug.log` is preserved
   - **Debug log written on success**: run init to completion, verify `.driftless/debug.log` exists and contains expected phases (detect, config, generate/skills)
   - **Debug log written on failure**: force an error, verify debug log still gets written with error entry
   - **Dry-run preview lists files**: run with `dryRun: true`, verify output includes test file paths and planned output filenames without any files being written to disk
   - **Dry-run with no matching test files**: verify graceful "0 test files found" output

6. Run full verification: `npx vp test`, `npx vp run -r build`, `npx vp check`.

## Must-Haves

- [ ] Init failure triggers rollback — all files created during the run are removed
- [ ] Rollback preserves `.driftless/debug.log`
- [ ] Rollback does not delete pre-existing files (re-run safety)
- [ ] `.driftless/debug.log` written on every run (success and failure)
- [ ] Debug log contains structured entries for each init phase
- [ ] `--dry-run` shows test files, output docs, and skill paths without writing
- [ ] `--dry-run` does not spawn Claude Code
- [ ] All existing init tests still pass (no regressions)

## Verification

- `npx vp test` — all tests pass including ~5 new init integration tests
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass
- Rollback test: mock generateDocs to throw → verify filesystem is clean except debug log
- Dry-run test: run with dryRun:true → verify no files written, output includes file listing

## Observability Impact

- Signals added: `.driftless/debug.log` written at `{cwd}/.driftless/debug.log` on every init run
- How a future agent inspects this: parse JSON from debug log, grep for `"phase":"error"` entries
- Failure state exposed: debug log contains the original error, rollback actions taken, and full agent diagnostics per file

## Inputs

- `packages/core/src/transaction.ts` — FileTransaction from T01
- `packages/core/src/logger.ts` — DebugLogger from T01
- `packages/core/src/generator.ts` — generateDocs with filesWritten, resolveGlobs (may need export)
- `packages/cli/src/commands/init.ts` — current init orchestrator to refactor
- T01 test patterns for mocking transaction/logger behavior

## Expected Output

- `packages/cli/src/commands/init.ts` — refactored with transaction boundary, debug logger, and real dry-run
- `packages/cli/test/init.test.ts` — ~5 new integration tests for rollback, debug log, and dry-run
