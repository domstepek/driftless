# M003: OSS Maturity + v1.0 Release — Research

**Date:** 2026-03-14

## Summary

M003 transforms a working monorepo into a publishable, professional OSS project. The codebase is well-structured for this — `vp pack` already produces clean ESM bundles with DTS, `@driftless/core` inlines its dependencies (zero runtime deps), and the CLI package has correct `bin`, `files`, and `exports` fields. The main structural decision is that **two packages must be published**: `@driftless/core` (scoped, zero deps) and the CLI package. The CLI bundle keeps `@driftless/core` and `@clack/prompts` as external imports, so both must be resolvable from npm at install time. pnpm's `workspace:*` protocol auto-resolves to real versions during `pnpm publish`, so this works cleanly.

The biggest early risk is **package naming**: `driftless` is already taken on npm (a 4-year-old setInterval replacement with few downloads). The scoped fallback `@driftless/cli` is available. This decision cascades into README, bin name, npx invocation, and all docs — it should be settled first. The second risk is the **auto-update feature** (from context scope), which is a novel piece of CLI infrastructure that interacts with npx caching, package manager detection, and version checking against the registry. This should be its own slice, ordered after the basic publish pipeline is proven.

The recommended approach is: tag-triggered CI/CD with `pnpm publish` (not `semantic-release`) for simplicity, conventional commits enforced going forward for CHANGELOG generation, and a staged slice order that proves npm publishing end-to-end before layering community files and auto-update.

## Recommendation

**Approach:** Simple tag-based publishing with GitHub Actions, not `semantic-release` or `changesets`.

**Why:** This is a solo-maintainer project with 2 packages. `semantic-release` adds plugin complexity for monorepo support and requires strict conventional commit history (which this repo doesn't have yet). `changesets` adds manual changeset-file ceremony. A simple flow — bump version in package.json, `git tag v1.0.0`, push tag, CI publishes — is the right level of automation for v1. CHANGELOG can be generated from conventional commits going forward using a lightweight tool (e.g., `conventional-changelog-cli` or just hand-written for v1.0.0).

**Package naming:** Recommend `@driftless/cli` (scoped) for the CLI package. `npx @driftless/cli init` works. The `@driftless` org scope gives a namespace for future packages. The unscoped `driftless` name is taken and the existing package hasn't been updated in years but isn't abandonable.

**Slice ordering:** Prove publishing first (S01), then CI/CD (S02), then community files + repo hygiene (S03), then auto-update (S04). S01 is highest risk because it touches npm credentials, package configuration, and the workspace→registry boundary. S03 is low risk (file creation). S04 (auto-update) is isolated new feature work that doesn't block v1.0.0 if it takes longer.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| CHANGELOG generation | `conventional-changelog-cli` or hand-write for v1 | Conventional commits standard is well-understood; tooling extracts them into markdown. Don't parse git log manually. |
| npm version check (auto-update) | `npm view <pkg> version` or `https://registry.npmjs.org/<pkg>/latest` | npm registry has a JSON API. Don't scrape or build custom version resolution. |
| GitHub Actions CI matrix | Standard `actions/setup-node@v4` + `pnpm/action-setup@v4` | Battle-tested. Don't hand-roll node/pnpm installation in CI. |
| Conventional commit enforcement | `commitlint` + `@commitlint/config-conventional` | Catches malformed commits in CI. Don't rely on contributor discipline alone. |
| Package manager detection (auto-update) | `process.env.npm_config_user_agent` | Set by npm/pnpm/yarn/bun at install time. Reliable signal without filesystem walks. |
| Code of Conduct | Contributor Covenant v2.1 | Industry standard. Don't write a custom one. |
| License | MIT (SPDX: `MIT`) | Already stated in project scope. Standard OSS license. |

## Existing Code and Patterns

- `packages/cli/package.json` — Already has `bin.driftless`, `files: ["dist"]`, `exports` fields. Ready for npm publish with version bump and possible name change.
- `packages/core/package.json` — Uses `inlinedDependencies` for minimatch/brace-expansion. Zero runtime deps in published bundle. `@driftless/core` scoped name already set.
- `packages/cli/vite.config.ts` + `packages/core/vite.config.ts` — Both use `vp pack` with `dts: true, exports: true`. Build pipeline is stable.
- `packages/cli/src/index.ts` — CLI entry point with `main()`. Auto-update check would hook in here, before command routing (line 24–58).
- `packages/core/src/config.ts` — Config read/write pattern. Auto-update config (`autoUpdate`, `packageManager`) extends `DriftlessConfig`.
- `packages/cli/src/prompts/init-prompts.ts` — Prompt flow via `@clack/prompts`. Auto-update prompt would be added here after capabilities selection.
- `pnpm-workspace.yaml` — Catalog mode with pinned Vite+ 0.1.11, overrides for vite/vitest aliasing. pnpm publish resolves `workspace:*` → real versions.
- `packages/core/src/workflows.ts` — Pattern for parameterized YAML template functions. CI workflow for driftless itself should follow the same style (function → YAML string) for consistency, though it could also just be a static `.github/workflows/*.yml` file since it's not user-facing.

## Constraints

- **Node ≥22.12.0** — `.nvmrc` says 22, `engines` field says `>=22.12.0`. CI must use Node 22. Current dev env has Node 20 (mismatch).
- **pnpm 10.32.1** — `packageManager` field in root `package.json`. CI must use matching pnpm version via `corepack` or `pnpm/action-setup`.
- **Vite+ 0.1.11** — Pinned in catalog. `vp pack` for library builds, `vp run -r build` for monorepo orchestration. Not globally available — CI must install it.
- **Two packages to publish** — CLI depends on `@driftless/core` as external import. Core must be published first (or simultaneously with pnpm's `--recursive` publish).
- **`workspace:*` resolution** — pnpm publish auto-resolves to exact version. Both packages must share the same version number or CLI pins core's version explicitly.
- **`driftless` npm name taken** — Existing package: `driftless@2.0.3` (setInterval replacement by dbkaplun). Must use scoped name or negotiate transfer.
- **No `.github/` directory exists** — All CI/CD, templates, and community files are net-new.
- **Commit history not conventional** — Existing commits use mixed prefixes (`feat()`, `chore()`, `docs()`, `test()`). Close to conventional but not strictly formatted. CHANGELOG for v1.0.0 should be hand-written summarizing M001+M002 work.
- **ESM-only** — Both packages output `.mjs`. No CJS compat currently. This is fine for Node 22+ CLIs.

## Common Pitfalls

- **Publishing order in monorepo** — Core must be on npm before CLI is installed by a consumer. In CI, publish core first, then CLI. Or use `pnpm publish -r` which handles topological order. **Avoid:** Don't publish CLI before core is available on the registry.
- **npm 2FA blocking CI publish** — npm requires 2FA for scoped packages by default. Use granular access tokens with `automation` type (bypasses 2FA for CI). **Avoid:** Don't use a login-based token; use `npm token create --type=granular` with publish scope.
- **`workspace:*` not resolving** — Only `pnpm publish` resolves workspace protocol. Plain `npm publish` from the package directory won't. **Avoid:** Always use `pnpm publish` or ensure CI uses pnpm.
- **Shebang line in published CLI** — `vp pack` already adds `#!/usr/bin/env node` to the CLI entry. But the file must have execute permission. Check `npm pack --dry-run` output — currently shows 4 files (correct). Verify the tarball has the shebang after build.
- **npx cache stale versions** — `npx @driftless/cli init` caches the package. After publishing an update, users may get the old version. The auto-update feature partially addresses this for global installs, but npx has its own cache at `~/.npm/_npx`. For v1 launch, document `npx @driftless/cli@latest init` as the canonical invocation.
- **Auto-update in npx context** — If the user runs via `npx`, the CLI is in a temporary/cached directory. `npm install -g` from within npx doesn't update the npx cache. Auto-update should detect npx context (check `process.env.npm_execpath` or absence of global install marker) and skip auto-update with a version-check notification instead.
- **Version in package.json still 0.0.0** — Both packages are at `0.0.0`. First publish needs version bump to `1.0.0` across both packages. The build reads version from `package.json` at bundle time (`createRequire(...)(\"../package.json\")`).
- **GitHub Sponsors waitlist** — Account must be enrolled before `FUNDING.yml` works. Start the enrollment process in S03, don't block on it.

## Open Risks

- **npm org creation** — The `@driftless` scope requires creating an npm organization. This is a UI step on npmjs.com that the agent can't do. Must be done by the user before CI can publish scoped packages.
- **Package name decision** — Choosing between `@driftless/cli` (scoped, available) vs pursuing name transfer for unscoped `driftless` (slow, uncertain). Recommend scoped. This decision affects all docs, README examples, and the `npx` invocation pattern.
- **Auto-update complexity** — The M003-CONTEXT scope document specifies a full auto-update system: package manager detection, `npx` vs global install awareness, network failure handling, major version warnings. This is a meaningful feature (~200-400 lines of new code + tests). Risk of scope creep if not clearly bounded as a separate slice.
- **Vite+ `vp pm publish` availability** — The `vp pm publish` command exists in Vite+ docs/RFCs but may not be stable in v0.1.11. Fallback is direct `pnpm publish` which is proven and reliable.
- **Branch protection via agent-browser** — Configuring GitHub branch protection rules requires browser automation against the GitHub UI. This has dependencies on authentication state and GitHub's UI stability. Lower risk but worth isolating in S03.

## Candidate Requirements

These surfaced during research and are worth discussing before planning. They're advisory, not auto-binding.

| Candidate | Description | Rationale | Recommendation |
|-----------|-------------|-----------|----------------|
| CR-01: npm org setup | Create `@driftless` npm organization before publishing | Required for scoped packages; agent can't do this | **Prerequisite** — user action item, document in S01 plan |
| CR-02: Conventional commits going forward | Enforce conventional commit format via commitlint in CI | Enables automated CHANGELOG for future releases; v1.0.0 CHANGELOG is hand-written | **Add to R017** — part of CHANGELOG infrastructure |
| CR-03: Version sync script | Keep `@driftless/core` and `driftless` CLI at the same version number | Simpler mental model for users and maintainers; `workspace:*` resolves to exact version | **Advisory** — use same version, enforce in CI publish script |
| CR-04: npm provenance | Publish with `--provenance` flag for supply chain security | npm provenance links published package to CI build. Free, standard practice for 2025+ | **Add to R016** — easy win, one flag in publish command |
| CR-05: `npx` cache-busting docs | Document `npx @driftless/cli@latest init` as canonical invocation | npx caches aggressively; users may run stale versions | **Add to README** — documentation item, not a requirement |

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| npm publishing | `b-open-io/prompts@npm-publish` (64 installs) | available — covers npm publish flows |
| npm publishing | `jwynia/agent-skills@npm-package` (54 installs) | available — npm package setup |
| semantic release | `terrylica/cc-skills@semantic-release` (85 installs) | available — but not using semantic-release (overkill for this project) |
| semantic versioning | `aj-geddes/useful-ai-prompts@semantic-versioning` (158 installs) | available — versioning conventions |
| GitHub Actions CI/CD | `hack23/homepage@github-actions-cicd` (38 installs) | available — GitHub Actions patterns |
| OSS repo setup | `~/.gsd/agent/skills/oss-repo-setup/` | in-progress (D016) — being built incrementally |

## Sources

- npm name `driftless` is taken: `driftless@2.0.3` by dbkaplun — setInterval replacement, MIT, published over a year ago (source: `npm view driftless`)
- `@driftless/cli` scope is available (source: `npm view @driftless/cli` returns 404)
- pnpm `workspace:*` auto-resolves to exact version during `pnpm publish` (source: [pnpm workspace protocol docs](https://pnpm.io/workspaces#publishing-workspace-packages))
- `semantic-release` vs `changesets` comparison: semantic-release has 2.4M weekly downloads but needs monorepo plugins; changesets is designed for monorepos but adds manual ceremony (source: [Google Search — semantic-release vs changesets 2024-2025])
- Vite+ `vp pack` produces ESM bundles with DTS, `vp pm publish` delegates to detected package manager (source: [Vite+ docs — pack.md, pm-command-group.md](https://github.com/voidzero-dev/vite-plus))
- npm auto-update patterns: `update-notifier` for notifications, `cli-autoupdater` for automated updates, registry JSON API at `https://registry.npmjs.org/<pkg>/latest` for version checking (source: [Google Search — CLI auto-update mechanisms 2024])
- npx cache lives at `~/.npm/_npx`, no native clear command (source: [Google Search — npx cache clearing])
