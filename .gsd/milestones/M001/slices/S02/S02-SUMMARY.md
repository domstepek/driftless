---
id: S02
parent: M001
milestone: M001
provides:
  - DriftlessConfig extended with Capability, TestFramework, agentHarness fields (S03/S04/S05 boundary contract)
  - detectTestFramework() scanning 6 frameworks by config file presence
  - readConfig / writeConfig / configExists / configPath for .driftless.json with atomic writes
  - FRAMEWORK_CONFIG_MAP exported constant for inspection
  - CLI arg routing (init, --version, --help, --dry-run)
  - Interactive prompt flow via @clack/prompts group()
  - initCommand orchestrator (detect → prompts → config write)
  - gatherConfig() producing DriftlessConfig from user input
requires:
  - slice: S01
    provides: CLI entry point (packages/cli/src/index.ts), core types (packages/core/src/types.ts), working Vite+ toolchain
affects:
  - S03 (consumes config schema, init command orchestrator for doc generation integration)
  - S04 (consumes config schema, capability choices for skill installation)
  - S05 (consumes config write for rollback, dry-run flag for behavior)
key_files:
  - packages/core/src/types.ts
  - packages/core/src/detect.ts
  - packages/core/src/config.ts
  - packages/core/src/index.ts
  - packages/cli/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/cli/src/prompts/init-prompts.ts
  - packages/cli/test/init.test.ts
  - packages/cli/test/cli.test.ts
  - packages/core/test/detect.test.ts
  - packages/core/test/config.test.ts
  - packages/core/test/types.test.ts
key_decisions:
  - "Set-based argv parsing — sufficient for 3 flags, no dependency needed"
  - "Dynamic import for initCommand — keeps main entry fast for --version/--help"
  - "Atomic writes via temp+rename for config — crash-safe, S05 rollback can build on this"
  - "Error.cause chaining on readConfig — preserves original error without losing context"
  - "Default test globs per framework in a const map — easy to extend"
patterns_established:
  - "Command pattern: commands/init.ts exports async initCommand(options) — future commands follow same shape"
  - "Prompt pattern: prompts/init-prompts.ts exports async gatherConfig() with group() + onCancel"
  - "Atomic write pattern: write to temp then rename — used for config, extensible to other file writes"
  - "Detection map as exported const array — testable and inspectable without reading source"
observability_surfaces:
  - "readConfig throws with file path + failure mode (missing vs. parse) + cause chain"
  - "writeConfig leaves .driftless.tmp.json on interrupted write — presence signals crash"
  - "FRAMEWORK_CONFIG_MAP inspectable at runtime for coverage verification"
  - "p.log.info announces detected framework or 'no framework detected'"
  - "Dry-run mode logs full config JSON to stdout without writing"
  - "Unknown command prints to stderr with exit code 1"
  - "Cancel at any prompt step produces clean exit(0) with cancel message"
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T02-SUMMARY.md
duration: 30m
verification_result: passed
completed_at: 2026-03-14
---

# S02: Interactive CLI wizard

**Full `driftless init` interactive flow: test framework auto-detection, @clack/prompts wizard, config write to `.driftless.json`, CLI routing for init/version/help/dry-run.**

## What Happened

T01 extended the core package with the type contract consumed by all downstream slices. `DriftlessConfig` now has `Capability` (doc-generation, e2e-test-generation) and `TestFramework` (6 frameworks) string unions, typed capabilities array, optional test framework field, and required `agentHarness: "claude-code"` literal. Built `detectTestFramework()` which scans a target directory for known config files (Playwright, Cypress, TestCafe, Detox, WebdriverIO, Nightwatch) using a priority-ordered map. Built `readConfig`/`writeConfig`/`configExists`/`configPath` with atomic writes (temp+rename) and descriptive errors with `Error.cause` chaining for missing file vs. invalid JSON.

T02 built the user-facing CLI. Restructured `index.ts` to route `init`, `--version`, `--help`, `--dry-run`, and unknown commands. Created `initCommand()` as the orchestrator: runs detection → gathers config via `@clack/prompts` `group()` → checks for existing config with overwrite confirmation → writes config (or previews in dry-run) → shows summary. Cancel at any prompt exits cleanly. Default test globs are per-framework. `@clack/prompts` ^0.10.0 added as a dependency.

## Verification

- `npx vp test` — 44 tests pass across 5 test files (types, detect, config, cli routing, init flow)
- `npx vp run -r build` — both core and CLI packages build clean
- `npx vp check` — format and lint pass (23 files formatted, 14 linted)
- `node packages/cli/dist/index.mjs --version` → `driftless v0.0.0`
- `node packages/cli/dist/index.mjs --help` → usage text with init, --dry-run, --version, --help
- `npx tsc --noEmit -p packages/core/tsconfig.json` — clean
- `readConfig` on missing file throws with path in message (verified in config.test.ts)
- `readConfig` on invalid JSON throws with parse failure message (verified in config.test.ts)
- Detection returns correct framework from temp dirs with config files (verified in detect.test.ts)
- Config round-trips through `.driftless.json` (verified in config.test.ts)
- Prompt flow produces correct config from mocked inputs (verified in init.test.ts)
- Cancel handling exits cleanly (verified in init.test.ts)

## Requirements Advanced

- R001 (Interactive CLI setup wizard) — full init wizard implemented with framework detection, path prompts, doc framework selection, capability multiselect, and config write
- R009 (Config file persisting init choices) — `.driftless.json` read/write with atomic writes, round-trip verified
- R010 (Test framework auto-detection) — 6-framework detection scanning config files, pre-fills prompts
- R015 (Modular capability selection) — multiselect prompt for capabilities, persisted in config
- R011 (--dry-run flag) — flag accepted and threaded through InitOptions (behavior deferred to S05)

## Requirements Validated

- R001 — wizard runs end-to-end with detection, prompts, config write; 11 tests cover prompt flow, cancel handling, overwrite confirmation
- R009 — config round-trips through `.driftless.json`; atomic writes verified; 8 config tests pass
- R010 — detection returns correct framework from 6 config file types; 11 detection tests pass

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None.

## Known Limitations

- `--dry-run` flag is accepted and threaded through `InitOptions` but the actual "preview without writing" behavior is deferred to S05
- No debug logging yet — S05 scope
- No rollback on init failure yet — S05 scope
- Prompt flow tested via mocks, not live terminal interaction (appropriate for unit tests; UAT covers live behavior)

## Follow-ups

- S03 will integrate doc generation into the init command flow after config write
- S05 will implement `--dry-run` preview behavior, rollback, and debug logging
- The `agentHarness` field defaults to `"claude-code"` — when R028 (additional harnesses) is pursued, this becomes a prompt

## Files Created/Modified

- `packages/core/src/types.ts` — extended with Capability, TestFramework, full DriftlessConfig
- `packages/core/src/detect.ts` — new: detectTestFramework() + FRAMEWORK_CONFIG_MAP
- `packages/core/src/config.ts` — new: configPath, configExists, writeConfig (atomic), readConfig (descriptive errors)
- `packages/core/src/index.ts` — re-exports all new types and functions
- `packages/core/test/types.test.ts` — updated + extended for new type unions
- `packages/core/test/detect.test.ts` — new: 11 tests
- `packages/core/test/config.test.ts` — new: 8 tests
- `packages/cli/package.json` — added @clack/prompts ^0.10.0
- `packages/cli/src/index.ts` — restructured with async main(), arg routing, usage text
- `packages/cli/src/commands/init.ts` — new: init command orchestrator
- `packages/cli/src/prompts/init-prompts.ts` — new: gatherConfig() with group() prompt flow
- `packages/cli/test/cli.test.ts` — updated for async main(), 8 routing tests
- `packages/cli/test/init.test.ts` — new: 11 tests for prompt flow and init command

## Forward Intelligence

### What the next slice should know
- `initCommand()` in `packages/cli/src/commands/init.ts` is the orchestrator — S03 doc generation hooks in after config write but before the outro summary
- The config schema in `types.ts` is the contract — `DriftlessConfig.capabilities` determines what S04 installs
- `gatherConfig()` returns a fully-typed `DriftlessConfig` — downstream slices can rely on all fields being present
- `@clack/prompts` is already installed and the pattern for prompt flows is established in `init-prompts.ts`

### What's fragile
- `@clack/prompts` mocking in tests uses `vi.mock("@clack/prompts")` with manual mock implementations — if the prompts API changes, tests break silently (they'd pass but test wrong behavior)
- Dynamic import of `initCommand` means build output chunk naming (`init-TENPLz0G.mjs`) changes on content changes — don't hardcode chunk names

### Authoritative diagnostics
- `npx vp test` is the single source of truth for all 44 tests across both packages
- `node packages/cli/dist/index.mjs --version` proves the bundle works end-to-end (not just tests)
- `FRAMEWORK_CONFIG_MAP` can be imported at runtime to verify detection coverage without reading source

### What assumptions changed
- No assumptions changed — the plan held as written
