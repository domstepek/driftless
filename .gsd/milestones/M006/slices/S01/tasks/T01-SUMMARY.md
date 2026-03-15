---
id: T01
parent: S01
milestone: M006
provides:
  - Complete brand identity specification at ~/Desktop/driftless/brand-identity.md with all design tokens
key_files:
  - ~/Desktop/driftless/brand-identity.md
key_decisions:
  - "7-step grayscale ramp (100–700) with warm-shifted hex values (#F5F5F3 → #2A2A24) to complement the warm amber accent"
  - "Fixed type scale (no fluid clamp) — brutalist aesthetic demands precision, not responsiveness"
  - "h1–h2 use --font-display (Familjen Grotesk 900), h3–h6 use --font-body weight 600 — clean hierarchy break"
  - "Amber (#C4862A) passes WCAG AA for large text only (4.6:1) — usage restricted to ≥18px, buttons, and decorative elements"
  - "Character density palette ordered by visual weight with edge characters (─│╭╮╰╯) context-sensitive based on surface normals"
patterns_established:
  - "CSS variable naming: --color-* for colors, --font-* for typography, --space-* for spacing (4px grid)"
  - "Semantic color aliases resolve to grayscale ramp tokens (--color-surface → --color-gray-100)"
  - "Component catalog uses spacing tokens exclusively — no hard-coded px values in component descriptions"
observability_surfaces:
  - "grep for any design token in brand-identity.md to verify specification presence"
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Write brand identity document with all design tokens

**Wrote the canonical brutalist-technical-white brand specification — 7 sections, all hex codes, font families, CSS variables, spacing scale, animation parameters, and component layouts with concrete values.**

## What Happened

Created `~/Desktop/driftless/brand-identity.md` with all 7 required sections:

1. **Reference Analysis** — broke down sutera.ch's design principles (condensed grotesque type, annotation-line schematic vocabulary, monochrome + accent restraint, data-card layouts) and mapped each to driftless adaptations (Familjen Grotesk, JetBrains Mono data labels, geological amber accent, ASCII mesa as hero centerpiece).

2. **Color System** — 3 primary colors, 7-step grayscale ramp, 5 semantic aliases, contrast ratios for all text-on-background combinations. Amber flagged as large-text-only per WCAG AA.

3. **Typography** — 3 font families with weights, `font-display` strategies, CSS variable names, fallback stacks, and strict usage rules (display only for h1–h2, body for everything else, mono for data).

4. **Type Scale** — 13 entries from h1 (4.5rem/72px) down to ticker (0.8125rem/13px) with font family, weight, line height, letter spacing, and text transform for each.

5. **Spacing Scale** — 13 tokens on 4px base grid from `--space-1` (4px) to `--space-32` (128px), plus layout constants (max-width, nav height, annotation width, border radius).

6. **Animation Spec** — mesa rotation parameters (0.4 RPM Y-axis, 5° X-wobble sinusoidal, 30fps cap), character density mapping table, color application rules (amber with per-stratum opacity), all three pause behaviors with priority ordering.

7. **Component Catalog** — 6 components (nav, hero, how-it-works, what-it-generates, ticker, footer) with layout rules, spacing tokens, typography assignments, and responsive behavior notes.

Appendix includes a complete CSS variable quick reference block ready for copy into `globals.css`.

## Verification

All task-level checks passed:
- `test -f ~/Desktop/driftless/brand-identity.md` — PASS
- `grep -c '^#' brand-identity.md` — 34 headings, all 7 major sections present
- Key values: `#FAFAF8`, `#0A0A0A`, `#C4862A`, `Familjen Grotesk`, `Instrument Sans`, `JetBrains Mono` — all PASS
- CSS variables: `--font-display`, `--font-body`, `--font-mono`, `--color-bg`, `--color-text`, `--color-amber` — all PASS

Slice-level checks (partial — T01 is intermediate):
- ✅ `brand doc OK` — brand-identity.md exists with all key tokens
- ⬜ `next build` — not yet relevant (no code changes in T01)
- ⬜ `pnpm run test` — not yet relevant (no code changes in T01)
- ⬜ `mesa-preview` browser check — T02 deliverable

## Diagnostics

This is a static specification document. Inspect with:
- `grep -q '<token>' ~/Desktop/driftless/brand-identity.md` for any design token
- `grep -c '^## [0-9]' ~/Desktop/driftless/brand-identity.md` should return 7 (one per major section)
- The appendix CSS block is copy-pasteable for quick token reference

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `~/Desktop/driftless/brand-identity.md` — Complete brand identity specification (7 sections, ~24KB)
- `.gsd/milestones/M006/slices/S01/tasks/T01-PLAN.md` — Added missing Observability Impact section (pre-flight fix)
