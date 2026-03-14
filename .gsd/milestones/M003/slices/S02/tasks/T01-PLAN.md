---
estimated_steps: 5
estimated_files: 2
---

# T01: Write CI and release GitHub Actions workflows

**Slice:** S02 — CI/CD Pipeline + Automated Releases
**Milestone:** M003

## Description

Write both GitHub Actions workflow files that automate the driftless repo's CI/CD pipeline. `ci.yml` gates PRs with test+lint+build. `release.yml` automates the full publish-to-npm + GitHub Release flow on tag push. This is the only task in the slice — both files are small, share the same setup pattern, and have no code dependencies.

## Steps

1. Create `.github/workflows/ci.yml`:
   - Trigger on `pull_request` (all branches) and `push` to `main`
   - Use `pnpm/action-setup@v4` (reads `packageManager` from root `package.json` automatically)
   - Use `actions/setup-node@v4` with `node-version-file: '.nvmrc'` and pnpm store cache
   - `pnpm install --frozen-lockfile`
   - Run: `pnpm run check`, `pnpm run test`, `pnpm run build` as separate named steps
   - Single job, single matrix entry (ubuntu-latest, Node 22)

2. Create `.github/workflows/release.yml`:
   - Trigger on `push` tags matching `v*`
   - Permissions: `contents: write` (for GitHub Release), `id-token: write` (for npm provenance)
   - Same pnpm + node setup as ci.yml
   - `pnpm install --frozen-lockfile`
   - Run check, test, build (self-contained — doesn't rely on CI workflow having run)
   - Add a "Validate version" step: extract version from tag (`${GITHUB_REF#refs/tags/v}`), compare to `packages/cli/package.json` version, fail if mismatch
   - Add a "Extract changelog" step: use `awk` to extract the section between `## [version]` headers from CHANGELOG.md, fall back to "See CHANGELOG.md" if section not found. Write to `$GITHUB_OUTPUT` or a temp file
   - Publish step: `pnpm -r publish --access public --no-git-checks --provenance` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`
   - GitHub Release step: `softprops/action-gh-release@v2` with `body_path` pointing to extracted changelog, `generate_release_notes: false`

3. Validate both YAML files parse cleanly with Python yaml module

4. Run the exact CI command sequence locally: `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build`

5. Test the CHANGELOG extraction logic: run the awk command against the real CHANGELOG.md and verify it outputs the v1.0.0 section content

## Must-Haves

- [ ] ci.yml triggers on pull_request and push to main
- [ ] ci.yml runs pnpm install --frozen-lockfile, check, test, build as discrete steps
- [ ] release.yml triggers on push tags matching v*
- [ ] release.yml has permissions for contents:write and id-token:write
- [ ] release.yml validates tag version matches package.json version
- [ ] release.yml extracts CHANGELOG section for the tagged version
- [ ] release.yml publishes with `pnpm -r publish --access public --no-git-checks --provenance` using NPM_TOKEN
- [ ] release.yml creates GitHub Release via softprops/action-gh-release@v2
- [ ] Both files use `pnpm/action-setup@v4` and `actions/setup-node@v4` with `.nvmrc`
- [ ] setup-node configured with `registry-url: 'https://registry.npmjs.org'` in release workflow
- [ ] Both YAML files are syntactically valid
- [ ] All 222+ existing tests pass after changes

## Verification

- `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('ci.yml valid')"` passes
- `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml')); print('release.yml valid')"` passes
- `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` passes
- CHANGELOG awk extraction against real CHANGELOG.md outputs expected content (non-empty, contains "Initial release")
- `grep -c 'pnpm -r publish' .github/workflows/release.yml` returns 1
- `grep -c 'softprops/action-gh-release' .github/workflows/release.yml` returns 1
- `grep -c 'NPM_TOKEN' .github/workflows/release.yml` returns at least 1

## Inputs

- `CHANGELOG.md` — Keep A Changelog format with `## [1.0.0] — 2026-03-14` header. Extraction script must parse between `## [version]` headers.
- `.nvmrc` — Contains `22`. Both workflows use `node-version-file: '.nvmrc'`.
- `package.json` (root) — Scripts: `test` → `vp test`, `check` → `vp check`, `build` → `vp run -r build`. `packageManager: pnpm@10.32.1`.
- S01 summary — npm scope is `@driftless-ai`, publish command is `pnpm -r publish --access public --no-git-checks`, provenance requires `id-token: write`.
- S02 research — `pnpm/action-setup@v4` auto-reads packageManager field. `actions/setup-node@v4` with `registry-url` writes `.npmrc` for NODE_AUTH_TOKEN. OIDC Trusted Publishing deferred (pnpm support unreliable).

## Expected Output

- `.github/workflows/ci.yml` — Complete, valid GitHub Actions workflow for PR quality gate
- `.github/workflows/release.yml` — Complete, valid GitHub Actions workflow for tag-triggered release pipeline

## Observability Impact

- **New signals:** Two GitHub Actions workflows that surface CI pass/fail status on every PR and tag push. Each step is individually named so failures are attributable.
- **Inspection surface:** A future agent can verify workflow correctness by: (1) parsing YAML with `python3 -c "import yaml; yaml.safe_load(open(...))"`, (2) grepping for key strings (`pnpm -r publish`, `softprops/action-gh-release`, `NPM_TOKEN`), (3) running the CI command sequence locally.
- **Failure visibility:** Version mismatch between tag and package.json prints both values and exits non-zero. CHANGELOG extraction failure falls back to a placeholder string. npm publish failure is a discrete step with its own exit code.
- **Redaction:** `NPM_TOKEN` accessed only via `${{ secrets.NPM_TOKEN }}` — never echoed in workflow logs or scripts.
