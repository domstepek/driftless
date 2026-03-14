---
estimated_steps: 6
estimated_files: 7
---

# T02: CLI routing, @clack/prompts wizard, and init command

**Slice:** S02 — Interactive CLI wizard
**Milestone:** M001

## Description

Build the user-facing init wizard: restructure the CLI entry point for arg routing (`init`, `--version`, `--help`), install `@clack/prompts`, implement the full prompt flow with `group()`, and wire the init command that calls detection → prompts → config write. This is R001 — the primary user entry point.

## Steps

1. **Add `@clack/prompts` dependency** to `packages/cli/package.json`. Run `pnpm install` from root.

2. **Restructure `packages/cli/src/index.ts`**:
   - `main()` becomes `async main()` that parses `process.argv`:
     - `init` → dynamic import and call `initCommand()`
     - `--version` / `-V` → print version (existing behavior)
     - `--help` / `-h` / no args → print usage text
     - `--dry-run` → set in InitOptions, thread to init
   - Keep the `main()` auto-invocation at module level (D022)
   - Usage text: brief description, `driftless init [options]`, list `--dry-run`, `--version`, `--help`

3. **Create `packages/cli/src/prompts/init-prompts.ts`** — `gatherConfig(options: { detectedFramework?: TestFramework }): Promise<DriftlessConfig>`:
   - Use `@clack/prompts` `group()` wrapping:
     - `text()` for test paths (pre-filled with default glob based on detected framework, e.g. `tests/**/*.spec.ts` for Playwright)
     - `text()` for output dir (default: `docs/training`)
     - `select()` for doc framework (plain-md / fumadocs / docusaurus)
     - `multiselect()` for capabilities (doc-generator / e2e-writer, both selected by default)
     - `text()` for skills dir (default: `.skills`)
   - Each prompt step: check `isCancel()`, call `cancel()` and `process.exit(0)` if cancelled
   - Return assembled `DriftlessConfig` with `agentHarness: "claude-code"`

4. **Create `packages/cli/src/commands/init.ts`** — `initCommand(options: InitOptions): Promise<void>`:
   - Call `intro("driftless init")`
   - Run `detectTestFramework(options.cwd)` — log detection result with `log.info`
   - Call `gatherConfig({ detectedFramework })` to get config
   - Check `configExists(options.cwd)` — if exists, `confirm()` overwrite, exit on decline
   - Call `writeConfig(options.cwd, config)`
   - Show `note()` with summary of what was written
   - Call `outro()` with next steps message
   - If `options.dryRun`, log what would be written but skip `writeConfig` (minimal: just print config and skip write — S05 owns the full dry-run experience)

5. **Update `packages/cli/test/cli.test.ts`**:
   - Update existing tests for new `main()` behavior (version still works, help prints usage)
   - Add test: bare `main()` with no args prints help
   - Add test: `main()` with `--help` prints usage
   - Mock the init command module to prevent prompt execution during CLI routing tests

6. **Write `packages/cli/test/init.test.ts`**:
   - `vi.mock('@clack/prompts')` — mock `group`, `text`, `select`, `multiselect`, `confirm`, `intro`, `outro`, `note`, `log`, `isCancel`, `cancel`
   - `vi.mock('@driftless/core')` — mock `detectTestFramework`, `writeConfig`, `configExists`
   - Test: `gatherConfig()` with mocked prompt responses produces correct `DriftlessConfig`
   - Test: `initCommand()` calls detect → gather → write in order
   - Test: `initCommand()` with existing config prompts for overwrite confirmation
   - Test: cancel at prompt exits process (mock `process.exit`)

## Must-Haves

- [ ] `@clack/prompts` installed and importable
- [ ] `main()` routes `init`, `--version`, `--help` correctly from `process.argv`
- [ ] `--dry-run` flag parsed and threaded through to `initCommand`
- [ ] Prompt flow uses `group()` with `text`, `select`, `multiselect`
- [ ] Cancel handling via `isCancel` + `process.exit(0)` at every prompt step
- [ ] Existing config triggers overwrite confirmation
- [ ] Bundle builds and `--version`/`--help` work from the built dist
- [ ] All tests pass (existing + new)

## Verification

- `npx vp test` — all tests pass across both packages
- `npx vp run -r build` — both packages build clean
- `node packages/cli/dist/index.mjs --version` prints `driftless v0.0.0`
- `node packages/cli/dist/index.mjs --help` prints usage with `init`, `--dry-run`, `--version`, `--help`
- `npx vp check` — format and lint pass

## Inputs

- `packages/core/src/types.ts` — extended types from T01 (`DriftlessConfig`, `Capability`, `TestFramework`, `InitOptions`)
- `packages/core/src/detect.ts` — `detectTestFramework()` from T01
- `packages/core/src/config.ts` — `readConfig()`, `writeConfig()`, `configExists()` from T01
- `packages/cli/src/index.ts` — existing entry point to restructure
- `packages/cli/test/cli.test.ts` — existing tests to update

## Observability Impact

- **CLI routing**: `--help` and `--version` print to stdout. Unrecognized commands or `init` without a TTY still produce useful output. `--dry-run` logs the config JSON to stdout without writing, providing a preview/debug signal.
- **Init flow logging**: Each phase (detection → prompts → write) is announced via `@clack/prompts` `log.info` — agents and users can see which framework was detected, what config was assembled, and whether a write occurred.
- **Prompt cancellation**: `isCancel()` at every prompt step produces a clean exit(0) with `cancel()` message — no silent hangs or unhandled rejections.
- **Config overwrite guard**: When `.driftless.json` already exists, the overwrite confirmation is logged, preventing accidental data loss.
- **Test mocking surface**: All external I/O (`@clack/prompts`, `@driftless/core` config/detect) is injected via imports, so tests mock at module boundaries — failures in tests pinpoint which layer broke.

## Expected Output

- `packages/cli/package.json` — `@clack/prompts` added as dependency
- `packages/cli/src/index.ts` — restructured with arg routing and async `main()`
- `packages/cli/src/commands/init.ts` — init command orchestrator
- `packages/cli/src/prompts/init-prompts.ts` — prompt gathering function
- `packages/cli/test/cli.test.ts` — updated for new routing
- `packages/cli/test/init.test.ts` — new tests for prompt flow and init command
