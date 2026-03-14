---
id: S02
milestone: M003
status: ready
---

# S02: CI/CD Pipeline + Automated Releases — Context

## Goal

Pushing a `v*` tag to main triggers GitHub Actions that publishes both packages to npm with provenance and creates a GitHub Release with changelog body. Every PR runs test + lint + build and blocks merge on failure.

## Why this Slice

S01 proves manual publishing works. S02 automates it so every future release is a `git tag` away. Also establishes the PR quality gate that prevents broken code from merging — foundational for accepting outside contributions (S03).

## Scope

### In Scope

- `.github/workflows/ci.yml` — runs on every PR: `vp test`, `vp check` (lint + format), `vp run -r build`. Blocks merge on failure.
- `.github/workflows/release.yml` — triggered by `v*` tag push to main: builds, publishes both packages to npm with `pnpm publish -r --provenance --no-git-checks`, creates GitHub Release with CHANGELOG body for that version.
- `NPM_TOKEN` as a GitHub Actions repository secret (granular access token, automation type, scoped to the npm org resolved in S01).
- `--provenance` flag on publish (requires `id-token: write` permission in the workflow).
- `pnpm publish -r` for topological publish ordering (core before CLI).
- Node 22 only in CI (matches `.nvmrc` and `engines` field) — no matrix.
- pnpm version matching `packageManager` field in root `package.json` (currently 10.32.1), installed via `pnpm/action-setup` or corepack.
- Vite+ (`vp`) installed in CI as a devDependency (already in catalog) — no global install needed in CI since `pnpm run build` calls `vp pack` via package scripts.
- Release flow is manual: user edits version in both `package.json` files, commits, tags `v<version>`, pushes tag. CI takes it from there.

### Out of Scope

- Conventional commit enforcement / commitlint (can add later if commit discipline becomes an issue)
- `semantic-release` or `changesets` automation (D043 — decided against for v1)
- Release script to automate version bump + tag (user does this manually for now)
- Branch protection rules (S03 — requires GitHub UI / API configuration)
- CHANGELOG generation tooling (v1.0.0 is hand-written per D044; future CHANGELOG automation is a separate concern)

## Constraints

- npm scope / org name deferred to whatever S01 resolves — S02 uses the same scope
- `NPM_TOKEN` must be a granular access token with automation type to bypass 2FA
- GitHub Actions only (no external CI — per M003 context)
- `pnpm publish` (not `npm publish`) required for `workspace:*` resolution
- Core must publish before CLI — `pnpm publish -r` handles this via topological order

## Integration Points

### Consumes from S01

- Proven `pnpm publish -r` mechanics and package metadata
- Published npm scope and package names
- `package.json` version at 1.0.0 across both packages
- CHANGELOG.md with v1.0.0 entry (release workflow extracts the relevant section for the GitHub Release body)

### Produces

- `.github/workflows/ci.yml` — PR quality gate
- `.github/workflows/release.yml` — tag-triggered publish + GitHub Release
- Proven end-to-end release pipeline: tag → CI → npm publish with provenance → GitHub Release

### Produces for S03

- CI workflow existence enables branch protection "require status checks" in S03
- Workflow badge URLs for README badges

## Open Questions

- **CHANGELOG extraction for GitHub Release body:** Should the release workflow parse CHANGELOG.md to extract the section for the tagged version, or just link to the CHANGELOG? Parsing is more polished but adds complexity. Current leaning: parse it — a simple sed/awk between version headers is reliable enough.
