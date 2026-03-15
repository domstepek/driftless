---
id: T01
parent: S01
milestone: M004
provides:
  - Next.js + fumadocs app scaffold in apps/web
  - fumadocs content pipeline (source.config → loader → MDX → rendered page)
  - Quick Start docs page at /docs
  - Search route handler at /api/search
  - Placeholder landing page at /
  - Tailwind v4 with fumadocs-ui CSS preset
key_files:
  - apps/web/lib/source.ts
  - apps/web/source.config.ts
  - apps/web/app/docs/[[...slug]]/page.tsx
  - apps/web/app/api/search/route.ts
  - apps/web/content/docs/index.mdx
key_decisions:
  - "D059: fumadocs-mdx Source.files compatibility bridge — lib/source.ts calls files() as function since fumadocs-core v15.8 expects array"
  - "D060: page.data typed as any for body/toc — fumadocs-mdx provides these at runtime but types don't carry through"
patterns_established:
  - "fumadocs route groups: app/(home) for landing, app/docs for docs"
  - "lib/layout.shared.tsx exports baseOptions() used by both HomeLayout and DocsLayout"
  - "oxlint ignores next-env.d.ts and .source/ generated files"
observability_surfaces:
  - "`cd apps/web && pnpm next build` — exits 0 on success, actionable error with file path on failure"
  - "`pnpm next dev --port 3456` → /docs renders Quick Start with sidebar and TOC"
duration: 45m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Scaffold Next.js + fumadocs app in monorepo

**Integrated Next.js 15 + fumadocs-mdx v11 + fumadocs-ui v15 into the Vite+ pnpm monorepo with full docs pipeline, search, and Tailwind v4.**

## What Happened

Expanded `pnpm-workspace.yaml` to include `apps/*` alongside `packages/*`. Created `apps/web` with Next.js 15.5, fumadocs-core/mdx/ui, Tailwind CSS v4, and PostCSS.

The main challenge was fumadocs version compatibility:
1. **`fumadocs-mdx:collections/server` import scheme** — webpack resolves import namespaces before tsconfig aliases. The docs recommend renaming to `collections/*`, but for fumadocs-mdx v11 the simpler pattern is importing from `@/.source` (the generated directory).
2. **`Source.files` type mismatch** — fumadocs-mdx v11 returns `files` as a lazy function `() => VirtualFile[]`, but fumadocs-core v15.8 expects a plain array. Fixed with a runtime bridge in `lib/source.ts` that calls the function if needed (D059).
3. **MDX page data types** — `body` and `toc` exist at runtime (injected by fumadocs-mdx) but the generic type chain loses them. Cast `page.data as any` in the docs page component (D060).

All scaffold files created: next.config.mjs with `createMDX()`, source.config.ts with `defineDocs`, fumadocs-core loader, shared layout options, root/home/docs layouts, docs catch-all page, search route handler, globals.css with Tailwind v4 + fumadocs-ui CSS imports, Quick Start MDX content.

Configured oxlint/oxfmt to ignore Next.js generated files (next-env.d.ts, .source/, .next/). Added `esbuild` and `sharp` to `pnpm.onlyBuiltDependencies` for Next.js build support.

## Verification

- ✅ `pnpm install` succeeds with expanded workspace (268 new packages for web app)
- ✅ `cd apps/web && pnpm next build` exits 0 — all 6 static pages generated
- ✅ `pnpm run test` at monorepo root → 268 tests pass (zero regressions)
- ✅ `pnpm run check` passes — 69 files formatted, 43 files linted, zero errors
- ✅ `pnpm next dev` → `/docs` renders Quick Start page with sidebar, TOC, search button, dark mode toggle
- ✅ `/` renders placeholder landing page with nav, "Get Started" → /docs link, GitHub link
- ✅ "Get Started" link navigates to /docs (cross-link verified in browser)
- ✅ Broken MDX file → build fails with actionable error (file path + error message)

### Slice-Level Verification Status

- ✅ `cd apps/web && pnpm next build` succeeds
- ✅ `pnpm run test` → 268 tests pass
- ✅ `pnpm run check` passes
- ⏳ Vercel URL loads landing page — T03 scope
- ⏳ Vercel URL loads docs — T03 scope
- ✅ Landing page → docs link works (locally verified)
- ⏳ OG meta tags present — T02 scope
- ✅ Build error on broken MDX produces actionable output

## Diagnostics

- **Build verification:** `cd apps/web && pnpm next build` — success = 0 exit code with route table output, failure = error with file path and description
- **Runtime verification:** `cd apps/web && pnpm next dev --port 3456` — visit `/docs` for docs, `/` for landing
- **Content pipeline:** `.source/index.ts` is auto-generated from `content/docs/*.mdx` via `source.config.ts` — check this file to verify MDX processing
- **Search:** `/api/search` route handler exists and builds — functional search verification in T02/T03

## Deviations

- Plan referenced `fumadocs-mdx:collections/server` import and `createMDXSource` from `fumadocs-mdx/runtime/next` — both are wrong for fumadocs-mdx v11. Used `@/.source` import with `docs.toFumadocsSource()` + compatibility bridge instead.
- Plan referenced `DocsPage`/`DocsBody`/`DocsTitle`/`DocsDescription` from `fumadocs-ui/layouts/docs/page` — in fumadocs-ui v15 these are at `fumadocs-ui/page`. Fixed import path.
- Plan referenced `fumadocs-ui/style.css` import in root layout — fumadocs-ui v15 uses CSS `@import` directives in globals.css instead (per D057).

## Known Issues

- fumadocs-mdx/fumadocs-core version gap requires a compatibility bridge (D059) — monitor for upstream fix
- Page data `body`/`toc` types require `as any` cast (D060) — cosmetic, runtime behavior is correct
- Network `GET fetch FAILED` warning in browser dev tools for search on home page — search tries to prefetch but the route works; non-blocking

## Files Created/Modified

- `pnpm-workspace.yaml` — expanded to include `apps/*`
- `package.json` (root) — added `pnpm.onlyBuiltDependencies` for esbuild/sharp
- `apps/web/package.json` — Next.js + fumadocs + Tailwind v4 dependencies
- `apps/web/tsconfig.json` — Next.js-compatible TypeScript config with `@/*` path alias
- `apps/web/next.config.mjs` — Next.js config wrapped with fumadocs-mdx `createMDX()`
- `apps/web/source.config.ts` — fumadocs content collection definition
- `apps/web/postcss.config.mjs` — PostCSS with `@tailwindcss/postcss` plugin
- `apps/web/lib/source.ts` — fumadocs-core loader with compatibility bridge
- `apps/web/lib/layout.shared.tsx` — shared layout options (nav title, GitHub link)
- `apps/web/app/layout.tsx` — root layout with RootProvider, metadata
- `apps/web/app/globals.css` — Tailwind v4 + fumadocs-ui CSS imports
- `apps/web/app/(home)/layout.tsx` — HomeLayout wrapper
- `apps/web/app/(home)/page.tsx` — placeholder landing page
- `apps/web/app/docs/layout.tsx` — DocsLayout with page tree sidebar
- `apps/web/app/docs/[[...slug]]/page.tsx` — docs page with MDX rendering
- `apps/web/app/api/search/route.ts` — search route handler
- `apps/web/content/docs/index.mdx` — Quick Start docs page
- `apps/web/.gitignore` — ignores .next/ and .source/
- `.gitignore` — added .source/ pattern
- `.oxlintrc.json` — added ignore patterns for Next.js generated files
- `.oxfmtrc.json` — added ignore patterns for .next/ and .source/
- `.gsd/milestones/M004/slices/S01/S01-PLAN.md` — added failure-path verification check
- `.gsd/milestones/M004/slices/S01/tasks/T01-PLAN.md` — added Observability Impact section
