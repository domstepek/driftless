# S02: CI/CD Pipeline + Automated Releases — Research

**Date:** 2026-03-14

## Summary

S02 needs two GitHub Actions workflows: a PR quality gate (`ci.yml`) and a tag-triggered release pipeline (`release.yml`). No `.github/` directory exists yet — everything is net-new. The build toolchain (`vp`) is a devDependency available via `pnpm exec` after install, so CI just needs pnpm + Node 22 setup, then `pnpm install`, and all existing scripts (`pnpm run test`, `pnpm run check`, `pnpm run build`) work unmodified. The 222-test baseline runs via `vp test` (vitest) from the root.

The main decision is authentication for npm publish. npm Trusted Publishing (OIDC) is now the standard, but `pnpm publish` support for OIDC is unreliable — multiple reports of users falling back to `npm publish` for OIDC to work. Since S01 proved `pnpm -r publish --access public --no-git-checks` handles workspace resolution and topological ordering correctly, the pragmatic approach is: use a granular npm automation token stored as a GitHub Actions secret (`NPM_TOKEN`), which bypasses 2FA and works reliably with pnpm. This is the proven path. Document OIDC Trusted Publishing as a future upgrade path once pnpm support stabilizes.

For GitHub Releases, `softprops/action-gh-release@v2` is the standard action. It can accept a `body_path` or inline `body` — we'll extract the relevant CHANGELOG section in a prior step using a shell script that parses between `## [version]` headers. The CHANGELOG already follows Keep A Changelog format (`## [1.0.0] — 2026-03-14`), which is trivially parseable.

## Recommendation

**Two static workflow files:**

1. `.github/workflows/ci.yml` — Triggers on `pull_request` and `push` to `main`. Runs `pnpm install`, `pnpm run check` (lint+format), `pnpm run test`, `pnpm run build`. Matrix: just ubuntu-latest + Node 22 (single target, matching `.nvmrc` and `engines` field). Fails the PR if any step fails.

2. `.github/workflows/release.yml` — Triggers on `push` tags matching `v*`. Runs full CI checks first (test, lint, build), then publishes both packages via `pnpm -r publish --access public --no-git-checks --provenance`, then creates a GitHub Release with the CHANGELOG section as body.

**Why not OIDC Trusted Publishing:** `pnpm publish` + OIDC is not reliably supported as of March 2026 — users report needing to fall back to `npm publish`. Switching to `npm publish` would lose workspace protocol resolution (`workspace:*` → real versions), requiring manual version coordination. A granular automation token is simple, proven, and works with `pnpm -r publish`.

**Why not separate CI + release jobs:** The release workflow should run its own build+test before publish (not rely on a separate CI run). This makes the release pipeline self-contained — a tag push always verifies before publishing, even if CI hadn't run on the exact commit.

**CHANGELOG extraction:** Shell script in the workflow, not a third-party action. The format is stable and simple. `awk` or `sed` between `## [version]` headers extracts the right section.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| pnpm setup in CI | `pnpm/action-setup@v4` with `cache: true` | Handles pnpm install, store caching, version pinning. Battle-tested. |
| Node.js setup in CI | `actions/setup-node@v4` | Standard Node setup with registry-url config for npm auth. |
| GitHub Release creation | `softprops/action-gh-release@v2` | Standard action for creating releases from tags. Handles body, assets, prerelease detection. |
| npm auth in CI | `NODE_AUTH_TOKEN` env var + `actions/setup-node` registry-url | `setup-node` writes `.npmrc` with auth token placeholder. `NODE_AUTH_TOKEN` fills it at publish time. |
| CHANGELOG parsing | `awk`/`sed` in a workflow step | Keep A Changelog format is simple enough for a 3-line awk script. No dependency needed. |

## Existing Code and Patterns

- `package.json` (root) — Scripts are the CI entry points: `"test": "vp test"`, `"check": "vp check"`, `"build": "vp run -r build"`. CI runs these directly via `pnpm run`.
- `pnpm-workspace.yaml` — Catalog mode pins vite-plus@0.1.11 with overrides for vite/vitest aliasing. `pnpm install --frozen-lockfile` in CI reproduces the exact lockfile.
- `packages/core/src/workflows.ts` — Existing workflow templates for user repos follow a function-builds-YAML-string pattern. S02's workflows are different — they're static files for the driftless repo itself, not generated templates. No code reuse needed, but the YAML style should be consistent (readable, well-commented).
- `.nvmrc` — Contains `22`. CI must use Node 22 to match.
- `packages/cli/package.json` / `packages/core/package.json` — Both at v1.0.0, `publishConfig.access: public` on CLI, `repository.url` and `directory` fields set (required for provenance).
- `CHANGELOG.md` — Follows Keep A Changelog format: `## [version] — date` headers with link definitions at bottom. Release workflow extracts the section matching the tag version.
- S01 proved `pnpm -r publish --access public --no-git-checks` handles workspace resolution and topological ordering. The release workflow uses this exact command plus `--provenance`.

## Constraints

- **Node ≥22.12.0** — `.nvmrc` says `22`, `engines` says `>=22.12.0`. CI uses `node-version-file: '.nvmrc'` for consistency.
- **pnpm 10.32.1** — Pinned in root `package.json` `packageManager` field. `pnpm/action-setup@v4` auto-reads this, or we pin explicitly.
- **vite-plus not globally available** — `vp` is only accessible via `pnpm exec vp` or through npm scripts. CI must `pnpm install` before any build/test/lint step.
- **Two packages, publish order matters** — `@driftless-ai/core` must be on npm before `@driftless-ai/cli` is consumable. `pnpm -r publish` handles topological ordering automatically.
- **`workspace:*` resolution requires pnpm** — Cannot use `npm publish` directly; it doesn't resolve workspace protocol. Must use `pnpm publish` (or `pnpm -r publish` for recursive).
- **npm provenance requires `id-token: write`** — The `--provenance` flag needs OIDC token generation permission in GitHub Actions, plus `repository.url` in package.json (already set).
- **Existing commit history is not strictly conventional** — Close but mixed. Future enforcement via commitlint is a nice-to-have for S02 but not required by R018.
- **No existing `.github/` directory** — Everything is net-new. The directory must be created by the workflow files themselves (git handles this).

## Common Pitfalls

- **`pnpm install` without `--frozen-lockfile` in CI** — Without this flag, pnpm may update the lockfile, causing non-reproducible builds. Always use `--frozen-lockfile` in CI.
- **Missing `registry-url` in `setup-node`** — If `actions/setup-node` isn't configured with `registry-url: 'https://registry.npmjs.org'`, the `.npmrc` auth configuration won't be written and `NODE_AUTH_TOKEN` won't work. This is the most common cause of "403 Forbidden" on publish.
- **`--provenance` on non-GitHub-hosted runners** — Provenance only works on GitHub-hosted runners with `id-token: write`. Self-hosted runners fail. Not a risk here (using ubuntu-latest) but worth noting.
- **Tag not matching package.json version** — If someone pushes a `v1.0.2` tag but package.json says `1.0.1`, the CHANGELOG extraction and publish may produce confusing results. The release workflow should validate tag↔version consistency.
- **CHANGELOG section extraction edge cases** — If the version header doesn't exist in CHANGELOG.md, the release body will be empty. The extraction script should handle this gracefully (fall back to "See CHANGELOG.md").
- **pnpm store cache key** — `pnpm/action-setup` uses the lockfile hash for cache key by default. If the lockfile changes frequently, cache misses increase. Not a real risk here — the lockfile is stable.
- **Detached HEAD in tag-triggered workflows** — Tag pushes check out the tagged commit in detached HEAD state. `pnpm publish` with `--no-git-checks` handles this (already proven in S01).
- **Version bump workflow** — S02 does NOT include automated version bumping. The release flow is: manually bump version in package.json(s), update CHANGELOG, commit, tag, push tag. Automation of the bump step is a future enhancement.

## Open Risks

- **npm automation token setup** — The user must create a granular npm automation token for the `@driftless-ai` org and add it as `NPM_TOKEN` in GitHub repo secrets. This is a manual setup step that must happen before the first CI release can work. The plan should include clear instructions.
- **Provenance with pnpm** — `pnpm publish --provenance` is documented but less battle-tested than `npm publish --provenance`. If it fails, falling back to `pnpm publish` without `--provenance` is acceptable for v1.
- **npm Trusted Publishing maturation** — OIDC-based publishing may become the only option if npm deprecates long-lived tokens (announced but not yet enforced for automation tokens). Document the migration path.
- **CHANGELOG format stability** — If future contributors change the CHANGELOG format, the extraction script breaks silently. Document the expected format in CONTRIBUTING.md (S03).
- **`vp check` includes format check** — If CI runs `pnpm run check` (which is `vp check`), it checks both lint and format. Contributors must format before pushing. This is desirable but may surprise contributors unfamiliar with the toolchain.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| GitHub Actions CI/CD | `wshobson/agents@github-actions-templates` (5.1K installs) | available — broad GH Actions patterns |
| GitHub Actions CI/CD | `callstackincubator/agent-skills@github-actions` (125 installs) | available — GH Actions patterns |
| npm publishing | `b-open-io/prompts@npm-publish` (64 installs) | available — npm publish flows |
| pnpm CI setup | `pnpm/action-setup@v4` (GitHub Action, not an agent skill) | use directly in workflow |

The `wshobson/agents@github-actions-templates` skill has high install count and covers CI/CD patterns broadly. Worth considering if the team wants a reusable reference, but the workflows here are simple enough that skills aren't required.

## Sources

- pnpm `action-setup@v4` with `cache: true` handles store caching and version detection (source: [pnpm/action-setup README](https://github.com/pnpm/action-setup))
- `pnpm -r publish` handles topological ordering in workspaces and resolves `workspace:*` to exact versions (source: [pnpm workspaces docs](https://pnpm.io/workspaces#publishing-workspace-packages))
- `pnpm publish --provenance` flag links package to CI build — requires `id-token: write` permission (source: [pnpm publish docs](https://pnpm.io/cli/publish))
- npm Trusted Publishing (OIDC) is GA but `pnpm publish` integration is unreliable — users report falling back to `npm publish` (source: Google Search, multiple GitHub issues and discussions, March 2026)
- `softprops/action-gh-release@v2` creates GitHub Releases from tags with body/files support (source: [softprops/action-gh-release](https://github.com/softprops/action-gh-release))
- `actions/setup-node@v4` with `registry-url` writes `.npmrc` for `NODE_AUTH_TOKEN` authentication (source: [actions/setup-node](https://github.com/actions/setup-node))
- npm granular access tokens with `automation` type bypass 2FA requirements for CI publishing (source: [npm docs — creating access tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens))
- `catalog:` protocol is removed on `pnpm publish` like `workspace:` protocol (source: [pnpm catalogs docs](https://pnpm.io/catalogs))
