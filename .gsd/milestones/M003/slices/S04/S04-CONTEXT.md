---
id: S04
milestone: M003
status: ready
---

# S04: CLI Auto-Update — Context

## Goal

Users with `autoUpdate: true` in `.driftless.json` get automatic silent version checks on every CLI launch, with the CLI self-updating via the correct package manager before running the command.

## Why this Slice

Auto-update keeps users on the latest version without manual intervention. This is important for a CLI that generates content via AI — stale versions may produce worse output or miss new features. It also reduces support burden from "are you on the latest version?" questions.

## Scope

### In Scope

- **New config fields:** Add `autoUpdate` (boolean, default `true`) and `packageManager` (`"npm" | "pnpm" | "yarn" | "bun"`, detected during init) to `DriftlessConfig` in `packages/core/src/types.ts`.
- **Init prompt:** Add auto-update question as the last prompt in `driftless init` flow: "Would you like to enable auto-updates?" (default: yes). Detect and store the package manager during init so subsequent updates don't re-detect.
- **Version check on launch:** Before command routing in `packages/cli/src/index.ts`, if `autoUpdate: true`, fetch `https://registry.npmjs.org/<pkg>/latest` to get the latest version. Compare against bundled version from `package.json`.
- **Auto-install for global installs:** If a newer version exists and the CLI is globally installed, run the appropriate package manager command (e.g., `pnpm i -g @driftless/cli@latest`) silently. Show a brief message: `Updating driftless v1.0.0 → v1.1.0...` — no spinner, no prompt.
- **npx detection + version notice:** If the CLI is running via npx (not globally installed), skip auto-update entirely. Show a one-line notice: `A newer version is available. Run: npx @driftless/cli@latest init`.
- **Major version warning:** On major version jumps (e.g., v1.x → v2.0.0), show a warning: `⚠ Major version update: v1.x → v2.0.0 — see changelog for breaking changes` — then auto-update anyway. No confirmation prompt, no blocking.
- **Network failure handling:** If the registry check fails (timeout, DNS, no internet), skip silently. Don't block, don't warn, don't error. The CLI runs normally with the current version.
- **Package manager detection:** Use `process.env.npm_config_user_agent` as primary signal (set by npm/pnpm/yarn/bun at install time). Fallback: walk up from resolved binary path to identify the package manager's global directory. Store result in `.driftless.json` as `packageManager`.
- **Tests:** Unit tests for all paths — version comparison, package manager detection, npx detection, network failure, major version warning, happy path update. Mock the registry and child process for deterministic testing.

### Out of Scope

- Updating the npx cache (no reliable mechanism exists)
- Downgrade protection (if local version is newer than registry, skip silently)
- Update frequency throttling / "check once per day" caching (check every launch for v1; revisit if users report latency complaints)
- Opt-out via CLI flag (config toggle is sufficient for v1)
- Self-restart after update (user re-runs the command; the update is for next invocation)

## Constraints

- The version check adds latency to every CLI launch when `autoUpdate: true`. Target: <2s total for check + install on a warm network. Registry fetch alone should be <500ms.
- Must not break the existing `--version` and `--help` fast paths (D026: dynamic import for init). Version check should only run when actually executing a command, not for `--version` or `--help`.
- `DriftlessConfig` changes must be backward-compatible — existing `.driftless.json` files without `autoUpdate`/`packageManager` fields should default to `autoUpdate: true` and detect the package manager on first run.

## Integration Points

### Consumes from S01

- Published package on npm registry (version check target)
- Package name for registry API URL (e.g., `https://registry.npmjs.org/@driftless/cli/latest`)
- `DriftlessConfig` type and config read/write pattern in `packages/core/src/config.ts`

### Produces

- `autoUpdate` and `packageManager` fields in `DriftlessConfig`
- Auto-update prompt in `driftless init` flow (in `packages/cli/src/prompts/init-prompts.ts`)
- Version check + auto-install logic in CLI entry point (`packages/cli/src/index.ts`)
- Package manager detection utility (new module, likely `packages/cli/src/update.ts` or similar)
- Comprehensive tests for all auto-update paths

## Open Questions

- **Update applies to next invocation, not current:** The auto-install updates the globally installed package, but the currently running process is already loaded from the old version. The updated code runs on the user's _next_ invocation. This is standard CLI behavior (same as `npm` itself) but worth noting in case we want a restart-and-re-exec pattern later.
