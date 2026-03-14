# S01: Monorepo scaffold + Vite+ toolchain — Research

**Date:** 2026-03-14

## Summary

S01 scaffolds the monorepo with pnpm workspaces and Vite+ (`vp`) as the unified toolchain — covering R033, R034, and R035. The primary risk is Vite+ maturity (v0.1.11, pre-1.0). Research confirms Vite+ has explicit monorepo support via `vp create vite:monorepo`, library packaging via `vp pack` (tsdown-based), and a unified `vp check` that runs Oxfmt + Oxlint + typecheck in one pass. The toolchain manages pnpm and node versions, so we don't need separate volta/fnm/nvm setup.

The approach is: install `vp` globally via the official curl installer, scaffold with `vp create vite:monorepo`, then manually add our specific packages (`packages/cli`, `packages/core`) as library packages. The scaffold gives us root-level config (pnpm-workspace.yaml with catalog, root vite.config.ts, root tsconfig.json). Each package gets its own `vite.config.ts` with `pack` config for library builds.

Key distinction discovered: `vp build` is for web applications (Vite dev server + Rolldown bundling). `vp pack` is for libraries and CLI executables (tsdown-based). Our packages/cli and packages/core are library packages, so they use `vp pack`, not `vp build`. The roadmap's acceptance criteria say "vp build passes" — but the correct command for library packages is `vp pack`. The root-level "build" script would be `vp run -r build` which runs each package's build script (which internally calls `vp pack`).

## Recommendation

1. Install `vp` globally via `curl -fsSL https://vite.plus | bash`
2. Use `vp create vite:monorepo --no-interactive` to scaffold the base structure, then customize
3. Add `packages/cli` and `packages/core` manually (or via `vp create vite:library` within the monorepo)
4. Configure each package's `vite.config.ts` with `pack` settings (ESM output, dts generation)
5. Root `vite.config.ts` configures shared lint/fmt/test settings
6. CLI package gets a `bin` entry pointing to built output
7. Verify: `vp check` passes, `vp test` passes (with at least one smoke test), `vp run -r build` packs all libraries
8. CLI entry point prints `driftless v0.0.0` when executed

Use the pnpm catalog pattern from Vite+ docs for centralized dependency versions. Internal workspace deps use `workspace:*` protocol.

## Don't Hand-Roll

| Problem                             | Existing Solution           | Why Use It                                                                            |
| ----------------------------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| Monorepo scaffolding                | `vp create vite:monorepo`   | Generates correct pnpm-workspace.yaml, catalog, overrides — matches Vite+ conventions |
| Library packaging (ESM + CJS + dts) | `vp pack` (tsdown)          | Zero-config library builds with declaration files, multiple formats                   |
| Linting + formatting                | `vp check` (Oxlint + Oxfmt) | Single command replaces ESLint + Prettier, Rust-speed                                 |
| Type checking                       | `vp check` (includes tsc)   | Integrated with lint/fmt in one pass                                                  |
| Testing                             | `vp test` (Vitest)          | Vite-native test runner, ESM/TS first-class                                           |
| Task orchestration                  | `vp run -r` (Vite Task)     | Dependency-aware recursive workspace task runner with caching                         |
| Package management                  | `vp install` / `vp add`     | Wraps pnpm with catalog support                                                       |

## Existing Code and Patterns

- Repo is empty — just `.gitignore` and `.gsd/`. No existing code to integrate with.
- pnpm 10.15.1 is available globally (via nvm, node v20.19.5)
- `vp` is NOT installed yet — must install during execution
- Reference skill at `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md` — not needed for S01 but relevant for S03/S04 genericization

## Constraints

- **Vite+ requires Node.js ≥22.12.0** — the monorepo snap test shows `"engines": { "node": ">=22.12.0" }`. Current global node is v20.19.5 (via nvm). Vite+ manages its own node version, so this should be handled by `vp` itself, but we need to verify `vp` can bootstrap a newer node.
- **Vite+ is v0.1.11 (pre-1.0)** — API surface may shift. Pin versions in catalog.
- **`vp pack` not `vp build`** for library packages — the roadmap says "vp build passes" but libraries use `vp pack`. Root script `vp run -r build` where each package's build script calls `vp pack` is the correct pattern.
- **ESM-first** — `"type": "module"` in all package.json files. CJS compat via `vp pack` format config.
- **pnpm catalog mode** — Vite+ monorepo template uses `catalogMode: prefer` with overrides aliasing `vite` and `vitest` to Vite+ core/test packages.
- **Root is private** — root package.json must be `"private": true` (standard monorepo pattern).

## Common Pitfalls

- **Using `vp build` for libraries** — `vp build` is the Vite application builder (dev server + Rolldown). Library packages must use `vp pack` (tsdown). Mixing these up produces wrong output or errors.
- **Missing pnpm overrides for vite/vitest** — Vite+ aliases `vite` and `vitest` imports to its own packages. Without the catalog overrides in pnpm-workspace.yaml, tools may resolve to vanilla vite/vitest and miss Vite+ features.
- **Node version mismatch** — Vite+ expects Node ≥22.12.0. If `vp` can't manage its own node installation, we may need to switch nvm to a newer node first.
- **Forgetting `dts: true` in pack config** — Without declaration file generation, downstream packages can't get TypeScript types from internal deps.
- **Workspace protocol in published packages** — `workspace:*` must be replaced with real versions at publish time. `vp pack` / pnpm publish handles this, but worth verifying.

## Open Risks

- **Vite+ `vp create vite:monorepo` output shape** — docs show the pattern but not the exact generated file tree. May need manual adjustment after scaffold. Will discover during execution.
- **`vp` installation in CI** — the `curl -fsSL https://vite.plus | bash` installer is for local dev. CI will need a different approach (or cache the binary). Not blocking for S01 but surfaces in M003.
- **Node ≥22.12.0 requirement** — if `vp` doesn't auto-manage node, we'll need to update nvm. Low risk since vp's docs say it manages runtime.
- **Alpha breakage** — at v0.1.11, breaking changes between patch versions are possible. Pin exact versions in catalog.
- **`vp check` with empty packages** — Oxlint/typecheck on near-empty source files may behave unexpectedly. Need at least minimal source to verify.

## Skills Discovered

| Technology      | Skill                                               | Status                                          |
| --------------- | --------------------------------------------------- | ----------------------------------------------- |
| Vite+           | none found                                          | No skill exists for Vite+ specifically          |
| Vite (general)  | antfu/skills@vite (9.4K installs)                   | Available — but targets vanilla Vite, not Vite+ |
| pnpm monorepo   | wshobson/agents@monorepo-management (4.4K installs) | Available — general monorepo patterns           |
| tsdown/CLI      | hairyf/skills@arch-tsdown-cli (89 installs)         | Available — tsdown CLI architecture             |
| tsdown monorepo | hairyf/skills@arch-tsdown-monorepo (278 installs)   | Available — tsdown monorepo patterns            |

The `hairyf/skills@arch-tsdown-monorepo` skill is the most directly relevant since `vp pack` is tsdown-based. Worth considering but low install count. Context7 docs for Vite+ are high quality (trust 8.6, 2006 snippets) and should be sufficient.

## Sources

- Vite+ monorepo scaffold pattern — pnpm-workspace.yaml with catalog, root package.json scripts (source: [vite-plus snap tests](https://github.com/voidzero-dev/vite-plus/blob/main/packages/cli/snap-tests-global/new-vite-monorepo/snap.txt))
- `vp pack` for library builds vs `vp build` for applications (source: [viteplus.dev/guide/pack](https://viteplus.dev/guide/pack))
- `vp check` combines fmt + lint + typecheck in one command (source: [viteplus.dev/guide/check](https://viteplus.dev/guide/check))
- `vp test` built on Vitest, does NOT default to watch mode (source: [viteplus.dev/guide/test](https://viteplus.dev/guide/test))
- `vp run -r build` for recursive workspace builds with auto-pruning (source: [viteplus.dev/guide/run](https://viteplus.dev/guide/run))
- `vp create vite:monorepo` scaffolds base structure (source: [viteplus.dev/guide/create](https://viteplus.dev/guide/create))
- Installation via `curl -fsSL https://vite.plus | bash` (source: [viteplus.dev/guide](https://viteplus.dev/guide))
- `defineConfig` from `vite-plus` for unified config including pack, test, lint, fmt (source: [vite-plus README](https://github.com/voidzero-dev/vite-plus/blob/main/packages/cli/README.md))
- Vite+ v0.1.11 current on npm, packages in sync (source: npm registry, checked 2026-03-14)
- Node.js ≥22.12.0 engine requirement from monorepo template (source: vite-plus snap tests)
