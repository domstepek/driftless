---
estimated_steps: 8
estimated_files: 13
---

# T01: Scaffold Next.js + fumadocs app in monorepo

**Slice:** S01 — Landing page + docs site deployed on Vercel
**Milestone:** M004

## Description

Integrate a Next.js application with fumadocs into the existing Vite+ pnpm monorepo. This is the highest-risk task — introducing a second build tool (Next.js alongside `vp pack`) and a docs framework (fumadocs) into a workspace that currently only knows about library packages. The task produces the complete fumadocs content pipeline and a working Quick Start docs page, proving the integration works before any design work begins.

## Steps

1. Expand `pnpm-workspace.yaml` to include `apps/*` alongside existing `packages/*`
2. Create `apps/web/package.json` with dependencies: `next`, `react`, `react-dom`, `fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`. Set `"build": "next build"` script. Use `"private": true`.
3. Create `apps/web/tsconfig.json` configured for Next.js (jsx: preserve, module: esnext, paths aliases `@/*` → `./`). Do NOT extend root tsconfig — per D020, packages use independent configs.
4. Create `apps/web/next.config.mjs` wrapping config with `createMDX()` from `fumadocs-mdx/next`
5. Create `apps/web/source.config.ts` with `defineDocs({ dir: 'content/docs' })` and `defineConfig()`
6. Create `apps/web/lib/source.ts` with fumadocs-core loader: `baseUrl: '/docs'`, `source: docs.toFumadocsSource()`
7. Create `apps/web/lib/layout.shared.tsx` exporting `baseOptions()` with nav title "driftless" and GitHub link
8. Create app directory structure:
   - `app/layout.tsx` — root layout with RootProvider from fumadocs-ui, import globals.css and fumadocs-ui/style.css
   - `app/globals.css` — Tailwind v4 imports: `@import 'tailwindcss'`, `@import 'fumadocs-ui/css/neutral.css'`, `@import 'fumadocs-ui/css/preset.css'`, `@source` directive for fumadocs-ui dist
   - `app/(home)/layout.tsx` — HomeLayout wrapper with baseOptions
   - `app/(home)/page.tsx` — placeholder landing page (T02 will replace)
   - `app/docs/layout.tsx` — DocsLayout with sidebar from source.getPageTree()
   - `app/docs/[[...slug]]/page.tsx` — DocsPage rendering MDX content with TOC
   - `app/api/search/route.ts` — search handler via createFromSource(source)
9. Create `apps/web/content/docs/index.mdx` — Quick Start page with title, description, basic install instructions
10. Create `apps/web/postcss.config.mjs` with `@tailwindcss/postcss` plugin
11. Run `pnpm install` to resolve the expanded workspace
12. Configure oxlint/oxfmt to handle or ignore `apps/web` if `vp check` fails on JSX/TSX or Next.js patterns
13. Verify: `cd apps/web && pnpm next build` succeeds, `pnpm run test` at root → 268 tests, `pnpm run check` passes

## Must-Haves

- [ ] `pnpm-workspace.yaml` includes both `packages/*` and `apps/*`
- [ ] `apps/web` is a valid pnpm workspace package with Next.js + fumadocs deps
- [ ] `next build` completes successfully in `apps/web`
- [ ] Docs route `/docs` renders Quick Start page with fumadocs DocsLayout (sidebar, TOC)
- [ ] Search route handler exists at `app/api/search/route.ts`
- [ ] Tailwind v4 configured with fumadocs-ui CSS preset
- [ ] `pnpm run test` at monorepo root → 268 tests pass (no regressions)
- [ ] `pnpm run check` passes (oxlint/oxfmt tolerates or ignores `apps/web`)

## Verification

- `pnpm install` succeeds with expanded workspace
- `cd apps/web && pnpm next build` exits 0 with no errors
- `cd ~/Personal\ Repos/driftless && pnpm run test` → 268 tests pass
- `cd ~/Personal\ Repos/driftless && pnpm run check` exits 0
- `cd apps/web && pnpm next dev` → `/docs` shows Quick Start page with sidebar and search

## Observability Impact

- **Build signal:** `next build` exit code + stdout/stderr gives full error context (file, line, message) on failure. No custom instrumentation needed — Next.js surfaces errors natively.
- **Runtime inspection:** `next dev` serves the app locally; `/docs` route proves fumadocs pipeline works end-to-end (source.config → loader → MDX → rendered page).
- **Failure visibility:** Missing MDX content → fumadocs `notFound()` (404 with clear route). Bad imports → Next.js build error with module path. Tailwind misconfiguration → unstyled page (visually obvious).
- **Future agent access:** Run `cd apps/web && pnpm next build` to verify scaffold integrity. Check `/docs` route in browser to confirm content pipeline.

## Inputs

- `pnpm-workspace.yaml` — current workspace config (packages/* only)
- `package.json` (root) — monorepo scripts using `vp run -r build`
- `.oxlintrc.json`, `.oxfmtrc.json` — current lint/format config
- fumadocs documentation — source.config.ts, lib/source.ts, layout patterns, Tailwind v4 CSS imports

## Expected Output

- `pnpm-workspace.yaml` — expanded to include `apps/*`
- `apps/web/` — complete Next.js + fumadocs app scaffold (package.json, tsconfig, next.config, source config, lib, app routes, content)
- `apps/web/content/docs/index.mdx` — Quick Start docs page
- `.oxlintrc.json` or `.oxfmtrc.json` — updated ignore patterns if needed
- Proof: `next build` succeeds, 268 tests pass, `vp check` passes
