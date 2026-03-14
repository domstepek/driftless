# M003: OSS Maturity + v1.0 Release

**Vision:** Transform driftless from a working monorepo into a professional, installable, automatically-released open source project that strangers can trust, install from npm, and contribute to.

## Success Criteria

- `npm install -g @driftless-ai/cli && driftless --version` returns `1.0.0` (or later) from a fresh machine
- `npx @driftless-ai/cli@latest init` runs the full interactive wizard from the npm registry
- Pushing a `v*` tag to `main` triggers CI that publishes both packages to npm and creates a GitHub Release with changelog
- Every PR runs test, lint, and build checks — broken PRs cannot merge
- The GitHub repo has: MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, issue templates, PR template, topics, description, and branch protection
- README includes badges, install instructions, usage examples, API reference, and Claude-first documentation
- CLI auto-updates on launch when `autoUpdate: true` in `.driftless.json`, detecting the correct package manager and handling network failures gracefully

## Key Risks / Unknowns

- **npm scoped package publishing** — ✅ RETIRED in S01. Published under `@driftless-ai` org (not `@driftless` — unavailable). Both packages live on npm at v1.0.0.
- **npm credentials in CI** — granular access tokens with automation type must bypass 2FA. Misconfigured tokens block the entire release pipeline.
- **CLI auto-update edge cases** — npx vs global install detection, package manager detection across npm/pnpm/yarn/bun, network failure handling, major version jump behavior. Novel code with many branches.

## Proof Strategy

- npm publishing → ✅ RETIRED in S01. Both packages publish and install correctly from the live npm registry under `@driftless-ai` scope.
- CI credentials + release pipeline → retire in S02 by proving a real tagged push triggers publish + GitHub Release end-to-end
- Auto-update edge cases → retire in S04 by proving version check, auto-install, npx detection, and network failure paths via unit tests + live registry verification

## Verification Classes

- Contract verification: vitest unit tests for auto-update logic, package.json field validation, CHANGELOG format
- Integration verification: `pnpm publish` → `npm install` from live registry, GitHub Actions workflow execution on real PRs/tags
- Operational verification: tag → CI → npm publish → GitHub Release → install from registry (full release cycle)
- UAT / human verification: README readability, community file quality, GitHub repo appearance

## Milestone Definition of Done

This milestone is complete only when all are true:

- Both `@driftless-ai/core` and `@driftless-ai/cli` are published to npm at version 1.0.0+
- `npx @driftless-ai/cli@latest init` works when installed from the npm registry (not just local)
- A tagged release triggers automated npm publish and GitHub Release creation with changelog
- PR CI runs test, lint, build and blocks merge on failure
- GitHub repo has MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, issue/PR templates, topics, description, branch protection
- README has badges, install instructions, usage, API reference, and Claude-first note
- CHANGELOG.md reflects all changes since initial release
- CLI auto-update feature works: checks registry, installs via correct package manager, handles npx/network failures gracefully
- All existing tests continue to pass (222+ baseline from M002)
- Success criteria above are re-verified against live registry and GitHub repo state

## Requirement Coverage

- Covers: R016, R017, R018, R019, R020, R025, R036 (new: CLI auto-update)
- Partially covers: none
- Leaves for later: none
- Orphan risks: none
- Note: R036 is the formal ID for CLI auto-update. M003-CONTEXT referenced this as "R032 (new)" but R032 is already assigned in REQUIREMENTS.md (out-of-scope: non-e2e-test doc sources). R036 is the next available ID.

## Slices

- [x] **S01: npm Package Publishing + v1.0.0 Release** `risk:high` `depends:[]`
  > After this: `npm install -g @driftless-ai/cli && driftless --version` returns 1.0.0, installed from the live npm registry. CHANGELOG.md summarizes all M001+M002 work. Both `@driftless-ai/core` and `@driftless-ai/cli` are live on npmjs.com.
- [ ] **S02: CI/CD Pipeline + Automated Releases** `risk:medium` `depends:[S01]`
  > After this: pushing a `v1.0.1` tag to main triggers GitHub Actions that runs tests, publishes both packages to npm with provenance, and creates a GitHub Release with changelog body. PRs run test+lint+build and block merge on failure.
- [ ] **S03: README + Community Files + Repo Hygiene** `risk:low` `depends:[S01]`
  > After this: the GitHub repo looks like a professional OSS project — README with badges and install instructions, MIT license, contributing guide, code of conduct, security policy, issue/PR templates, FUNDING.yml, repo topics/description, and branch protection rules.
- [ ] **S04: CLI Auto-Update** `risk:medium` `depends:[S01]`
  > After this: a user with `autoUpdate: true` in `.driftless.json` runs `driftless init` and the CLI silently checks npm for a newer version, detects the package manager that installed it, and auto-updates before running. Network failures skip silently. npx users get a version notification instead of auto-update. Major version jumps warn but still update.

## Boundary Map

### S01 → S02

Produces:
- Both packages published on npm with correct `name`, `version`, `bin`, `files`, `exports` fields
- Proven `pnpm publish` mechanics: workspace:* resolution, core-before-CLI ordering
- `package.json` version at 1.0.0 across both packages
- CHANGELOG.md with v1.0.0 entry

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- Published package name (`@driftless-ai/cli`) and npm URL for README install instructions and badges
- Version number (1.0.0) for badge display
- Verified `npx @driftless-ai/cli@latest init` invocation pattern for README examples

Consumes:
- nothing (first slice)

### S01 → S04

Produces:
- Published package on npm registry (version check target)
- Package name for registry API URL: `https://registry.npmjs.org/@driftless-ai/cli/latest`
- `DriftlessConfig` type and config read/write pattern in `packages/core/src/config.ts`

Consumes:
- nothing (first slice)

### S02 (standalone)

Produces:
- `.github/workflows/ci.yml` — PR quality gate (test, lint, build)
- `.github/workflows/release.yml` — tag-triggered npm publish + GitHub Release
- Proven release pipeline: tag → CI → publish → release

Consumes:
- S01: proven pnpm publish mechanics, package.json metadata, CHANGELOG.md

### S03 (standalone)

Produces:
- README.md, LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`, `.github/FUNDING.yml`
- GitHub repo: topics, description, branch protection (configured via agent-browser)

Consumes:
- S01: published package name, npm URL, version number, npx invocation pattern

### S04 (standalone)

Produces:
- `autoUpdate` and `packageManager` fields in `DriftlessConfig`
- Auto-update prompt in `driftless init` flow
- Version check + auto-install logic in CLI entry point
- Package manager detection utility
- Tests for all auto-update paths (unit + edge cases)

Consumes:
- S01: published package on npm registry, config type/pattern
