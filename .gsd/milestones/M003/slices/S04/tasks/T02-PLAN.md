---
estimated_steps: 4
estimated_files: 5
---

# T02: Wire auto-update into CLI entry point and init wizard

**Slice:** S04 — CLI Auto-Update
**Milestone:** M003

## Description

Connect the core auto-update modules to the CLI. Add a pre-command hook in `main()` that calls `performUpdate()` before routing to commands (but after --version/--help fast paths). Add an auto-update `p.confirm()` prompt to the init wizard. Thread the `autoUpdate` field through config construction and persistence. Update CLI and init tests to cover the new behavior.

## Steps

1. In `packages/cli/src/index.ts`, add the auto-update hook in `main()` after the --version/--help early returns but before command routing. Import `performUpdate` and `readConfig` from `@driftless-ai/core`. Wrap in try/catch — any error is silently swallowed so the user's command always runs. Only call when config exists and `autoUpdate === true`.
2. In `packages/cli/src/prompts/init-prompts.ts`, add a `p.confirm()` call after the `p.group()` for auto-update preference. Default to `true`. Handle cancellation. Include the result as `autoUpdate` in the returned `DriftlessConfig`.
3. In `packages/cli/src/commands/init.ts`, ensure the `autoUpdate` field from `gatherConfig()` flows through to the config written to disk. No structural changes needed — the config object already gets serialized as-is.
4. Update `packages/cli/test/cli.test.ts`: verify --version and --help still return instantly (existing tests cover this, but confirm they still pass). Add a test that the auto-update hook doesn't interfere when no config exists.
5. Update `packages/cli/test/init.test.ts`: verify the auto-update prompt appears in the init flow and the preference is persisted to the written config file.

## Must-Haves

- [ ] Pre-command hook calls `performUpdate()` when config has `autoUpdate: true`
- [ ] Hook silently skips when: no config file, `autoUpdate` not true, `performUpdate` throws
- [ ] `--version` and `--help` remain instant (no auto-update check)
- [ ] Init wizard includes auto-update confirm prompt
- [ ] `autoUpdate` field persisted in `.driftless.json` after init
- [ ] All existing CLI and init tests still pass

## Verification

- `pnpm run test` — full suite passes (222+ existing plus new tests from T01 and this task)
- `pnpm run build` — both packages build clean
- `node packages/cli/dist/index.mjs --version` returns version instantly (no network call)

## Inputs

- `packages/core/src/auto-update.ts` — `performUpdate()` function from T01
- `packages/core/src/index.ts` — exports from T01
- `packages/cli/src/index.ts` — current CLI entry point with `main()` function
- `packages/cli/src/prompts/init-prompts.ts` — current prompt flow
- `packages/cli/src/commands/init.ts` — current init command

## Expected Output

- `packages/cli/src/index.ts` — updated with auto-update hook before command routing
- `packages/cli/src/prompts/init-prompts.ts` — updated with auto-update confirm prompt
- `packages/cli/src/commands/init.ts` — minor update if needed to thread `autoUpdate` field
- `packages/cli/test/cli.test.ts` — updated with auto-update hook tests
- `packages/cli/test/init.test.ts` — updated with auto-update prompt tests

## Observability Impact

- **Pre-command hook**: `performUpdate()` writes to stderr on: npx notification, major version warning, permission error hint. All errors are silently swallowed — the hook never blocks command execution.
- **Init wizard**: The `autoUpdate` field appears in `.driftless.json` after init — inspect the written config to confirm the preference was persisted.
- **Inspection**: A future agent can verify auto-update wiring by: (1) reading `.driftless.json` for the `autoUpdate` field, (2) running `--version` and confirming no network call or delay, (3) checking stderr output when `performUpdate` detects a newer version.
- **Failure visibility**: If the auto-update hook throws, the error is caught and swallowed — the user's command proceeds normally. No visible signal on hook failure (by design — update checks must never block the CLI).
