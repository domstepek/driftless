---
estimated_steps: 7
estimated_files: 10
---

# T01: Install Vite+, scaffold monorepo, configure library packages

**Slice:** S01 — Monorepo scaffold + Vite+ toolchain
**Milestone:** M001

## Description

Install Vite+ globally, scaffold the monorepo base structure, and configure two library packages (`packages/cli`, `packages/core`) with pack config for ESM + declaration file output. This task retires the primary risk: does Vite+ actually work for our monorepo shape?

Key research findings to apply:

- `vp pack` (tsdown-based) for libraries, NOT `vp build` (Vite app builder)
- Node ≥22.12.0 required — `vp` should manage this, but verify and fall back to nvm if needed
- pnpm catalog mode with overrides aliasing `vite` and `vitest` to Vite+ packages
- `vp create vite:monorepo` scaffold shape is not fully documented — may need manual adjustment

## Steps

1. **Ensure Node ≥22.12.0** — check if `vp` manages node automatically. If not, use nvm to install and switch to Node 22.x LTS. Verify with `node --version`.
2. **Install Vite+** — run `curl -fsSL https://vite.plus | bash` and verify `vp --version` works.
3. **Scaffold monorepo** — run `vp create vite:monorepo` in the project root (or a temp dir and move files in, since repo already has .gsd/). Inspect generated structure. If `--no-interactive` flag exists, use it.
4. **Configure root** — ensure `pnpm-workspace.yaml` includes `packages/*` glob, has catalog with pinned Vite+ versions, and proper overrides. Root `package.json` must be `"private": true` with scripts for build (`vp run -r build`), check (`vp check`), test (`vp test`). Root `tsconfig.json` with strict mode.
5. **Add packages/cli** — create `package.json` (name: `driftless`, `"type": "module"`, workspace dep on `@driftless/core`), `vite.config.ts` with pack config (ESM output, dts: true), `tsconfig.json` extending root. Add minimal `src/index.ts` placeholder (e.g. `export function main() {}`).
6. **Add packages/core** — create `package.json` (name: `@driftless/core`, `"type": "module"`), `vite.config.ts` with pack config, `tsconfig.json` extending root. Add minimal `src/index.ts` placeholder.
7. **Verify toolchain** — run `vp install` (or `pnpm install`), then `vp pack` in each package (or `vp run -r build`), then `vp check`. Fix any issues until all commands exit 0.

## Must-Haves

- [ ] Vite+ (`vp`) installed and functional
- [ ] Node ≥22.12.0 active for the project
- [ ] pnpm-workspace.yaml with catalog and both packages
- [ ] Both packages have pack config producing ESM + declaration files
- [ ] `vp check` passes (format + lint + typecheck)
- [ ] `vp run -r build` exits 0 with dist/ output in both packages
- [ ] TypeScript strict mode enabled
- [ ] ESM-first (`"type": "module"`) in all package.json files

## Verification

- `vp --version` prints version ≥0.1.11
- `pnpm ls -r` shows `driftless` and `@driftless/core` in workspace
- `vp run -r build` exits 0 — both packages have `dist/` with `.mjs` and `.d.mts` files
- `vp check` exits 0

## Observability Impact

- **New surfaces:** `vp --version` (toolchain health), `pnpm ls -r` (workspace topology), `vp check` (lint/fmt/type errors with categorized output), `vp run -r build` (per-package build status with timing)
- **Inspection pattern:** Future agents verify this task by running `vp --version` (≥0.1.11), `ls packages/*/dist/*.mjs` (built output exists), and `vp check` (exits 0)
- **Failure state:** Build failures produce tsdown error output with file paths and line numbers. `vp check` failures are categorized into format/lint/type sections. Both exit non-zero.

## Inputs

- Research findings from S01-RESEARCH.md (Vite+ conventions, pack vs build distinction, catalog pattern)
- Empty repo with only `.gitignore` and `.gsd/`

## Expected Output

- Root config files: `pnpm-workspace.yaml`, `package.json`, `vite.config.ts`, `tsconfig.json`
- `packages/cli/` with package.json, vite.config.ts, tsconfig.json, src/index.ts (placeholder)
- `packages/core/` with package.json, vite.config.ts, tsconfig.json, src/index.ts (placeholder)
- `dist/` directories in both packages with built output
- All Vite+ toolchain commands operational
