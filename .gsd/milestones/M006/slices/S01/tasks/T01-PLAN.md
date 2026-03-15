---
estimated_steps: 4
estimated_files: 1
---

# T01: Write brand identity document with all design tokens

**Slice:** S01 — Brand Identity + ASCII Mesa Component
**Milestone:** M006

## Description

Write the comprehensive brand identity document that defines the brutalist-technical-white design system for driftless. This is the canonical specification consumed by both T02's ASCII mesa component and S02's full landing page rebuild. Every design decision — colors, fonts, sizes, spacing, animation parameters, component layouts — gets concrete values here so downstream work implements a cohesive system.

The document follows direction set by D080 (brutalist-technical-white supersedes editorial-serif) and D084 (three Google Fonts). The sutera.ch reference drives the aesthetic: technical precision, generous whitespace, condensed grotesque type, monospace data labels, minimal color with one strong accent.

## Steps

1. Write the reference analysis section — break down what makes sutera.ch's design work (typography choices, whitespace rhythm, annotation-line patterns, data-card layouts, monochrome + accent approach) and how driftless adapts those patterns for a developer tool context
2. Write the color system section — define all hex values with CSS variable names: `--color-bg: #FAFAF8`, `--color-text: #0A0A0A`, `--color-amber: #C4862A`, grayscale ramp (at least 5 steps from near-white to near-black), semantic aliases (surface, muted, border, accent-hover). Include contrast ratio notes for accessibility.
3. Write the typography section — three font families with weights, `font-display` strategies, CSS variable names (`--font-display`, `--font-body`, `--font-mono`), and usage rules (when to use each). Familjen Grotesk 900 for display, Instrument Sans for body, JetBrains Mono for data/labels. Include fallback stacks.
4. Write the type scale, spacing scale, animation spec, and component catalog sections — type scale with concrete rem/px values for h1–h6, body, small, label; spacing scale on 4px base grid; animation spec with exact mesa rotation parameters (0.4 RPM, ~5° wobble, 30fps, character palette, pause behaviors); component catalog describing nav, hero with mesa, annotation lines, floating data cards, ticker marquee, and footer with layout rules and spacing.

## Must-Haves

- [ ] Reference analysis section with sutera.ch aesthetic breakdown
- [ ] Color system with all hex values and CSS variable names
- [ ] Typography section with 3 fonts, weights, font-display, CSS variables, fallback stacks
- [ ] Type scale with concrete rem values
- [ ] Spacing scale on 4px grid
- [ ] Animation spec with mesa rotation parameters and pause behaviors
- [ ] Component catalog with layout descriptions for all page sections

## Verification

- `test -f ~/Desktop/driftless/brand-identity.md` — file exists
- `grep -c '#' ~/Desktop/driftless/brand-identity.md` — has markdown headings for all 7 sections
- Key values present: `#FAFAF8`, `#0A0A0A`, `#C4862A`, `Familjen Grotesk`, `Instrument Sans`, `JetBrains Mono`, `--font-display`, `--font-body`, `--font-mono`, `--color-bg`, `--color-text`, `--color-amber`

## Observability Impact

- **Signals changed:** None — this task produces a static markdown document, not runtime code
- **Future agent inspection:** `grep -q '<token>' ~/Desktop/driftless/brand-identity.md` for any design token; section presence verified via heading grep; file existence is the primary health signal
- **Failure visibility:** If the document is incomplete or missing sections, downstream T02/S02 tasks will fail to find expected values when grepping for CSS variable names or hex codes. No runtime diagnostics — this is a specification artifact.

## Inputs

- D080: Brand direction — brutalist-technical-white modeled on sutera.ch
- D084: Three Google Fonts — Familjen Grotesk 900, Instrument Sans, JetBrains Mono
- D082: Custom layout replaces fumadocs HomeLayout for (home) route
- M006 roadmap: mesa rotation spec (0.4 RPM, character palette `╭╮╰╯─│·○░▒▓`)
- M006 boundary map: CSS variable names and design token contract for S02

## Expected Output

- `~/Desktop/driftless/brand-identity.md` — complete brand specification with all 7 sections containing concrete values (hex codes, font names, rem values, px values, animation parameters). No placeholders. Ready for T02 to reference for mesa colors/animation and S02 to consume for full page implementation.
