---
id: T01
parent: S01
milestone: M003
provides:
  - "CLI package renamed to @driftless/cli with publishConfig.access: public"
  - "Both packages bumped to version 1.0.0 with full npm metadata (repository, license, homepage, keywords, author)"
  - "CHANGELOG.md at repo root with v1.0.0 entry summarizing M001 + M002 features"
  - "Verified tarballs: correct file lists, workspace:* resolved to 1.0.0, bin field preserved"
key_files:
  - packages/cli/package.json
  - packages/core/package.json
  - CHANGELOG.md
key_decisions:
  - "D042: CLI package renamed from driftless to @driftless/cli — bin.driftless preserved so users still type driftless init"
  - "D043: publishConfig.access set to public on CLI (scoped packages default to restricted on npm)"
  - "D044: CHANGELOG.md is hand-written narrative, not auto-generated from commits — user-facing feature summary grouped by capability area"
patterns_established:
  - "Package metadata pattern: repository with directory field, homepage pointing to repo readme, keywords shared across packages"
observability_surfaces:
  - "driftless --version now reports v1.0.0 — binary version verification"
  - "pnpm pack tarball names reflect scoped package names (driftless-core-1.0.0.tgz, driftless-cli-1.0.0.tgz)"
  - "Packed package.json shows resolved workspace:* → 1.0.0 — dependency resolution verifiable by tar extraction"
duration: 12m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Prepare package metadata, CHANGELOG, and verify tarballs

**Renamed CLI to @driftless/cli, bumped both packages to 1.0.0 with full npm metadata, wrote CHANGELOG.md, all 222 tests pass, tarballs verified clean with resolved dependencies.**

## What Happened

Renamed `packages/cli/package.json` name from `driftless` to `@driftless/cli` with `publishConfig: { "access": "public" }` to ensure scoped package publishes as public. `bin.driftless` left unchanged — users still type `driftless init`.

Bumped both packages to `1.0.0`. Root `package.json` stays at `0.0.0` (private, not published).

Added npm metadata to both packages: `repository` (GitHub URL with `directory` field for monorepo), `license: "MIT"`, `homepage`, `author: "Dom Stepek"`, `keywords`, and updated CLI description to be user-facing. Core description updated to be more descriptive.

Wrote `CHANGELOG.md` at repo root with a v1.0.0 entry covering M001 features (CLI wizard, agent-driven doc generation, framework adapters, skill installer, fail-safe init) and M002 features (GitHub Actions workflows for doc-update and test-gen).

One test in `cli.test.ts` hardcoded `v0.0.0` for the `-V` flag — updated to `v1.0.0` to match the version bump. The `--version` test already used a regex pattern.

## Verification

- ✅ `pnpm run build` — both packages build clean (core: 478ms, cli: 429ms)
- ✅ `pnpm run test` — 222 tests passed, 0 failures across 12 test files
- ✅ `pnpm pack -C packages/core` — tarball contains: `package.json`, `dist/index.mjs`, `dist/index.d.mts` (no source, no tests)
- ✅ `pnpm pack -C packages/cli` — tarball contains: `package.json`, `dist/index.mjs`, `dist/init-BZjkJGi5.mjs`, `dist/index.d.mts` (no source, no tests)
- ✅ CLI tarball's `package.json` shows `"@driftless/core": "1.0.0"` — workspace:* resolved
- ✅ CLI tarball has `bin.driftless` field and `publishConfig.access: "public"`
- ✅ Core tarball has `name: "@driftless/core"`, `version: "1.0.0"`, `license: "MIT"`, `repository`, `homepage`
- ✅ `node packages/cli/dist/index.mjs --version` → `driftless v1.0.0`

**Slice-level verification (partial — T01 scope):**
- ✅ `pnpm run test` — 222 tests pass
- ✅ `pnpm run build` — both packages build clean
- ✅ `pnpm pack -C packages/core && tar tf driftless-core-1.0.0.tgz` — correct files
- ✅ `pnpm pack -C packages/cli && tar tf driftless-cli-1.0.0.tgz` — correct files, bin entry, resolved core dep
- ⬜ `npm info @driftless/core@1.0.0 version` — T02 (publish required)
- ⬜ `npm info @driftless/cli@1.0.0 version` — T02 (publish required)
- ⬜ `npm install -g @driftless/cli && driftless --version` — T02 (publish required)
- ⬜ `npx @driftless/cli@latest --help` — T02 (publish required)
- ⬜ `pnpm publish -C packages/core --dry-run` — T02
- ⬜ `pnpm publish -C packages/cli --dry-run` — T02

## Diagnostics

- `node packages/cli/dist/index.mjs --version` — confirms version propagated through build
- `tar xf packages/cli/driftless-cli-1.0.0.tgz --to-stdout package/package.json` — inspect resolved dependencies
- `tar xf packages/core/driftless-core-1.0.0.tgz --to-stdout package/package.json` — inspect metadata
- Tarballs at `packages/core/driftless-core-1.0.0.tgz` and `packages/cli/driftless-cli-1.0.0.tgz` can be inspected with `tar tf`

## Deviations

- Updated `cli.test.ts` test for `-V` flag from hardcoded `v0.0.0` to `v1.0.0` — not listed in task plan but necessary consequence of version bump.

## Known Issues

None.

## Files Created/Modified

- `packages/cli/package.json` — renamed to `@driftless/cli`, version 1.0.0, added publishConfig, repository, license, homepage, keywords, author, updated description
- `packages/core/package.json` — version 1.0.0, added repository, license, homepage, keywords, author, updated description
- `CHANGELOG.md` — new file, v1.0.0 entry summarizing M001 + M002 features
- `packages/cli/test/cli.test.ts` — updated `-V` test expectation from v0.0.0 to v1.0.0
- `.gsd/milestones/M003/slices/S01/S01-PLAN.md` — added Observability / Diagnostics section
- `.gsd/milestones/M003/slices/S01/tasks/T01-PLAN.md` — added Observability Impact section
