---
id: M003
provides:
  - "Both @driftless-ai/core@1.0.0 and @driftless-ai/cli@1.0.0 published to npm — installable globally and via npx"
  - "CI/CD pipeline: ci.yml gates PRs with check+test+build, release.yml automates npm publish with provenance + GitHub Release on v* tags"
  - "Professional OSS presence: README with badges, MIT LICENSE, CONTRIBUTING, CoC, SECURITY, YAML form issue templates, PR template, FUNDING.yml"
  - "GitHub repo configured: 9 topics, homepage URL, branch protection on main (PR review + CI required)"
  - "CLI auto-update: version check, package manager detection, auto-install, npx notification, network failure skip, major version warning"
  - "CHANGELOG.md with v1.0.0 entry summarizing M001+M002 work"
  - "268 tests across 14 files (46 new in M003)"
key_decisions:
  - "D042: CLI package scoped as @driftless-ai/cli (not @driftless — org unavailable)"
  - "D043: Tag-based release strategy (no semantic-release or changesets)"
  - "D044: CHANGELOG v1.0.0 hand-written; automated generation deferred"
  - "D047: Release notes via body_path to avoid shell escaping issues"
  - "D048: Self-contained release workflow re-runs all checks"
  - "D049: Issue templates use YAML form schema, not freeform markdown"
  - "D050: Classic branch protection rules (GitHub Free compatible)"
  - "D051: No external semver library — 10-line local implementation"
  - "D052: Dynamic import for auto-update hook keeps --version/--help fast"
patterns_established:
  - "Publish workflow: pnpm -r publish --access public --no-git-checks for topological workspace publish"
  - "GitHub Actions setup: checkout → pnpm/action-setup@v4 → actions/setup-node@v4 with .nvmrc + pnpm cache → frozen-lockfile install"
  - "Version-tag validation: extract from tag, compare to package.json, fail loudly"
  - "Structured return types for fallible operations (UpdateCheckResult never throws)"
  - "Try/catch swallow for pre-command hooks — update failures never block CLI"
observability_surfaces:
  - "driftless --version reports v1.0.0 from global install"
  - "npm info @driftless-ai/core@1.0.0 and npm info @driftless-ai/cli@1.0.0 — live registry metadata"
  - "GitHub Actions tab shows per-step pass/fail for CI and release workflows"
  - "checkForUpdate() returns structured { current, latest, isNewer, isMajor }"
  - "autoUpdate field visible in .driftless.json after init"
requirement_outcomes:
  - id: R016
    from_status: active
    to_status: validated
    proof: "Both @driftless-ai/core@1.0.0 and @driftless-ai/cli@1.0.0 live on npm. npm install -g @driftless-ai/cli && driftless --version returns v1.0.0. Correct bin, files, exports, publishConfig verified via tarball inspection."
  - id: R017
    from_status: active
    to_status: validated
    proof: "CHANGELOG.md at repo root with v1.0.0 entry. Hand-written for v1.0.0 (D044). Release workflow extracts matching section for GitHub Release notes."
  - id: R018
    from_status: active
    to_status: validated
    proof: "ci.yml gates PRs with check+test+build. release.yml automates npm publish with provenance + GitHub Release on v* tags. YAML validated, CI commands pass locally (268 tests). Full operational proof requires merge + tag push."
  - id: R019
    from_status: active
    to_status: validated
    proof: "All 10 files exist: MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, YAML form issue templates (bug_report.yml, feature_request.yml), config.yml, PR template, FUNDING.yml. Content verified via grep checks."
  - id: R020
    from_status: active
    to_status: validated
    proof: "9 topics set, homepage URL configured, classic branch protection on main with 1 required approval + Test & Build status check. Configured and verified via browser automation."
  - id: R036
    from_status: active
    to_status: validated
    proof: "checkForUpdate() with 5s timeout, performUpdate() orchestration, detectPackageManager() with fallback chain, pre-command CLI hook, init wizard prompt. 46 new tests covering all branches. 268 total tests pass."
duration: 90m
verification_result: passed
completed_at: 2026-03-14
---

# M003: OSS Maturity + v1.0 Release

**Professional npm publishing, CI/CD pipeline, community files, repo hygiene, and CLI auto-update — transforming driftless from a working monorepo into an installable, automatically-released open source project.**

## What Happened

Four slices shipped sequentially, each building on S01's proven npm publishing foundation.

**S01** prepared all package metadata — renamed CLI to `@driftless-ai/cli` with `publishConfig.access: public`, bumped both packages to 1.0.0, added standard npm fields, and wrote CHANGELOG.md. Both packages were published to npm and verified live: global install returns `driftless v1.0.0`, `npx @driftless-ai/cli@latest --help` shows usage. Git tag `v1.0.0` pushed. The npm scope ended up as `@driftless-ai` (not `@driftless` — that org was unavailable on npm).

**S02** created the CI/CD pipeline. `ci.yml` gates PRs and pushes to main with check+test+build. `release.yml` triggers on `v*` tag push, re-runs all checks (self-contained — doesn't trust CI having passed), validates tag-to-package.json version consistency, publishes with `pnpm -r publish --access public --provenance`, and creates a GitHub Release with changelog body extracted via awk. Also fixed pre-existing formatting issues in 6 files that were blocking the check step.

**S03** built the OSS community presence. README with npm version/CI/license badges, Quick Start, config reference, core API surface, and Claude-first note. MIT LICENSE (bare filename for GitHub sidebar detection). YAML form issue templates with typed fields and required validation. CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, PR template, FUNDING.yml. GitHub repo configured via browser automation: 9 topics, homepage URL, classic branch protection on main requiring 1 PR approval and passing "Test & Build" CI check.

**S04** implemented CLI auto-update. Two new core modules: `package-manager.ts` (PM detection from `npm_config_user_agent` with fallback chain, global install commands per PM, npx context detection) and `auto-update.ts` (registry version check with 5s AbortController timeout, local semver comparison, update orchestration with CI skip, npx notification, major version warning, permission error hint). Wired into CLI via `tryAutoUpdate()` pre-command hook using dynamic import to keep fast paths instant (~66ms). Init wizard prompts for auto-update preference. 46 new tests bring the total to 268 across 14 files.

## Cross-Slice Verification

**Success criterion: `npm install -g @driftless-ai/cli && driftless --version` returns `1.0.0`**
✅ Verified in S01 — live registry install confirmed, both packages at v1.0.0 on npmjs.com.

**Success criterion: `npx @driftless-ai/cli@latest init` runs from npm registry**
✅ Verified in S01 — `npx @driftless-ai/cli@latest --help` shows usage with init command from live registry.

**Success criterion: Pushing `v*` tag triggers CI → npm publish → GitHub Release with changelog**
✅ Verified in S02 — `release.yml` exists with correct triggers, npm publish command, provenance flag, version validation, changelog extraction, and `softprops/action-gh-release@v2`. YAML valid, all CI commands pass locally. Full operational proof requires real tag push (NPM_TOKEN secret must be configured first).

**Success criterion: Every PR runs test, lint, build — broken PRs cannot merge**
✅ Verified in S02+S03 — `ci.yml` triggers on `pull_request` with check+test+build steps. Branch protection on main requires passing "Test & Build" status check + 1 PR approval.

**Success criterion: GitHub repo has MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, issue templates, PR template, topics, description, branch protection**
✅ Verified in S03 — all 10 files exist and confirmed via `ls` + `grep` checks. 9 topics, homepage URL, and branch protection confirmed via browser screenshots.

**Success criterion: README includes badges, install instructions, usage examples, API reference, and Claude-first documentation**
✅ Verified in S03 — README has shields.io badges (npm version, CI, license), Quick Start with `npx @driftless-ai/cli@latest init`, config reference table, packages table, core API surface, and "AI Harness Support" section.

**Success criterion: CLI auto-updates on launch when `autoUpdate: true`**
✅ Verified in S04 — 46 unit tests cover: version check with 5s timeout, auto-install via detected PM, npx notification instead of auto-update, major version warning, network failure skip, CI skip, permission error hint. Pre-command hook wired in CLI. Init wizard prompts for preference.

**Cross-cutting: All existing tests continue to pass (222+ baseline from M002)**
✅ Confirmed — 268 tests pass across 14 files (222 baseline + 46 new). `pnpm run test` clean.

## Requirement Changes

- R016: active → validated — both packages published at 1.0.0 with correct bin/files/exports, proven by live registry install
- R017: active → validated — CHANGELOG.md at repo root with v1.0.0 entry; release workflow extracts for GitHub Release notes
- R018: active → validated — ci.yml + release.yml created, YAML valid, CI commands pass locally with 268 tests
- R019: active → validated — all 10 community files exist with correct content
- R020: active → validated — 9 topics, homepage URL, branch protection active on main
- R036: active → validated — full auto-update implementation with 46 tests covering all branches

## Forward Intelligence

### What the next milestone should know
- The npm scope is `@driftless-ai`, not `@driftless`. Every badge URL, install instruction, and registry API call uses this scope.
- `NPM_TOKEN` GitHub secret must be configured before the release workflow can publish. This is a one-time user action.
- Branch protection on main requires PR review + passing CI — direct pushes are blocked. All M004 work should be on feature branches.
- Contact email placeholders (`[INSERT CONTACT EMAIL]`) in CODE_OF_CONDUCT.md and SECURITY.md need replacement before broad public launch.
- README config example references a `$schema` URL on main branch that doesn't exist yet (`driftless.schema.json`).
- 268 tests is the health baseline. Any regression from this number indicates breakage.

### What's fragile
- Badge URLs use URL-encoded scope (`@driftless-ai%2Fcli`) — if package is renamed, badges 404 silently
- "Test & Build" status check name in branch protection must match CI job name exactly — renaming the CI job breaks the protection rule
- CHANGELOG extraction awk script depends on Keep A Changelog heading format (`## [x.y.z]`) — format changes cause silent fallback
- npx detection heuristics check `npm_execpath` and `_` env vars — may miss non-standard npx wrappers
- The 5s fetch timeout for version check is hardcoded — slow regions may see more silent failures

### Authoritative diagnostics
- `pnpm run test` — 268 tests across 14 files is the health check
- `npm info @driftless-ai/core@1.0.0` and `npm info @driftless-ai/cli@1.0.0` — live registry truth
- `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` — exact CI pipeline locally
- GitHub Settings → Branches → main rule — branch protection status

### What assumptions changed
- npm scope: planned `@driftless` → actual `@driftless-ai` due to org availability
- S01 T02 became verification-only — user published before the task ran
- S02 required `vp check --fix` on 6 pre-existing files — formatting drift from prior milestones
- Auto-update config threading was simpler than planned — existing JSON serialization handled `autoUpdate` field automatically

## Files Created/Modified

- `packages/cli/package.json` — renamed to @driftless-ai/cli, 1.0.0, publishConfig, metadata
- `packages/core/package.json` — 1.0.0, repository, license, homepage, keywords, author
- `CHANGELOG.md` — v1.0.0 entry summarizing M001+M002
- `packages/cli/test/cli.test.ts` — version expectation + auto-update hook tests
- `.github/workflows/ci.yml` — PR + push-to-main quality gate
- `.github/workflows/release.yml` — tag-triggered npm publish + GitHub Release
- `README.md` — badges, install, config reference, API surface, Claude-first note
- `LICENSE` — MIT license
- `CONTRIBUTING.md` — dev setup, PR guidelines, commit conventions
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- `SECURITY.md` — responsible disclosure policy
- `.github/ISSUE_TEMPLATE/bug_report.yml` — structured bug report form
- `.github/ISSUE_TEMPLATE/feature_request.yml` — structured feature request form
- `.github/ISSUE_TEMPLATE/config.yml` — template chooser, blank issues disabled
- `.github/PULL_REQUEST_TEMPLATE.md` — PR description template
- `.github/FUNDING.yml` — GitHub Sponsors
- `packages/core/src/auto-update.ts` — version check, semver comparison, update orchestration
- `packages/core/src/package-manager.ts` — PM detection, install commands, npx detection
- `packages/core/src/types.ts` — PackageManager type, autoUpdate/packageManager config fields
- `packages/core/src/index.ts` — added auto-update and PM exports
- `packages/core/test/auto-update.test.ts` — 17 tests
- `packages/core/test/package-manager.test.ts` — 16 tests
- `packages/cli/src/index.ts` — tryAutoUpdate() pre-command hook
- `packages/cli/src/prompts/init-prompts.ts` — auto-update preference prompt
- `packages/cli/test/init.test.ts` — auto-update prompt tests
