---
estimated_steps: 6
estimated_files: 6
---

# T01: Core types, test framework detection, and config module

**Slice:** S02 — Interactive CLI wizard
**Milestone:** M001

## Description

Build the core package foundations that S02's CLI layer and all downstream slices (S03, S04, S05) depend on: the extended type contract (`Capability`, `TestFramework`, fleshed-out `DriftlessConfig`), test framework auto-detection by scanning for known config files, and `.driftless.json` config read/write with atomic writes.

## Steps

1. **Extend types** in `packages/core/src/types.ts`:
   - Add `Capability = "doc-generator" | "e2e-writer"` string union type
   - Add `TestFramework = "playwright" | "cypress" | "testcafe" | "detox" | "webdriverio" | "nightwatch" | "other"` string union type
   - Extend `DriftlessConfig`: change `capabilities` from `string[]` to `Capability[]`, add `testFramework?: TestFramework`, add `agentHarness: "claude-code"`, add optional `$schema?: string`
   - Do NOT break the existing `InitOptions` — it stays as-is

2. **Create `packages/core/src/detect.ts`** — `detectTestFramework(cwd: string): Promise<TestFramework | undefined>`:
   - Define the config file map (research has the full table: 6 frameworks × their config files)
   - Check each framework's config files with `fs.stat` in priority order (Playwright first — most common)
   - Return the first match, or `undefined` if nothing found
   - Export the detection map constant so tests can verify coverage

3. **Create `packages/core/src/config.ts`** — config file operations:
   - `configPath(cwd: string): string` — resolves to `path.join(cwd, '.driftless.json')`
   - `configExists(cwd: string): Promise<boolean>` — checks if `.driftless.json` exists
   - `writeConfig(cwd: string, config: DriftlessConfig): Promise<void>` — write to `.driftless.tmp.json`, then `fs.rename` for atomic write. JSON.stringify with 2-space indent.
   - `readConfig(cwd: string): Promise<DriftlessConfig>` — read and parse. Throw with clear message if file missing or invalid JSON.

4. **Update `packages/core/src/index.ts`** — re-export new types (`Capability`, `TestFramework`) and new modules (`detectTestFramework`, `readConfig`, `writeConfig`, `configExists`)

5. **Write `packages/core/test/detect.test.ts`**:
   - Create temp dirs with framework config files, assert `detectTestFramework` returns correct framework
   - Test empty dir returns `undefined`
   - Test priority ordering (if both playwright and cypress configs exist, returns playwright)

6. **Write `packages/core/test/config.test.ts`**:
   - Write config, read it back, assert round-trip fidelity
   - Assert `configExists` returns true after write, false on empty dir
   - Assert `readConfig` throws on missing file
   - Verify atomic write (temp file is cleaned up)

## Must-Haves

- [ ] `Capability` and `TestFramework` are string union types (not enums) matching existing `DocFramework` pattern
- [ ] `DriftlessConfig.capabilities` typed as `Capability[]` (not `string[]`)
- [ ] `DriftlessConfig.agentHarness` typed as `"claude-code"` literal
- [ ] `detectTestFramework` covers all 6 frameworks from the research detection map
- [ ] `writeConfig` uses atomic write (temp file + rename)
- [ ] `readConfig` throws descriptive error on missing/invalid file
- [ ] Existing S01 tests (`types.test.ts`) still pass after type changes — update the existing test's `capabilities` value to use a valid `Capability`
- [ ] All new tests pass

## Verification

- `cd packages/core && npx vp test` — all tests pass (existing + new)
- `npx tsc --noEmit -p packages/core/tsconfig.json` — type-checks clean
- `npx vp run -r build` — core package builds with new exports in declaration file

## Inputs

- `packages/core/src/types.ts` — existing S01 boundary types to extend
- `packages/core/src/index.ts` — existing re-exports to augment
- `packages/core/test/types.test.ts` — existing tests that must keep passing (update `capabilities` value)
- S02 Research: detection map table, config schema design, constraints

## Observability Impact

- **`readConfig` errors** — throws with file path, failure mode (missing vs. parse), and original error. A future agent debugging config issues can catch these to understand exactly what went wrong.
- **`writeConfig` atomicity** — uses temp file + rename. If a crash occurs mid-write, the temp file `.driftless.tmp.json` may be left behind — its presence signals an interrupted write.
- **Detection map exported** — `FRAMEWORK_CONFIG_MAP` is a public constant. Agents and tests can inspect it to verify coverage without reading source.
- **`detectTestFramework` returns `undefined`** — explicit absence signal, not a silent default. Callers must handle the undefined case.

## Expected Output

- `packages/core/src/types.ts` — extended with `Capability`, `TestFramework`, full `DriftlessConfig`
- `packages/core/src/detect.ts` — `detectTestFramework()` with 6-framework config file scanning
- `packages/core/src/config.ts` — `readConfig()`, `writeConfig()`, `configExists()` with atomic writes
- `packages/core/src/index.ts` — re-exports all new types and functions
- `packages/core/test/detect.test.ts` — detection tests with temp dir fixtures
- `packages/core/test/config.test.ts` — config round-trip and error handling tests
