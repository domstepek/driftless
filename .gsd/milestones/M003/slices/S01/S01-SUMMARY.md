---
id: S01
parent: M003
milestone: M003
provides:
  - "Both @driftless-ai/core@1.0.0 and @driftless-ai/cli@1.0.0 published to npm registry"
  - "CLI installable globally: npm install -g @driftless-ai/cli — driftless --version returns v1.0.0"
  - "npx @driftless-ai/cli@latest --help shows usage with init command"
  - "CHANGELOG.md at repo root with v1.0.0 entry summarizing M001+M002 work"
  - "Git tag v1.0.0 created and pushed to origin"
  - "Verified tarballs with correct file lists, resolved workspace:* dependencies, bin entry, public access"
requires:
  - slice: none
    provides: first slice in milestone
affects:
  - S02
  - S03
  - S04
key_files:
  - packages/cli/package.json
  - packages/core/package.json
  - CHANGELOG.md
key_decisions:
  - "D042: CLI package renamed from driftless to @driftless-ai/cli — bin.driftless preserved"
  - "D043: publishConfig.access set to public on CLI (scoped packages default to restricted)"
  - "D044: CHANGELOG.md is hand-written narrative for v1.0.0, not auto-generated from commits"
patterns_established:
  - "Package metadata pattern: repository with directory field, homepage pointing to repo readme, shared keywords"
  - "Publish workflow: pnpm -r publish --access public --no-git-checks for topological workspace publish"
  - "Scope: @driftless-ai (not @driftless — that org was unavailable)"
observability_surfaces:
  - "driftless --version reports v1.0.0 — binary version verification from installed package"
  - "npm info @driftless-ai/core@1.0.0 and npm info @driftless-ai/cli@1.0.0 — live registry metadata"
  - "Packed package.json shows resolved workspace:* → 1.0.0 — verifiable by tar extraction"
drill_down_paths:
  - .gsd/milestones/M003/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S01/tasks/T02-SUMMARY.md
duration: 22m
verification_result: passed
completed_at: 2026-03-14
---

# S01: npm Package Publishing + v1.0.0 Release

**Both @driftless-ai/core and @driftless-ai/cli published to npm at v1.0.0 — installable from the live registry, with CHANGELOG and v1.0.0 git tag.**

## What Happened

T01 prepared all package metadata: renamed CLI from `driftless` to `@driftless-ai/cli` with `publishConfig.access: public` and `bin.driftless` preserved. Bumped both packages to 1.0.0. Added standard npm metadata (repository, license, homepage, keywords, author) to both. Wrote CHANGELOG.md summarizing M001 (CLI wizard, doc generation, framework adapters, skill installer, fail-safe init) and M002 (GitHub Actions workflow templates). Updated one test that hardcoded v0.0.0. All 222 tests pass, both packages build clean, tarballs verified with correct file lists and resolved `workspace:*` → `1.0.0`.

T02 verified the live registry. Both packages had already been published by the user moments before the task ran, so the task became verification-only. Confirmed both packages live on npmjs.com with correct metadata. Global install from npm returns `driftless v1.0.0`. `npx @driftless-ai/cli@latest --help` shows usage with init command. Git tag `v1.0.0` exists locally and on origin.

Note: The npm scope is `@driftless-ai` (not `@driftless` as originally planned) — the user created the `@driftless-ai` org on npm.

## Verification

- ✅ `pnpm run test` — 222 tests passed across 12 test files
- ✅ `pnpm run build` — both packages build clean
- ✅ `pnpm pack -C packages/core` — tarball has package.json, dist/index.mjs, dist/index.d.mts
- ✅ `pnpm pack -C packages/cli` — tarball has package.json, dist/index.mjs, dist/init-*.mjs, dist/index.d.mts, bin entry
- ✅ CLI tarball's package.json: `@driftless-ai/core: 1.0.0` (workspace:* resolved), `bin.driftless`, `publishConfig.access: public`
- ✅ `npm info @driftless-ai/core@1.0.0 version` → `1.0.0`
- ✅ `npm info @driftless-ai/cli@1.0.0 version` → `1.0.0`
- ✅ `npm install -g @driftless-ai/cli && driftless --version` → `driftless v1.0.0`
- ✅ `npx @driftless-ai/cli@latest --help` → shows usage with init command
- ✅ `git tag -l v1.0.0` → exists, `git ls-remote --tags origin v1.0.0` → pushed

## Requirements Advanced

- R016 (npm package with semantic versioning) — both packages published at 1.0.0 with correct bin, files, exports fields
- R017 (CHANGELOG.md) — v1.0.0 entry written summarizing all M001+M002 features

## Requirements Validated

- R016 — proven by live registry install: `npm install -g @driftless-ai/cli && driftless --version` returns v1.0.0
- R017 — CHANGELOG.md exists at repo root with v1.0.0 entry; future automation deferred to S02

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- R016/R017 scope note: npm scope is `@driftless-ai` not `@driftless`. All downstream slices (S02 CI publish, S03 README badges, S04 auto-update registry URL) must use `@driftless-ai`.

## Deviations

- npm scope changed from `@driftless` to `@driftless-ai` — the `@driftless` org was not available on npm.
- T02 became verification-only rather than publish+verify — user had already published both packages before the task ran.
- `cli.test.ts` updated to expect v1.0.0 (not in original task plan, but necessary consequence of version bump).

## Known Limitations

- CHANGELOG is hand-written for v1.0.0. Automated changelog generation from conventional commits is deferred to S02/CI pipeline.
- No npm provenance on the v1.0.0 publish (manual publish, not from CI). S02 will add `--provenance` to CI publish.

## Follow-ups

- S02 must use `@driftless-ai` scope in CI publish workflow
- S03 must use `@driftless-ai/cli` in README install instructions and npm badges
- S04 must use `https://registry.npmjs.org/@driftless-ai/cli/latest` for version check

## Files Created/Modified

- `packages/cli/package.json` — renamed to @driftless-ai/cli, 1.0.0, publishConfig, metadata
- `packages/core/package.json` — 1.0.0, added repository, license, homepage, keywords, author
- `CHANGELOG.md` — new file, v1.0.0 entry
- `packages/cli/test/cli.test.ts` — updated -V test expectation to v1.0.0

## Forward Intelligence

### What the next slice should know
- The npm scope is `@driftless-ai`, not `@driftless`. Every reference to the package name must use this scope.
- Publish order matters: core before CLI (workspace dependency). `pnpm -r publish` handles topological ordering automatically.
- `pnpm publish` (not `npm publish`) is required for workspace:* resolution in monorepo.

### What's fragile
- The init chunk filename in the CLI tarball includes a hash (`init-DrcIQ8Xw.mjs`) that changes on rebuild — don't hardcode it in tests or CI.

### Authoritative diagnostics
- `npm info @driftless-ai/core@1.0.0` and `npm info @driftless-ai/cli@1.0.0` — live registry truth
- `driftless --version` from global install — confirms full publish pipeline worked
- `tar xf <cli-tgz> --to-stdout package/package.json` — inspect resolved dependencies without installing

### What assumptions changed
- Plan assumed `@driftless` scope — actual scope is `@driftless-ai` due to npm org availability
- Plan assumed agent would publish — user published first, task became verification-only
