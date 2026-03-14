# S02: Interactive CLI wizard — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven for test verification, live-runtime for CLI behavior)
- Why this mode is sufficient: Test mocks validate prompt logic; live runtime validates the built bundle actually executes. No human-interactive prompts need manual testing — the prompt library is trusted and the logic is covered by unit tests.

## Preconditions

- Repository cloned and dependencies installed (`pnpm install`)
- Both packages built: `npx vp run -r build` succeeds
- Node.js available (managed by Vite+)
- Working directory is the monorepo root

## Smoke Test

Run `node packages/cli/dist/index.mjs --version` — should print `driftless v0.0.0`. If this fails, the bundle is broken and nothing else will work.

## Test Cases

### 1. Version flag

1. Run `node packages/cli/dist/index.mjs --version`
2. **Expected:** stdout prints `driftless v0.0.0`, exit code 0

### 2. Help flag

1. Run `node packages/cli/dist/index.mjs --help`
2. **Expected:** stdout prints usage text including `init`, `--dry-run`, `--version`, `--help`, exit code 0

### 3. Unknown command

1. Run `node packages/cli/dist/index.mjs bogus`
2. **Expected:** stderr prints "Unknown command: bogus" followed by usage text, exit code 1

### 4. Test framework detection — Playwright

1. Create a temp directory with a `playwright.config.ts` file (can be empty)
2. Call `detectTestFramework(tempDir)`
3. **Expected:** returns `"playwright"`

### 5. Test framework detection — Cypress

1. Create a temp directory with a `cypress.config.js` file
2. Call `detectTestFramework(tempDir)`
3. **Expected:** returns `"cypress"`

### 6. Test framework detection — no framework

1. Create an empty temp directory
2. Call `detectTestFramework(tempDir)`
3. **Expected:** returns `undefined`

### 7. Config round-trip

1. Call `writeConfig(tempDir, validConfig)` with a full `DriftlessConfig` object
2. Call `readConfig(tempDir)`
3. **Expected:** returned config deeply equals the original. File exists at `<tempDir>/.driftless.json`.

### 8. Config existence check

1. Call `configExists(tempDir)` on a directory without `.driftless.json`
2. **Expected:** returns `false`
3. Call `writeConfig(tempDir, config)`, then `configExists(tempDir)`
4. **Expected:** returns `true`

### 9. Prompt flow produces correct config (mocked)

1. Mock `@clack/prompts` to return: testPaths `["tests/**/*.spec.ts"]`, outputDir `"docs"`, docFramework `"plain-md"`, capabilities `["doc-generation"]`, skillsDir `".skills"`
2. Call `gatherConfig()` with detected framework `"playwright"` and cwd `/tmp/test`
3. **Expected:** returned config has `testFramework: "playwright"`, `testPaths: ["tests/**/*.spec.ts"]`, `outputDir: "docs"`, `docFramework: "plain-md"`, `capabilities: ["doc-generation"]`, `skillsDir: ".skills"`, `agentHarness: "claude-code"`

### 10. Init command full flow (mocked)

1. Mock detection to return `"playwright"`, mock prompts to return valid config, mock config write
2. Call `initCommand({ dryRun: false, cwd: "/tmp/test" })`
3. **Expected:** `detectTestFramework` called with cwd, `gatherConfig` called, `writeConfig` called with the gathered config

### 11. Init command dry-run mode (mocked)

1. Mock detection and prompts as above
2. Call `initCommand({ dryRun: true, cwd: "/tmp/test" })`
3. **Expected:** `writeConfig` is NOT called. Dry-run preview logged to stdout.

### 12. Init command overwrite confirmation (mocked)

1. Mock `configExists` to return `true`, mock confirmation prompt to return `true`
2. Call `initCommand({ dryRun: false, cwd: "/tmp/test" })`
3. **Expected:** overwrite confirmation prompt is shown, config is written when confirmed

### 13. Init command overwrite declined (mocked)

1. Mock `configExists` to return `true`, mock confirmation prompt to return `false` (decline)
2. Call `initCommand({ dryRun: false, cwd: "/tmp/test" })`
3. **Expected:** cancel message shown, process exits with code 0, config is NOT written

### 14. All automated tests pass

1. Run `npx vp test`
2. **Expected:** 44 tests pass across 5 test files (types, detect, config, cli, init), 0 failures

### 15. Both packages build clean

1. Run `npx vp run -r build`
2. **Expected:** both `packages/core` and `packages/cli` build without errors

### 16. Format and lint pass

1. Run `npx vp check`
2. **Expected:** all files formatted and linted clean, no warnings or errors

### 17. TypeScript compiles clean

1. Run `npx tsc --noEmit -p packages/core/tsconfig.json`
2. **Expected:** no errors

## Edge Cases

### Cancel at prompt step

1. Mock `@clack/prompts` to return `Symbol.for("cancel")` from a prompt
2. Call `gatherConfig()`
3. **Expected:** `process.exit(0)` called, cancel message shown, no config written

### Config read — missing file

1. Call `readConfig("/nonexistent/path")`
2. **Expected:** throws Error with message containing the file path and "not found"

### Config read — invalid JSON

1. Write `{{{invalid` to `<tempDir>/.driftless.json`
2. Call `readConfig(tempDir)`
3. **Expected:** throws Error with message indicating parse failure, `.cause` set to original SyntaxError

### Atomic write — temp file cleanup

1. Call `writeConfig(tempDir, config)` successfully
2. Check for `<tempDir>/.driftless.tmp.json`
3. **Expected:** temp file does NOT exist (renamed to final path)

### Detection priority order

1. Create a temp directory with both `playwright.config.ts` and `cypress.config.js`
2. Call `detectTestFramework(tempDir)`
3. **Expected:** returns `"playwright"` (Playwright has higher priority in the detection map)

### FRAMEWORK_CONFIG_MAP coverage

1. Import `FRAMEWORK_CONFIG_MAP` from `@driftless/core`
2. **Expected:** contains entries for all 6 frameworks: playwright, cypress, testcafe, detox, webdriverio, nightwatch

## Failure Signals

- `node packages/cli/dist/index.mjs --version` prints something other than `driftless v0.0.0` or crashes
- `npx vp test` reports any failures or the test count drops below 44
- `npx vp check` reports lint or format errors
- `readConfig` on missing file does NOT include the file path in the error message
- `writeConfig` leaves `.driftless.tmp.json` behind after a successful write
- `detectTestFramework` returns a value for an empty directory
- Build output missing `dist/index.d.mts` in either package

## Requirements Proved By This UAT

- R001 — Interactive CLI setup wizard: test cases 1-3, 9-13 prove the wizard prompts, routes, and writes config
- R009 — Config file persisting init choices: test cases 7-8 prove round-trip and existence
- R010 — Test framework auto-detection: test cases 4-6 plus edge cases prove detection across frameworks
- R015 — Modular capability selection: test case 9 proves capabilities are selectable and persisted

## Not Proven By This UAT

- R011 (`--dry-run` behavior) — flag is accepted and threaded but actual preview behavior deferred to S05
- R007 (debug logging) — no debug log written yet, deferred to S05
- R008 (rollback on failure) — no rollback implemented yet, deferred to S05
- Live terminal interaction — prompts are tested via mocks; actual terminal rendering depends on `@clack/prompts` library behavior

## Notes for Tester

- Test cases 9-13 are already covered by automated tests in `packages/cli/test/init.test.ts` — run `npx vp test` to execute them all
- The CLI cannot be tested interactively in a non-TTY environment (CI) because `@clack/prompts` requires a terminal — mocked tests are the appropriate verification method
- Detection tests create real temp directories with real config files — they exercise actual fs.stat calls, not mocked filesystem
