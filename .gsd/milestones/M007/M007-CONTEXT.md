# M007: Pricing Page — Context

**Gathered:** 2026-03-15
**Status:** Queued — pending auto-mode execution

## Project Description

Add a `/pricing` route to `apps/web` that presents the driftless Pro and Enterprise tiers as "coming soon." The page uses the M006 brand system (brutalist-technical-white, geological amber, Familjen Grotesk, JetBrains Mono) and is linked from both the nav bar and the footer. It is a fully static page — no email capture, no waitlist form, no backend integration.

The page serves as a placeholder that communicates the product's commercial direction to curious OSS users before the Pro tier ships in M008+. It also gives the team a concrete URL to reference in marketing, the launch playbook, and future Pro tier announcements.

## Why This Milestone

The landing page (M006) is the public face of driftless. Visitors who are interested in the product beyond the OSS tier have nowhere to go right now. A pricing page — even a "coming soon" one — signals that a Pro tier exists, sets expectations around the product's commercial ambitions, and captures attention from ICP visitors before the Pro tier is ready.

Shipping this immediately after M006 means the brand is cohesive from day one: the pricing page inherits the same design system, nav, and footer as the rebuilt landing page.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Navigate to `driftless-six.vercel.app/pricing` and see a page styled in the M006 brand system
- Read about two upcoming tiers: **Pro** (targeted at mid-market B2B SaaS teams) and **Enterprise** (larger orgs, SSO/compliance), both labeled "coming soon"
- Click `[ PRICING ]` in the nav bar or footer to reach the page from anywhere on the site
- Return to the landing page via the standard nav

### Entry point / environment

- Entry point: `https://driftless-six.vercel.app/pricing` (Vercel deployment)
- Environment: browser
- Live dependencies involved: Vercel (auto-deploys on push to main)

## Completion Class

- Contract complete means: `/pricing` route exists, `next build` exits 0, nav and footer links resolve correctly
- Integration complete means: Vercel deployment live at `driftless-six.vercel.app/pricing`, page renders in browser with correct brand styles, nav link active
- Operational complete means: `pnpm run test` passes 268 (no regressions)

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- `https://driftless-six.vercel.app/pricing` loads and renders the pricing page with Pro and Enterprise "coming soon" sections in M006 brand styles
- Nav bar shows `[ PRICING ]` link that routes correctly; footer shows a pricing link
- `cd apps/web && pnpm next build` exits 0
- `pnpm run test` passes 268

## Risks and Unknowns

- **Nav bar modification** — The M006 nav is built as a custom component inside `app/(home)/layout.tsx`. Adding `[ PRICING ]` requires either (a) adding it to the `(home)` layout nav directly, or (b) if `/pricing` lives outside the `(home)` route group, it needs its own layout with the same nav. Cleaner to put `/pricing` inside `(home)/pricing/page.tsx` so it inherits the layout automatically.
- **None significant** — this is a static page with no new dependencies, no client components, no data fetching.

## Existing Codebase / Prior Art

- `apps/web/app/(home)/layout.tsx` — the custom brutalist nav built in M006. Pricing link added here. `/pricing` lives at `apps/web/app/(home)/pricing/page.tsx` to inherit this layout.
- `apps/web/app/(home)/page.tsx` — M006 landing page. Reference for brand token usage (CSS variables, Tailwind classes, font stack).
- `apps/web/app/globals.css` — M006 brand design tokens: `--color-bg`, `--color-text`, `--color-amber`, `--font-display`, `--font-mono`. All available for the pricing page.
- `~/Desktop/driftless/brand-identity.md` — brand identity document from M006. Reference for tone, component patterns (bracketed labels, thin borders, monospace annotations).
- `~/Desktop/driftless/05-pricing-model.md` — pricing model document from M005. Use for tier naming and positioning copy (Pro $99/mo early adopter, Enterprise custom pricing).

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R021 — Vercel landing/marketing page (pricing page is part of the marketing site, same Vercel project)

## Scope

### In Scope

- **`/pricing` route** at `apps/web/app/(home)/pricing/page.tsx` — inherits the `(home)` layout (nav + footer)
- **Page content:**
  - Section header: `[ PRICING ]` in JetBrains Mono, amber
  - Headline: something like `BUILT FOR TEAMS THAT SHIP.` in Familjen Grotesk 700
  - Two tier cards (thin 1px border, monospace labels, brutalist style):
    - **PRO** — brief positioning line (e.g. "For B2B SaaS teams with e2e tests and a docs gap"), `COMING SOON` label in amber
    - **ENTERPRISE** — brief positioning line (e.g. "Custom deployment, SSO, and compliance for larger organizations"), `COMING SOON` label in amber
  - A short note below: something like `We're building in public. Follow along on GitHub.` with a GitHub link
- **Nav bar update** — add `[ PRICING ]` pill link to the custom nav in `app/(home)/layout.tsx`, styled identically to the existing `[ DOCS ]` link
- **Footer update** — add pricing link to the footer alongside existing GitHub / npm / docs links
- **Vercel redeploy** — auto-triggers on push to main; no manual deploy step needed

### Out of Scope / Non-Goals

- Email capture or waitlist form — no backend, no third-party form service
- Actual pricing numbers or tier feature lists — the page is deliberately sparse ("coming soon")
- A pricing calculator or comparison table — deferred until Pro tier ships
- Any `/pricing` OG image — reuses the root OG image
- Changes to fumadocs `/docs` — untouched
- Any Pro tier code — that's M008+

## Technical Constraints

- **`(home)` route group** — `/pricing` must live inside `app/(home)/` to inherit the custom layout from M006. Do not create a separate layout.
- **RSC only** — the pricing page is fully server-rendered. No client components needed (no animation, no interactive elements).
- **Brand tokens only** — no new CSS variables, no new fonts. All styling uses the M006 `globals.css` token system.
- **`next build` exits 0** — TypeScript strict mode. Pricing page must have no type errors.
- **268 test baseline holds** — no changes to `packages/*`. `pnpm run test` must still pass 268.
- **Tailwind v4 CSS-first** — any new utility classes follow the established D057 pattern.

## Integration Points

- **Vercel** — same project as landing page (D063: `rootDirectory: apps/web`). Auto-deploys on push to main.
- **`app/(home)/layout.tsx`** — nav bar modified to add `[ PRICING ]` link
- **`app/(home)/page.tsx`** — footer modified to add pricing link (or footer is a shared component in the layout — verify during planning)

## Open Questions

- **Nav active state** — should `[ PRICING ]` have an amber/active treatment when the user is on `/pricing`? Or is it the same style as `[ DOCS ]` at rest?
  - Current thinking: same style as `[ DOCS ]` — no active state needed for a static placeholder page. Keep it simple.
- **Tier copy** — the "coming soon" message should be honest but not undersell. Should it hint at pricing (e.g. "starting at $99/mo") or stay completely unpriced?
  - Current thinking: no pricing numbers on the "coming soon" page. Pricing is subject to change before launch. Keep it purely "coming soon" with a brief positioning line per tier.
