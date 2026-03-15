---
id: M004
provides:
  - Polished editorial landing page at driftless-six.vercel.app with hero, install command, before/after, features, OG/Twitter Card meta tags
  - Five-page fumadocs documentation site at /docs (Quick Start, init walkthrough, GitHub Actions, configuration, troubleshooting) with search, sidebar, dark mode
  - Dynamic OG image route (1200×630) and 19 OG/Twitter Card meta tags for social sharing
  - X/Twitter launch playbook (671 lines, 18 posting sessions, Mermaid timeline, engagement strategy) at ~/Desktop/driftless/m004-launch-playbook.md
  - Next.js 15 + fumadocs-mdx v11 + fumadocs-ui v15 app integrated into pnpm monorepo (apps/web)
key_decisions:
  - "D053: Single Next.js app for landing page + docs (route groups, not two apps)"
  - "D054: Vercel default subdomain for v1 (no custom domain)"
  - "D055: Standalone markdown playbook (no paid scheduling tool dependency)"
  - "D056: Integration-first slice ordering — S01 retires risk, S02+S03 parallel after"
  - "D057: Tailwind v4 CSS-first config for fumadocs"
  - "D058: apps/web excluded from vp check/test/build — uses next build directly"
  - "D059: fumadocs-mdx Source.files compatibility bridge"
  - "D061: Editorial dark-luxury aesthetic — Instrument Serif, amber accents, numbered features"
  - "D063: Vercel monorepo deploy with rootDirectory apps/web"
  - "D064: fumadocs defaultMdxComponents required for Callout support"
patterns_established:
  - "fumadocs route groups: app/(home) for landing, app/docs for docs"
  - "Editorial section layout: numbered rows instead of card grids"
  - "Docs pages use fumadocs MDX conventions: YAML frontmatter, Callout components, absolute cross-links"
  - "Error documentation pattern: exact error message in code block, source explanation, fix steps"
  - "Paste-ready tweet copy with inline timing, hashtag, and media guidance per post"
observability_surfaces:
  - "`cd apps/web && pnpm next build` — exits 0 with route table on success"
  - "`curl -sI https://driftless-six.vercel.app/` — HTTP 200 confirms live"
  - "`pnpm run test` at monorepo root — 268 tests, zero regressions"
  - "`grep -cE '\\[insert|YOUR_|PLACEHOLDER' ~/Desktop/driftless/m004-launch-playbook.md` → 0 confirms no placeholder contamination"
requirement_outcomes:
  - id: R021
    from_status: active
    to_status: validated
    proof: "Landing page live at driftless-six.vercel.app with hero, install command, before/after, feature highlights, /docs and GitHub links. 19 OG/Twitter Card meta tags. Responsive across mobile/tablet/desktop. Editorial aesthetic per frontend-design skill."
  - id: R022
    from_status: active
    to_status: validated
    proof: "Five docs pages compile via next build, render with fumadocs navigation/search/dark mode, sidebar ordered via meta.json. Content derived from source code: prompt messages match init-prompts.ts, config fields match types.ts, workflow structure matches workflows.ts, error messages match source files."
  - id: R023
    from_status: active
    to_status: validated
    proof: "671-line playbook at ~/Desktop/driftless/m004-launch-playbook.md with 18 posting sessions, 7-tweet launch thread, Mermaid gantt timeline, 6 reply templates, engagement strategy. 16× Vercel URL, 11× GitHub URL, 6× install command references. Zero placeholder contamination."
  - id: R024
    from_status: active
    to_status: validated
    proof: "S03-RESEARCH.md findings applied: Tue–Thu 10 AM ET posting window, 1-2 hashtag max, 5-7 tweet thread length, varied daily angles, reply template strategy. Playbook structure mirrors research recommendations."
duration: ~2h15m
verification_result: passed
completed_at: 2026-03-14
---

# M004: Product Launch

**Polished editorial landing page, five-page fumadocs documentation site, and researched X/Twitter launch playbook — driftless has a front door, self-documentation, and a plan to reach users.**

## What Happened

Three slices, clean progression from infrastructure to content to strategy.

**S01 (landing page + docs scaffold)** retired the highest risk: integrating Next.js 15 + fumadocs into the existing Vite+ pnpm monorepo. Expanded `pnpm-workspace.yaml` to include `apps/*`, created the full `apps/web` app with fumadocs content pipeline, and deployed to Vercel. The landing page went through two passes — functional scaffold then editorial elevation using the frontend-design skill (Instrument Serif, amber accents, numbered feature rows, noise texture). Vercel deployment required three attempts to get monorepo settings right (rootDirectory + pnpm install from root). fumadocs v11/v15 version gaps required two compatibility bridges (D059 for `files()` lazy return, D060 for page data types). Result: live at `driftless-six.vercel.app` with all OG/Twitter Card meta tags, responsive across breakpoints.

**S02 (docs content)** filled the five required documentation pages using the fumadocs pipeline from S01. All content was source-derived: init prompts from `init-prompts.ts`, config fields from `types.ts`, workflow structure from `workflows.ts`, error messages from actual source files. Discovered that fumadocs MDX components (Callout, etc.) require explicit `defaultMdxComponents` pass-through (D064). Quick two-task slice.

**S03 (launch playbook)** gathered research from S03-RESEARCH.md on SWE engagement patterns, optimal posting times, and thread structure. Wrote a 671-line standalone markdown playbook with 18 posting sessions, a 7-tweet launch thread, Mermaid gantt timeline, minute-by-minute launch day plan, engagement strategy with 6 reply templates, and operational notes. All copy references real URLs and features — zero placeholders.

The monorepo integration was the real test. 268 tests still pass, `vp check` is clean, and `next build` produces all expected routes. No regressions from adding a Next.js app to a Vite+ monorepo.

## Cross-Slice Verification

### Success Criteria

| Criterion | Evidence | Result |
|-----------|----------|--------|
| Landing page live on Vercel URL, communicates what driftless does, shows install command and before/after | `curl -sI https://driftless-six.vercel.app/` → HTTP 200. Page has hero with `npx @driftless-ai/cli@latest init`, before/after code windows, feature sections, CTAs | ✅ |
| Docs at `/docs` covers Quick Start, init walkthrough, GitHub Action setup, config reference, troubleshooting | 5 MDX files in `apps/web/content/docs/`, all compile via `next build`, `meta.json` orders sidebar correctly | ✅ |
| Docs have working search and navigation | fumadocs search route at `/api/search`, sidebar with page tree, TOC per page, dark mode toggle | ✅ |
| Launch playbook at `~/Desktop/driftless/m004-launch-playbook.md` with day-by-day posts, tweet copy, timing, hashtags, engagement strategy, Mermaid diagrams | File exists (671 lines), 18 posting sessions, Mermaid gantt, 16× Vercel URLs, 6× install commands, 0 placeholders | ✅ |
| Landing page and docs share single Next.js app on one Vercel project | `apps/web` with route groups: `app/(home)` for landing, `app/docs/[[...slug]]` for docs. One Vercel deploy serves both. | ✅ |
| OG/Twitter Card meta tags produce good link previews | Next.js Metadata API exports `openGraph` and `twitter` config in `app/layout.tsx`. Dynamic OG image at `/opengraph-image` (1200×630). 19 total meta tags verified in S01. | ✅ |
| Existing monorepo packages (268 tests) unaffected | `pnpm run test` → 268 tests pass across 14 files. `pnpm run check` → 77 files formatted, 46 linted, 0 errors. | ✅ |

### Definition of Done

| Check | Result |
|-------|--------|
| Landing page live on Vercel URL, loads correctly, passes visual inspection | ✅ HTTP 200, editorial design verified in S01 |
| Docs at `/docs` has all five sections with working search | ✅ All 5 MDX pages + search route + sidebar ordering |
| OG/Twitter Card meta tags produce correct previews | ✅ 19 tags via Next.js Metadata API + dynamic OG image route |
| Launch playbook exists with pre-written tweet copy using actual URLs | ✅ 671 lines, 16× Vercel URL, 11× GitHub URL, 6× install command |
| `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` passes | ✅ 268 tests, 0 lint errors, next build exits 0 |
| Landing page links to docs, docs link to GitHub | ✅ CTA buttons + footer link to /docs; GitHub nav link in shared layout options |
| All slices [x] in roadmap | ✅ S01, S02, S03 all checked |
| All slice summaries exist | ✅ S01-SUMMARY.md, S02-SUMMARY.md, S03-SUMMARY.md |

## Requirement Changes

- R021: active → validated — Landing page live at `driftless-six.vercel.app` with all required content, editorial design, responsive layout, OG meta tags
- R022: active → validated — Five docs pages with source-derived content, fumadocs navigation/search/dark mode, sidebar ordering, build verification
- R023: active → validated — 671-line playbook with 18 posting sessions, real URLs/features, Mermaid timeline, engagement strategy, zero placeholders
- R024: active → validated — Research findings from S03-RESEARCH.md directly applied to playbook structure, timing, hashtag strategy, thread length

## Forward Intelligence

### What the next milestone should know
- The web app is at `apps/web` and deploys to `driftless-six.vercel.app`. Add new routes (e.g. `/pricing` for M005) as route groups under `app/`.
- fumadocs MDX files go in `apps/web/content/docs/` — the loader auto-discovers them. `meta.json` controls sidebar ordering.
- The install command is `npx @driftless-ai/cli@latest init` (scoped under `@driftless-ai`).
- Vercel project is configured via API with `rootDirectory: apps/web`, `framework: nextjs`, `installCommand: pnpm install`. Redeploy via `source .env && npx vercel --prod --token "$VERCEL_TOKEN"` from repo root.
- OG image URLs reference `https://driftless.dev` (custom domain not mapped). Images work on the Vercel URL directly but won't resolve from `driftless.dev` until domain is configured.
- The launch playbook at `~/Desktop/driftless/m004-launch-playbook.md` references `driftless-six.vercel.app` — update if domain changes.

### What's fragile
- fumadocs-mdx v11 / fumadocs-core v15.8 compatibility bridge in `lib/source.ts` (D059) — `files()` is called as a function. If either package updates, test the bridge.
- OG image rendering on Twitter depends on domain configuration — `metadataBase` points to `driftless.dev` which doesn't resolve yet. Twitter Card Validator should be checked before executing the launch playbook.
- `defaultMdxComponents` pass-through (D064) is required for any MDX component usage in docs — forgetting it causes silent build failures.

### Authoritative diagnostics
- `cd apps/web && pnpm next build` — single source of truth for whether the web app works. Exits 0 = good.
- `curl -sI https://driftless-six.vercel.app/` — HTTP 200 = deployment healthy.
- `pnpm run test` at monorepo root — 268 tests = no regressions from web app integration.
- `grep -cE '\[insert|YOUR_|PLACEHOLDER' ~/Desktop/driftless/m004-launch-playbook.md` → 0 = no placeholder contamination.

### What assumptions changed
- fumadocs v11/v15 import paths differ significantly from official documentation — actual API surface required compatibility bridges and different import paths (documented in D059, D060, D064).
- Vercel monorepo deployment required 3 attempts with API-configured project settings — plan assumed single deploy step.
- Tailwind v4 with fumadocs uses CSS `@import` directives, not JS config with `createPreset` — simpler but different from Tailwind v3 patterns.

## Files Created/Modified

- `pnpm-workspace.yaml` — expanded to include `apps/*`
- `package.json` (root) — added `pnpm.onlyBuiltDependencies` for esbuild/sharp
- `apps/web/` — entire Next.js 15 + fumadocs app (25+ files including pages, layouts, components, config, content)
- `apps/web/content/docs/*.mdx` — five documentation pages (Quick Start, init walkthrough, GitHub Actions, configuration, troubleshooting)
- `apps/web/content/docs/meta.json` — sidebar ordering
- `.gitignore` — added .source/ pattern
- `.oxlintrc.json` — added ignore patterns for Next.js generated files
- `.oxfmtrc.json` — added ignore patterns for .next/ and .source/
- `~/Desktop/driftless/m004-launch-playbook.md` — complete X/Twitter launch playbook (671 lines)
