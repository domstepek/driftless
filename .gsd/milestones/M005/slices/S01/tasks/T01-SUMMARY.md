---
id: T01
parent: S01
milestone: M005
provides:
  - Canonical vision strategy document (00-vision-strategy.md) with three-phase evolution narrative
  - Canonical product strategy document (03-product-strategy.md) with grounded competitive landscape and ICP
  - Canonical ICP definition used verbatim across all M005 documents
  - Competitive pricing data for 5 DAP/onboarding incumbents with specific dollar figures
  - Market sizing anchored to analyst reports (DAP $1.9B, KM $22.9B)
key_files:
  - ~/Desktop/driftless/00-vision-strategy.md
  - ~/Desktop/driftless/03-product-strategy.md
key_decisions:
  - Canonical ICP phrase is "B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers, shipping frequently with an existing e2e test suite" — all M005 docs reference this verbatim
  - Phase timeline: Phase 1 Q1–Q3 2026 (M001–M004), Phase 2 Q4 2026–Q2 2027 (M006–M008), Phase 3 Q3 2027+ (M009+)
  - Competitive pricing sourced from Vendr procurement data, G2, and public pricing pages — not fabricated. Custom-pricing competitors (Pendo, WalkMe, Whatfix) cite median/range from procurement aggregators.
patterns_established:
  - Cross-document consistency: identical ICP, phase names, quarter targets, and feature labels across vision and product strategy
  - Grounded claims pattern: every market size and pricing figure cites a specific source
observability_surfaces:
  - grep for canonical ICP phrase across ~/Desktop/driftless/*.md confirms cross-doc consistency
  - grep -c '```mermaid' per doc confirms diagram presence
  - MD5 checksums of untouched files (pro-tier-features.md, m004-launch-playbook.md) confirm no collateral damage
duration: 25m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Write vision strategy and product strategy documents with grounded competitive research

**Wrote two foundational strategy documents with specific competitor pricing from 5 incumbents, analyst-sourced market sizing ($1.9B DAP, $22.9B KM), and a canonical ICP definition shared verbatim across both docs.**

## What Happened

1. **Research phase:** Searched for current pricing data on all five competitors (Pendo, WalkMe, Whatfix, Appcues, Userpilot) plus DAP and knowledge management market sizing. All pricing data sourced from Vendr procurement data, G2, public pricing pages, and analyst reports — no fabricated figures.

   Key findings:
   - Pendo: custom pricing, median ~$47K/year mid-market, $120–140K enterprise (Vendr/Spendflo)
   - WalkMe: custom pricing, avg ~$79K/year, acquired by SAP June 2024 (Clarkston Consulting)
   - Whatfix: custom pricing, avg ~$32K/year, Standard $24–40K, Premium $40–80K (Vendr)
   - Appcues: public pricing — Essentials $249/mo, Growth $879/mo, Enterprise custom
   - Userpilot: public pricing — Starter $299/mo, Growth $799/mo, Enterprise ~$2–4K+/mo
   - DAP market: $1.9B (2025), projected $2.8B by 2030, CAGR 23% (Dimension Market Research, KBV Research)
   - KM software market: $22.9B (2025), projected $43.3B by 2030 (Fortune Business Insights)

2. **Vision strategy (00-vision-strategy.md):** Three-phase evolution narrative with Mermaid timeline diagram, growth model (bootstrapped → sponsors → Pro revenue → team), strategic risk table, and the "wedge works" argument.

3. **Product strategy (03-product-strategy.md):** Canonical ICP definition with detail table, competitive landscape with two tables (5 DAP competitors + 3 KB competitors) including specific dollar-amount pricing, Mermaid quadrant chart for competitive positioning, TAM/SAM/SOM market sizing, positioning statement, and phased product roadmap matching vision doc exactly.

4. **Cross-reference audit:** Verified ICP phrase, phase names (1/2/3), quarter targets (Q1–Q3 2026, Q4 2026–Q2 2027, Q3 2027+), and feature labels (a)–(d) are identical between both documents.

## Verification

All task-level checks passed:
- ✅ `ls` — both files exist at ~/Desktop/driftless/
- ✅ `grep -c '```mermaid'` — ≥1 in both (1 each)
- ✅ `grep -c 'Pendo\|WalkMe\|Whatfix\|Appcues'` in product strategy — 11 (≥4 required)
- ✅ `grep '50.*500\|50–500'` — ICP size appears in both docs (4 matches total)
- ✅ MD5 pro-tier-features.md — f93972b6985ec540a93df5fe3e120153 (unchanged)
- ✅ MD5 m004-launch-playbook.md — 6dc7ac0fa7b45c5d3f37671655530441 (unchanged)
- ✅ Specific dollar amounts in competitive table — 20+ figures with sources
- ✅ Market sizing cites specific figures: $1.9B, $2.8B, $22.9B, $43.3B

Slice-level checks (partial — T02 still pending):
- ✅ 00-vision-strategy.md and 03-product-strategy.md exist
- ⏳ 04-product-requirements.md — T02 deliverable, does not exist yet
- ✅ Pendo appears in product strategy
- ✅ ICP description appears in both T01 docs
- ✅ Phase names and quarter targets match
- ✅ Feature names (a)–(d) present in product strategy
- ⏳ Feature names (a)–(d) use identical labels in product strategy and PRD — T02
- ⏳ PRD feature detail checks — T02
- ✅ pro-tier-features.md and m004-launch-playbook.md preserved

## Diagnostics

- `grep 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0*.md` — confirms canonical ICP in any doc
- `grep -c '```mermaid' ~/Desktop/driftless/0*.md` — confirms Mermaid presence per doc
- `md5 ~/Desktop/driftless/pro-tier-features.md ~/Desktop/driftless/m004-launch-playbook.md` — confirms untouched files

## Deviations

None. Executed as planned.

## Known Issues

None.

## Files Created/Modified

- `~/Desktop/driftless/00-vision-strategy.md` — Vision strategy with three-phase narrative, Mermaid timeline, growth model, strategic risks
- `~/Desktop/driftless/03-product-strategy.md` — Product strategy with canonical ICP, grounded competitive landscape (8 competitors), market sizing, positioning, Mermaid quadrant chart
- `.gsd/milestones/M005/slices/S01/S01-PLAN.md` — Added Observability / Diagnostics section (pre-flight fix)
- `.gsd/milestones/M005/slices/S01/tasks/T01-PLAN.md` — Added Observability Impact section (pre-flight fix)
