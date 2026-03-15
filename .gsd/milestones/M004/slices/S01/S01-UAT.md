# S01: Landing page + docs site deployed on Vercel — UAT

**Milestone:** M004
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (live-runtime + artifact-driven)
- Why this mode is sufficient: The slice produces a live Vercel deployment (runtime) and build artifacts (Next.js build output, meta tags in HTML source). Both must be verified — the deployment proves operational, the source inspection proves correctness.

## Preconditions

- Monorepo dependencies installed (`pnpm install` at repo root)
- Vercel deployment live at `https://driftless-six.vercel.app`
- Modern browser with DevTools available
- Terminal access for build/test commands

## Smoke Test

Visit `https://driftless-six.vercel.app/` — the landing page loads with a hero headline mentioning "driftless" and a code block showing the install command. Click "Read the Docs" — navigates to `/docs` with a Quick Start page.

## Test Cases

### 1. Landing page hero section

1. Navigate to `https://driftless-six.vercel.app/`
2. Verify the hero section contains a headline explaining what driftless does
3. Verify the install command `npx @driftless-ai/cli@latest init` is displayed in a code block
4. Verify a copy button exists on the install command block
5. **Expected:** Hero clearly communicates the value proposition (e2e tests → training docs), install command is prominent and copy-pasteable

### 2. Before/after example

1. On the landing page, scroll to the before/after section
2. Verify a "before" code block shows an e2e test file (Playwright or similar)
3. Verify an "after" code block shows the generated training documentation
4. **Expected:** The transformation is visually clear — test code on one side, human-readable docs on the other. Real content, not placeholder lorem ipsum.

### 3. Feature highlights

1. On the landing page, scroll to the features section
2. Verify at least 3 features are listed with titles and descriptions
3. **Expected:** Features describe real capabilities (framework agnostic, GitHub Action automation, composable skills, etc.), not generic filler

### 4. Cross-links: landing → docs

1. On the landing page, find the "Read the Docs" CTA button
2. Click it
3. **Expected:** Navigates to `/docs` — the Quick Start page loads with fumadocs UI (sidebar, table of contents, search bar)

### 5. Cross-links: landing → GitHub

1. On the landing page, find the GitHub link (nav bar or footer)
2. Click it (or verify href)
3. **Expected:** Links to `https://github.com/driftless-ai/driftless`

### 6. Docs Quick Start page

1. Navigate to `https://driftless-six.vercel.app/docs`
2. Verify the page has a title ("Quick Start" or similar)
3. Verify the left sidebar shows navigation (at minimum the Quick Start entry)
4. Verify a table of contents appears on the right side
5. Verify a search button/bar is visible in the header
6. **Expected:** Full fumadocs UI with sidebar navigation, TOC, and search affordance

### 7. Dark mode toggle

1. On any page (landing or docs), find the dark mode toggle
2. Click it to switch themes
3. **Expected:** Page switches between light and dark themes. Colors, backgrounds, and text remain readable in both modes.

### 8. OG meta tags — landing page

1. View page source of `https://driftless-six.vercel.app/`
2. Search for `og:title`, `og:description`, `og:image`, `twitter:card`
3. **Expected:** All present. `og:title` contains "driftless". `og:description` mentions docs/tests. `og:image` points to a 1200×630 image. `twitter:card` is `summary_large_image`.

### 9. OG image route

1. Navigate to `https://driftless-six.vercel.app/opengraph-image`
2. **Expected:** Returns a PNG image, approximately 1200×630 pixels, with driftless branding

### 10. Responsive design — mobile

1. Open DevTools, set viewport to 375×812 (iPhone)
2. Navigate to `https://driftless-six.vercel.app/`
3. Scroll through the entire page
4. **Expected:** No horizontal overflow, text is readable, install command block doesn't break layout, navigation is accessible (hamburger menu or stacked)

### 11. Build verification

1. Run `cd apps/web && pnpm next build`
2. **Expected:** Exits 0. Route table shows `/`, `/docs/[[...slug]]`, `/api/search`, `/opengraph-image`, `/twitter-image`

### 12. Monorepo test regression

1. Run `pnpm run test` at monorepo root
2. **Expected:** 268 tests pass across 14 test files. Zero failures, zero regressions.

### 13. Lint and format

1. Run `pnpm run check` at monorepo root
2. **Expected:** All files pass format check and lint check. Zero errors.

## Edge Cases

### Broken MDX content

1. Temporarily add invalid MDX to `apps/web/content/docs/index.mdx` (e.g., an unclosed JSX tag)
2. Run `cd apps/web && pnpm next build`
3. **Expected:** Build fails with an actionable error message including the file path and line number/description. Non-zero exit code.
4. Revert the change after testing.

### Docs page with no slug (root /docs)

1. Navigate to `https://driftless-six.vercel.app/docs` (no trailing path)
2. **Expected:** Renders the index.mdx content (Quick Start). Does not 404 or show an empty page.

### Direct navigation to non-existent docs path

1. Navigate to `https://driftless-six.vercel.app/docs/does-not-exist`
2. **Expected:** Returns a 404 page (Next.js default or custom). Does not crash or show a blank page.

## Failure Signals

- Vercel URL returns non-200 HTTP status → deployment is down
- Landing page renders without install command or before/after → content regression
- `/docs` shows empty page or 404 → fumadocs pipeline broken
- `pnpm run test` shows fewer than 268 tests or any failures → regression from web app integration
- `pnpm next build` fails → Next.js or fumadocs config broken
- Meta tags missing from page source → OG metadata not configured
- `/opengraph-image` returns 404 or broken image → dynamic image route broken

## Requirements Proved By This UAT

- R021 (Vercel landing/marketing page) — tests 1-5, 8-10 prove the landing page is live, polished, and has OG tags
- R034 (pnpm workspaces for monorepo) — tests 11-13 prove the new app integrates without breaking existing workspace packages

## Not Proven By This UAT

- R022 (Fumadocs documentation site) — only Quick Start page exists; remaining 4 sections are S02 scope
- Link preview rendering on actual X/Twitter — OG tags are present in source but actual preview rendering depends on platform card validators and the custom domain issue (og:url references driftless.dev)
- Vercel auto-deploy on git push — deployment was manual via CLI; git-push-triggered deploys require GitHub integration configuration

## Notes for Tester

- The OG image URLs in meta tags reference `https://driftless.dev` which is not yet configured as a custom domain. The images render correctly when accessed via the Vercel URL (`driftless-six.vercel.app/opengraph-image`) but Twitter/OG card validators may show broken images until the domain is mapped.
- The landing page uses an editorial "dark luxury" design aesthetic — this is intentional, not a dark-mode-only page. The design uses dark backgrounds with amber/gold accents.
- Search on the docs site indexes content at build time. With only the Quick Start page, search results will be minimal. S02 will add more content for meaningful search testing.
