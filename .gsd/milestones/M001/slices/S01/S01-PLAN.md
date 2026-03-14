# S01: Monorepo scaffold + Vite+ toolchain

**Goal:** A working pnpm monorepo with Vite+ (`vp`) as the unified toolchain — two library packages (`packages/cli`, `packages/core`), all toolchain commands operational, and real source code exercising the boundary contract to S02.
**Demo:** `vp run -r build` packs both libraries, `vp check` passes (lint + format + typecheck), `vp test` passes with real assertions, and `node packages/cli/dist/index.mjs` prints `driftless v0.0.0`.

## Must-Haves

- pnpm workspaces with `packages/cli` and `packages/core` (R034)
- Vite+ toolchain: `vp pack` builds both packages, `vp check` passes, `vp test` runs tests (R033)
- TypeScript strict mode, ESM-first (`"type": "module"`) in all packages (R035)
- CLI entry point (`packages/cli/src/index.ts`) exports `main()` and prints `driftless v0.0.0` when executed
- Core package (`packages/core/src/index.ts`) exports `DriftlessConfig`, `InitOptions`, `DocFramework` types
- `packages/cli/package.json` has `bin.driftless` pointing to built output
- At least one smoke test per package proving the toolchain end-to-end

## Proof Level

- This slice proves: operational (toolchain works end-to-end on real packages)
- Real runtime required: yes (vp commands must execute successfully)
- Human/UAT required: no

## Verification

- `vp run -r build` exits 0 — both packages produce dist/ output with declaration files
- `vp check` exits 0 — format, lint, and typecheck all pass
- `vp test` exits 0 — smoke tests assert on CLI output and core type exports
- `node packages/cli/dist/index.mjs` prints output containing `driftless v0.0.0`
- `packages/core/dist/index.d.mts` contains exported types `DriftlessConfig`, `InitOptions`, `DocFramework`
- **Diagnostic check:** `vp check` on intentionally malformed input produces categorized, actionable error output (not silent failure)

## Observability / Diagnostics

- **Build output inspection:** `ls packages/*/dist/` shows produced artifacts; absence of `.mjs` or `.d.mts` files indicates build failure
- **Toolchain version surface:** `vp --version` and `node --version` — mismatch from expected values signals environment drift
- **Failure visibility:** `vp check` exits non-zero with structured output (format errors, lint violations, type errors) — each category is independently identifiable in output
- **Workspace topology:** `pnpm ls -r` dumps the workspace dependency graph — missing or phantom packages visible immediately
- **Build diagnostics:** `vp run -r build` prints per-package success/failure with timing; failed packages show tsdown error output with file/line context
- **Test diagnostics:** `vp test` prints Vitest reporter output with pass/fail counts and failure stack traces
- **Redaction:** No secrets involved in this slice — all config is committed source

## Integration Closure

- Upstream surfaces consumed: none (first slice)
- New wiring introduced in this slice: monorepo workspace protocol (`workspace:*`), pnpm catalog for centralized deps, Vite+ pack config for library builds, CLI bin entry point
- What remains before the milestone is truly usable end-to-end: S02 (wizard), S03 (agent), S04 (skills), S05 (rollback/dry-run)

## Tasks

- [x] **T01: Install Vite+, scaffold monorepo, configure library packages** `est:45m`
  - Why: The base monorepo structure and Vite+ toolchain must exist before any source code. This task retires the Vite+ maturity risk by proving `vp` installs, scaffolds, and builds on our system.
  - Files: `pnpm-workspace.yaml`, `package.json`, `vite.config.ts`, `tsconfig.json`, `packages/cli/package.json`, `packages/cli/vite.config.ts`, `packages/cli/tsconfig.json`, `packages/core/package.json`, `packages/core/vite.config.ts`, `packages/core/tsconfig.json`
  - Do: Install `vp` globally, scaffold with `vp create vite:monorepo` (handle Node ≥22.12.0 requirement), add both packages with pack config (ESM + dts), configure pnpm catalog with pinned Vite+ versions, add minimal placeholder source so `vp check` and `vp pack` can run. If `vp create` output doesn't match expectations, manually create the structure following Vite+ conventions from research.
  - Verify: `vp pack` succeeds in both packages, `vp check` exits 0, `pnpm ls -r` shows correct workspace topology
  - Done when: Both packages build with declaration files and all Vite+ toolchain commands execute without error

- [x] **T02: Wire CLI entry point, core types, smoke tests, and verify full toolchain** `est:30m`
  - Why: S02 depends on a working CLI entry point with `main()` export and core types (`DriftlessConfig`, `InitOptions`, `DocFramework`). This task delivers the boundary contract and proves it with tests.
  - Files: `packages/cli/src/index.ts`, `packages/core/src/index.ts`, `packages/core/src/types.ts`, `packages/cli/test/cli.test.ts`, `packages/core/test/types.test.ts`
  - Do: Implement CLI entry point that reads version from package.json and prints `driftless v0.0.0`. Define core types in `packages/core/src/types.ts` and re-export from index. Write smoke tests: CLI test asserts `main()` produces version output, core test asserts type exports exist and are structurally correct. Wire `bin.driftless` in CLI package.json to built output. Update .gitignore for dist/ directories.
  - Verify: `vp test` passes, `vp run -r build` succeeds, `node packages/cli/dist/index.mjs` prints version, `vp check` still passes
  - Done when: All five slice verification checks pass — build, check, test, CLI execution, and type declarations

## Files Likely Touched

- `pnpm-workspace.yaml`
- `package.json` (root)
- `vite.config.ts` (root)
- `tsconfig.json` (root)
- `packages/cli/package.json`
- `packages/cli/vite.config.ts`
- `packages/cli/tsconfig.json`
- `packages/cli/src/index.ts`
- `packages/cli/test/cli.test.ts`
- `packages/core/package.json`
- `packages/core/vite.config.ts`
- `packages/core/tsconfig.json`
- `packages/core/src/index.ts`
- `packages/core/src/types.ts`
- `packages/core/test/types.test.ts`
- `.gitignore`
