---
id: T01
parent: S01
milestone: M001
provides:
  - Vite+ (vp v0.1.11) installed globally and operational
  - pnpm monorepo with packages/cli and packages/core
  - Both packages build with vp pack producing ESM + declaration files
  - vp check passes (format + lint + typecheck)
key_files:
  - pnpm-workspace.yaml
  - package.json
  - vite.config.ts
  - tsconfig.json
  - packages/cli/package.json
  - packages/cli/vite.config.ts
  - packages/cli/tsconfig.json
  - packages/cli/src/index.ts
  - packages/core/package.json
  - packages/core/vite.config.ts
  - packages/core/tsconfig.json
  - packages/core/src/index.ts
  - .nvmrc
key_decisions:
  - D018: npm global install for vp (curl installer returns 403)
  - D019: dts:true without tsgo (tsgo fails resolving @typescript/native-preview from global vp)
  - D020: Independent per-package tsconfigs matching Vite+ scaffold convention
patterns_established:
  - pnpm catalog mode with pinned Vite+ 0.1.11 and overrides aliasing vite/vitest
  - vp pack config in vite.config.ts using defineConfig from vite-plus
  - Oxfmt formatting convention (semicolons, double quotes) via vp check --fix
  - Package exports field pointing to dist/index.mjs with types at dist/index.d.mts
observability_surfaces:
  - vp --version for toolchain health
  - pnpm ls -r for workspace topology
  - vp check for categorized format/lint/type errors
  - vp run -r build for per-package build status with timing
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Install Vite+, scaffold monorepo, configure library packages

**Scaffolded pnpm monorepo with Vite+ toolchain — both library packages build with declaration files, all toolchain commands pass.**

## What Happened

Upgraded Node from v20.19.5 to v22.22.1 (LTS Jod) via nvm. Installed Vite+ v0.1.11 globally via `npm install -g vite-plus` after the official curl installer returned HTTP 403 (D018).

Scaffolded a reference monorepo with `vp create vite:monorepo` in a temp directory to learn Vite+ conventions (catalog mode, overrides, pack config shape, tsconfig patterns). Then created the driftless monorepo structure manually based on those conventions:

- Root: pnpm-workspace.yaml with catalog pinning Vite+ 0.1.11, overrides aliasing vite/vitest to Vite+ packages. Root vite.config.ts with type-aware lint. Root tsconfig.json with strict mode.
- `packages/core`: @driftless/core library package with vp pack config (dts:true, exports:true). Placeholder `src/index.ts` exporting a function.
- `packages/cli`: driftless CLI package with workspace dependency on @driftless/core. Same pack config. Placeholder `src/index.ts` exporting `main()`.

Used `dts: true` instead of the scaffold's `dts: { tsgo: true }` — the tsgo option requires `@typescript/native-preview` which can't be resolved from the global vp installation (D019).

Ran `vp check --fix` to apply Oxfmt formatting (semicolons, double quotes). Then verified `vp check` passes clean.

## Verification

- ✅ `vp --version` → v0.1.11
- ✅ `node --version` → v22.22.1 (≥22.12.0)
- ✅ `pnpm ls -r` shows driftless-monorepo (root), driftless (cli), @driftless/core with correct topology
- ✅ `vp run -r build` exits 0 — both packages produce dist/index.mjs and dist/index.d.mts
- ✅ `vp check` exits 0 — format, lint, and typecheck all pass
- ✅ All package.json files have `"type": "module"`
- ✅ All tsconfig.json files have `"strict": true`

### Slice-level verification (partial — intermediate task):

- ✅ `vp run -r build` exits 0 with dist/ output in both packages
- ✅ `vp check` exits 0
- ❌ `vp test` exits 1 — no test files yet (T02)
- ⚠️ `node packages/cli/dist/index.mjs` exits 0 but no output — main() exported but not called (T02 wires entry point)
- ⚠️ `packages/core/dist/index.d.mts` has placeholder — DriftlessConfig/InitOptions/DocFramework types come in T02

## Diagnostics

- `vp --version` confirms toolchain health (expect v0.1.11)
- `pnpm ls -r` shows workspace topology — missing or phantom packages visible
- `vp check` produces categorized output: format errors, lint violations, type errors separately
- `vp run -r build` shows per-package build timing and tsdown error output on failure
- `ls packages/*/dist/*.mjs packages/*/dist/*.d.mts` confirms build artifacts exist

## Deviations

- **Curl installer → npm global install** (D018): `curl -fsSL https://vite.plus | bash` returned 403. Used `npm install -g vite-plus@0.1.11` instead. Functionally equivalent.
- **Independent tsconfigs instead of extending root** (D020): Task plan said "tsconfig.json extending root" but the Vite+ scaffold uses independent configs per package. Root uses nodenext/nodenext for root-level files, packages use preserve/bundler for tsdown. Followed the scaffold convention since these serve different purposes.
- **Added .bg-shell/ to .gitignore**: Agent infrastructure directory was triggering Oxfmt formatting check. Not part of project source.

## Known Issues

- The `curl -fsSL https://vite.plus | bash` installer returns HTTP 403 as of 2026-03-14. CI setup should use `npm install -g vite-plus` or `pnpm add -g vite-plus`.
- The scaffold's default `tsgo: true` dts config fails when `@typescript/native-preview` is resolved from the global vp installation rather than the local node_modules. Use plain `dts: true`.

## Files Created/Modified

- `pnpm-workspace.yaml` — workspace config with catalog, overrides, and packages/\* glob
- `package.json` — root package with build/check/test scripts, private:true, ESM, engines ≥22.12.0
- `vite.config.ts` — root config with type-aware lint
- `tsconfig.json` — root strict TypeScript config
- `packages/core/package.json` — @driftless/core library package
- `packages/core/vite.config.ts` — pack config with dts:true
- `packages/core/tsconfig.json` — strict TypeScript for library
- `packages/core/src/index.ts` — placeholder export
- `packages/cli/package.json` — driftless CLI package with workspace dep on core
- `packages/cli/vite.config.ts` — pack config with dts:true
- `packages/cli/tsconfig.json` — strict TypeScript for library
- `packages/cli/src/index.ts` — placeholder main() export
- `.nvmrc` — pins Node 22 for the project
- `.gitignore` — added .bg-shell/, dist-ssr/, \*.local
