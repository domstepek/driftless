---
id: T02
parent: S01
milestone: M003
provides:
  - "Both @driftless-ai/core@1.0.0 and @driftless-ai/cli@1.0.0 published to npm"
  - "Install from live registry verified — driftless --version returns v1.0.0"
  - "Git tag v1.0.0 created and pushed to origin"
key_files:
  - packages/core/package.json
  - packages/cli/package.json
key_decisions:
  - "Packages were already published and tagged by the user before this task ran — agent verified rather than re-published"
patterns_established:
  - "Publish workflow: pnpm -r publish --access public --no-git-checks for topological workspace publish"
observability_surfaces:
  - "npm info @driftless-ai/core@1.0.0 — live registry metadata"
  - "npm info @driftless-ai/cli@1.0.0 — live registry metadata"
  - "driftless --version — version surface from installed binary"
duration: 10m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Publish to npm and verify from live registry

**Both @driftless-ai/core@1.0.0 and @driftless-ai/cli@1.0.0 verified live on npm — install, version, and help output all confirmed working.**

## What Happened

Confirmed npm auth (`npm whoami` → `jdomstepek`) and `@driftless-ai` org membership (owner). Ran `pnpm -r publish` which reported no new packages — both had already been published moments earlier by the user. Verified both packages are live on the registry with correct metadata: MIT license, proper homepage, correct dependencies (`@driftless-ai/core: 1.0.0` in CLI), and `bin: driftless` entry.

Installed `@driftless-ai/cli` globally from npm — `driftless --version` returns `driftless v1.0.0`. `npx @driftless-ai/cli@latest --help` shows usage with `init` command. Git tag `v1.0.0` was already created and pushed to origin.

Note: The task plan referenced `@driftless/core` and `@driftless/cli` but the actual published scope is `@driftless-ai` — this was the correct name from T01 implementation.

## Verification

All task-level must-haves verified:

- ✅ `npm info @driftless-ai/core@1.0.0 version` → `1.0.0`
- ✅ `npm info @driftless-ai/cli@1.0.0 version` → `1.0.0`
- ✅ `npm install -g @driftless-ai/cli` succeeded, `driftless --version` → `driftless v1.0.0`
- ✅ `npx @driftless-ai/cli@latest --help` → shows usage with init command
- ✅ `git tag -l v1.0.0` → tag exists, `git ls-remote --tags origin v1.0.0` → pushed

All slice-level verification checks pass:

- ✅ `pnpm run test` — 222 tests pass
- ✅ `pnpm run build` — both packages build clean
- ✅ `pnpm pack` tarballs correct (core: 3 files, cli: 4 files with bin)
- ✅ `npm info` returns valid metadata for both packages
- ✅ `npm install -g` + `driftless --version` → `v1.0.0`
- ✅ `npx @driftless-ai/cli@latest --help` → shows init command
- ✅ Publish dry-runs succeed with correct names and public access

## Diagnostics

- `npm info @driftless-ai/core@1.0.0` — full registry metadata including tarball URL, shasum, dependencies
- `npm info @driftless-ai/cli@1.0.0` — same, plus confirms `bin: driftless` and `@driftless-ai/core: 1.0.0` dependency
- `driftless --version` from global install — confirms version propagation through build and registry
- Registry URLs: https://www.npmjs.com/package/@driftless-ai/core, https://www.npmjs.com/package/@driftless-ai/cli

## Deviations

- Scope is `@driftless-ai` not `@driftless` as written in the task plan — this matches the actual T01 implementation and the npm org the user created
- Packages were already published and tagged before the agent ran — task became verification-only rather than publish+verify

## Known Issues

None.

## Files Created/Modified

- No files modified — all publish and tagging was already complete
