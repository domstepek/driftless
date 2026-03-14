# S04: CLI Auto-Update

**Goal:** The driftless CLI checks npm for newer versions on launch and auto-updates when `autoUpdate: true` in config.
**Demo:** A user with `autoUpdate: true` in `.driftless.json` runs `driftless init`. The CLI checks the registry, detects the package manager, and updates if newer. npx users see a notification instead. Network failures skip silently.

## Must-Haves

- Version check against `https://registry.npmjs.org/@driftless-ai/cli/latest` with 5s timeout
- Semver comparison (exact `x.y.z` vs `x.y.z`) without external dependencies
- Package manager detection from `npm_config_user_agent` with fallback to config, then npm
- npx context detection — show notification instead of auto-updating
- Global install command generation per PM (npm, pnpm, yarn, bun)
- Auto-update skipped when: no config, `autoUpdate` not true, CI environment, network error
- Major version jump warning to stderr before updating
- `autoUpdate` and `packageManager` optional fields added to `DriftlessConfig`
- Auto-update prompt in `driftless init` wizard
- Pre-command hook in CLI entry point (after --version/--help, before command routing)

## Proof Level

- This slice proves: contract + integration (unit tests for all logic branches, CLI integration for hook wiring)
- Real runtime required: no (unit tests mock fetch and execSync; live registry already proven in S01)
- Human/UAT required: no

## Verification

- `pnpm run test` — all existing tests pass (222+ baseline) plus new auto-update and package-manager tests
- `packages/core/test/auto-update.test.ts` — covers: newer version available, same version, network timeout, 404, malformed JSON, major version detection, npx context notification, CI environment skip, execSync failure, permission error hint
- `packages/core/test/package-manager.test.ts` — covers: npm/pnpm/yarn/bun user agent parsing, missing user agent fallback to config, missing config fallback to npm, install command per PM, npx detection heuristics
- `packages/cli/test/cli.test.ts` — existing tests still pass; auto-update hook doesn't break --version/--help fast paths
- `pnpm run build` — both packages build clean

## Observability / Diagnostics

- Runtime signals: stderr warning on major version jump; stderr hint on permission error; silent skip on network failure/CI/npx
- Inspection surfaces: `checkForUpdate()` returns `{ current, latest, isNewer, isMajor }` — inspectable in tests and debug logs
- Failure visibility: all error paths caught and skipped silently for the user, but return structured info for callers
- Redaction constraints: none (no secrets involved)

## Integration Closure

- Upstream surfaces consumed: `DriftlessConfig` type and `readConfig()` from `packages/core/src/config.ts`; `package.json` version from CLI package
- New wiring introduced in this slice: pre-command hook in `packages/cli/src/index.ts`, auto-update prompt in init wizard
- What remains before the milestone is truly usable end-to-end: nothing — S01-S03 are complete, S04 is the final slice

## Tasks

- [x] **T01: Build auto-update and package-manager modules in core** `est:45m`
  - Why: All auto-update logic (version check, PM detection, semver comparison, install orchestration) belongs in core as reusable infrastructure. Tests prove every branch without network access.
  - Files: `packages/core/src/auto-update.ts`, `packages/core/src/package-manager.ts`, `packages/core/src/types.ts`, `packages/core/src/index.ts`, `packages/core/test/auto-update.test.ts`, `packages/core/test/package-manager.test.ts`
  - Do: Add `PackageManager` type and optional `autoUpdate`/`packageManager` fields to `DriftlessConfig`. Create `package-manager.ts` with `detectPackageManager()`, `getGlobalInstallCommand()`, `isNpxContext()`. Create `auto-update.ts` with `checkForUpdate()` (fetch + semver compare) and `performUpdate()` (orchestration: check → detect PM → install or notify). Use `AbortController` with 5s timeout on fetch. Skip when `CI=true`. Export all new symbols from `packages/core/src/index.ts`. Write comprehensive tests mocking `fetch` and `child_process.execSync`.
  - Verify: `pnpm run test` — all existing tests pass plus new test files. `pnpm run build` succeeds.
  - Done when: `auto-update.test.ts` and `package-manager.test.ts` pass covering all edge cases listed in research (version check, PM detection, npx detection, network failures, major version, CI skip, permission errors).

- [x] **T02: Wire auto-update into CLI entry point and init wizard** `est:30m`
  - Why: The core modules exist but nothing calls them. This task connects the auto-update check to the CLI lifecycle and adds the init prompt for user preference.
  - Files: `packages/cli/src/index.ts`, `packages/cli/src/prompts/init-prompts.ts`, `packages/cli/src/commands/init.ts`, `packages/cli/test/cli.test.ts`, `packages/cli/test/init.test.ts`
  - Do: Add pre-command hook in `main()` between help/version checks and command routing — import and call `performUpdate()` wrapped in try/catch (silent failure). Add `p.confirm()` for auto-update preference after the `p.group()` call in `gatherConfig()`. Thread `autoUpdate` into the config object built in `gatherConfig()` and written in `initCommand()`. Update CLI tests to verify the hook doesn't break fast paths. Update init tests to verify auto-update prompt and config persistence.
  - Verify: `pnpm run test` — full suite passes. `pnpm run build` succeeds. Manual check: `node packages/cli/dist/index.mjs --version` still returns instantly.
  - Done when: CLI auto-update hook runs before commands, init wizard includes auto-update prompt, config persists the preference, and all tests pass.

## Files Likely Touched

- `packages/core/src/types.ts`
- `packages/core/src/auto-update.ts`
- `packages/core/src/package-manager.ts`
- `packages/core/src/index.ts`
- `packages/core/test/auto-update.test.ts`
- `packages/core/test/package-manager.test.ts`
- `packages/cli/src/index.ts`
- `packages/cli/src/prompts/init-prompts.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/test/cli.test.ts`
- `packages/cli/test/init.test.ts`
