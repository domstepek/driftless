# S02: Interactive CLI wizard

**Goal:** `npx driftless init` runs an interactive wizard that detects test framework config, prompts for paths/framework/capabilities, and writes `.driftless.json`.
**Demo:** Run `node packages/cli/dist/index.mjs init` — it detects frameworks, prompts the user through config, writes `.driftless.json`. Run with `--version` and `--help` — both work. All tests pass.

## Must-Haves

- `DriftlessConfig` extended with `Capability`, `TestFramework`, `agentHarness` fields — the S03/S04/S05 boundary contract
- `detectTestFramework()` scans target directory for known config files and returns the first match
- `readConfig()` and `writeConfig()` round-trip `.driftless.json` with atomic writes (write-to-temp, rename)
- `configExists()` checks for existing config
- CLI entry point routes `init`, `--version`, `--help` from `process.argv`
- Init prompt flow using `@clack/prompts` `group()`: detect → test paths → output dir → doc framework → capabilities → skills dir → confirm overwrite if existing → write config → summary
- Cancel at any prompt exits cleanly via `isCancel` + `process.exit(0)`
- `--dry-run` flag accepted and threaded through `InitOptions` (behavior deferred to S05)
- Existing `.driftless.json` triggers overwrite confirmation prompt

## Proof Level

- This slice proves: contract + integration (types consumed by future slices, prompt flow exercises real @clack/prompts in the bundle)
- Real runtime required: yes (bundle must execute, prompts must render)
- Human/UAT required: no (tests mock prompts; bundle verified with `--version`/`--help`)

## Integration Closure

- Upstream surfaces consumed: `packages/cli/src/index.ts` (entry point — restructured), `packages/core/src/types.ts` (extended), `packages/core/src/index.ts` (re-exports added)
- New wiring introduced in this slice: CLI arg routing dispatches to init command; init command calls detection → prompts → config write
- What remains before the milestone is truly usable end-to-end: S03 (doc generation), S04 (skill installer), S05 (dry-run/rollback/debug logging)

## Tasks

- [x] **T01: Core types, test framework detection, and config module** `est:40m`
  - Why: S03/S04/S05 all consume the type contract and config module — this must exist first
  - Files: `packages/core/src/types.ts`, `packages/core/src/detect.ts`, `packages/core/src/config.ts`, `packages/core/src/index.ts`, `packages/core/test/detect.test.ts`, `packages/core/test/config.test.ts`
  - Do: Extend `DriftlessConfig` with `Capability`, `TestFramework`, `agentHarness`. Add `detectTestFramework(cwd)` scanning the 6-framework config file map. Add `readConfig`/`writeConfig`/`configExists` with atomic writes. Re-export everything from index.ts. Write tests for detection (mock fs with temp dirs + config files) and config (round-trip, atomic write, configExists).
  - Verify: `npx vp test --project core` passes. `npx tsc --noEmit -p packages/core/tsconfig.json` clean. Existing S01 type tests still pass.
  - Done when: detection returns correct framework from temp dirs with config files, config round-trips through `.driftless.json`, all core tests green

- [x] **T02: CLI routing, @clack/prompts wizard, and init command** `est:50m`
  - Why: The user-facing init flow — this is R001 (the wizard)
  - Files: `packages/cli/src/index.ts`, `packages/cli/src/commands/init.ts`, `packages/cli/src/prompts/init-prompts.ts`, `packages/cli/test/cli.test.ts`, `packages/cli/test/init.test.ts`, `packages/cli/package.json`
  - Do: Add `@clack/prompts` as dependency. Restructure `main()` to parse `process.argv` — route `init`, `--version`, `--help`, `--dry-run`. Build `gatherConfig()` in init-prompts.ts using `group()` with intro/outro: detect framework → pre-fill test paths → output dir → doc framework → capabilities multiselect → skills dir. Build `initCommand()` in init.ts that calls detect → gather → check existing config → confirm overwrite → writeConfig → summary note. Handle `isCancel` at every prompt. Update existing CLI tests for new routing. Write init.test.ts mocking `@clack/prompts` and `@driftless/core` config functions.
  - Verify: `npx vp test` all pass. `npx vp run -r build` clean. `node packages/cli/dist/index.mjs --version` prints version. `node packages/cli/dist/index.mjs --help` prints usage. `npx vp check` passes.
  - Done when: all tests pass including mocked prompt flow, bundle runs `--version`/`--help` correctly, `vp check` clean

## Observability / Diagnostics

- **Config write errors** — `writeConfig` throws with `path` and cause on failure; the temp file path is included so agents can inspect partial writes.
- **Config read errors** — `readConfig` throws a descriptive error including the file path attempted, whether the file was missing vs. parse failure, and the underlying error message.
- **Detection results** — `detectTestFramework` returns `undefined` (not silent swallow) when no framework found. The detection map is exported as `FRAMEWORK_CONFIG_MAP` so tests and agents can inspect coverage.
- **CLI routing** — `--help` and `--version` print to stdout; unrecognized commands print usage to stderr with exit code 1.
- **Prompt cancellation** — `isCancel` checks produce a clean exit(0) with a cancellation message via `@clack/prompts` `cancel()`.
- **Secrets / PII** — no secrets flow through this slice. Config file contains only project-relative paths and string enum values.

## Verification

- `npx vp test` — all tests pass (existing S01 tests + new detection, config, CLI routing, and prompt flow tests)
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass
- `node packages/cli/dist/index.mjs --version` prints `driftless v0.0.0`
- `node packages/cli/dist/index.mjs --help` prints usage text
- `npx tsc --noEmit -p packages/core/tsconfig.json` — type checks clean (boundary contract verified)
- `readConfig` on a missing file throws with message containing the file path (failure-path check)
- `readConfig` on invalid JSON throws with message indicating parse failure (failure-path check)
- Test files:
  - `packages/core/test/detect.test.ts` — detection returns correct framework or undefined
  - `packages/core/test/config.test.ts` — config write/read round-trip, configExists, atomic write, descriptive error on missing/invalid file
  - `packages/cli/test/init.test.ts` — prompt flow produces correct config from mocked inputs, cancel handling, existing config overwrite prompt

## Files Likely Touched

- `packages/core/src/types.ts`
- `packages/core/src/detect.ts`
- `packages/core/src/config.ts`
- `packages/core/src/index.ts`
- `packages/core/test/detect.test.ts`
- `packages/core/test/config.test.ts`
- `packages/core/test/types.test.ts`
- `packages/cli/src/index.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/src/prompts/init-prompts.ts`
- `packages/cli/test/cli.test.ts`
- `packages/cli/test/init.test.ts`
- `packages/cli/package.json`
