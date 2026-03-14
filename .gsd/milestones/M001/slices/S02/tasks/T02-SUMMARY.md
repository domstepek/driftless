---
id: T02
parent: S02
milestone: M001
provides:
  - CLI arg routing (init, --version, --help, --dry-run)
  - Interactive prompt flow via @clack/prompts group()
  - initCommand orchestrator (detect → prompts → write)
  - gatherConfig() producing DriftlessConfig from user input
key_files:
  - packages/cli/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/cli/src/prompts/init-prompts.ts
  - packages/cli/test/init.test.ts
  - packages/cli/test/cli.test.ts
key_decisions:
  - "Used Set-based argv parsing instead of a flag library — sufficient for 3 flags, no dep needed"
  - "Dynamic import for initCommand — keeps main entry fast for --version/--help"
  - "process.exit(0) on cancel/decline — clean exit, not an error. Tests mock exit as throw to verify no side-effects after exit"
  - "Default test globs per framework in a const map — easy to extend and test"
patterns_established:
  - "Command pattern: commands/init.ts exports async initCommand(options) — future commands follow same shape"
  - "Prompt pattern: prompts/init-prompts.ts exports async gatherConfig() with group() + onCancel — new prompt flows follow same structure"
  - "CLI routing: argv Set + find for positional command — no framework needed at this scale"
observability_surfaces:
  - "p.log.info announces detected framework or 'no framework detected'"
  - "Dry-run mode logs the full config JSON to stdout without writing"
  - "Unknown command prints to stderr with exit code 1"
  - "Cancel at any prompt step produces a clean exit(0) with cancel message"
duration: 1 step
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: CLI routing, @clack/prompts wizard, and init command

**Built the full `driftless init` user entry point: CLI arg routing, interactive prompt flow with `@clack/prompts`, and init command orchestrating detect → prompts → config write.**

## What Happened

Installed `@clack/prompts` ^0.10.0 as a CLI dependency. Restructured `index.ts` from a simple version-printer to an async `main()` that routes `init`, `--version`, `--help`, `--dry-run`, and unknown commands. Created `commands/init.ts` as the init orchestrator: it runs detection, gathers config via prompts, handles existing config overwrite confirmation, supports dry-run, and shows a summary note. Created `prompts/init-prompts.ts` with `gatherConfig()` using `group()` to wrap text/select/multiselect prompts with cancel handling via `onCancel`. Default test globs are per-framework (e.g. `tests/**/*.spec.ts` for Playwright). Updated CLI tests for the new async routing behavior with mocked init command. Wrote 11 new tests covering prompt assembly, init command flow ordering, overwrite handling, cancel behavior, and dry-run mode.

## Verification

- `npx vp test` — 44 tests pass across 5 test files (0 failures)
- `npx vp run -r build` — both packages build clean
- `node packages/cli/dist/index.mjs --version` → `driftless v0.0.0` ✓
- `node packages/cli/dist/index.mjs --help` → usage text with init, --dry-run, --version, --help ✓
- `npx vp check` — format and lint pass (23 files formatted, 14 linted)

### Slice-level verification status (intermediate task — not all expected to pass yet)

- ✅ `npx vp test` — all tests pass
- ✅ `npx vp run -r build` — both packages build clean
- ✅ `npx vp check` — format and lint pass
- ✅ `node packages/cli/dist/index.mjs --version` prints `driftless v0.0.0`
- ✅ `node packages/cli/dist/index.mjs --help` prints usage text
- ✅ `npx tsc --noEmit -p packages/core/tsconfig.json` — (passes via vp check)
- ✅ `readConfig` on missing file throws with file path (T01 verified, still passing)
- ✅ `readConfig` on invalid JSON throws with parse failure message (T01 verified, still passing)
- ✅ Test files: detect.test.ts, config.test.ts, init.test.ts all pass

## Diagnostics

- `node packages/cli/dist/index.mjs bogus` — prints "Unknown command: bogus" to stderr, shows usage, exits with code 1
- Init flow logging visible via `@clack/prompts` log.info: framework detection result, dry-run config preview
- Cancel at any prompt step → `cancel("Setup cancelled.")` + `process.exit(0)`
- Overwrite decline → `cancel("Init cancelled — existing config preserved.")` + `process.exit(0)`

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/cli/package.json` — added `@clack/prompts` ^0.10.0 dependency
- `packages/cli/src/index.ts` — restructured with async main(), arg routing, usage text
- `packages/cli/src/commands/init.ts` — init command orchestrator (detect → prompt → write)
- `packages/cli/src/prompts/init-prompts.ts` — gatherConfig() with group() prompt flow
- `packages/cli/test/cli.test.ts` — updated for async main(), 8 tests for routing
- `packages/cli/test/init.test.ts` — new, 11 tests for prompt flow and init command
- `.gsd/milestones/M001/slices/S02/tasks/T02-PLAN.md` — added Observability Impact section
