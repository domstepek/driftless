# S02: CI/CD Pipeline + Automated Releases

**Goal:** Pushing a `v*` tag to main triggers GitHub Actions that publishes both packages to npm with provenance and creates a GitHub Release. PRs run test+lint+build and block merge on failure.
**Demo:** A PR against main shows CI checks running. A `v1.0.1` tag push triggers the release workflow that would publish to npm and create a GitHub Release (requires NPM_TOKEN secret to be configured).

## Must-Haves

- `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile`, `pnpm run check`, `pnpm run test`, `pnpm run build` on every PR and push to main
- `.github/workflows/release.yml` triggers on `v*` tags, runs full CI checks, publishes via `pnpm -r publish --access public --no-git-checks --provenance`, and creates a GitHub Release via `softprops/action-gh-release@v2`
- Release workflow extracts the matching version section from CHANGELOG.md for the GitHub Release body
- Release workflow validates that the tag version matches `packages/cli/package.json` version
- Both workflows use Node 22 (via `.nvmrc`) and pnpm (via `packageManager` field)
- `id-token: write` permission set in release workflow for npm provenance
- `NPM_TOKEN` referenced as a GitHub Actions secret for npm authentication
- All 222+ existing tests continue to pass

## Proof Level

- This slice proves: operational (real workflow files, locally verified commands)
- Real runtime required: yes — full operational proof requires a real GitHub Actions run, which depends on merging + tagging. Local verification proves the commands and YAML structure.
- Human/UAT required: yes — user must configure `NPM_TOKEN` GitHub secret and push a tag to prove the release pipeline end-to-end

## Verification

- `cat .github/workflows/ci.yml | python3 -c "import sys,yaml; yaml.safe_load(sys.stdin.read()); print('valid')"` — YAML syntax valid
- `cat .github/workflows/release.yml | python3 -c "import sys,yaml; yaml.safe_load(sys.stdin.read()); print('valid')"` — YAML syntax valid
- `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` — the exact CI pipeline passes locally
- CHANGELOG extraction script tested against real CHANGELOG.md — outputs the v1.0.0 section correctly
- Release workflow contains `pnpm -r publish --access public --no-git-checks --provenance`
- Release workflow contains `softprops/action-gh-release@v2`
- CI workflow triggers on `pull_request` and `push` to `main`
- Release workflow triggers on `push` tags matching `v*`

## Observability / Diagnostics

- **CI workflow status:** GitHub Actions tab shows green/red per PR and push to main. Failed steps name the exact command that broke (check, test, or build).
- **Release workflow status:** Tag push triggers visible in Actions tab. Each step (validate version, extract changelog, publish, create release) is a discrete named step — failure is attributable to exactly one stage.
- **Version mismatch detection:** The "Validate version" step fails loudly with both the tag version and package.json version printed, so the fix is immediately obvious.
- **CHANGELOG extraction fallback:** If the awk extraction finds no matching section, the release notes body falls back to "See CHANGELOG.md" rather than silently publishing with an empty body.
- **npm publish provenance:** Published packages include OIDC provenance attestation (visible on npmjs.com package page) proving they were built by this CI pipeline.
- **Secrets:** `NPM_TOKEN` is referenced only via `${{ secrets.NPM_TOKEN }}` — never logged or echoed. GitHub Actions masks secret values in logs by default.
- **Local inspection:** Both workflows can be validated offline with `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/<file>'))"`. The CI command sequence (`pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build`) is runnable locally to reproduce any CI failure.

## Integration Closure

- Upstream surfaces consumed: `CHANGELOG.md` (Keep A Changelog format from S01), `package.json` scripts (`test`, `check`, `build`), `.nvmrc`, root `packageManager` field
- New wiring introduced in this slice: `.github/workflows/` directory with two workflow files — first GitHub Actions config in the repo
- What remains before the milestone is truly usable end-to-end: S03 (community files + repo hygiene), S04 (CLI auto-update), and operational proof that a real tag push triggers the full pipeline

## Tasks

- [x] **T01: Write CI and release GitHub Actions workflows** `est:45m`
  - Why: This is the entire slice — two YAML workflow files that automate PR quality gates and tag-triggered releases
  - Files: `.github/workflows/ci.yml`, `.github/workflows/release.yml`
  - Do: Write ci.yml (PR + push-to-main trigger, pnpm/node setup with caching, check/test/build steps). Write release.yml (v* tag trigger, same CI steps, version-tag consistency check, CHANGELOG section extraction, pnpm -r publish with provenance, GitHub Release creation via softprops/action-gh-release@v2). Use `pnpm/action-setup@v4`, `actions/setup-node@v4` with `registry-url` for npm auth. Validate YAML syntax. Run the full CI command sequence locally to prove it passes. Test the CHANGELOG extraction logic against the real CHANGELOG.md.
  - Verify: Both YAML files parse cleanly. `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` passes. CHANGELOG extraction outputs the correct section.
  - Done when: Both workflow files exist with correct triggers, steps, and secrets references. Local CI command sequence passes. YAML is syntactically valid.

## Files Likely Touched

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
