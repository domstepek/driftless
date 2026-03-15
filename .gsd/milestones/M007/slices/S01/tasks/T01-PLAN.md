---
estimated_steps: 5
estimated_files: 3
---

# T01: Extract Nav and Footer into shared components

**Slice:** S01 — Pricing page with nav/footer integration
**Milestone:** M007

## Description

Extract the `Nav()` and `Footer()` inline function components from `apps/web/app/(home)/page.tsx` into dedicated files at `apps/web/components/nav.tsx` and `apps/web/components/footer.tsx`. Update `page.tsx` to import them. This is a behavior-identical refactor — the landing page must render exactly the same after extraction.

## Steps

1. Read `apps/web/app/(home)/page.tsx` to identify the exact boundaries of `Nav()` and `Footer()` functions and their dependencies (imports, CSS classes, local variables)
2. Create `apps/web/components/nav.tsx` — move `Nav` function as a named export. Include the `LocalTime` import from `./local-time`. Ensure all JSX, CSS variable references, and Tailwind classes are preserved exactly.
3. Create `apps/web/components/footer.tsx` — move `Footer` function as a named export. Include the `Link` import from `next/link` and any other dependencies.
4. Update `apps/web/app/(home)/page.tsx` — remove the inline `Nav` and `Footer` definitions, add imports from `@/components/nav` and `@/components/footer`. Preserve the component composition order in the page JSX.
5. Run `cd apps/web && pnpm next build` and `pnpm run test` to confirm zero regression.

## Must-Haves

- [ ] `Nav` is exported from `components/nav.tsx` with identical markup and behavior
- [ ] `Footer` is exported from `components/footer.tsx` with identical markup and behavior
- [ ] `page.tsx` imports and renders both without any visible change
- [ ] `next build` exits 0
- [ ] `pnpm run test` passes 268

## Verification

- `cd apps/web && pnpm next build` exits 0 — all existing routes present in output
- `pnpm run test` passes 268

## Observability Impact

- **No new runtime signals** — this is a behavior-identical refactor. No new logs, metrics, or error paths introduced.
- **Future agent inspection**: A future agent can verify this task by checking that `components/nav.tsx` and `components/footer.tsx` exist as named exports, and that `page.tsx` imports from `@/components/nav` and `@/components/footer`. `grep -r "from.*@/components/nav" apps/web/app` confirms wiring.
- **Failure visibility**: If the extraction breaks imports, `next build` will emit `Module not found: Can't resolve '@/components/nav'` (or footer) with the exact file and line — no silent failures.

## Inputs

- `apps/web/app/(home)/page.tsx` — source of Nav and Footer inline functions
- `apps/web/components/local-time.tsx` — client component imported by Nav

## Expected Output

- `apps/web/components/nav.tsx` — extracted Nav component
- `apps/web/components/footer.tsx` — extracted Footer component
- `apps/web/app/(home)/page.tsx` — modified to import Nav/Footer from components
