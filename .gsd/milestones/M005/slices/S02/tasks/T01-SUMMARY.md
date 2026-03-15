---
id: T01
parent: S02
milestone: M005
provides:
  - NY LLC formation guide with step-by-step instructions, URLs, and costs
  - Pricing model with three revenue scenarios and competitor benchmarks
  - Payment infrastructure doc with Lemon Squeezy setup and Stripe migration path
key_files:
  - ~/Desktop/driftless/02-business-structure.md
  - ~/Desktop/driftless/05-pricing-model.md
  - ~/Desktop/driftless/06-payment-infrastructure.md
key_decisions:
  - Albany RA strategy as primary LLC recommendation (saves $650–$1,650+ vs NYC publication)
  - $99/mo early adopter → $199–$299/mo standard framed as pricing evolution, not contradiction with S01's $200–$500 range
  - Moderate revenue scenario ($18.5K MRR at Month 12) as planning target; $5K MRR reached by Month 7
  - Blended LS fee estimate of ~6.6% effective rate (70% US card, 20% intl card, 10% PayPal)
patterns_established:
  - Canonical ICP phrase, phase timeline, and feature labels appear verbatim in each business doc — grep-verifiable
  - Each doc opens with Context section containing ICP, timeline table, and feature list for cross-doc consistency
  - Revenue scenarios use explicit per-scenario assumption tables with benchmark anchors cited
observability_surfaces:
  - File existence: `ls ~/Desktop/driftless/0{2,5,6}*.md`
  - Content integrity: grep for canonical ICP, Albany, NYLTA exemption, revenue scenarios, URLs
  - Protected files: MD5 verification on pro-tier-features.md and m004-launch-playbook.md
duration: 18m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Write LLC guide, pricing model, and payment infrastructure docs

**Wrote three internally consistent business documents: LLC formation guide (8 steps, 18 URLs, Albany RA as primary strategy), pricing model (3 revenue scenarios, competitor benchmarks, LS fee modeling), and payment infrastructure (LS setup, webhook lifecycle, Stripe migration path).**

## What Happened

Read S01 outputs (00-vision-strategy.md, 03-product-strategy.md, 04-product-requirements.md) and S02-RESEARCH.md to extract canonical data: ICP phrase, phase timeline, feature labels (a)–(d), competitor pricing table, LS fee structure, Albany publication costs, NYLTA correction, Mercury requirements, SaaS conversion benchmarks.

Wrote `02-business-structure.md` with 8-step formation sequence. Every step has a URL and dollar amount. Albany RA is the primary recommendation with explicit cost comparison ($150–$350 Albany vs $1,000–$2,000+ NYC). NYLTA section correctly states domestic LLCs are exempt per Hochul's Dec 2025 veto. Operating agreement documented as legally required within 90 days under LLCL §417. Mermaid flowchart shows formation sequence. Ongoing compliance section covers annual filing fee ($25) and biennial statement ($9).

Wrote `05-pricing-model.md` with competitor benchmark table citing S01's specific figures, $99→$199–$299 pricing evolution explicitly bridged, LS fee modeling (~6% effective on $99/mo domestic), and three full revenue scenarios (conservative/moderate/aggressive) with all inputs explicit per scenario: OSS users, growth rate, free→trial conversion, trial→paid conversion, churn, ARPU. Benchmarks cited from StateShift, ChartMogul, GrowthUnhinged 2025. Moderate scenario hits $5K MRR target by Month 7. Mermaid chart shows MRR growth comparison.

Wrote `06-payment-infrastructure.md` with LS rationale (MoR eliminates tax registration burden), fee breakdown on all payment scenarios, product/variant configuration for Pro tier, webhook event table with subscription lifecycle sequence diagram (Mermaid), LS API reference, and Stripe migration path with triggers, effort estimate (30–60 hours), and parallel migration strategy.

Fixed pre-flight observability gaps: added Observability/Diagnostics section to S02-PLAN.md, diagnostic failure-path checks to slice verification, and Observability Impact section to T01-PLAN.md.

## Verification

All task-level checks passed:
- `ls` — all three files exist ✅
- `grep -c 'mermaid'` — each file ≥1 Mermaid block ✅
- `grep -l` canonical ICP — matches all three files ✅
- `grep -i 'albany'` — prominent in LLC guide (appears in flowchart, Step 2, Step 5 heading) ✅
- `grep -i 'exempt'` — NYLTA domestic exemption stated ✅
- `grep -i 'operating agreement' | grep -i 'required'` — legally required, within 90 days ✅
- `grep -c 'conservative|moderate|aggressive'` — 11 matches (≥3) ✅
- `grep 'http' | wc -l` — 18 URLs in LLC guide ✅
- `md5 pro-tier-features.md` = f93972b6985ec540a93df5fe3e120153 ✅
- `md5 m004-launch-playbook.md` = 6dc7ac0fa7b45c5d3f37671655530441 ✅

Slice-level checks (partial — T02 files not yet written):
- Q1–Q3 2026 timeline in all three T01 files ✅
- Knowledge Base + Agent Skill label in pricing ✅
- NYLTA domestic exempt pattern matches ✅
- Mermaid zero-count failure check — empty (good) ✅
- 07-gtm-plan.md and 08-operations-playbook.md do not exist yet (expected, T02 scope) ✅

## Diagnostics

These are static documents. Inspection is via filesystem and grep:
- File existence: `ls ~/Desktop/driftless/0{2,5,6}*.md`
- Canonical ICP: `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0{2,5,6}*.md`
- Albany: `grep -i 'albany' ~/Desktop/driftless/02-business-structure.md | head -5`
- Revenue scenarios: `grep -c 'conservative\|moderate\|aggressive' ~/Desktop/driftless/05-pricing-model.md`
- Protected files: `md5 ~/Desktop/driftless/pro-tier-features.md ~/Desktop/driftless/m004-launch-playbook.md`

## Deviations

None. All steps executed as planned.

## Known Issues

None.

## Files Created/Modified

- `~/Desktop/driftless/02-business-structure.md` — NY LLC formation guide (8 steps, URLs, costs, Albany RA primary, NYLTA exemption, OA required)
- `~/Desktop/driftless/05-pricing-model.md` — Pricing model with competitor benchmarks, 3 revenue scenarios, LS fee modeling
- `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy setup, fee breakdown, webhook lifecycle, Stripe migration path
- `.gsd/milestones/M005/slices/S02/S02-PLAN.md` — Added Observability/Diagnostics section and diagnostic failure-path verification checks
- `.gsd/milestones/M005/slices/S02/tasks/T01-PLAN.md` — Added Observability Impact section
