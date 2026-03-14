# S01: npm Package Publishing + v1.0.0 Release

**Goal:** Both `@driftless/core` and `@driftless/cli` are published to npm at version 1.0.0, installable from the live registry, with a CHANGELOG summarizing all prior work.
**Demo:** `npm install -g @driftless/cli && driftless --version` returns `1.0.0` from a fresh install. `npx @driftless/cli@latest init` launches the interactive wizard.

## Must-Haves

- CLI package renamed from `driftless` to `@driftless/cli` with `bin.driftless` preserved
- Both packages at version `1.0.0` with correct `name`, `files`, `exports`, `types`, `bin` fields
- Standard npm metadata on both packages: `repository`, `license`, `homepage`, `keywords`, `author`, `description`
- `workspace:*` dependency resolves to `1.0.0` in published CLI package
- `CHANGELOG.md` at repo root with v1.0.0 entry summarizing M001+M002 features
- Both packages published to npmjs.com under the `@driftless` scope
- `npm install -g @driftless/cli && driftless --version` returns `1.0.0`
- `npx @driftless/cli@latest init` launches the wizard
- Git tag `v1.0.0` on the publish commit
- All 222 existing tests continue to pass

## Verification

- `pnpm run test` — 222 tests pass (no regressions from rename/version bump)
- `pnpm run build` — both packages build clean
- `pnpm pack -C packages/core && tar tf driftless-core-1.0.0.tgz` — correct files, no junk
- `pnpm pack -C packages/cli && tar tf driftless-cli-1.0.0.tgz` — correct files, bin entry, resolved core dependency
- `npm info @driftless/core@1.0.0 version` — returns `1.0.0`
- `npm info @driftless/cli@1.0.0 version` — returns `1.0.0`
- `npm install -g @driftless/cli && driftless --version` — returns `1.0.0` (or version string containing it)
- `npx @driftless/cli@latest --help` — shows usage with init command

## Tasks

- [ ] **T01: Prepare package metadata, CHANGELOG, and verify tarballs** `est:45m`
  - Why: All code and metadata changes needed before publishing — rename, version bump, npm fields, CHANGELOG. No external dependencies required.
  - Files: `packages/cli/package.json`, `packages/core/package.json`, `CHANGELOG.md`, `package.json`
  - Do: Rename CLI to `@driftless/cli`. Bump both packages to 1.0.0. Add `repository`, `license`, `homepage`, `keywords`, `author` fields to both packages. Write CHANGELOG.md v1.0.0 entry summarizing M001 (CLI + doc engine) and M002 (GitHub Actions workflows). Verify build, run tests, verify pack tarballs have correct contents and `workspace:*` resolves to `1.0.0`.
  - Verify: `pnpm run test` passes 222 tests. `pnpm run build` succeeds. `pnpm pack` in both package dirs produces tarballs with correct file lists and resolved dependencies.
  - Done when: Both packages are at 1.0.0 with complete metadata, CHANGELOG exists, tarballs verified correct — ready for `pnpm publish`.

- [ ] **T02: Publish to npm and verify from live registry** `est:30m`
  - Why: The actual publish and verification against the live npm registry. Requires user to have created the `@driftless` npm org.
  - Files: `packages/core/package.json`, `packages/cli/package.json`
  - Do: Confirm user has created `@driftless` npm org. Publish core first, then CLI (or `pnpm publish -r --access public`). Verify both packages are live. Test install from registry. Tag `v1.0.0`.
  - Verify: `npm info @driftless/core@1.0.0` and `npm info @driftless/cli@1.0.0` return valid metadata. `npm install -g @driftless/cli && driftless --version` returns 1.0.0. `npx @driftless/cli@latest --help` shows usage.
  - Done when: Both packages live on npm, install + version verified, `v1.0.0` tag pushed.

## Files Likely Touched

- `packages/cli/package.json`
- `packages/core/package.json`
- `package.json`
- `CHANGELOG.md`
