---
estimated_steps: 7
estimated_files: 5
---

# T02: Build polished landing page with OG meta tags

**Slice:** S01 — Landing page + docs site deployed on Vercel
**Milestone:** M004

## Description

Replace the placeholder landing page with a polished, distinctive design that communicates driftless's value proposition. This task uses the `frontend-design` skill to avoid generic AI aesthetics. The page must show the install command prominently, include a real before/after example (e2e test → training doc), and link to /docs and GitHub. OG/Twitter Card meta tags ensure good link previews when shared on X.

## Steps

1. Load and follow `~/.gsd/agent/skills/frontend-design/SKILL.md` for design direction
2. Target aesthetic: **linear.app**. Near-black background (`#09090B`), Inter/system-ui sans-serif, purple/violet accent (`#7C3AED`/`#8B5CF6`), gradient text on hero headline, subtle radial/mesh glow behind hero, generous whitespace. Small announcement badge. Two hero CTAs (filled purple + ghost). Clean feature grid with subtle-border cards. Smooth, premium, restrained — not terminal, not SaaS template.
3. Build `app/(home)/page.tsx` with:
   - Hero section: headline explaining "Your e2e tests become training docs. Automatically."
   - Install command: `npx @driftless-ai/cli@latest init` in a copy-pasteable code block
   - Before/after example: show a real e2e test snippet → the training doc it produces
   - Feature highlights: framework-agnostic, GitHub Action staleness detection, composable capabilities
   - CTA links: "Read the docs" → /docs, "View on GitHub" → repo URL
   - Footer with links
4. Add responsive design — mobile-first, works on phone/tablet/desktop
5. Add OG/Twitter Card meta tags in root layout metadata export:
   - `og:title`, `og:description`, `og:image`, `og:url`
   - `twitter:card: summary_large_image`, `twitter:title`, `twitter:description`
6. Create or generate an OG image (`public/og-image.png`) — simple, branded, 1200x630
7. Verify build still passes: `cd apps/web && pnpm next build`

## Must-Haves

- [ ] Landing page has hero, install command, before/after example, feature highlights, CTA links
- [ ] Design follows `frontend-design` skill — visually distinctive, not generic template
- [ ] OG meta tags present: `og:title`, `og:description`, `og:image`, `twitter:card`
- [ ] Responsive layout works on mobile, tablet, and desktop
- [ ] Links to /docs and GitHub are functional
- [ ] `next build` still succeeds

## Verification

- `cd apps/web && pnpm next build` exits 0
- View page source → `og:title`, `og:description`, `og:image`, `twitter:card` meta tags present
- `pnpm next dev` → landing page renders hero, install command, before/after, links to /docs and GitHub
- Browser responsive mode → layout works at 375px, 768px, and 1280px widths

## Inputs

- `apps/web/app/(home)/page.tsx` — placeholder from T01
- `apps/web/app/layout.tsx` — root layout from T01 (add metadata here)
- `apps/web/app/(home)/layout.tsx` — HomeLayout from T01
- `~/.gsd/agent/skills/frontend-design/SKILL.md` — design skill
- README.md and existing project docs for accurate product copy

## Expected Output

- `apps/web/app/(home)/page.tsx` — polished landing page with all required sections
- `apps/web/app/layout.tsx` — updated with OG/Twitter meta tags
- `apps/web/public/og-image.png` — branded OG image (1200x630)
- Possibly new component files in `apps/web/components/` if the landing page is complex enough to warrant extraction

## Observability Impact

- **Build verification:** `cd apps/web && pnpm next build` — success = 0 exit code with route table showing `/(home)` page, failure = error with file/line
- **Meta tag verification:** `pnpm next dev` → view page source at `/` → `og:title`, `og:description`, `og:image`, `twitter:card` meta tags present in `<head>`
- **Visual verification:** `pnpm next dev` → browser at `/` → hero, install command, before/after, feature highlights, CTA links all render. Responsive at 375px/768px/1280px
- **OG image verification:** Visit `/opengraph-image` route → returns 1200x630 PNG with driftless branding
- **Failure visibility:** Missing fonts → fallback to system fonts (degraded but functional). Broken JSX → build fails with component file path and line number. Missing OG image route → `og:image` meta tag still present but returns 404
