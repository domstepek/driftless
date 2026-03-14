---
id: T01
parent: S02
milestone: M001
provides:
  - Capability and TestFramework string union types
  - DriftlessConfig extended with agentHarness, testFramework, $schema, typed capabilities
  - detectTestFramework() scanning 6 frameworks by config file presence
  - readConfig / writeConfig / configExists / configPath for .driftless.json
  - FRAMEWORK_CONFIG_MAP exported constant for inspection
key_files:
  - packages/core/src/types.ts
  - packages/core/src/detect.ts
  - packages/core/src/config.ts
  - packages/core/src/index.ts
  - packages/core/test/detect.test.ts
  - packages/core/test/config.test.ts
  - packages/core/test/types.test.ts
key_decisions:
  - Used fs.stat (not fs.access) for config file detection — simpler and sufficient for existence checks
  - Error.cause chaining on readConfig failures — preserves original error for debugging without losing context
patterns_established:
  - Atomic write pattern: write to .driftless.tmp.json then rename — S05 rollback can build on this
  - Detection map as exported const array — testable and inspectable without reading source
observability_surfaces:
  - readConfig throws with file path + failure mode (missing vs. parse) + cause chain
  - writeConfig leaves .driftless.tmp.json on interrupted write — presence signals crash
  - FRAMEWORK_CONFIG_MAP inspectable at runtime for coverage verification
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Core types, test framework detection, and config module

**Extended DriftlessConfig with Capability/TestFramework types, built 6-framework auto-detection, and added atomic config read/write with descriptive errors.**

## What Happened

Extended `types.ts` with `Capability` and `TestFramework` string unions matching the existing `DocFramework` pattern. `DriftlessConfig` now has typed `Capability[]` capabilities, optional `TestFramework`, required `agentHarness: "claude-code"` literal, and optional `$schema`. `InitOptions` untouched.

Created `detect.ts` with a priority-ordered config file map covering Playwright, Cypress, TestCafe, Detox, WebdriverIO, and Nightwatch. `detectTestFramework()` scans with `fs.stat` and returns the first match.

Created `config.ts` with `configPath`, `configExists`, `writeConfig` (atomic via temp+rename), and `readConfig` (descriptive errors with `Error.cause` chaining for missing file vs. invalid JSON).

Updated `index.ts` to re-export all new types and functions. Updated existing `types.test.ts` to use valid `Capability` values and added tests for the new type unions.

## Verification

- `npx tsc --noEmit -p packages/core/tsconfig.json` — clean, no errors
- `cd packages/core && npx vp test` — 25 tests pass (6 types + 11 detect + 8 config)
- `npx vp test` (workspace root) — 27 tests pass (includes 2 existing CLI tests)
- `npx vp run -r build` — both core and CLI packages build clean
- Declaration file `dist/index.d.mts` exports all new types and functions

### Slice-level verification status (T01 is intermediate — partial expected):
- ✅ `npx vp test` — all tests pass (27/27)
- ✅ `npx vp run -r build` — both packages build clean
- ⬜ `npx vp check` — not run (no new formatting concerns; will verify on T02)
- ⬜ `node packages/cli/dist/index.mjs --version` — CLI not restructured yet (T02)
- ⬜ `node packages/cli/dist/index.mjs --help` — CLI not restructured yet (T02)
- ✅ `npx tsc --noEmit -p packages/core/tsconfig.json` — clean
- ✅ `packages/core/test/detect.test.ts` — detection returns correct framework or undefined
- ✅ `packages/core/test/config.test.ts` — round-trip, configExists, atomic write, descriptive errors on missing/invalid
- ⬜ `packages/cli/test/init.test.ts` — T02 scope

## Diagnostics

- `readConfig` on missing file: throws `Error("Config file not found: <path>")` with `.cause` set to original fs error
- `readConfig` on invalid JSON: throws `Error("Invalid JSON in config file: <path>")` with `.cause` set to parse error
- `FRAMEWORK_CONFIG_MAP` can be imported and inspected at runtime to verify detection coverage
- If `.driftless.tmp.json` exists in a project dir, it indicates an interrupted write

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/types.ts` — extended with Capability, TestFramework, full DriftlessConfig
- `packages/core/src/detect.ts` — new: detectTestFramework() + FRAMEWORK_CONFIG_MAP
- `packages/core/src/config.ts` — new: configPath, configExists, writeConfig (atomic), readConfig (descriptive errors)
- `packages/core/src/index.ts` — re-exports all new types and functions
- `packages/core/test/types.test.ts` — updated capabilities to valid Capability values, added Capability/TestFramework tests
- `packages/core/test/detect.test.ts` — new: 11 tests for detection + map coverage
- `packages/core/test/config.test.ts` — new: 8 tests for round-trip, existence, atomic write, error paths
- `.gsd/milestones/M001/slices/S02/S02-PLAN.md` — added Observability/Diagnostics section, failure-path verification
- `.gsd/milestones/M001/slices/S02/tasks/T01-PLAN.md` — added Observability Impact section
