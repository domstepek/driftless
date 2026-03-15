# S01: Pricing page with nav/footer integration — UAT

**Milestone:** M007
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven + live-runtime)
- Why this mode is sufficient: Build verification confirms compilation and routing. Browser verification confirms visual rendering and navigation. No backend, no user data, no async flows — static page only.

## Preconditions

- `apps/web` dev server running (`cd apps/web && pnpm next dev`) or production build served locally
- Browser available at `localhost:3000`
- OR: Vercel deployment live at `driftless-six.vercel.app`

## Smoke Test

Navigate to `/pricing` — page loads with "BUILT FOR TEAMS THAT SHIP." headline and two tier cards visible. No 404, no blank page, no build errors.

## Test Cases

### 1. Pricing page renders with correct structure

1. Navigate to `/pricing`
2. Verify section label `[ PRICING ]` is visible in amber monospace text
3. Verify headline "BUILT FOR TEAMS THAT SHIP." is visible in display font
4. Verify two tier cards are visible: one labeled "PRO", one labeled "ENTERPRISE"
5. Verify each card has a "COMING SOON" badge
6. **Expected:** All five elements render with M006 brand styling — amber accent, thin 1px borders, correct fonts

### 2. PRO tier card content

1. Navigate to `/pricing`
2. Locate the PRO tier card
3. Verify it contains positioning copy referencing B2B SaaS teams with e2e tests
4. Verify it lists features (knowledge base, guided walkthroughs, demo videos or similar)
5. Verify "COMING SOON" badge is amber text at ≥18px font size
6. **Expected:** PRO card conveys that this tier is for product-led SaaS teams shipping frequently

### 3. ENTERPRISE tier card content

1. Navigate to `/pricing`
2. Locate the ENTERPRISE tier card
3. Verify it contains positioning copy referencing larger organizations, SSO, compliance
4. Verify it lists enterprise-specific features (SSO/SAML, dedicated support, autonomous pipeline or similar)
5. Verify "COMING SOON" badge is amber text at ≥18px font size
6. **Expected:** ENTERPRISE card conveys that this tier is for orgs with security and compliance needs

### 4. Nav [ PRICING ] link from landing page

1. Navigate to `/` (landing page)
2. Locate `[ PRICING ]` link in the navigation bar
3. Click the link
4. **Expected:** Browser navigates to `/pricing` via client-side routing (no full page reload). Pricing page renders correctly.

### 5. Footer Pricing link from landing page

1. Navigate to `/` (landing page)
2. Scroll to the footer
3. Locate "Pricing" link in the footer navigation row
4. Verify it appears alongside Docs, GitHub, and npm links
5. Click the Pricing link
6. **Expected:** Browser navigates to `/pricing`. Footer link order is Pricing, Docs, GitHub, npm.

### 6. Nav and Footer present on pricing page

1. Navigate to `/pricing`
2. Verify Nav bar is visible at top with brand name and `[ PRICING ]` link
3. Scroll to bottom of page
4. Verify Footer is visible with Pricing, Docs, GitHub, npm links
5. **Expected:** Pricing page has identical nav and footer to the landing page

### 7. Landing page unchanged after component extraction

1. Navigate to `/` (landing page)
2. Verify Nav bar renders: brand name left, CTA pill center, local time right
3. Verify all landing page sections load (hero, how-it-works, features, framework ticker)
4. Scroll to footer — verify all links present
5. **Expected:** Landing page is visually identical to pre-M007 state. No layout shifts, missing sections, or broken links.

### 8. Build verification

1. Run `cd apps/web && pnpm next build`
2. Verify exit code is 0
3. Grep output for `/pricing` — should appear as a static route (○)
4. Run `pnpm run test` from workspace root
5. **Expected:** Build succeeds with `/pricing` in route manifest. 268 tests pass with zero failures.

## Edge Cases

### GitHub note link

1. Navigate to `/pricing`
2. Locate the "building in public" section below the tier cards
3. Click the GitHub link
4. **Expected:** Opens the driftless GitHub repository (external navigation)

### Mobile viewport

1. Set browser to mobile width (~375px)
2. Navigate to `/pricing`
3. Verify tier cards stack vertically (not side-by-side)
4. Verify "COMING SOON" badges are still visible and readable
5. Verify footer links don't overflow
6. **Expected:** Page is responsive — no horizontal overflow, cards readable on mobile

### Direct URL access

1. Type `/pricing` directly in browser address bar (cold navigation, not via link)
2. **Expected:** Page renders correctly — not a client-only route that fails on direct access (it's a static page, should work)

## Failure Signals

- 404 at `/pricing` → page file missing or not inside `(home)` route group
- "Module not found" in build → broken import path in nav.tsx, footer.tsx, or pricing/page.tsx
- Missing nav/footer on pricing page → imports not wired correctly in pricing page
- Landing page layout broken → Nav/Footer extraction changed behavior (JSX/styles not preserved)
- "COMING SOON" text not visible → TierCard component rendering issue
- Test count < 268 → regression introduced by component extraction

## Requirements Proved By This UAT

- R021 (partially) — extends the marketing site with a working /pricing route reachable from nav and footer

## Not Proven By This UAT

- Vercel deployment rendering — requires push to main and Vercel build (operational verification)
- Pro tier actual pricing or signup flow — intentionally deferred (D090)
- Visual pixel-perfect regression testing — manual browser check only, no automated screenshot comparison

## Notes for Tester

- This is a static "coming soon" page. There are no interactive elements beyond navigation links.
- The amber color (`#C4862A`) should appear on section labels and "COMING SOON" badges. If it renders as default text color, the CSS variables aren't loading.
- WCAG AA requires ≥18px for amber text on white background. Check that "COMING SOON" badges meet this.
