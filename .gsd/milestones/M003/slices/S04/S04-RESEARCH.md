# S04: CLI Auto-Update — Research

**Date:** 2026-03-14

## Summary

S04 adds a self-update mechanism to the driftless CLI. The feature has four distinct parts: (1) version check against the npm registry, (2) package manager detection, (3) auto-install via the detected package manager, and (4) an auto-update prompt in the init wizard. All logic lives in new modules — no existing code needs modification except `DriftlessConfig` (add two fields), `init-prompts.ts` (add one prompt), and `index.ts` (add one pre-command hook).

The approach is straightforward: `fetch` the npm registry's abbreviated metadata (`https://registry.npmjs.org/@driftless-ai/cli/latest`) for the version string, compare with the local `package.json` version using a simple 3-tuple semver parse (no library needed), and if newer, shell out to the detected package manager's global install command. The registry endpoint returns ~500 bytes and responds in <200ms — well within the "adds ~1-2s on cold runs" budget from scope.

The main complexity is in the edge cases: npx detection (show notification, don't auto-update), network failure (skip silently), major version jumps (warn via stderr but still update), and package manager detection (parse `npm_config_user_agent` with fallback to config file). These are all unit-testable without network access by mocking `fetch` and `child_process.execSync`.

## Recommendation

**Approach:** Four new source files in `packages/core/src/`: `auto-update.ts` (version check + install orchestration), `package-manager.ts` (detection utility), and corresponding exports. The init prompt addition is a one-line change in `init-prompts.ts`. The CLI hook is a ~10-line addition in `index.ts` before command routing.

**Why core, not CLI:** The auto-update logic (version check, PM detection, semver comparison) is reusable infrastructure that belongs in `@driftless-ai/core`. The CLI only calls the orchestration function. This follows the existing pattern where `installSkills`, `installWorkflows`, `generateDocs`, etc. all live in core.

**No external dependencies:** Semver comparison for exact versions (not ranges) is a 10-line function. `fetch` is built into Node 22. `child_process.execSync` is built in. `npm_config_user_agent` parsing is simple string splitting. Adding `semver` (2MB) or `update-notifier` (pulls in `configstore`, `is-ci`, etc.) would be over-engineering.

**Where the hook goes:** In `index.ts`, after version/help checks but before command routing (line ~37). The auto-update check reads `.driftless.json` (if it exists), checks `autoUpdate: true`, runs the version check, and either updates or notifies. This means `--version` and `--help` remain instant. The hook is async but non-blocking for the user experience — if it fails, it logs nothing and the command proceeds.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Version check against registry | `fetch('https://registry.npmjs.org/@driftless-ai/cli/latest')` → `json.version` | npm's public JSON API. 500 bytes, no auth, <200ms. Don't scrape or shell out to `npm view`. |
| Package manager detection | `process.env.npm_config_user_agent` parsing | Set by npm/pnpm/yarn/bun at install time. Format: `<pm>/<version> node/<version>`. Don't walk filesystem. |
| Semver comparison (exact versions) | 10-line `parseSemver` + `isNewer` function | Only comparing `x.y.z` vs `x.y.z` — no ranges, prerelease, or build metadata. `semver` package is overkill. |
| Global install command | `execSync('<pm> install -g @driftless-ai/cli@latest')` | Each PM has a known global install syntax. Don't abstract this — it's a switch statement. |
| npx detection | Check for `npm_execpath` containing `npx` or absence of global install markers | npx sets specific env vars. Heuristic but reliable enough — false negatives just mean the user gets the auto-update behavior, which is still fine. |

## Existing Code and Patterns

- `packages/core/src/config.ts` — `readConfig()` reads `.driftless.json` with descriptive errors. Auto-update hook uses this. `writeConfig()` does atomic write (temp+rename). Used to persist `packageManager` after detection.
- `packages/core/src/types.ts` — `DriftlessConfig` interface. Add `autoUpdate?: boolean` and `packageManager?: PackageManager` fields. Both optional to maintain backward compat with existing config files (pre-S04).
- `packages/cli/src/index.ts` — CLI entry point. `main()` function at line 24. Hook goes between help/version checks (line 36) and command routing (line 39). Pattern: early return for fast paths, dynamic import for heavy commands.
- `packages/cli/src/prompts/init-prompts.ts` — `gatherConfig()` uses `p.group()` for multi-step prompts. Auto-update prompt is a `p.confirm()` added after the group, similar to the overwrite prompt in `init.ts`.
- `packages/core/src/agent.ts` — Uses `spawn` from `child_process`. Establishes the pattern for shelling out. Auto-update uses `execSync` instead (synchronous, blocking — we want to finish updating before the command runs).
- `packages/cli/test/cli.test.ts` — Tests mock `console.log` before dynamic import. The auto-update hook must be mockable — it should be an importable function, not inline code.
- `packages/cli/test/init.test.ts` — Mocks `@driftless-ai/core` via `vi.mock()` with `...actual` spread. New auto-update exports from core follow the same mock pattern.

## Constraints

- **Node ≥22.12.0** — `fetch` is stable and globally available. No polyfill needed.
- **ESM-only build** — All new modules must use `.js` extension in imports. `vp pack` handles bundling.
- **Zero new dependencies** — Everything needed (`fetch`, `execSync`, `process.env`) is built into Node 22. Core's `inlinedDependencies` pattern is for library deps only.
- **Backward-compatible config** — Existing `.driftless.json` files (from S01-S03) don't have `autoUpdate` or `packageManager`. Both fields must be optional in the type. `readConfig()` returns whatever's in the file — no migration needed.
- **CLI auto-invocation** — `main()` is called at module level (D022). The auto-update hook runs inside `main()`, not at module scope. Tests mock the hook function before importing `main`.
- **`@driftless-ai/cli` scope** — Registry URL must use the scoped package name: `https://registry.npmjs.org/@driftless-ai/cli/latest` (the `@` and `/` are URL-encoded automatically by `fetch`). Verified: this endpoint returns `{"name":"@driftless-ai/cli","version":"1.0.0",...}`.
- **Config may not exist** — When running `driftless init` for the first time, there's no `.driftless.json` yet. The auto-update hook must handle config-not-found gracefully (skip check, proceed to command).

## Common Pitfalls

- **Blocking the CLI on network failure** — `fetch` with no timeout will hang on DNS resolution or slow networks. Must use `AbortController` with a 5-second timeout. On timeout or any error, skip silently (log nothing to user, maybe debug log).
- **Updating during npx execution** — `npm install -g` from within npx doesn't update the npx cache. The CLI would update globally but the current npx invocation still runs the old version. Worse, the user might not have a global install at all. Solution: detect npx context → show "A new version is available" notification instead of auto-updating.
- **`execSync` error handling** — If the global install command fails (permissions, network, etc.), `execSync` throws. Must wrap in try/catch, skip silently on failure. The user's actual command should always run.
- **Major version jump semantics** — Scope says "warn but still update." The warning should go to stderr (not stdout) so it doesn't corrupt piped output. Format: `⚠ Updating from v1.x to v2.x — this is a major version change.`
- **Race condition on config write** — If auto-update persists `packageManager` to config and the user is running `init` (which also writes config), there's a race. Solution: only write `packageManager` to config if the file already exists and auto-update is enabled. During `init`, the prompt sets `packageManager` directly in the config being built — no need to update afterwards.
- **Scoped package name in registry URL** — Must encode correctly. `fetch('https://registry.npmjs.org/@driftless-ai/cli/latest')` works — Node's `fetch` handles the `@` and `/` in the URL path without explicit encoding. Verified locally.
- **`npm_config_user_agent` format varies** — npm: `npm/10.x.x node/22.x.x ...`, pnpm: `pnpm/10.x.x npm/? node/22.x.x ...`, yarn: `yarn/4.x.x npm/? node/22.x.x ...`, bun: `bun/1.x.x node/22.x.x ...`. Parse by splitting on `/` and taking the first token. If unrecognized, fall back to `npm`.

## Open Risks

- **npx detection reliability** — No single env var definitively identifies npx. Best heuristic: check if `npm_execpath` contains `npx-cli` or if `_` env var contains `npx`. May produce false negatives (user gets auto-update attempt in npx context, which still fails gracefully) but not false positives.
- **Permission errors on global install** — Some users install Node via nvm/volta/fnm, which allows global installs. Others use system Node, which requires `sudo`. The auto-update `execSync` may fail with EACCES. This is caught and skipped silently, but the user doesn't get updated. Could log a hint to stderr: "Auto-update failed — run `npm install -g @driftless-ai/cli@latest` manually."
- **CI environments** — If a user's CI runs `driftless init`, the auto-update check adds latency. Should auto-update be skipped in CI? `process.env.CI` is set by most CI providers. Scope doesn't mention CI detection, but it's a natural guard. Recommend: skip auto-update when `CI=true`.
- **bun global install syntax** — bun uses `bun install -g <pkg>` (not `bun add -g`). Need to verify the exact command. This is testable.

## Module Design

### New files

| File | Location | Purpose |
|------|----------|---------|
| `auto-update.ts` | `packages/core/src/` | `checkForUpdate()` — fetches registry, compares versions, returns `{current, latest, isNewer, isMajor}`. `performUpdate()` — orchestrates detection + install + notification. |
| `package-manager.ts` | `packages/core/src/` | `detectPackageManager()` — parses `npm_config_user_agent`, falls back to config. `getGlobalInstallCommand(pm, pkg)` — returns the right install string. `isNpxContext()` — heuristic detection. |
| `auto-update.test.ts` | `packages/core/test/` | Unit tests for version check, PM detection, npx detection, install command generation, error paths. |
| `package-manager.test.ts` | `packages/core/test/` | Unit tests for PM detection from user agent strings, fallback behavior, install commands. |

### Modified files

| File | Change |
|------|--------|
| `packages/core/src/types.ts` | Add `autoUpdate?: boolean`, `packageManager?: PackageManager` to `DriftlessConfig`. Add `PackageManager` type. |
| `packages/core/src/index.ts` | Export new modules. |
| `packages/cli/src/index.ts` | Add auto-update hook in `main()` before command routing. |
| `packages/cli/src/prompts/init-prompts.ts` | Add `p.confirm()` for auto-update preference after `p.group()`. |
| `packages/cli/src/commands/init.ts` | Thread `autoUpdate` and `packageManager` into config write. |

### Type additions

```typescript
type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

// DriftlessConfig additions (both optional)
autoUpdate?: boolean;
packageManager?: PackageManager;
```

### Test coverage targets

- Version check: newer available, same version, older available, pre-release versions, malformed response, network timeout, 404, non-JSON response
- PM detection: npm user agent, pnpm user agent, yarn user agent, bun user agent, missing user agent (falls back to config), missing config (falls back to npm)
- npx detection: npx env vars present, global install context, unknown context
- Install command: correct command per PM, failure handling, major version warning output
- Init prompt: auto-update confirm prompt appears, default value, persisted in config
- CLI hook: skips when no config, skips when autoUpdate false, skips in CI, skips on network error, runs update when newer, shows notification in npx context

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| CLI auto-update | `teylersf/openclaw-auto-updater@auto-updater` (149 installs) | available — but OpenClaw-specific, not generalizable |
| npm publishing | `b-open-io/prompts@npm-publish` (64 installs) | available — not needed for this slice |
| Node.js | `cin12211/orca-q@nodejs-expert` (51 installs) | available — too general to be useful |

No directly relevant skills for this work. The auto-update logic is straightforward enough to implement without specialized guidance.

## Sources

- npm registry API returns package metadata at `https://registry.npmjs.org/@driftless-ai/cli/latest` — verified locally, returns JSON with `version` field, ~500 bytes (source: `curl` test against live registry)
- `npm_config_user_agent` format: `<pm>/<version> node/<version> <os> <arch>` — set by npm, pnpm, yarn, and bun at install time (source: [npm docs](https://docs.npmjs.com/cli/v10/using-npm/scripts#environment), Google Search results)
- npx detection heuristic: check `npm_execpath` for `npx-cli.js` path component (source: [npm/npx GitHub issues](https://github.com/npm/npx/issues), Google Search)
- Node 22 has stable `fetch` (no flag needed) and `AbortController` — no polyfill required (source: Node.js 22 docs)
- Simple semver comparison for exact versions works without the `semver` package — verified locally with test cases (source: local test)
