---
estimated_steps: 5
estimated_files: 6
---

# T01: Build auto-update and package-manager modules in core

**Slice:** S04 — CLI Auto-Update
**Milestone:** M003

## Description

Create two new modules in `packages/core/src/`: `package-manager.ts` (PM detection, install commands, npx detection) and `auto-update.ts` (version check against npm registry, semver comparison, update orchestration). Add `PackageManager` type and optional config fields to `DriftlessConfig`. Export everything from core's barrel. Write comprehensive unit tests mocking `fetch` and `child_process.execSync` to cover all edge cases without network access.

## Steps

1. Add `PackageManager` type (`"npm" | "pnpm" | "yarn" | "bun"`) and optional `autoUpdate?: boolean` + `packageManager?: PackageManager` fields to `DriftlessConfig` in `packages/core/src/types.ts`. Both fields optional for backward compat.
2. Create `packages/core/src/package-manager.ts`:
   - `detectPackageManager(config?)` — parse `process.env.npm_config_user_agent` by splitting on `/` to get first token. If unrecognized, fall back to `config?.packageManager`, then `"npm"`.
   - `getGlobalInstallCommand(pm, pkg)` — switch statement: npm→`npm install -g`, pnpm→`pnpm install -g`, yarn→`yarn global add`, bun→`bun install -g`. Returns full command string.
   - `isNpxContext()` — check `process.env.npm_execpath` contains `npx-cli` or `process.env._` contains `npx`. Returns boolean.
3. Create `packages/core/src/auto-update.ts`:
   - `checkForUpdate(currentVersion, options?)` — fetch `https://registry.npmjs.org/@driftless-ai/cli/latest` with 5s `AbortController` timeout. Parse JSON, extract `version` field. Compare using a local `isNewer(latest, current)` function (split on `.`, compare major/minor/patch numerically). Return `{ current, latest, isNewer, isMajor }`. On any error (timeout, non-200, bad JSON), return `{ current, latest: current, isNewer: false, isMajor: false }`.
   - `performUpdate(config?)` — orchestration: skip if `process.env.CI`; read current version from package.json (passed in or imported); call `checkForUpdate`; if not newer, return; if `isNpxContext()`, write notification to stderr and return; if `isMajor`, write warning to stderr; detect PM via `detectPackageManager(config)`; call `execSync(getGlobalInstallCommand(pm, '@driftless-ai/cli@latest'))` wrapped in try/catch (on failure, write hint to stderr and return).
4. Export all new public symbols from `packages/core/src/index.ts`.
5. Write `packages/core/test/package-manager.test.ts` covering: npm/pnpm/yarn/bun user agent strings, missing user agent with config fallback, missing everything falls to npm, install command strings per PM, npx detection (positive and negative).
6. Write `packages/core/test/auto-update.test.ts` covering: newer version available, same version, older version (edge), network timeout, HTTP 404, malformed JSON, major version detection, `performUpdate` with npx context (notification not install), CI environment skip, execSync failure (permission error hint), successful update flow.

## Must-Haves

- [ ] `PackageManager` type and optional `autoUpdate`/`packageManager` fields on `DriftlessConfig`
- [ ] `detectPackageManager()` parses `npm_config_user_agent` correctly for npm, pnpm, yarn, bun
- [ ] `getGlobalInstallCommand()` returns correct command per PM
- [ ] `isNpxContext()` detects npx via env vars
- [ ] `checkForUpdate()` fetches registry with 5s timeout, compares semver, returns structured result
- [ ] `checkForUpdate()` returns safe default on any network/parse error (never throws)
- [ ] `performUpdate()` skips on CI, notifies on npx, warns on major, installs on update, hints on permission error
- [ ] All new symbols exported from `packages/core/src/index.ts`
- [ ] All existing 222+ tests still pass

## Verification

- `pnpm run test` passes — all existing tests plus new `auto-update.test.ts` and `package-manager.test.ts`
- `pnpm run build` succeeds with no type errors
- New test files have ≥15 test cases total covering all branches listed in research

## Observability Impact

- Signals added: `checkForUpdate()` returns structured `{ current, latest, isNewer, isMajor }` — inspectable by callers
- How a future agent inspects this: call `checkForUpdate()` directly or check stderr output from `performUpdate()`
- Failure state exposed: `performUpdate()` writes stderr hints on permission errors; returns silently on all other failures

## Inputs

- `packages/core/src/types.ts` — existing `DriftlessConfig` interface to extend
- `packages/core/src/index.ts` — existing barrel exports to add to
- `packages/core/src/config.ts` — `readConfig()` pattern for reference (not modified)
- S04-RESEARCH.md — module design, user agent formats, npx detection heuristics, pitfall list

## Expected Output

- `packages/core/src/package-manager.ts` — new module with PM detection, install commands, npx detection
- `packages/core/src/auto-update.ts` — new module with version check and update orchestration
- `packages/core/src/types.ts` — updated with `PackageManager` type and two new optional fields
- `packages/core/src/index.ts` — updated with new exports
- `packages/core/test/package-manager.test.ts` — new test file
- `packages/core/test/auto-update.test.ts` — new test file
