---
estimated_steps: 4
estimated_files: 2
---

# T02: Write GTM plan and operations playbook

**Slice:** S02 — Business Operations — LLC, Pricing, Payment, GTM, Ops
**Milestone:** M005

## Description

Write the two synthesis documents of S02. The GTM plan references the pricing model, payment provider, and competitive landscape to define a three-phase go-to-market strategy executable by one person. The operations playbook is a concise monthly checklist covering LLC maintenance, financial ops, and product ops with scaling triggers tied to the phase timeline. After writing both, run the full slice verification suite across all five S02 documents.

## Steps

1. Read T01 outputs (`02-business-structure.md`, `05-pricing-model.md`, `06-payment-infrastructure.md`) for LLC entity details, pricing tier structure, payment provider choice, and revenue scenario data to reference in GTM and operations.

2. Write `~/Desktop/driftless/07-gtm-plan.md` — Go-to-market strategy:
   - Three-phase GTM aligned to canonical timeline:
     - Phase 1 (Q1–Q3 2026): OSS awareness — content marketing (blog posts on e2e-to-docs, dev community posts), GitHub presence, conference lightning talks, open-source community engagement. Reference `m004-launch-playbook.md` as the foundation (don't duplicate — extend). Zero paid spend. One person.
     - Phase 2 (Q4 2026–Q2 2027): Pro tier launch — early adopter outreach to ICP companies, case studies from first 20 customers, developer community partnerships (Discord, Slack communities), product-led growth via OSS→Pro funnel. Zero paid spend. One person.
     - Phase 3 (Q3 2027+): Scale — partnerships with CI/CD platforms, potential paid acquisition (budget TBD based on revenue), consider first hire (developer advocate or part-time support).
   - Channel-by-channel strategy with expected impact (qualitative — don't fabricate conversion numbers for untested channels).
   - Funnel diagram: OSS users → trial → paid, with benchmark conversion rates from research (5% freemium-to-paid, 15–25% trial-to-paid).
   - Mermaid diagram (funnel or phase timeline).
   - Canonical ICP, phase timeline, feature labels verbatim.

3. Write `~/Desktop/driftless/08-operations-playbook.md` — Monthly ops checklist (1–2 pages max):
   - LLC/Legal: biennial statement ($9, due every 2 years), annual filing fee ($25 for <$100K income, Form IT-204-LL), registered agent renewal, operating agreement review.
   - Financial: Mercury account reconciliation, Lemon Squeezy payout review, quarterly tax estimates, annual tax prep.
   - Product: churn review, usage metrics, support triage, feature prioritization.
   - Scaling triggers: when to add annual pricing (after 20+ monthly customers), when to consider hiring (after $10K MRR), when to evaluate Stripe migration (after international volume exceeds 20%).
   - Mermaid diagram (ops cycle or scaling trigger flowchart).
   - Canonical ICP, phase timeline, feature labels verbatim.

4. Run full slice verification: all five S02 files exist, each has Mermaid, canonical ICP in all five, phase timeline consistent, feature labels consistent, Albany RA prominent, NYLTA exemption correct, three revenue scenarios, URLs in LLC guide, operations ≤2 pages, protected file MD5s unchanged. Fix any issues found.

## Must-Haves

- [ ] `07-gtm-plan.md` exists with three-phase GTM strategy
- [ ] Phase 1 and 2 GTM executable by one person with zero paid spend
- [ ] GTM references m004-launch-playbook.md as Phase 1 foundation (extends, doesn't duplicate)
- [ ] `08-operations-playbook.md` exists as ≤2 pages of actionable checklist content
- [ ] Operations includes scaling triggers tied to phase timeline
- [ ] Canonical ICP phrase verbatim in both docs
- [ ] Phase timeline matches S01 exactly in both docs
- [ ] Mermaid diagram in each doc
- [ ] Full slice verification passes across all five S02 docs

## Verification

- `ls ~/Desktop/driftless/07-gtm-plan.md ~/Desktop/driftless/08-operations-playbook.md` — both exist
- `grep -c 'mermaid' ~/Desktop/driftless/07-gtm-plan.md ~/Desktop/driftless/08-operations-playbook.md` — each ≥1
- `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/07-gtm-plan.md ~/Desktop/driftless/08-operations-playbook.md` — both
- `grep 'Q1–Q3 2026' ~/Desktop/driftless/07-gtm-plan.md ~/Desktop/driftless/08-operations-playbook.md` — timeline present
- `wc -l ~/Desktop/driftless/08-operations-playbook.md` — reasonable length (≤150 lines for 2 pages of markdown)
- Full slice verification suite (all commands from S02-PLAN.md Verification section)

## Observability Impact

These are static business documents, not runtime code. Observability is filesystem and content verification:

- **File existence:** `ls ~/Desktop/driftless/07-gtm-plan.md ~/Desktop/driftless/08-operations-playbook.md` confirms both deliverables exist.
- **Content integrity:** `grep` checks for canonical ICP, phase timeline, feature labels, and Mermaid blocks verify cross-document consistency with S01 and T01 outputs.
- **Protected file integrity:** MD5 checks on `pro-tier-features.md` and `m004-launch-playbook.md` detect accidental modification of referenced-but-not-edited files.
- **Failure visibility:** Each verification command targets a specific file/pattern — failures report exactly which check failed and which file is missing or non-conforming.
- **Future agent inspection:** Run the Verification commands above. All are idempotent grep/ls/wc checks. A passing suite means both docs exist, are internally consistent, and match S01/T01 canonical data.

## Inputs

- `~/Desktop/driftless/02-business-structure.md` — LLC entity details, costs for ops checklist
- `~/Desktop/driftless/05-pricing-model.md` — pricing tiers, revenue scenarios for GTM context
- `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy details for ops checklist
- `~/Desktop/driftless/03-product-strategy.md` — competitive landscape for GTM positioning
- `~/Desktop/driftless/00-vision-strategy.md` — phase timeline, growth model stages
- `~/Desktop/driftless/m004-launch-playbook.md` — existing OSS launch strategy (reference, don't modify)

## Expected Output

- `~/Desktop/driftless/07-gtm-plan.md` — Three-phase GTM plan with channel strategy, funnel benchmarks, Mermaid diagram
- `~/Desktop/driftless/08-operations-playbook.md` — Monthly ops checklist with scaling triggers, Mermaid diagram
- Full slice verification passing across all five S02 documents
