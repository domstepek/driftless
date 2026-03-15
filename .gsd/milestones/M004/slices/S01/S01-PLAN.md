# S01: Landing page + docs site deployed on Vercel

**Goal:** A polished landing page and fumadocs documentation scaffold are live on a Vercel URL, with the install command, before/after example, docs Quick Start page with search/navigation, and all 268 existing tests still passing.
**Demo:** Visit the Vercel URL → landing page loads with hero, install command, before/after, links to /docs and GitHub. Click /docs → Quick Start page renders with fumadocs layout, sidebar, dark mode toggle, and search. Run `pnpm run test` at monorepo root → 268 tests pass.

## Must-Haves

- `apps/web` Next.js app with fumadocs in the existing Vite+ pnpm monorepo
- `pnpm-workspace.yaml` expanded to include `apps/*` without breaking existing packages
- fumadocs content pipeline: `source.config.ts`, `lib/source.ts`, MDX content dir, search route
- Landing page at `/` with: hero headline, `npx @driftless-ai/cli@latest init` install command, before/after example, links to /docs and GitHub
- OG/Twitter Card meta tags on landing page for good link previews
- Docs at `/docs` with Quick Start page, fumadocs sidebar navigation, dark mode, working search
- Tailwind CSS v4 with fumadocs-ui preset
- Landing page design follows `frontend-design` skill — no generic AI slop
- `pnpm install && pnpm run check && pnpm run test && pnpm run build` passes at monorepo root (268+ tests)
- Deployed to Vercel serving both landing page and docs

## Proof Level

- This slice proves: integration + operational
- Real runtime required: yes (Vercel deployment, browser verification)
- Human/UAT required: yes (landing page design quality, docs readability)

## Verification

- `cd apps/web && pnpm next build` succeeds (Next.js builds fumadocs + landing page)
- `cd ~/Personal\ Repos/driftless && pnpm run test` → 268+ tests pass
- `cd ~/Personal\ Repos/driftless && pnpm run check` passes (oxlint/oxfmt)
- Vercel URL loads landing page at `/` with hero, install command, before/after
- Vercel URL loads docs at `/docs` with Quick Start, sidebar, search, dark mode
- Landing page → docs link works, docs → GitHub link works
- OG meta tags present in page source (`og:title`, `og:description`, `twitter:card`)
- `cd apps/web && pnpm next build 2>&1` on a broken MDX file or missing import → build fails with actionable error (file path + line number), not a silent 0 exit

## Observability / Diagnostics

- Runtime signals: Next.js build output (success/failure with error details), Vercel deploy logs
- Inspection surfaces: `next build` exit code, Vercel deployment URL, browser DevTools network tab
- Failure visibility: Next.js build errors surface in terminal; Vercel deploy errors in CLI output
- Redaction constraints: Vercel token (if used) must not be logged

## Integration Closure

- Upstream surfaces consumed: `pnpm-workspace.yaml` (expanded), monorepo root `package.json` scripts
- New wiring introduced: `apps/web` package with `next build` as its build command, workspace protocol linking
- What remains before milestone is truly usable: S02 adds remaining 4 docs sections, S03 adds launch playbook

## Tasks

- [x] **T01: Scaffold Next.js + fumadocs app in monorepo** `est:2h`
  - Why: Retires the highest risk — integrating a Next.js app with fumadocs into a Vite+ pnpm monorepo. Produces the entire docs infrastructure that S02 will fill with content.
  - Files: `pnpm-workspace.yaml`, `apps/web/package.json`, `apps/web/next.config.mjs`, `apps/web/source.config.ts`, `apps/web/lib/source.ts`, `apps/web/app/layout.tsx`, `apps/web/app/docs/[[...slug]]/page.tsx`, `apps/web/app/docs/layout.tsx`, `apps/web/app/api/search/route.ts`, `apps/web/app/globals.css`, `apps/web/content/docs/index.mdx`, `apps/web/tsconfig.json`, `apps/web/lib/layout.shared.tsx`
  - Do: Expand pnpm-workspace.yaml to `apps/*`. Create `apps/web` with Next.js + fumadocs-core + fumadocs-mdx + fumadocs-ui + Tailwind v4. Wire source.config.ts → lib/source.ts → route groups. Create `app/docs/` route group with DocsLayout + DocsPage. Create `app/(home)/` route group with HomeLayout. Add search route handler. Write Quick Start MDX page as first content. Configure Tailwind v4 with fumadocs-ui CSS imports. Add `next build` as the package's `build` script. Ensure `vp check` still passes — may need to configure oxlint/oxfmt to ignore `apps/web` or handle JSX/TSX.
  - Verify: `pnpm install && cd apps/web && pnpm next build` succeeds. `cd ~/Personal\ Repos/driftless && pnpm run test` → 268 tests pass. `pnpm run check` passes.
  - Done when: Next.js builds cleanly, docs Quick Start page renders at `/docs`, existing tests unaffected.

- [x] **T02: Build polished landing page with OG meta tags** `est:2h`
  - Why: Retires the design-quality risk. The landing page is the front door — it must communicate value quickly with a distinctive, professional design. OG tags ensure good link previews when shared on X.
  - Files: `apps/web/app/(home)/page.tsx`, `apps/web/app/layout.tsx` (metadata), `apps/web/app/(home)/layout.tsx`, `apps/web/public/og-image.png`
  - Do: Load and follow `frontend-design` skill. Design a landing page with: bold hero section explaining what driftless does, copy-pasteable `npx @driftless-ai/cli@latest init` install command, real before/after example showing e2e test → training doc transformation, feature highlights, links to /docs and GitHub repo. Add comprehensive OG/Twitter Card meta tags (title, description, image, twitter:card summary_large_image). Create or source an OG image. Ensure responsive design (mobile/tablet/desktop).
  - Verify: `cd apps/web && pnpm next build` succeeds. View source contains `og:title`, `og:description`, `twitter:card` meta tags. Landing page renders hero, install command, before/after, links.
  - Done when: Landing page is visually polished (not generic template), contains all required content, OG tags present, build passes.

- [x] **T03: Deploy to Vercel and verify cross-links** `est:45m`
  - Why: Closes the slice — nothing is "deployed on Vercel" until it's actually deployed and verified live. Cross-link verification proves the integration between landing page and docs.
  - Files: `apps/web/vercel.json` (if needed), `apps/web/package.json`
  - Do: Deploy `apps/web` to Vercel (CLI or git-based). Verify landing page loads at Vercel URL. Verify `/docs` loads with Quick Start, sidebar, search. Test cross-links: landing → docs, docs → GitHub. Check OG meta tags in page source. Verify dark mode toggle works.
  - Verify: Vercel URL serves landing page at `/`. `/docs` serves Quick Start with fumadocs UI. All cross-links resolve. OG meta tags present. `pnpm run test` at monorepo root still passes (268+).
  - Done when: Live Vercel URL serves both landing page and docs, all links work, OG tags verified.

## Files Likely Touched

- `pnpm-workspace.yaml`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/next.config.mjs`
- `apps/web/source.config.ts`
- `apps/web/lib/source.ts`
- `apps/web/lib/layout.shared.tsx`
- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/(home)/layout.tsx`
- `apps/web/app/(home)/page.tsx`
- `apps/web/app/docs/layout.tsx`
- `apps/web/app/docs/[[...slug]]/page.tsx`
- `apps/web/app/api/search/route.ts`
- `apps/web/content/docs/index.mdx`
- `apps/web/public/og-image.png`
- `.oxlintrc.json` or `.oxfmtrc.json` (if exclusions needed)
