---
id: T02
parent: S03
milestone: M001
provides:
  - Init command integrates generateDocs() with spinner progress and error reporting
  - Summary note includes generation stats (files generated, errored, cost)
key_files:
  - packages/cli/src/commands/init.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - Spinner message shows basename only (not full path) for readability during progress
  - Generation errors are warnings (p.log.warn), not fatal — init always completes
  - All-failed vs partial-failure get distinct spinner stop messages with code 1
patterns_established:
  - Init command post-write hook pattern — capability-gated async work after config write, with dry-run skip
  - Spinner progress callback wiring — ProgressEvent mapped to spinner.message() updates
observability_surfaces:
  - Spinner messages show real-time file-by-file progress (filename + index/total)
  - Summary note includes docs generated count, error count, and total cost
  - Per-file errors logged as p.log.warn() with file path and error string
  - Dry-run mode explicitly logs that generation was skipped
duration: 15min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Wire generation into init command with progress spinner

**Wired generateDocs() into the init command with @clack/prompts spinner showing per-file progress, generation stats in summary, and per-file error warnings.**

## What Happened

Added the generation integration to `initCommand` after config write:
1. Checks `config.capabilities.includes("doc-generator")` — skips entirely when not selected
2. In dry-run mode, logs that generation would run but skips invocation
3. Otherwise creates a spinner, starts with "Generating docs…", calls `generateDocs(config, { cwd, onProgress })`
4. Progress callback updates spinner with basename + count (e.g., "Generating docs… login.spec.ts (3/12)")
5. Spinner stop message differentiates: all-failed (error), partial failure (warning with counts), full success (count)
6. Per-file errors reported via `p.log.warn()` before summary note
7. Summary note extended with generation stats (files generated, errored, cost) when generation ran

Added 6 test cases covering: generation called with correct args, skipped when capability missing, skipped in dry-run, all-failed error message, partial failure message, stats in summary.

## Verification

- `npx vp test` — 89 tests pass (8 test files, 17 init tests including 6 new generation tests)
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass
- Init tests verify: generation called/skipped based on capabilities, dry-run flag, error handling

### Slice-level verification status

- ✅ `npx vp test` — 89 tests pass
- ✅ `npx vp run -r build` — both packages build clean
- ✅ `npx vp check` — format and lint pass
- ✅ Agent spawner tests (T01) — 9 tests covering success, timeout, kill, non-zero exit, partial JSON, missing binary
- ✅ Adapters tests (T01) — 22 tests covering format-specific markers
- ✅ Generator tests (T01) — 8 tests covering glob resolution, orchestration, output writing, error accumulation, progress callback
- ✅ Init generation tests (T02) — generation called/skipped based on capabilities and dry-run

## Diagnostics

- Spinner messages are the primary user-facing diagnostic — visible during `driftless init` when doc-generator is enabled
- `p.log.warn()` lines per failed file include path and error string for immediate debugging
- Summary note generation stats (files, errors, cost) are the post-run inspection surface
- `GenerateResult` object carries full diagnostics downstream if needed

## Deviations

- Added 6 tests instead of the planned 4 — extra cases for partial failure and stats-in-summary verification
- Added an `Observability Impact` section to T02-PLAN.md per pre-flight requirement

## Known Issues

None.

## Files Created/Modified

- `packages/cli/src/commands/init.ts` — Added generateDocs integration with spinner, progress callback, error handling, and generation stats in summary
- `packages/cli/test/init.test.ts` — Added spinner mock, generateDocs mock, and 6 new test cases for generation wiring
- `.gsd/milestones/M001/slices/S03/tasks/T02-PLAN.md` — Added Observability Impact section
