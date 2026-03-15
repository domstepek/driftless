---
id: S01
milestone: M004
status: ready
---

# S01: Landing Page + Docs Site Deployed on Vercel — Context

## Goal

A dark, minimal, code-forward landing page and fumadocs docs site are live on a single Vercel deployment, sharing a shadcn/ui + Tailwind CSS design system, with a real test→doc before/after example on the landing page and a working Quick Start docs page.

## Why this Slice

Everything in M004 depends on having a live URL. S02 (docs content) needs the fumadocs scaffold to write into. S03 (launch playbook) needs the actual URLs to put in tweet copy. The riskiest unknowns — Next.js in the Vite+ monorepo, fumadocs setup, Vercel deployment — are all retired here.

## Scope

### In Scope

- **Monorepo expansion:** Add `apps/*` to `pnpm-workspace.yaml`. Create `apps/web` as the Next.js app workspace.
- **Design system setup:** Install and configure shadcn/ui + Tailwind CSS as the shared design foundation. fumadocs-ui's Tailwind preset (`createPreset()`) is layered on top for docs-specific components. shadcn components used in both landing page and docs site.
- **Next.js + fumadocs scaffold:** Single app with fumadocs route groups: `app/(home)` for landing page routes, `app/docs/[[...slug]]` for documentation. Source config at `source.config.ts`, MDX content directory, fumadocs search route at `app/api/search/route.ts`.
- **Landing page:** linear.app aesthetic — near-black (`#09090B`), Inter/sans-serif, purple/violet accent, gradient hero text, radial glow, clean feature grid, generous whitespace. Must include:
  - Hero with one-liner tagline and `npx @driftless-ai/cli@latest init` install command prominently as primary CTA
  - Real before/after example: a representative test file snippet → the generated fumadocs MDX doc about that flow
  - Links to `/docs` and GitHub repo
  - OG/Twitter Card meta tags for link previews when shared on X
- **Docs scaffold:** Quick Start page as the initial content. Navigation sidebar, dark mode, fumadocs search working.
- **Vercel deployment:** User has an existing Vercel account. Connect `apps/web` as root directory. Deploy to `driftless.vercel.app` (D054 — no custom domain for v1). Verify deploy-on-push works.
- **Monorepo hygiene:** Verify existing 268+ tests still pass after adding `apps/*`. Add `.source` (fumadocs generated dir) to `.gitignore`. Verify `vp check` (oxlint/oxfmt) handles `.tsx` files in `apps/` or add exclusion rules.

### Out of Scope

- Full docs content (S02 — only Quick Start page needed for S01)
- Launch playbook (S03)
- Custom domain (deferred per D054 — add after launch)
- Pricing page (M005 — added after business infrastructure is in place)
- Analytics / tracking (not in M004 scope)
- Dark/light mode toggle on landing page (fumadocs docs site gets it via fumadocs-ui; landing page can be dark-only for now)

## Constraints

- Design system: shadcn/ui + Tailwind CSS shared across landing page and fumadocs docs site. fumadocs-ui Tailwind preset layered on top for docs components.
- **Landing page aesthetic: [linear.app](https://linear.app) as the primary design reference.**
  - Near-black background (`#09090B` — not pure black, not navy). Clean sans-serif throughout (Inter or system-ui — not monospace, not serif). Purple/violet as the single accent (`#7C3AED` / `#8B5CF6`).
  - Hero: large gradient text headline, subtle radial/mesh gradient glow behind it, small announcement badge/pill, two CTA buttons (one filled purple, one ghost). Generous whitespace.
  - Feature grid: clean cards with very subtle borders, icon + title + description, minimal color.
  - Smooth, premium, polished. Not data-dense. Not terminal. Not a SaaS template either — linear.app's restraint and craft.
  - Use `frontend-design` skill during execution and reference linear.app explicitly as the design target.
- Before/after example on landing page must be real and specific — an actual representative test snippet → the MDX doc that driftless would generate from it. Not a placeholder.
- Vercel account already connected — no new account setup needed.
- Next.js app uses `next build` (not `vp pack`). Gets `next.config.mjs`, not `vite.config.ts`. Root `vp run -r build` picks it up transparently via its `build` script.
- `NEXT_TELEMETRY_DISABLED=1` should be set in CI to suppress Next.js telemetry output.
- fumadocs-mdx generates a `.source` directory — must be gitignored.

## Integration Points

### Consumes

- `packages/core/src/adapters.ts` — `fumadocsPrompt()` defines the exact MDX output format driftless generates. The before/after example on the landing page should use this format authentically.
- `packages/cli/src/commands/init.ts` — the init command flow, for Quick Start docs page content.
- `pnpm-workspace.yaml` — needs `apps/*` added.

### Produces

- `apps/web` — Next.js app with shadcn/ui + Tailwind + fumadocs-ui, deployed on Vercel
- Deployed Vercel URL (driftless.vercel.app) — needed by S03 for tweet copy
- Live `/docs` URL — needed by S03
- fumadocs content pipeline (source.config.ts, MDX content dir, page tree) — consumed by S02
- Docs Quick Start page as structural reference for S02 content

## Open Questions

- **oxlint compatibility with `.tsx`:** `.oxlintrc.json` currently has no path exclusions. Need to verify oxlint handles Next.js-specific patterns (`"use client"`, `next/image` imports) or add `apps/` to ignore paths. Determine during execution.
- **fumadocs version:** Fumadocs moves fast — pin to a specific version during setup. Use `resolve_library` + `get_library_docs` during execution to get the current correct API.
- **shadcn/ui in a monorepo app:** shadcn components live in `apps/web/components/ui/`. They're not a shared package — each app would need its own copy. For v1 with one app this is fine.
