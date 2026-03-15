---
id: T01
parent: S02
milestone: M004
provides:
  - Quick Start page with accurate v1.0.0 content (all 6 init prompts, no standalone generate command)
  - Init walkthrough page with exact prompt messages/placeholders/defaults from init-prompts.ts
  - Configuration reference page with all 11 DriftlessConfig fields, framework detection table, docFramework and capability documentation
  - fumadocs Callout component wiring via defaultMdxComponents
key_files:
  - apps/web/content/docs/index.mdx
  - apps/web/content/docs/init-walkthrough.mdx
  - apps/web/content/docs/configuration.mdx
  - apps/web/app/docs/[[...slug]]/page.tsx
key_decisions:
  - Wired fumadocs defaultMdxComponents into docs page to enable Callout and other MDX components
patterns_established:
  - Docs pages use fumadocs MDX conventions: YAML frontmatter with title/description, no manual # Title, <Callout> for tips/warnings
  - Cross-links use absolute paths (/docs/init-walkthrough, /docs/configuration, etc.)
observability_surfaces:
  - Build verification: `cd apps/web && pnpm next build` shows routes for /docs, /docs/init-walkthrough, /docs/configuration
  - Content accuracy: grep prompt messages from init-prompts.ts in walkthrough page
duration: 12m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Write Quick Start, init walkthrough, and configuration reference

**Rewrote Quick Start and created init walkthrough + configuration reference pages with source-derived content; wired fumadocs Callout components.**

## What Happened

Rewrote `index.mdx` (Quick Start) to remove the inaccurate standalone `generate` command reference, add a Claude Code prerequisite callout, and list all 6 init prompts accurately. Created `init-walkthrough.mdx` documenting the full init flow — each of the 6 prompts with exact messages/placeholders/defaults from `init-prompts.ts`, plus the post-prompt flow (framework detection → config write → doc generation → skill installation → workflow installation → debug log → completion). Created `configuration.mdx` with a table of all 11 DriftlessConfig fields from `types.ts`, the framework detection priority table from `detect.ts` (6 frameworks with config files), documentation of all 3 docFramework options from `adapters.ts`, and both capabilities with what they install.

During the build, discovered `Callout` components were undefined because the docs page wasn't passing fumadocs MDX components to the rendered content. Fixed by importing `defaultMdxComponents` from `fumadocs-ui/mdx` and passing it to `<MDXContent>` in the docs page template.

## Verification

- `cd apps/web && pnpm next build` exits 0 — routes `/docs`, `/docs/configuration`, `/docs/init-walkthrough` all present in build output
- `pnpm run test` at monorepo root — 268 tests pass (14 test files, no regressions)
- All 6 prompt messages from `init-prompts.ts` confirmed present in walkthrough via grep
- All 11 DriftlessConfig fields from `types.ts` confirmed present in configuration reference
- Quick Start confirmed free of standalone `generate` command reference
- Cross-links verified: Quick Start links to all 4 other doc pages, init walkthrough links to config reference and GitHub Actions, config reference links back to init walkthrough

## Diagnostics

Static documentation pages — no runtime diagnostics. Build verification via `next build` catches MDX syntax errors with file paths in error output. Content drift detectable by grepping source prompt messages against walkthrough page.

## Deviations

- Added `defaultMdxComponents` import and pass-through to `apps/web/app/docs/[[...slug]]/page.tsx` — not in the task plan but required to make `<Callout>` components render. Without this, all MDX component usage would fail at build time.

## Known Issues

None.

## Files Created/Modified

- `apps/web/content/docs/index.mdx` — rewritten Quick Start with accurate v1.0.0 content
- `apps/web/content/docs/init-walkthrough.mdx` — new init walkthrough page
- `apps/web/content/docs/configuration.mdx` — new configuration reference page
- `apps/web/app/docs/[[...slug]]/page.tsx` — added defaultMdxComponents import and pass-through for Callout support
- `.gsd/milestones/M004/slices/S02/S02-PLAN.md` — added Observability / Diagnostics section
- `.gsd/milestones/M004/slices/S02/tasks/T01-PLAN.md` — added Observability Impact section

## Slice Verification Status (intermediate — T01 of 2)

- ✅ `cd apps/web && pnpm next build` exits 0
- ✅ `pnpm run test` — 268 tests pass
- ✅ Build output shows routes for 3 of 5 docs pages (remaining 2 are T02: github-actions, troubleshooting)
- ⬜ fumadocs sidebar displays all 5 pages in correct order (needs meta.json from T02)
- ✅ Content accuracy: init prompts match `init-prompts.ts`, config fields match `types.ts`
