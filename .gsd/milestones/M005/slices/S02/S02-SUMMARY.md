---
id: S02
parent: M005
milestone: M005
provides:
  - NY LLC formation guide with 8 steps, 18 URLs, Albany RA as primary strategy, NYLTA exemption documented
  - Pricing model with three revenue scenarios (conservative/moderate/aggressive), competitor benchmarks, LS fee modeling
  - Payment infrastructure doc with Lemon Squeezy rationale, webhook lifecycle, Stripe migration path
  - Three-phase GTM plan extending m004-launch-playbook with channel strategy and funnel benchmarks
  - Monthly operations playbook with LLC/financial/product checklists and five scaling triggers
requires:
  - slice: S01
    provides: Canonical ICP phrase, phase timeline, feature labels (a)–(d), competitive landscape table
key_files:
  - ~/Desktop/driftless/02-business-structure.md
  - ~/Desktop/driftless/05-pricing-model.md
  - ~/Desktop/driftless/06-payment-infrastructure.md
  - ~/Desktop/driftless/07-gtm-plan.md
  - ~/Desktop/driftless/08-operations-playbook.md
key_decisions:
  - Albany RA strategy as primary LLC recommendation (saves $650–$1,650+ vs NYC publication)
  - $99/mo early adopter → $199–$299/mo standard framed as pricing evolution, not contradiction with S01's $200–$500 range
  - GTM qualitative-only channel impact — refused to fabricate conversion numbers for untested channels
  - Ops playbook scaling triggers at concrete thresholds (20+ customers → annual billing, $10K MRR → first hire, 20% international → Stripe migration)
patterns_established:
  - Each doc opens with Context section containing canonical ICP, phase timeline table, and feature list — grep-verifiable across all five
  - Revenue scenarios use explicit per-scenario assumption tables with benchmark anchors cited
observability_surfaces:
  - "File existence: ls ~/Desktop/driftless/0{2,5,6,7,8}*.md"
  - "Cross-doc consistency: grep for canonical ICP, timeline, feature labels across all five S02 docs"
  - "Protected file integrity: md5 ~/Desktop/driftless/pro-tier-features.md ~/Desktop/driftless/m004-launch-playbook.md"
drill_down_paths:
  - .gsd/milestones/M005/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S02/tasks/T02-SUMMARY.md
duration: 26m
verification_result: passed
completed_at: 2026-03-14
---

# S02: Business Operations — LLC, Pricing, Payment, GTM, Ops

**Five business documents covering LLC formation (actionable today with URLs and costs), pricing model (three revenue scenarios with grounded assumptions), payment infrastructure (Lemon Squeezy setup with Stripe migration path), go-to-market plan (three-phase, zero-spend through Phase 2), and operations playbook (monthly checklist with scaling triggers).**

## What Happened

T01 wrote three tightly coupled documents: LLC formation guide, pricing model, and payment infrastructure. The LLC guide has 8 steps with every step linking to a URL and showing an exact dollar amount. Albany RA strategy is the primary recommendation with explicit cost comparison ($150–$350 Albany vs $1,000–$2,000+ NYC). NYLTA correctly documented as not applying to domestically-formed NY LLCs (Hochul veto Dec 2025). Operating agreement documented as legally required within 90 days under LLCL §417. Pricing model bridges S01's $200–$500 positioning range with the $99/mo early adopter strategy, includes competitor benchmark table from S01's product strategy figures, and has three full revenue scenarios with all inputs explicit per scenario. Payment infrastructure doc covers LS rationale (MoR eliminates tax registration), fee breakdown, webhook lifecycle, and Stripe migration path with triggers and effort estimate.

T02 wrote two synthesis documents. GTM plan extends the existing m004-launch-playbook for Phase 1, adds Pro tier outreach for Phase 2, and scaled acquisition for Phase 3 — all executable by one person with zero paid spend through Phase 2. Explicitly refused to fabricate per-channel conversion numbers for untested channels. Operations playbook is a concise 94-line monthly checklist covering LLC maintenance, financial ops, and product ops with five scaling triggers tied to the phase timeline.

All five documents share the canonical ICP phrase, phase timeline, and feature labels verbatim from S01 — every cross-reference consistency check passes.

## Verification

All 14 slice-level checks passed:
- All five files exist at `~/Desktop/driftless/` ✓
- Each has ≥1 Mermaid block, no file has 0 ✓
- Canonical ICP phrase appears in all five files ✓
- Q1–Q3 2026 phase timeline consistent across all five ✓
- Feature labels (Knowledge Base + Agent Skill) in pricing and GTM ✓
- Albany RA prominent in LLC guide ✓
- NYLTA domestic exemption stated ✓
- Operating agreement documented as required ✓
- Three revenue scenarios in pricing model ✓
- 18 URLs in LLC guide ✓
- Protected file MD5s unchanged (pro-tier-features.md, m004-launch-playbook.md) ✓

## Requirements Advanced

No active requirements are relevant to M005 S02. R025 (Claude-first constraint) is the only active requirement and is unrelated to business document writing.

## Requirements Validated

None — M005 capabilities are outside the existing requirement contract.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Deviations

None. Both tasks executed as planned.

## Known Limitations

- Revenue scenario projections are based on published SaaS benchmarks, not driftless-specific data — the actual conversion funnel won't exist until Pro tier ships
- Lemon Squeezy fee modeling uses blended estimates (~6.6% effective); actual rates may vary by payment method mix
- GTM channel impact is qualitative-only until real data exists from execution
- NYLTA status is correct as of Dec 2025 veto but could change in future legislative sessions

## Follow-ups

None. S03 (Synthesis + Scaffold) consumes these five documents as input.

## Files Created/Modified

- `~/Desktop/driftless/02-business-structure.md` — NY LLC formation guide (8 steps, 18 URLs, Albany RA primary, NYLTA exemption, OA required)
- `~/Desktop/driftless/05-pricing-model.md` — Pricing model with competitor benchmarks, 3 revenue scenarios, LS fee modeling
- `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy setup, fee breakdown, webhook lifecycle, Stripe migration path
- `~/Desktop/driftless/07-gtm-plan.md` — Three-phase GTM plan with channel strategy, funnel benchmarks, Mermaid diagram
- `~/Desktop/driftless/08-operations-playbook.md` — Monthly ops checklist (94 lines) with LLC/financial/product checklists, five scaling triggers
- `.gsd/milestones/M005/slices/S02/S02-PLAN.md` — Added Observability/Diagnostics section and diagnostic failure-path checks
- `.gsd/milestones/M005/slices/S02/tasks/T01-PLAN.md` — Added Observability Impact section
- `.gsd/milestones/M005/slices/S02/tasks/T02-PLAN.md` — Added Observability Impact section

## Forward Intelligence

### What the next slice should know
- All five S02 docs use the same Context section pattern as S01 — canonical ICP, phase timeline table, and feature list at the top. S03's executive summary should synthesize these, not re-derive them.
- The LLC entity name used throughout is "Driftless AI LLC" — keep this consistent in the executive summary and pitch deck outline.
- Pricing evolution is framed as $99/mo early adopter → $199–$299/mo standard. S01's $200–$500/mo is the competitive positioning range, not a contradiction.
- Payment provider decision is Lemon Squeezy with Stripe as the migration target at scale. This is the architecture decision S03 should append to DECISIONS.md.

### What's fragile
- Revenue projections anchor to SaaS benchmark ranges (e.g., 2–5% free→trial conversion). If the actual product funnel differs significantly, the three scenarios need recalculation.
- NYLTA exemption depends on a December 2025 veto. If new legislation passes, the LLC guide section needs updating.

### Authoritative diagnostics
- `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0{2,5,6,7,8}*.md` — should return all five files; if any is missing, cross-doc consistency is broken
- `md5 ~/Desktop/driftless/pro-tier-features.md ~/Desktop/driftless/m004-launch-playbook.md` — protected file integrity check

### What assumptions changed
- None. All assumptions from the slice plan held.
