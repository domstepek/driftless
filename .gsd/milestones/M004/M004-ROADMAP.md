# M004: Product Launch

**Vision:** Ship the public-facing surfaces that drive adoption — a polished landing page, comprehensive documentation, and a researched launch playbook — so driftless has a front door, self-documentation, and a plan to reach users.

## Success Criteria

- A polished landing page is live on a Vercel URL, clearly communicates what driftless does, shows the install command and a before/after example, and links to docs and GitHub
- A documentation site at `/docs` covers: Quick Start, full init walkthrough, GitHub Action setup, configuration reference, and troubleshooting — with working search and navigation
- A launch playbook exists at `~/Desktop/driftless/m004-launch-playbook.md` with day-by-day X/Twitter posts, pre-written driftless-specific tweet copy, timing, hashtags, engagement strategy, and Mermaid diagrams
- The landing page and docs site share a single Next.js app deployed as one Vercel project
- OG/Twitter Card meta tags produce good link previews when shared on X
- Existing monorepo packages (268 tests) are unaffected by the new app

## Key Risks / Unknowns

- **Next.js + fumadocs in a Vite+ monorepo** — This monorepo uses `vp pack` for library builds. Adding a Next.js app (`next build`) is a new build tool. Workspace expansion (`apps/*` in pnpm-workspace.yaml) changes dependency resolution. `vp check` (oxlint/oxfmt) may not handle `.tsx` or `"use client"` directives.
- **Landing page design quality** — AI-generated landing pages tend toward generic hero-with-gradient templates. The page needs to look professional and communicate value quickly with a real before/after example.

## Proof Strategy

- **Next.js in Vite+ monorepo** → retire in S01 by deploying the full landing page + docs scaffold to Vercel and verifying existing tests still pass
- **Landing page design quality** → retire in S01 by using the `frontend-design` skill and including the actual `npx @driftless-ai/cli@latest init` command + before/after example prominently

## Verification Classes

- Contract verification: Next.js builds successfully, `pnpm run test` passes (268 tests), docs pages render, playbook file exists at specified path
- Integration verification: Vercel deployment serves the app, landing page links to docs, docs link to GitHub, OG meta tags render in link previews
- Operational verification: Vercel deploys on git push, fumadocs search indexes content at build time
- UAT / human verification: Landing page communicates value clearly, docs content is accurate and complete, playbook contains actionable driftless-specific tweet copy (not generic placeholders)

## Milestone Definition of Done

This milestone is complete only when all are true:

- Landing page is live on a Vercel URL, loads correctly, and passes visual inspection
- Docs site at `/docs` has all five required sections (Quick Start, init walkthrough, GitHub Action setup, config reference, troubleshooting) with working search
- OG/Twitter Card meta tags produce correct previews (title, description, image)
- Launch playbook exists at `~/Desktop/driftless/m004-launch-playbook.md` with pre-written tweet copy using actual URLs and real feature descriptions
- `pnpm install --frozen-lockfile && pnpm run check && pnpm run test && pnpm run build` passes at the monorepo root (268+ tests, no regressions)
- Landing page links to docs, docs link to GitHub — cross-references verified

## Requirement Coverage

- Covers: R021 (landing page), R022 (docs site), R023 (launch playbook), R024 (research-informed playbook)
- Partially covers: R025 (docs will document Claude-first with future harness intent — primary owner is M001, already validated in README)
- Leaves for later: none
- Orphan risks: none

## Slices

- [ ] **S01: Landing page + docs site deployed on Vercel** `risk:high` `depends:[]`
  > After this: a polished landing page is live on a Vercel URL with the install command, before/after example, and links to docs. The `/docs` section has a working Quick Start page with fumadocs navigation, search, and dark mode. Existing monorepo tests still pass.
- [ ] **S02: Documentation content** `risk:low` `depends:[S01]`
  > After this: all five required docs sections are complete — Quick Start (expanded), full init walkthrough, GitHub Action setup, configuration reference, and troubleshooting — with accurate content ported from and expanding on the README.
- [ ] **S03: X/Twitter launch playbook** `risk:low` `depends:[S01]`
  > After this: `~/Desktop/driftless/m004-launch-playbook.md` contains a researched, day-by-day launch strategy with pre-written tweet copy referencing the actual landing page URL, npm install command, and real features — informed by google_search research on SWE community engagement.

## Boundary Map

### S01 → S02

Produces:
- `apps/web` Next.js app with fumadocs route groups: `app/(home)` for landing, `app/docs/[[...slug]]` for docs
- fumadocs content pipeline (`source.config.ts`, MDX content directory, page tree generation)
- Deployed Vercel URL serving both landing page and docs
- Docs Quick Start page as reference for content structure and MDX conventions
- fumadocs search route handler at `app/api/search/route.ts`
- Tailwind CSS config with fumadocs-ui preset (shared design tokens)

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- Live Vercel URL for the landing page (to include in tweet copy)
- Live `/docs` URL (to link in tweets)

Consumes:
- nothing (first slice)
