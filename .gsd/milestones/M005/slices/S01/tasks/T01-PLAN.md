---
estimated_steps: 5
estimated_files: 3
---

# T01: Write vision strategy and product strategy documents with grounded competitive research

**Slice:** S01 — Strategic Foundation — Vision, Product Strategy, PRD
**Milestone:** M005

## Description

Write the two foundational documents that establish canonical definitions for the entire M005 document library. The vision strategy defines the three-phase evolution narrative (OSS CLI → Pro platform → autonomous pipeline). The product strategy defines the ICP, competitive landscape with real pricing data, market sizing, and positioning. These canonical definitions are referenced verbatim by all downstream docs (pricing, GTM, operations, executive summary, pitch deck).

The primary risk this task retires is "generic boilerplate vs grounded analysis" — every market claim, pricing comparison, and market size figure must trace to a specific public source, not AI-generated platitudes.

## Steps

1. Research current competitor pricing and market data via web search:
   - Pendo pricing (enterprise-tier annual contract)
   - WalkMe pricing (enterprise-tier annual contract)
   - Whatfix pricing tiers
   - Appcues pricing tiers (public pricing page)
   - Userpilot pricing tiers (public pricing page)
   - DAP (Digital Adoption Platform) market size from recent analyst estimates
   - Knowledge base / internal wiki market size
2. Write `~/Desktop/driftless/00-vision-strategy.md`:
   - Opening narrative: what driftless is becoming and why
   - Three-phase evolution with quarter estimates and milestone mapping (Phase 1: OSS/M001-M004, Phase 2: Pro features a-c/M006-M008, Phase 3: autonomous pipeline/M009+)
   - Mermaid timeline/roadmap diagram showing phases with milestones
   - Growth model: bootstrapped → sponsors → Pro revenue → team scaling
   - Why the wedge works: e2e tests as the universal source of truth
3. Write `~/Desktop/driftless/03-product-strategy.md`:
   - Canonical ICP definition (B2B SaaS, 50–500 employees, PLG, 10–50 engineers) — this exact description must be reusable verbatim
   - Competitive landscape table: ≥4 competitors with specific pricing, positioning, limitations, and driftless differentiation
   - Market sizing: DAP market ($2.5B+), knowledge management market, total addressable from analyst estimates
   - Positioning statement: the "always-current from e2e tests" wedge
   - Phased product roadmap with the same phases/quarters as the vision doc
   - Mermaid diagram (competitive positioning map or market landscape)
4. Cross-reference audit: verify ICP description, phase names, quarter targets, and feature names are identical between the two documents
5. Verify neither `pro-tier-features.md` nor `m004-launch-playbook.md` was modified

## Must-Haves

- [ ] `00-vision-strategy.md` exists at `~/Desktop/driftless/` with ≥1 Mermaid diagram
- [ ] `03-product-strategy.md` exists at `~/Desktop/driftless/` with ≥1 Mermaid diagram
- [ ] Competitive landscape table includes ≥4 named competitors with specific dollar-amount pricing
- [ ] ICP definition uses identical language in both documents
- [ ] Phase names and quarter estimates match between both documents
- [ ] Market sizing cites specific figures (not "large and growing" or similar vague claims)
- [ ] Existing files `pro-tier-features.md` and `m004-launch-playbook.md` are untouched

## Verification

- `ls ~/Desktop/driftless/00-vision-strategy.md ~/Desktop/driftless/03-product-strategy.md` — both exist
- `grep -c '```mermaid' ~/Desktop/driftless/00-vision-strategy.md` — ≥ 1
- `grep -c '```mermaid' ~/Desktop/driftless/03-product-strategy.md` — ≥ 1
- `grep -c 'Pendo\|WalkMe\|Whatfix\|Appcues' ~/Desktop/driftless/03-product-strategy.md` — ≥ 4 (multiple competitor references)
- `grep '50.*500\|50–500' ~/Desktop/driftless/00-vision-strategy.md ~/Desktop/driftless/03-product-strategy.md` — ICP size appears in both
- `md5 ~/Desktop/driftless/pro-tier-features.md` matches pre-task value (file unchanged)

## Observability Impact

- **What changes:** Two new markdown files appear at `~/Desktop/driftless/`. No runtime code, no services — these are static documents.
- **How a future agent inspects this task:** `ls ~/Desktop/driftless/0{0,3}-*.md` confirms files exist. `grep` for canonical phrases (ICP, phase names, competitor names) confirms content quality. MD5 of untouched files confirms no collateral damage.
- **Failure visibility:** If competitive research yields incomplete data, the competitive table cells explicitly state "not publicly listed" with a note on the research method attempted — never silently fabricated.

## Inputs

- `~/Desktop/driftless/pro-tier-features.md` — existing feature specifications, read for feature naming and scope alignment (not modified)
- `.gsd/milestones/M005/M005-CONTEXT.md` — ICP definition, competitive landscape sketch, phased execution model
- `.gsd/milestones/M005/M005-ROADMAP.md` — boundary map defining what canonical definitions S01 must produce for S02/S03

## Expected Output

- `~/Desktop/driftless/00-vision-strategy.md` — complete vision strategy document with three-phase narrative, Mermaid timeline, growth model
- `~/Desktop/driftless/03-product-strategy.md` — complete product strategy with canonical ICP, grounded competitive landscape table, market sizing, positioning, Mermaid diagram
