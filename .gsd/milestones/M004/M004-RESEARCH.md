# M004: Product Launch — Research

**Date:** 2026-03-14

## Summary

M004 has three deliverables (landing page, docs site, launch playbook), and the most important architectural finding is that the first two should be **one Next.js app, not two**. Fumadocs' default template uses route groups within a single Next.js app — `app/(home)` for the landing page and `app/docs/[[...slug]]` for documentation pages. This eliminates the domain/subdomain question (just `driftless.vercel.app` with `/docs` subpath), simplifies deployment to a single Vercel project, and sets up M005 naturally (add `/pricing` route to the same app). The app lives at `apps/web` in the monorepo, which requires adding `apps/*` to `pnpm-workspace.yaml`.

The highest-risk slice is the Next.js + fumadocs scaffold and Vercel deployment — this introduces a new build tool (Next.js) into a monorepo that currently uses only Vite+ (`vp pack`) for library packages. The integration is straightforward (Next.js apps use `next build` while packages keep `vp pack`; the root `vp run -r build` just runs each workspace's `build` script), but proving the deployment pipeline end-to-end should come first. The landing page should be built with the `frontend-design` skill for design quality. The docs site is content-heavy but structurally simple once fumadocs is wired up. The launch playbook is pure writing — lowest risk, highest research dependency.

For the playbook, research shows: phased rollout (teasers → launch day → follow-up) outperforms "big bang." Optimal posting for SWE audiences on X is Tuesday–Thursday, 10am–12pm ET. The format should be a standalone markdown document with pre-written tweet copy, timing, hashtags, engagement tactics, and Mermaid diagrams — executable without any paid scheduling tool, though Typefully is the strongest option if the user wants to schedule posts.

## Recommendation

**Build a single Next.js app (`apps/web`) that combines landing page + fumadocs docs site.** Deploy to Vercel with monorepo root directory detection. Use fumadocs' standard route group pattern: `(home)` for landing/marketing routes, `docs` for documentation routes. This resolves the open questions about domains (subpath, not subdomain), app architecture (combined, not separate), and deployment (one Vercel project).

**Prove the scaffold first.** The riskiest unknown is Next.js + fumadocs + Vercel deployment working correctly in this Vite+ monorepo. Once the scaffold deploys and a hello-world doc page renders, the landing page design and docs content are parallelizable creative work.

**Write the playbook last.** It has zero code dependencies and benefits from having the landing page URL and docs site URL available for inclusion in tweet copy. Research for the playbook (SWE engagement patterns, hashtag strategy, OSS launch case studies) should happen during S03 planning, not during execution.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Documentation framework | fumadocs (fumadocs-core + fumadocs-ui + fumadocs-mdx) | Full-featured docs framework for Next.js: sidebar nav, search, MDX, callouts, code blocks, dark mode. Dogfoods driftless's own fumadocs adapter. |
| Landing page UI components | Tailwind CSS + fumadocs-ui preset | fumadocs-ui includes a Tailwind preset. Shared design tokens between landing page and docs — consistent look without custom theme wiring. |
| MDX content pipeline | fumadocs-mdx with source.config.ts | Handles content collection, frontmatter parsing, page tree generation. No custom content loading code needed. |
| Docs search | fumadocs built-in search (route handler) | `app/api/search/route.ts` — fumadocs provides search out of the box via a Next.js route handler. |
| Hosting/deployment | Vercel | Zero-config Next.js deployment. Monorepo support via root directory setting. Automatic preview deployments on PRs. |
| Social media post scheduling | Typefully (optional) | Best developer-focused X scheduling tool — thread writer, AI assist, optimal time suggestions. But playbook is designed to be tool-agnostic. |

## Existing Code and Patterns

- `packages/core/src/adapters.ts` — Contains the `fumadocsPrompt()` function defining the exact MDX output format driftless generates for fumadocs users. The docs site should use `<Callout>` components in the same way the adapter instructs users' docs to use them. Dogfooding opportunity.
- `packages/core/src/types.ts` — Defines `DocFramework`, `Capability`, `DriftlessConfig`, etc. The docs site's configuration reference page should document these types accurately.
- `packages/cli/src/commands/init.ts` — The init command flow. The docs "Quick Start" and "Full Init Walkthrough" pages need to mirror this flow step-by-step.
- `packages/core/src/workflows.ts` — Workflow template functions. The docs "GitHub Action Setup" page needs to document the generated YAML, permissions, and required repo secrets.
- `README.md` — Current project README with CLI usage, configuration reference, and "How It Works" section. Source of truth for docs content; docs site should expand on this, not contradict it.
- `pnpm-workspace.yaml` — Currently only includes `packages/*`. Must add `apps/*` to support the new Next.js app.
- `package.json` (root) — Scripts use `vp run -r build`, `vp check`, `vp test`. The Next.js app's `build` script (`next build`) will be picked up automatically by `vp run -r build`.
- `.github/workflows/ci.yml` — CI runs check, test, build. Adding an app with `next build` should work transparently, but may need the `NEXT_TELEMETRY_DISABLED=1` env var to suppress Next.js telemetry in CI.
- `.oxfmtrc.json` / `.oxlintrc.json` — Format and lint config. Need to verify oxlint/oxfmt handle `.tsx` files in the Next.js app, or scope exclusions if needed.

## Constraints

- **Node 22+ required** — already the project baseline (`.nvmrc` = 22, `engines.node` >= 22.12.0). fumadocs also requires Node 22+. No conflict.
- **Next.js app ≠ Vite+ library package** — The web app uses `next build`, not `vp pack`. The `vite.config.ts` pattern used in packages does not apply to the Next.js app. The app gets `next.config.mjs` instead.
- **fumadocs-mdx generates a `.source` directory** — Created at dev/build time from MDX content. Must be added to `.gitignore`.
- **Workspace expansion** — `pnpm-workspace.yaml` must add `apps/*` alongside `packages/*`. This changes dependency resolution for the entire monorepo — run `pnpm install` after the change and verify existing tests still pass.
- **CI impact** — `vp check` (oxlint + oxfmt) runs at the monorepo root. New `.tsx` files in `apps/web` will be linted/formatted. Need to verify compatibility or add exclusion rules.
- **Vercel monorepo deployment** — When creating the Vercel project, set root directory to `apps/web`. Vercel detects pnpm from `pnpm-lock.yaml` and runs `pnpm install` at the monorepo root before building.
- **Playbook output location** — Must be written to `~/Desktop/driftless/m004-launch-playbook.md` per M004-CONTEXT.md, not to the repo.

## Common Pitfalls

- **Two apps instead of one** — D003 defines `apps/web` (landing page) and `apps/docs` (docs site) as separate workspaces. Research shows combining them into one fumadocs Next.js app is simpler, more maintainable, and the fumadocs-recommended pattern. Splitting them creates cross-linking headaches, two Vercel projects, and a domain question that doesn't need to exist. Recommend updating D003's interpretation for M004.
- **fumadocs version mismatch** — fumadocs moves fast. Pin to a specific version during setup and don't upgrade mid-milestone. Use `resolve_library` / `get_library_docs` for current API during execution.
- **Tailwind CSS v4 vs v3** — fumadocs-ui's Tailwind preset needs to match the Tailwind version in the app. Check fumadocs docs for which Tailwind version is supported before installing.
- **MDX content hot-reload quirks** — fumadocs-mdx generates the `.source` directory on `next dev`. New MDX files sometimes require a dev server restart to appear in the sidebar. Not a build issue, just a DX annoyance to be aware of.
- **Landing page looking generic** — AI-generated landing pages tend toward the same hero-section-with-gradient template. Use the `frontend-design` skill to avoid this. Key differentiator: the landing page should show the actual `npx @driftless-ai/cli@latest init` command and a before/after (test file → generated doc) example prominently.
- **Playbook that reads like a template** — The playbook must contain pre-written, driftless-specific tweet copy, not generic "[insert project name]" placeholders. It should reference actual features, the actual npm install command, and actual URLs (filled in after landing page deploys).
- **Docs content drift from README** — The README is the current source of truth. Docs should expand on it, not rewrite from scratch. Port relevant sections, then add depth (troubleshooting, edge cases, framework-specific guides).

## Open Risks

- **Vite+ (`vp check`) compatibility with Next.js app** — oxlint and oxfmt may not handle Next.js-specific patterns (e.g., `"use client"` directives, `next/image` imports). May need `.oxlintrc.json` adjustments or path exclusions for `apps/`.
- **fumadocs search implementation** — The built-in search uses a route handler that indexes content at build time. For a small docs site this is fine, but worth verifying it works correctly with the combined app structure.
- **Vercel build time with monorepo** — First deploy may be slow as Vercel installs all monorepo dependencies. Subsequent deploys should be cached. If build times are problematic, consider `--filter` in the build command.
- **Landing page design quality** — The `frontend-design` skill should produce high-quality output, but landing page copy requires product marketing instincts. The "what driftless does" messaging needs to be crisp — "Generate living documentation from your test suite" is good, but the value prop needs a before/after visual to land.
- **Playbook timing** — The playbook includes specific timing recommendations (Tue–Thu 10am–12pm ET), but the user's actual audience timezone and X following size aren't known. The playbook should note these as defaults to be adjusted.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Frontend UI / Landing page | `frontend-design` (bundled GSD skill) | installed |
| Fumadocs MDX structure | `theorcdev/8bitcn-ui@fumadocs-mdx-structure` (103 installs) | available — useful patterns for MDX content organization |
| Fumadocs component docs | `theorcdev/8bitcn-ui@fumadocs-component-docs` (54 installs) | available — less relevant (component library docs, not tool docs) |
| Vercel deployment | `sickn33/antigravity-awesome-skills@vercel-deployment` (879 installs) | available — may have useful Vercel config patterns |
| Social media strategy | `frankxai/claude-skills-library@social-media-strategy` (38 installs) | available — generic social media, not OSS-specific |
| Landing page guide | `bear2u/my-skills@landing-page-guide-v2` (587 installs) | available — Next.js landing page patterns |

**Recommendation:** The `frontend-design` skill (already installed) is the most important one. The `fumadocs-mdx-structure` skill (103 installs) could be useful for organizing docs content correctly but is not critical — fumadocs' own docs are sufficient. The `vercel-deployment` skill (879 installs) might save time on Vercel config but is a straightforward setup. None of the available skills are essential enough to require installation before starting.

## Candidate Requirements

These emerged from research but are not currently in REQUIREMENTS.md. Surface for user decision during planning:

- **R-candidate: Vercel preview deployments on PRs** — Vercel automatically creates preview deployments for PRs. This is free and automatic if the repo is connected, but CI may need a Vercel project ID for status checks. Low effort, high value for reviewing landing page changes.
- **R-candidate: Docs site search** — fumadocs includes built-in search via a route handler. It's nearly free to include and users expect it. Currently implicit in R022 but worth making explicit.
- **R-candidate: Dark mode support** — fumadocs-ui supports dark mode out of the box via its Tailwind preset and `RootProvider`. The landing page should match. Nearly zero effort since fumadocs handles it, but worth noting.
- **R-candidate: Social media meta tags (OG image, Twitter card)** — The landing page should have proper Open Graph and Twitter Card meta tags for link previews when shared on X. Critical for the launch playbook to be effective. Next.js metadata API makes this trivial.

## Sources

- Fumadocs project structure uses route groups: `app/(home)` for landing, `app/docs` for documentation, `app/api/search/route.ts` for search (source: [fumadocs GitHub template](https://github.com/fuma-nama/fumadocs))
- Fumadocs setup requires `source.config.ts`, `fumadocs-mdx/config`, and `fumadocs-ui/layouts/docs` for the docs layout (source: [Context7 fumadocs docs](/fuma-nama/fumadocs))
- Fumadocs supports Tailwind CSS via `createPreset()` from `fumadocs-ui/tailwind-plugin` (source: [Google Search — fumadocs monorepo setup](https://fumadocs.dev))
- pnpm monorepos with Next.js + Vite packages coexist via workspace protocol — each app/package uses its own build tool (source: [Google Search — pnpm monorepo Vite Next.js](https://medium.com))
- Vercel deploys monorepo apps by setting root directory to the specific app folder; detects pnpm from lockfile (source: [Google Search — Vercel monorepo deployment](https://vercel.com))
- Optimal X posting times for SWE audience: Tuesday–Thursday, 10am–12pm; single hashtag outperforms multiple; images boost retweets 34% (source: [Sprout Social](https://sproutsocial.com), [Hootsuite](https://hootsuite.com))
- OSS launch playbooks recommend phased approach: pre-launch teasers → launch day thread → week 1 follow-up → sustained content (source: [Google Search — OSS launch playbook](https://kodekloud.com), [freeCodeCamp](https://freecodecamp.org))
- Typefully offers best developer-focused X scheduling with thread writer and API; Buffer is broader but less dev-focused (source: [Google Search — Typefully vs Buffer](https://typefully.com))
- Developer tool landing pages should lead with install command as CTA, show before/after examples, and provide prominent docs links (source: [Google Search — OSS landing page best practices](https://lapa.ninja))
