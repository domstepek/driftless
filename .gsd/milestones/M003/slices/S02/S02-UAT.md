# S02: CI/CD Pipeline + Automated Releases — UAT

**Milestone:** M003
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven for local checks + live-runtime for GitHub Actions operational proof)
- Why this mode is sufficient: Workflow files can be validated structurally and locally (YAML syntax, command correctness, key strings). Full operational proof requires a real GitHub Actions run which is a live-runtime check the user performs after merge + secret configuration.

## Preconditions

- Repository cloned with all dependencies installed (`pnpm install --frozen-lockfile`)
- `.github/workflows/ci.yml` and `.github/workflows/release.yml` exist in the repo
- CHANGELOG.md exists with at least one `## [x.y.z]` section
- For operational tests: repo pushed to GitHub, `NPM_TOKEN` secret configured in GitHub repo settings

## Smoke Test

Run `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); yaml.safe_load(open('.github/workflows/release.yml')); print('both valid')"` — should print "both valid".

## Test Cases

### 1. CI workflow YAML structure

1. Open `.github/workflows/ci.yml`
2. Verify `on:` section includes `pull_request:` and `push: branches: [main]`
3. Verify job uses `ubuntu-latest`
4. Verify steps include: Checkout, Setup pnpm, Setup Node.js, Install dependencies, Check, Test, Build
5. Verify Install step uses `pnpm install --frozen-lockfile`
6. **Expected:** All structural elements present. YAML parses without error.

### 2. Release workflow YAML structure

1. Open `.github/workflows/release.yml`
2. Verify `on: push: tags: ["v*"]`
3. Verify `permissions:` includes `contents: write` and `id-token: write`
4. Verify `registry-url: 'https://registry.npmjs.org'` in setup-node step
5. Verify steps include: Checkout, Setup pnpm, Setup Node.js, Install, Check, Test, Build, Validate version, Extract changelog, Publish, Create GitHub Release
6. Verify publish step uses `pnpm -r publish --access public --no-git-checks --provenance`
7. Verify `NPM_TOKEN` is referenced via `${{ secrets.NPM_TOKEN }}`
8. Verify GitHub Release step uses `softprops/action-gh-release@v2`
9. **Expected:** All structural elements present. YAML parses without error.

### 3. Local CI pipeline passes

1. Run `pnpm install --frozen-lockfile`
2. Run `pnpm run check`
3. Run `pnpm run test`
4. Run `pnpm run build`
5. **Expected:** All four commands succeed. 222+ tests pass. No lint/format errors. Both packages build cleanly.

### 4. CHANGELOG extraction — valid version

1. Run `VERSION=1.0.0 && awk "/^## \\[$VERSION\\]/{found=1; next} /^## \\[/{if(found) exit} found" CHANGELOG.md`
2. **Expected:** Non-empty output containing the v1.0.0 changelog section (includes "Initial release").

### 5. CHANGELOG extraction — non-existent version

1. Run `VERSION=99.99.99 && awk "/^## \\[$VERSION\\]/{found=1; next} /^## \\[/{if(found) exit} found" CHANGELOG.md`
2. **Expected:** Empty output (no match). This is the fallback path — the release workflow will use "See CHANGELOG.md" text instead.

### 6. Version-tag validation logic

1. In release.yml, find the "Validate version" step
2. Verify it extracts version from the git tag (stripping `v` prefix)
3. Verify it reads version from `packages/cli/package.json`
4. Verify it compares the two and fails (`exit 1`) if they don't match
5. Verify it echoes both values before failing (for diagnostics)
6. **Expected:** Step would fail with clear error message showing both versions if they differ.

### 7. Operational: PR triggers CI (live GitHub)

1. Push a branch with a trivial change and open a PR against `main`
2. Check the GitHub Actions tab
3. **Expected:** CI workflow runs automatically. Shows check, test, build steps. All pass (or clearly indicate what failed).

### 8. Operational: Tag triggers release (live GitHub)

1. Ensure `NPM_TOKEN` is configured as a GitHub Actions secret
2. Update version in both package.json files to match the new tag (e.g., `1.0.1`)
3. Update CHANGELOG.md with a `## [1.0.1]` section
4. Commit, push to main, then run `git tag v1.0.1 && git push --tags`
5. Check the GitHub Actions tab
6. **Expected:** Release workflow runs. Validates version match. Extracts changelog. Publishes both packages to npm with provenance. Creates GitHub Release with changelog body.

## Edge Cases

### Missing NPM_TOKEN secret

1. Remove or don't configure the `NPM_TOKEN` secret
2. Push a `v*` tag
3. **Expected:** Release workflow runs check/test/build successfully but the publish step fails with an authentication error. The failure is clearly attributable to the publish step (not a YAML or logic error).

### Tag version mismatch

1. Set `packages/cli/package.json` version to `1.0.1`
2. Push a `v1.0.2` tag (mismatched)
3. **Expected:** The "Validate version" step fails with a message showing `TAG_VERSION=1.0.2` and `PKG_VERSION=1.0.1`. No publish or release creation occurs.

### CHANGELOG section missing for tagged version

1. Push a `v1.0.1` tag with matching package.json but no `## [1.0.1]` section in CHANGELOG.md
2. **Expected:** CHANGELOG extraction returns empty. Release is still created but body says "See CHANGELOG.md" instead of the version-specific notes.

## Failure Signals

- YAML parse error when loading workflow files
- Any of `pnpm run check`, `pnpm run test`, `pnpm run build` failing locally
- CHANGELOG extraction returning content for a non-existent version
- Missing `provenance`, `NPM_TOKEN`, `id-token: write`, or `softprops/action-gh-release` references in release.yml
- CI workflow not triggering on PR or push to main
- Release workflow not triggering on `v*` tag push
- Version validation step not printing both versions on mismatch

## Requirements Proved By This UAT

- R018 — CI/CD pipeline: test cases 1-8 collectively prove PR gating and tag-triggered release automation. Tests 1-6 are locally verifiable; tests 7-8 require live GitHub Actions runs.

## Not Proven By This UAT

- npm provenance attestation visibility on npmjs.com — requires checking the published package page after a real release
- Branch protection rules blocking merge on CI failure — this is a GitHub repo setting, not a workflow concern (covered by S03)
- Automated CHANGELOG generation from conventional commits — v1.0.0 CHANGELOG is hand-written (D044); tooling for future releases is deferred

## Notes for Tester

- Tests 1-6 can be run locally without any GitHub infrastructure
- Tests 7-8 require the repo to be pushed to GitHub with `NPM_TOKEN` configured as a repository secret (Settings → Secrets and variables → Actions → New repository secret)
- The `NPM_TOKEN` should be a granular access token with `automation` type to bypass 2FA requirements
- Local Node.js v20 warnings are expected and harmless — CI uses Node 22 via `.nvmrc`
