---
estimated_steps: 6
estimated_files: 4
---

# T01: Prepare package metadata, CHANGELOG, and verify tarballs

**Slice:** S01 — npm Package Publishing + v1.0.0 Release
**Milestone:** M003

## Description

All code and metadata changes needed before npm publishing. Rename the CLI package from `driftless` to `@driftless/cli` (D042), bump both packages to 1.0.0, add standard npm fields, write the hand-written CHANGELOG (D044), and verify everything builds, tests pass, and tarballs are correct.

## Steps

1. Rename `packages/cli/package.json` `name` from `driftless` to `@driftless/cli`. Keep `bin.driftless` unchanged (users still type `driftless init`). Add `publishConfig: { "access": "public" }` since scoped packages default to restricted.
2. Bump `version` to `1.0.0` in both `packages/cli/package.json` and `packages/core/package.json`. Leave root `package.json` at `0.0.0` (private, not published).
3. Add standard npm metadata to both packages: `repository` (GitHub URL with directory), `license: "MIT"`, `homepage`, `keywords`, `author`. Update `description` on CLI to be user-facing.
4. Write `CHANGELOG.md` at repo root — v1.0.0 entry with narrative summary of M001 features (CLI wizard, doc generation, framework adapters, skill installer, fail-safe init) and M002 features (doc-update workflow, test-gen workflow, capability gating). Keep it concise and user-facing.
5. Run `pnpm run build` and `pnpm run test` — all 222 tests must pass, both packages must build clean.
6. Run `pnpm pack` in both package directories. Inspect tarballs: correct file list (dist/, package.json, no test files or source), `workspace:*` resolved to `1.0.0` in CLI's dependency on core, bin field present in CLI tarball's package.json.

## Must-Haves

- [ ] CLI package name is `@driftless/cli` with `publishConfig.access: "public"`
- [ ] Both packages at version `1.0.0`
- [ ] `repository`, `license`, `homepage`, `keywords`, `author` on both packages
- [ ] `CHANGELOG.md` exists at repo root with v1.0.0 entry
- [ ] 222 tests pass, both packages build clean
- [ ] `pnpm pack` tarballs contain only dist/ + package.json, workspace:* resolved

## Verification

- `pnpm run test` — 222 tests, 0 failures
- `pnpm run build` — both packages build without error
- `pnpm pack -C packages/core 2>&1 | grep 'Total files'` and inspect contents
- `pnpm pack -C packages/cli 2>&1 | grep 'Total files'` and inspect contents
- `tar tf *.tgz` on both tarballs — no source, no test, no node_modules
- `tar xf <cli-tgz> --to-stdout package/package.json | grep '"@driftless/core": "1.0.0"'` — workspace:* resolved

## Inputs

- `packages/cli/package.json` — current state: name `driftless`, version `0.0.0`, no repository/license/homepage
- `packages/core/package.json` — current state: version `0.0.0`, no repository/license/homepage
- M001-SUMMARY.md — feature list for CHANGELOG
- M002-SUMMARY.md — feature list for CHANGELOG

## Expected Output

- `packages/cli/package.json` — renamed to `@driftless/cli` at 1.0.0 with full metadata
- `packages/core/package.json` — at 1.0.0 with full metadata
- `CHANGELOG.md` — v1.0.0 entry at repo root
- Clean build, clean tests, verified tarballs ready for `pnpm publish`

## Observability Impact

- **`driftless --version` output changes** from `driftless v0.0.0` to `@driftless/cli v1.0.0` (or similar) — a future agent can verify version propagation by running the built binary
- **Tarball names change** — `pnpm pack` in cli now produces `driftless-cli-1.0.0.tgz` (reflecting scoped name), core produces `driftless-core-1.0.0.tgz` (reflecting version bump)
- **Package metadata inspectable** via `npm pkg get` or `jq` on package.json — repository, license, homepage fields exist where they were previously absent
- **Workspace dependency resolution** visible in packed tarball's package.json — `workspace:*` becomes `1.0.0`, verifiable by extracting and grepping
