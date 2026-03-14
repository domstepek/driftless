---
id: T01
parent: S02
milestone: M003
provides:
  - CI workflow (.github/workflows/ci.yml) gating PRs with check+test+build
  - Release workflow (.github/workflows/release.yml) automating npm publish + GitHub Release on v* tags
key_files:
  - .github/workflows/ci.yml
  - .github/workflows/release.yml
key_decisions:
  - Used body_path (temp file) for changelog content instead of inline body to avoid shell escaping issues with multiline markdown
  - Formatter auto-changed YAML quoting style (double quotes for tags array) — kept formatter's output for consistency
patterns_established:
  - Workflow setup pattern: checkout → pnpm/action-setup@v4 → actions/setup-node@v4 with .nvmrc + pnpm cache → frozen-lockfile install
  - Release workflow is self-contained (re-runs check/test/build) rather than depending on CI having passed
observability_surfaces:
  - GitHub Actions tab shows per-step pass/fail for both workflows
  - Version mismatch step prints both tag and package.json versions before failing
  - CHANGELOG extraction falls back to "See CHANGELOG.md" link when section not found
duration: 12m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Write CI and release GitHub Actions workflows

**Created CI and release GitHub Actions workflows with full PR quality gate and tag-triggered npm publish + GitHub Release pipeline.**

## What Happened

Wrote two workflow files:

1. **ci.yml** — Triggers on `pull_request` (all branches) and `push` to `main`. Single job on ubuntu-latest: checkout, pnpm setup (auto-reads `packageManager`), Node.js setup (reads `.nvmrc`, caches pnpm store), `pnpm install --frozen-lockfile`, then discrete `check`, `test`, `build` steps.

2. **release.yml** — Triggers on `v*` tag push. Sets `contents: write` + `id-token: write` permissions. Same setup pattern as CI plus `registry-url: 'https://registry.npmjs.org'` for npm auth. After check/test/build, validates tag version matches `packages/cli/package.json`, extracts CHANGELOG section via awk (with fallback), publishes all packages with `pnpm -r publish --access public --no-git-checks --provenance`, and creates a GitHub Release with `softprops/action-gh-release@v2` using the extracted changelog as body.

Running `vp check --fix` also resolved pre-existing formatting issues in 6 files (package.json files, a test file, and core/src/index.ts). These were not caused by this task but are included in the diff.

## Verification

- `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('ci.yml valid')"` — ✅ passed
- `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml')); print('release.yml valid')"` — ✅ passed
- `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` — ✅ passed (222 tests, all green)
- CHANGELOG awk extraction for v1.0.0 — ✅ non-empty output containing "Initial release"
- CHANGELOG awk extraction for non-existent version — ✅ empty (fallback path works)
- `grep -c 'pnpm -r publish' .github/workflows/release.yml` — ✅ returns 1
- `grep -c 'softprops/action-gh-release' .github/workflows/release.yml` — ✅ returns 1
- `grep -c 'NPM_TOKEN' .github/workflows/release.yml` — ✅ returns 1
- All slice-level verification checks pass (this is the only task in the slice)

## Diagnostics

- **YAML validity:** `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/<file>'))"` to verify syntax
- **CI pipeline locally:** `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build`
- **CHANGELOG extraction:** `VERSION=1.0.0 && awk "/^## \\[$VERSION\\]/{found=1; next} /^## \\[/{if(found) exit} found" CHANGELOG.md`
- **Key strings:** grep for `pnpm -r publish`, `softprops/action-gh-release`, `NPM_TOKEN`, `id-token: write`, `registry-url`

## Deviations

- Ran `vp check --fix` to resolve pre-existing formatting issues in 6 files that blocked the `pnpm run check` step. These are formatter-only changes unrelated to the workflow files.

## Known Issues

- `NPM_TOKEN` GitHub secret must be configured by the user before the release workflow can publish. This is expected (documented in slice proof level).
- Local Node.js is v20 (engine wants >=22.12.0) — emits warnings but works. CI uses `.nvmrc` (Node 22) so this won't be an issue in GitHub Actions.

## Files Created/Modified

- `.github/workflows/ci.yml` — CI workflow: PR + push-to-main quality gate
- `.github/workflows/release.yml` — Release workflow: tag-triggered npm publish + GitHub Release
- `.gsd/milestones/M003/slices/S02/S02-PLAN.md` — Added Observability / Diagnostics section
- `.gsd/milestones/M003/slices/S02/tasks/T01-PLAN.md` — Added Observability Impact section
- Various pre-existing files reformatted by `vp check --fix`
