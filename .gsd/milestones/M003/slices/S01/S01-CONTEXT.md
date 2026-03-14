---
id: S01
milestone: M003
status: ready
---

# S01: npm Package Publishing + v1.0.0 Release — Context

## Goal

Both `@driftless/core` and `@driftless/cli` are published to npm at version 1.0.0, installable from the live registry, with a hand-written CHANGELOG summarizing M001+M002 work.

## Why this Slice

Nothing else in M003 works without packages on npm. CI/CD (S02) needs a proven publish pipeline. README (S03) needs a real package name and install command. Auto-update (S04) needs a live registry to check against. This slice retires the highest risk — first-ever npm publish for this project — and unblocks everything downstream.

## Scope

### In Scope

- Rename CLI package from `driftless` to `@driftless/cli` in `packages/cli/package.json` (name field, any internal references)
- Bump both packages from `0.0.0` to `1.0.0` (root package.json stays at 0.0.0 — it's not published)
- Verify `vp pack` produces correct bundles for both packages (bin shebang, exports, types, files)
- Run `pnpm pack --dry-run` (or `npm pack --dry-run`) for both packages — verify tarball contents are correct
- Hand-write `CHANGELOG.md` for v1.0.0 summarizing M001 (Core CLI + E2E-to-Docs Engine) and M002 (GitHub Actions + PR Automation) features at a narrative level, not per-commit
- Verify `workspace:*` in CLI's dependency on core resolves to `1.0.0` during pack
- Prepare everything for publish: the user creates the `@driftless` npm org and runs `pnpm publish -r` themselves
- Verify post-publish: `npm install -g @driftless/cli && driftless --version` returns `1.0.0`, `npx @driftless/cli@latest init` launches the wizard
- Git tag `v1.0.0` on the commit that bumps versions

### Out of Scope

- CI/CD pipeline for automated publishing (S02)
- README, community files, repo hygiene (S03)
- CLI auto-update feature (S04)
- npm provenance (requires CI — deferred to S02's release pipeline)
- Conventional commit enforcement (S02)
- Pursuing the unscoped `driftless` npm name (decided: use `@driftless/cli`)

## Constraints

- User must create the `@driftless` npm org on npmjs.com before publish — agent cannot do this
- Use `pnpm publish` (not `npm publish`) to resolve `workspace:*` protocol
- Core must be published before CLI (or use `pnpm publish -r` which handles topological order)
- Agent prepares everything; user runs the final `pnpm publish -r` command
- Both packages must share version `1.0.0` — synchronized version numbering
- ESM-only output (`.mjs`) — no CJS compat needed for Node 22+ target

## Integration Points

### Consumes

- `packages/cli/package.json` — current package config (rename `name` field)
- `packages/core/package.json` — current package config (version bump only)
- `packages/cli/vite.config.ts` + `packages/core/vite.config.ts` — build configs for `vp pack`
- M001+M002 feature work — source material for CHANGELOG narrative

### Produces

- Both packages published on npm: `@driftless/core@1.0.0`, `@driftless/cli@1.0.0`
- Proven publish mechanics: `pnpm publish -r` with workspace resolution and topological ordering
- `CHANGELOG.md` at repo root with v1.0.0 entry
- Git tag `v1.0.0`
- Published package name (`@driftless/cli`) and npx invocation pattern (`npx @driftless/cli@latest init`) for downstream slices

## Open Questions

- **`bin` command name after rename:** The package becomes `@driftless/cli` but the bin command should still be `driftless` (already set in package.json as `"bin": { "driftless": "./dist/index.mjs" }`). Verify this works correctly when installed from a scoped package — the user should still type `driftless init`, not `@driftless/cli init`.
- **npm org pricing:** Free npm orgs allow unlimited public packages. Verify no paid tier is needed for publishing scoped public packages.
