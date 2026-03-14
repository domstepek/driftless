---
estimated_steps: 5
estimated_files: 7
---

# T02: Wire CLI entry point, core types, smoke tests, and verify full toolchain

**Slice:** S01 — Monorepo scaffold + Vite+ toolchain
**Milestone:** M001

## Description

Replace placeholder source with real implementations: CLI entry point that prints `driftless v0.0.0`, core types defining the S02 boundary contract (`DriftlessConfig`, `InitOptions`, `DocFramework`), and smoke tests for both packages. This task delivers the boundary contract that S02 depends on and proves the entire toolchain end-to-end.

## Steps

1. **Implement core types** — create `packages/core/src/types.ts` with `DriftlessConfig` interface (testPaths, outputDir, docFramework, capabilities, skillsDir), `InitOptions` interface (dryRun, verbose, cwd), and `DocFramework` type union (`'plain-md' | 'fumadocs' | 'docusaurus'`). Re-export all from `packages/core/src/index.ts`.
2. **Implement CLI entry point** — update `packages/cli/src/index.ts` to import version from package.json (using createRequire or import assertion), export `main()` that prints `driftless v{version}` to stdout, add shebang line. Configure `bin.driftless` in `packages/cli/package.json` pointing to `dist/index.mjs`.
3. **Write smoke tests** — create `packages/core/test/types.test.ts` asserting type exports exist and `DocFramework` values are correct. Create `packages/cli/test/cli.test.ts` asserting `main()` produces output containing the version string.
4. **Update .gitignore** — add `dist/`, `node_modules/`, and any Vite+ cache directories.
5. **Run full verification** — `vp run -r build` (pack both), `vp check` (lint+fmt+typecheck), `vp test` (smoke tests), `node packages/cli/dist/index.mjs` (prints version). Fix any issues until all pass.

## Must-Haves

- [ ] `packages/cli/src/index.ts` exports `main()` that prints version to stdout
- [ ] `packages/core/src/types.ts` exports `DriftlessConfig`, `InitOptions`, `DocFramework`
- [ ] `packages/core/src/index.ts` re-exports all types
- [ ] `bin.driftless` in CLI package.json points to built entry point
- [ ] Smoke test for CLI verifies version output
- [ ] Smoke test for core verifies type exports
- [ ] `vp test` passes with all tests green
- [ ] `node packages/cli/dist/index.mjs` prints `driftless v0.0.0`

## Verification

- `vp test` exits 0 with at least 2 passing tests
- `vp run -r build` exits 0
- `vp check` exits 0
- `node packages/cli/dist/index.mjs` output contains `driftless v0.0.0`
- `grep -l 'DriftlessConfig' packages/core/dist/index.d.mts` finds the declaration file

## Inputs

- Working monorepo scaffold from T01 (root configs, package structure, toolchain commands)
- S01→S02 boundary contract (from roadmap): `main()`, `DriftlessConfig`, `InitOptions`, `DocFramework`

## Expected Output

- `packages/cli/src/index.ts` — CLI entry point with `main()` and version printing
- `packages/core/src/types.ts` — type definitions for S02 boundary
- `packages/core/src/index.ts` — re-exports
- `packages/cli/test/cli.test.ts` — CLI smoke test
- `packages/core/test/types.test.ts` — core types smoke test
- Updated `.gitignore` with dist/ and cache entries
- All slice verification checks passing

## Observability Impact

- **CLI version surface:** `node packages/cli/dist/index.mjs` prints `driftless v{version}` — confirms the CLI entry point is wired and the package.json version is reachable at runtime. Absence of output or wrong version string signals broken import resolution.
- **Type export verification:** `grep -l 'DriftlessConfig' packages/core/dist/index.d.mts` confirms the S02 boundary contract is present in build output. Missing types indicate a re-export or build configuration issue.
- **Test diagnostics:** `npx vp test` prints Vitest reporter output with pass/fail counts. At least 2 passing tests expected (one per package). Failure stack traces provide file/line context.
- **Failure state visibility:** If `main()` throws, the error message includes import resolution context (e.g., missing package.json read). Type tests exercise the contract shape directly — a missing or renamed export produces a compile-time error visible in `npx vp check` output.
