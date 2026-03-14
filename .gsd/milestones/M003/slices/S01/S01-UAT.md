# S01: npm Package Publishing + v1.0.0 Release — UAT

**Milestone:** M003
**Written:** 2026-03-14

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: This slice's value is entirely about published artifacts on a live registry — the only meaningful test is installing from npm and verifying the result.

## Preconditions

- npm registry is accessible (internet connection)
- No prior global install of `@driftless-ai/cli` (or uninstall first: `npm uninstall -g @driftless-ai/cli`)
- Node.js 18+ and npm available in PATH

## Smoke Test

Run `npm info @driftless-ai/cli@1.0.0 version` — should return `1.0.0`. If this fails, nothing else will work.

## Test Cases

### 1. Global install and version check

1. Run `npm install -g @driftless-ai/cli`
2. Run `driftless --version`
3. **Expected:** Output contains `v1.0.0`

### 2. npx invocation with help

1. Run `npx @driftless-ai/cli@latest --help`
2. **Expected:** Output shows usage with `init` command listed, `--dry-run` and `--version` options

### 3. npx init wizard launches

1. Run `npx @driftless-ai/cli@latest init` in a temp directory
2. **Expected:** Interactive wizard starts (prompts for test framework, docs location, etc.). Cancel with Ctrl+C — no files should be written.

### 4. Core package registry metadata

1. Run `npm info @driftless-ai/core@1.0.0`
2. **Expected:** Shows version `1.0.0`, license `MIT`, repository URL pointing to GitHub, homepage URL, keywords array

### 5. CLI package registry metadata

1. Run `npm info @driftless-ai/cli@1.0.0`
2. **Expected:** Shows version `1.0.0`, license `MIT`, `bin: { driftless: './dist/index.mjs' }`, dependency `@driftless-ai/core: 1.0.0`

### 6. CHANGELOG exists with v1.0.0 entry

1. Open `CHANGELOG.md` at repo root
2. **Expected:** Contains `## [1.0.0]` section with summaries of CLI wizard, doc generation, framework adapters, skill installer, GitHub Actions workflows

### 7. Git tag v1.0.0

1. Run `git tag -l v1.0.0`
2. Run `git ls-remote --tags origin v1.0.0`
3. **Expected:** Both return the v1.0.0 tag (local and remote)

### 8. All tests pass post-publish

1. Run `pnpm run test` in the repo root
2. **Expected:** 222 tests pass across 12 test files, 0 failures

## Edge Cases

### Scoped package access

1. Run `npm access list packages @driftless-ai` (requires npm auth)
2. **Expected:** Both `@driftless-ai/core` and `@driftless-ai/cli` show `public` access

### Tarball contents verification

1. Run `pnpm pack -C packages/core && tar tf packages/core/driftless-ai-core-1.0.0.tgz`
2. Run `pnpm pack -C packages/cli && tar tf packages/cli/driftless-ai-cli-1.0.0.tgz`
3. **Expected:** Core has 3 files (package.json, dist/index.mjs, dist/index.d.mts). CLI has 4 files (package.json, dist/index.mjs, dist/init-*.mjs, dist/index.d.mts). No source files, no test files, no .gsd/ artifacts.

### workspace:* resolution in published package

1. Run `npm pack @driftless-ai/cli@1.0.0 --pack-destination /tmp && tar xf /tmp/driftless-ai-cli-1.0.0.tgz -C /tmp && cat /tmp/package/package.json | grep -A1 driftless-ai/core`
2. **Expected:** Shows `"@driftless-ai/core": "1.0.0"` (not `workspace:*`)

## Failure Signals

- `npm info @driftless-ai/core@1.0.0` returns 404 — package not published
- `driftless --version` returns anything other than `v1.0.0` — version bump didn't propagate
- `npm install -g @driftless-ai/cli` fails with scope/access error — publishConfig wrong
- `npx @driftless-ai/cli@latest init` fails to start — bin field or build broken
- CLI tarball contains `"@driftless-ai/core": "workspace:*"` — pnpm publish didn't resolve workspace protocol
- `pnpm run test` has failures — version bump or rename broke something

## Requirements Proved By This UAT

- R016 — npm package with semantic versioning: both packages at 1.0.0, installable from registry, correct bin/files/exports
- R017 — CHANGELOG.md: v1.0.0 entry exists summarizing prior work (automated generation deferred to S02)

## Not Proven By This UAT

- R017 automated changelog from conventional commits — deferred to S02 CI pipeline
- npm provenance — v1.0.0 was published manually, not from CI with --provenance
- R018 CI/CD pipeline — S02 scope
- R019/R020 community files and repo hygiene — S03 scope

## Notes for Tester

- The npm scope is `@driftless-ai` (not `@driftless` as some plan docs reference). This is correct — the `@driftless` org was not available.
- If you already have `@driftless-ai/cli` installed globally, uninstall first to get a clean test: `npm uninstall -g @driftless-ai/cli`
- The init wizard requires Claude Code CLI to be installed for actual doc generation. Cancelling with Ctrl+C during the wizard is fine for UAT — it proves the wizard launches from the registry install.
