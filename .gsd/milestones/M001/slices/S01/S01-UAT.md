# S01: Monorepo scaffold + Vite+ toolchain — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: live-runtime
- Why this mode is sufficient: This slice is pure toolchain and scaffolding — all verification is command output and file existence. No UI, no human experience judgment needed.

## Preconditions

- Node ≥22.12.0 available (`nvm use 22` or equivalent)
- pnpm installed (`npm install -g pnpm`)
- Vite+ installed globally (`npm install -g vite-plus@0.1.11`)
- `pnpm install` has been run in the repo root
- No uncommitted changes that would interfere with build output

## Smoke Test

Run `node packages/cli/dist/index.mjs` — should print `driftless v0.0.0`. If it does, the entire build pipeline (TypeScript → tsdown → ESM output → runtime execution) is working.

## Test Cases

### 1. Both packages build with declaration files

1. Run `npx vp run -r build`
2. **Expected:** Exit code 0. Output shows both `~/packages/core$ vp pack` and `~/packages/cli$ vp pack` completing successfully.
3. Run `ls packages/core/dist/index.mjs packages/core/dist/index.d.mts`
4. **Expected:** Both files exist.
5. Run `ls packages/cli/dist/index.mjs packages/cli/dist/index.d.mts`
6. **Expected:** Both files exist.

### 2. Format and lint checks pass

1. Run `npx vp check`
2. **Expected:** Exit code 0. Output shows "All N files are correctly formatted" and "Found no warnings or lint errors".
3. No warnings, no errors, no skipped files.

### 3. All tests pass

1. Run `npx vp test`
2. **Expected:** Exit code 0. Output shows 5 tests passing across 2 test files (`packages/core/test/types.test.ts` and `packages/cli/test/cli.test.ts`).

### 4. CLI entry point prints version

1. Run `node packages/cli/dist/index.mjs`
2. **Expected:** Output is exactly `driftless v0.0.0` (with newline).
3. Exit code 0.

### 5. Core type declarations exported correctly

1. Run `grep 'DriftlessConfig' packages/core/dist/index.d.mts`
2. **Expected:** At least one match showing the type is exported.
3. Run `grep 'InitOptions' packages/core/dist/index.d.mts`
4. **Expected:** At least one match.
5. Run `grep 'DocFramework' packages/core/dist/index.d.mts`
6. **Expected:** At least one match.

### 6. Workspace topology is correct

1. Run `pnpm ls -r`
2. **Expected:** Shows three projects: `driftless-monorepo` (root, private), `driftless` (packages/cli), `@driftless/core` (packages/core).
3. `driftless` should show `@driftless/core` as a dependency via `link:../core`.

### 7. bin field is wired correctly

1. Run `node -e "const pkg = require('./packages/cli/package.json'); console.log(pkg.bin?.driftless)"`
2. **Expected:** Output is `dist/index.mjs`.

## Edge Cases

### Diagnostic output on malformed input

1. Create a temp file with invalid TypeScript: `echo "bad syntax {{{" > /tmp/test-bad.ts`
2. Run `npx vp fmt --check /tmp/test-bad.ts`
3. **Expected:** Non-zero exit code with a categorized error message showing the file and the parse error. Should NOT be silent failure.

### Build from clean state

1. Run `rm -rf packages/*/dist`
2. Run `npx vp run -r build`
3. **Expected:** Both packages rebuild successfully. All dist/ files are recreated.

### Tests fail on broken type contract

1. Temporarily rename `packages/core/src/types.ts` to `types.bak`
2. Run `npx vp test`
3. **Expected:** Tests fail with clear import/resolution errors.
4. Restore: `mv packages/core/src/types.bak packages/core/src/types.ts`

## Failure Signals

- `npx vp run -r build` exits non-zero — tsdown compilation failure, check error output for file/line
- `npx vp check` exits non-zero — formatting or lint violations present
- `npx vp test` exits non-zero — test assertions failing, check Vitest output
- `node packages/cli/dist/index.mjs` produces no output — `main()` not being invoked or `createRequire` failing
- `node packages/cli/dist/index.mjs` prints wrong version — package.json version mismatch
- `packages/core/dist/index.d.mts` missing types — tsdown declaration generation failed or types not re-exported from index

## Requirements Proved By This UAT

- R033 (Vite+ as unified toolchain) — test cases 1-3 prove build, check, and test all work via vp
- R034 (pnpm workspaces) — test case 6 proves workspace topology and workspace protocol linking
- R035 (TypeScript strict + ESM-first) — test cases 1 and 4 prove ESM output works at runtime; strict mode is verified by successful typecheck during build

## Not Proven By This UAT

- CLI command routing (S02 scope — currently just prints version)
- Interactive prompts (S02 scope)
- Any doc generation or agent interaction (S03 scope)
- `npx driftless init` working as an installed package (requires npm publish or `npm link`)

## Notes for Tester

- The `engines` field requires Node ≥22.12.0. If your default node is older, run `nvm use 22` first.
- The `pnpm ls -r` output may show an "Unsupported engine" warning if your current Node is <22.12.0 — this is expected and doesn't affect functionality.
- `vp check` only covers format + lint, not typecheck. This is a known limitation of the current Vite+ integration.
