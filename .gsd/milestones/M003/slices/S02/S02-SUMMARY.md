---
id: S02
parent: M003
milestone: M003
provides:
  - CI workflow (.github/workflows/ci.yml) gating PRs and pushes to main with check+test+build
  - Release workflow (.github/workflows/release.yml) automating npm publish with provenance + GitHub Release on v* tags
  - CHANGELOG extraction for release notes with fallback
  - Version-tag consistency validation in release pipeline
requires:
  - slice: S01
    provides: Published packages on npm, proven pnpm publish mechanics, CHANGELOG.md with v1.0.0 entry, package.json metadata
affects:
  - S03 (CI badge available for README)
key_files:
  - .github/workflows/ci.yml
  - .github/workflows/release.yml
key_decisions:
  - D047: Used body_path (temp file) for changelog content in GitHub Release instead of inline body — avoids shell escaping issues with multiline markdown
  - D048: Release workflow is self-contained (re-runs check/test/build) rather than depending on CI having passed — ensures no broken publish even if CI is bypassed
patterns_established:
  - GitHub Actions setup pattern: checkout → pnpm/action-setup@v4 → actions/setup-node@v4 with .nvmrc + pnpm cache → frozen-lockfile install
  - Version-tag validation pattern: extract version from tag, compare to package.json, fail loudly with both values printed
  - CHANGELOG extraction via awk with fallback to "See CHANGELOG.md" when section not found
observability_surfaces:
  - GitHub Actions tab shows per-step pass/fail for both workflows
  - Version mismatch step prints both tag and package.json versions before failing
  - CHANGELOG extraction falls back to "See CHANGELOG.md" link when section not found
  - npm provenance attestation links published packages to CI builds
drill_down_paths:
  - .gsd/milestones/M003/slices/S02/tasks/T01-SUMMARY.md
duration: 12m
verification_result: passed
completed_at: 2026-03-14
---

# S02: CI/CD Pipeline + Automated Releases

**CI and release GitHub Actions workflows that gate PRs with check+test+build and automate npm publish + GitHub Release on tagged commits.**

## What Happened

Created two workflow files covering the full CI/CD pipeline:

**ci.yml** — Triggers on `pull_request` (all branches) and `push` to `main`. Single job on ubuntu-latest: checkout, pnpm setup via `pnpm/action-setup@v4` (reads `packageManager` field), Node.js setup via `actions/setup-node@v4` (reads `.nvmrc`, caches pnpm store), `pnpm install --frozen-lockfile`, then discrete `check`, `test`, `build` steps. Any failure blocks the PR.

**release.yml** — Triggers on `v*` tag push. Sets `contents: write` + `id-token: write` permissions. Same setup pattern as CI plus `registry-url: 'https://registry.npmjs.org'` for npm auth via `NODE_AUTH_TOKEN`. After re-running check/test/build, validates that tag version matches `packages/cli/package.json`, extracts the matching CHANGELOG section via awk (with fallback), publishes all packages with `pnpm -r publish --access public --no-git-checks --provenance`, and creates a GitHub Release with `softprops/action-gh-release@v2` using the extracted changelog as body.

Also resolved pre-existing formatting issues in 6 files via `vp check --fix` that were blocking the check step.

## Verification

- YAML syntax: both workflow files parse cleanly via `python3 yaml.safe_load()`
- Full CI pipeline: `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` — 222 tests pass, check+build clean
- CHANGELOG extraction: awk script outputs correct v1.0.0 section; non-existent versions produce empty output (fallback path works)
- Key strings confirmed: `pnpm -r publish`, `softprops/action-gh-release`, `NPM_TOKEN`, `id-token: write`, `registry-url` all present in release.yml
- CI triggers: `pull_request` + `push` to `main` confirmed
- Release trigger: `push` tags matching `v*` confirmed

## Requirements Advanced

- R018 (CI/CD pipeline) — both workflows written and locally verified

## Requirements Validated

- R018 — CI workflow gates PRs with check+test+build; release workflow automates npm publish + GitHub Release on v* tags. YAML valid, CI command sequence passes locally, all key components verified. Full operational proof requires a real GitHub Actions run (merge + tag push).

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Ran `vp check --fix` to resolve pre-existing formatting issues in 6 files. These were formatter-only changes unrelated to the workflow files but necessary for the CI check step to pass.

## Known Limitations

- `NPM_TOKEN` GitHub secret must be configured by the user before the release workflow can publish to npm. This is expected and documented.
- Full operational proof (tag → CI → publish → release) requires merging these workflows to main and pushing a real tag. Local verification proves the commands and YAML structure.
- Local Node.js is v20 (engine wants >=22.12.0) — emits warnings locally but CI uses `.nvmrc` (Node 22) so this is not an issue in GitHub Actions.

## Follow-ups

- Configure `NPM_TOKEN` as a GitHub Actions secret (user action required before first real release)
- S03 can reference CI badge URL from these workflows in README

## Files Created/Modified

- `.github/workflows/ci.yml` — CI workflow: PR + push-to-main quality gate
- `.github/workflows/release.yml` — Release workflow: tag-triggered npm publish + GitHub Release
- `.gsd/milestones/M003/slices/S02/S02-PLAN.md` — Added Observability / Diagnostics section
- `.gsd/milestones/M003/slices/S02/tasks/T01-PLAN.md` — Added Observability Impact section

## Forward Intelligence

### What the next slice should know
- CI badge URL pattern: `https://github.com/domstepek/driftless/actions/workflows/ci.yml/badge.svg` — S03 README can use this
- Release workflow expects `NPM_TOKEN` secret — S03 CONTRIBUTING.md should document the release process
- The setup pattern (checkout → pnpm → node → frozen-lockfile) is established — any future workflows should follow it

### What's fragile
- CHANGELOG extraction depends on Keep A Changelog heading format (`## [x.y.z]`) — if that format changes, the awk script breaks silently (falls back to "See CHANGELOG.md" link, which is safe but loses release notes)

### Authoritative diagnostics
- YAML validity: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/<file>'))"` — single-line syntax check
- CI pipeline locally: `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` — exact same commands as CI
- CHANGELOG extraction: `VERSION=x.y.z && awk "/^## \\[$VERSION\\]/{found=1; next} /^## \\[/{if(found) exit} found" CHANGELOG.md`

### What assumptions changed
- No assumptions changed — slice executed cleanly per plan
