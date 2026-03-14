---
id: S01
milestone: M001
status: ready
---

# S01: Monorepo scaffold + Vite+ toolchain — Context

## Goal

Scaffold the full monorepo shape with Vite+ toolchain so that `vp build`, `vp check`, and `vp test` all pass, cross-package imports resolve, and the CLI entry point runs.

## Why this Slice

S01 is the foundation everything else builds on. S02 (interactive CLI wizard) consumes the CLI entry point and core package types. Every subsequent slice assumes a working toolchain, workspace resolution, and build pipeline. Doing this first also retires the Vite+ maturity risk — if it can't handle our monorepo, we find out before writing any product code.

## Scope

### In Scope

- Full monorepo topology from day one: `packages/cli`, `packages/core`, `packages/action`, `apps/web`, `apps/docs` — all as workspace entries
- `packages/cli` and `packages/core` are real packages with source, exports, and cross-package wiring
- `packages/action`, `apps/web`, `apps/docs` are minimal valid stubs (package.json, tsconfig.json, `src/index.ts` exporting nothing) — enough for the workspace to resolve and `vp build` to succeed
- Vite+ configuration: `vp build`, `vp check`, `vp test` all pass across the workspace
- CLI entry point via `bin` field in `packages/cli/package.json` — running `driftless` with no args prints version, one-liner description, and a usage hint ("Run `driftless init` to get started")
- Cross-package import wiring: CLI imports from core, TypeScript resolves it, built output works
- Wiring smoke tests: one test in core proving exports work, one test in CLI proving the entry point runs
- TypeScript strict mode, ESM-first (per D004)
- pnpm workspaces root configuration

### Out of Scope

- Full help output or command routing beyond the no-args version print (that's S02)
- Any CLI command implementation (init, etc.) — S02
- CI/CD pipeline setup — M003
- README, LICENSE, contributing guide, or any OSS community files — M003
- npm publish configuration — M003
- Convention-setting test suites or test infrastructure beyond smoke tests
- Falling back from Vite+ to conventional tools — we are committed to Vite+ (see Constraints)

## Constraints

- **Vite+ commitment (D002):** We are betting on Vite+ as the unified toolchain. If it has gaps or rough edges for our monorepo shape, we work through them rather than falling back to turborepo + tsup + vitest + biome. Record workarounds as decisions.
- **pnpm workspaces (D003):** Monorepo uses pnpm workspaces with `packages/` and `apps/` directory convention.
- **ESM-first + TypeScript strict (D004, R035):** All packages are ESM with TypeScript strict mode enabled.
- **Version string:** CLI prints `driftless v0.0.0` — version can be hardcoded or read from package.json, but must be present in the no-args output.

## Integration Points

### Consumes

- Nothing — S01 is the first slice, leaf node in the dependency graph.

### Produces

- `packages/cli/src/index.ts` — CLI entry point with `main()` that prints version + usage hint
- `packages/cli/package.json` — `bin.driftless` pointing to built CLI entry point
- `packages/core/src/index.ts` — shared types and utilities barrel export (initially minimal: `DriftlessConfig`, `InitOptions`, `DocFramework` type stubs)
- Working Vite+ toolchain: `vp build`, `vp check`, `vp test` all functional across the workspace
- Full monorepo workspace topology with all five packages resolving

## Open Questions

- Whether Vite+ supports our exact five-package monorepo shape out of the box or needs configuration tuning — will discover during implementation. Current thinking: likely needs some `vp.config.ts` or workspace-level config, but Vite+ is designed for this.
- Exact Vite+ commands for workspace-wide operations vs per-package — need to verify `vp build` runs across all packages or requires `--filter`. Will resolve during research/planning.
