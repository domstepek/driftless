# S02: Business Operations — LLC, Pricing, Payment, GTM, Ops

**Goal:** Five business documents at `~/Desktop/driftless/` covering LLC formation, pricing model, payment infrastructure, go-to-market, and operations — grounded in specific data, internally consistent with S01's canonical ICP/timeline/features, and actionable without further research.
**Demo:** `ls ~/Desktop/driftless/0{2,5,6,7,8}*.md` shows all five files; each contains at least one Mermaid diagram; `grep` confirms canonical ICP phrase, phase timeline, and feature labels match S01 verbatim; LLC guide has URLs and dollar amounts for every step; pricing model has three revenue scenarios with explicit assumptions.

## Must-Haves

- `02-business-structure.md` — NY LLC formation guide with every step having a direct URL and exact dollar amount
- `05-pricing-model.md` — Three revenue scenarios (conservative/moderate/aggressive) with explicit per-scenario assumptions and competitor benchmark table
- `06-payment-infrastructure.md` — Lemon Squeezy rationale, fee modeling on $99/mo subscription, Stripe migration path
- `07-gtm-plan.md` — Phase 1/2/3 GTM strategy executable by one person with zero paid spend in Phases 1–2
- `08-operations-playbook.md` — 1–2 page monthly checklist with scaling triggers tied to phase timeline
- Albany RA strategy as PRIMARY recommendation (not footnote) with exact cost comparison vs NYC
- NYLTA correctly documented as NOT applying to domestically-formed NY LLCs (Hochul veto Dec 2025)
- Operating agreement documented as REQUIRED (within 90 days), not optional
- Canonical ICP phrase appears verbatim in all five docs
- Phase timeline and feature labels match S01 exactly
- Mermaid diagram in each of the five documents
- `pro-tier-features.md` and `m004-launch-playbook.md` unchanged (MD5 verified)

## Verification

- `ls ~/Desktop/driftless/02-business-structure.md ~/Desktop/driftless/05-pricing-model.md ~/Desktop/driftless/06-payment-infrastructure.md ~/Desktop/driftless/07-gtm-plan.md ~/Desktop/driftless/08-operations-playbook.md` — all five exist
- `grep -c 'mermaid' ~/Desktop/driftless/0{2,5,6,7,8}*.md` — each file ≥1 Mermaid block
- `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0{2,5,6,7,8}*.md` — returns all five files
- `grep 'Q1–Q3 2026' ~/Desktop/driftless/0{2,5,6,7,8}*.md` — Phase 1 timeline in at least pricing, GTM, and operations
- `grep 'Knowledge Base + Agent Skill' ~/Desktop/driftless/0{5,7}*.md` — feature labels in pricing and GTM
- `grep -i 'albany' ~/Desktop/driftless/02-business-structure.md | head -5` — Albany RA appears prominently
- `grep -i 'domestic.*exempt\|does not apply.*domestic\|exempt.*domestic' ~/Desktop/driftless/02-business-structure.md` — NYLTA exemption stated
- `grep -i 'operating agreement' ~/Desktop/driftless/02-business-structure.md | grep -i 'required\|must\|mandatory'` — OA requirement clear
- `grep -c 'conservative\|moderate\|aggressive' ~/Desktop/driftless/05-pricing-model.md` — three scenarios present
- `grep 'http' ~/Desktop/driftless/02-business-structure.md | wc -l` — multiple URLs in LLC guide
- `md5 ~/Desktop/driftless/pro-tier-features.md` = f93972b6985ec540a93df5fe3e120153
- `md5 ~/Desktop/driftless/m004-launch-playbook.md` = 6dc7ac0fa7b45c5d3f37671655530441
- `grep -c 'http' ~/Desktop/driftless/02-business-structure.md` — returns >0, confirming URLs are present (failure-path: 0 means guide lacks actionable links)
- `grep -ci 'mermaid' ~/Desktop/driftless/0{2,5,6,7,8}*.md | grep ':0$'` — returns empty (failure-path: any file with 0 Mermaid blocks is incomplete)

## Tasks

- [x] **T01: Write LLC guide, pricing model, and payment infrastructure docs** `est:25m`
  - Why: These three docs are tightly coupled — LLC establishes the entity, pricing defines what's charged, payment explains how charges are collected. They share cost data (LLC costs → ops budget, payment fees → revenue projections, pricing tiers → LS product config). Writing together ensures internal consistency.
  - Files: `~/Desktop/driftless/02-business-structure.md`, `~/Desktop/driftless/05-pricing-model.md`, `~/Desktop/driftless/06-payment-infrastructure.md`
  - Do: Write `02-business-structure.md` with step-by-step LLC formation (Articles of Org $200, EIN free, Albany RA strategy as primary, publication $150–350, Certificate of Publication $50, Certificate of Change $30, operating agreement required within 90 days, Mercury bank setup). Correct NYLTA — domestic LLCs exempt per Hochul veto. Every step gets a URL and dollar amount. Write `05-pricing-model.md` with $99/mo early adopter → $199–299/mo evolution, competitor benchmark table citing S01's product strategy figures, three revenue scenarios (conservative/moderate/aggressive) with explicit assumptions (OSS users, growth rate, trial conversion, paid conversion, churn, ARPU), Lemon Squeezy fee modeling (~6% effective on $99/mo). Write `06-payment-infrastructure.md` with Lemon Squeezy rationale (MoR, tax handling, no monthly fees), product/variant config for the tier, webhook events, test mode, fee breakdown, Stripe migration path section. Include canonical ICP, phase timeline, and feature labels verbatim in each doc. Mermaid diagram in each.
  - Verify: All three files exist; each has ≥1 Mermaid block; canonical ICP grep matches all three; Albany RA prominent in LLC guide; NYLTA exemption stated; three revenue scenarios in pricing; MD5 of protected files unchanged
  - Done when: Three docs written with grounded data, consistent with S01, every LLC step has URL + dollar amount, pricing has three explicit scenarios

- [x] **T02: Write GTM plan and operations playbook** `est:15m`
  - Why: GTM and operations are synthesis docs — they reference the entity (T01), pricing (T01), payment provider (T01), and S01's competitive landscape. Lighter research load; GTM extends m004-launch-playbook pattern for Pro tier.
  - Files: `~/Desktop/driftless/07-gtm-plan.md`, `~/Desktop/driftless/08-operations-playbook.md`
  - Do: Write `07-gtm-plan.md` with three-phase GTM: Phase 1 (OSS awareness — content marketing, community, conference talks, zero spend), Phase 2 (Pro tier launch — early adopter outreach, case studies, developer communities, still one person), Phase 3 (scale — partnerships, paid, team). Reference m004-launch-playbook as Phase 1 foundation. Include channel-by-channel strategy with expected impact. Write `08-operations-playbook.md` as 1–2 page monthly checklist: LLC maintenance (biennial statement $9, annual filing fee $25, registered agent renewal), financial ops (Mercury reconciliation, tax prep, LS payout review), product ops (churn review, usage metrics, support triage), scaling triggers tied to phase timeline. Include canonical ICP, phase timeline, and feature labels verbatim. Mermaid diagram in each. Run full slice verification suite after both docs are written.
  - Verify: Both files exist; Mermaid blocks present; canonical ICP in both; GTM phases match timeline; operations ≤2 pages of content; all 5 S02 docs pass full verification suite; protected file MD5s unchanged
  - Done when: All five S02 docs exist, pass cross-reference consistency checks, and protected files are unmodified

## Observability / Diagnostics

These are document-writing tasks, not runtime code. Observability is file-system and content verification:

- **File existence:** `ls ~/Desktop/driftless/0{2,5,6,7,8}*.md` confirms all five deliverables exist.
- **Content integrity:** `grep` checks for canonical ICP, phase timeline, feature labels, and Mermaid blocks verify cross-document consistency.
- **Protected file integrity:** MD5 checks on `pro-tier-features.md` and `m004-launch-playbook.md` detect accidental modification.
- **Failure visibility:** If a document is missing or a content check fails, the specific grep command reports exactly which file/pattern is missing — no silent failures.
- **No secrets or credentials** are handled in S02 documents. No redaction constraints apply.

## Files Likely Touched

- `~/Desktop/driftless/02-business-structure.md`
- `~/Desktop/driftless/05-pricing-model.md`
- `~/Desktop/driftless/06-payment-infrastructure.md`
- `~/Desktop/driftless/07-gtm-plan.md`
- `~/Desktop/driftless/08-operations-playbook.md`
