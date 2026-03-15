---
id: S02
milestone: M005
status: ready
---

# S02: Business Operations — LLC, Pricing, Payment, GTM, Ops — Context

## Goal

Five documents at `~/Desktop/driftless/` cover every operational decision a bootstrapped solo founder needs to execute: business formation, pricing strategy, payment infrastructure, go-to-market, and lean operations.

## Why this Slice

S01 establishes what driftless is and what it's building. S02 answers how it operates as a business — legal entity, how it charges money, how it gets customers, and how one person runs it without dropping the ball. S03 (exec summary, pitch deck) can't synthesize financials or GTM until these exist.

## Scope

### In Scope

- **`02-business-structure.md`** — NY LLC formation guide that is fully actionable today. Every step has a direct URL, exact dollar amount, and expected wait time. A founder should be able to open this document and start filing within 30 minutes. Must include: Albany RA strategy as the primary recommendation (not a footnote), NYLTA beneficial ownership filing within 30 days (mandatory, $500/day fines), operating agreement requirement within 90 days, EIN application, Mercury bank account setup. Step-by-step with costs at each stage: $200 filing, Albany publication ~$150-$395, Certificate of Change $30, EIN free, Mercury free.

- **`05-pricing-model.md`** — Pro tier starts at **$99/mo** for early adopters, with an explicit plan to raise pricing after traction is established. Three revenue scenarios (conservative/moderate/aggressive) model the path from $99 early adopter pricing to a higher eventual price point, with explicit assumptions for each (conversion rate, churn, expansion). Competitor benchmark table: Pendo ~$47K/yr, WalkMe ~$79K/yr, Whatfix ~$24-37K/yr — positioning driftless as the affordable automated alternative. Document the plan to raise pricing: e.g. after 20 paying customers, revisit at $199/mo. Mermaid diagram showing revenue ramp across three scenarios.

- **`06-payment-infrastructure.md`** — **Lemon Squeezy** as the chosen payment provider. Document the rationale: MoR model handles tax/VAT/disputes (5% + $0.50/txn), simpler for a solo bootstrapped founder, no need to register for sales tax in 50 states. Include a Stripe migration path section for when Lemon Squeezy is eventually deprecated/absorbed into Stripe Managed Payments (Stripe acquired LS in 2024). Step-by-step account setup, product/price object configuration for the $99/mo Pro tier, webhook setup for subscription events. This is the operative document for payment configuration.

- **`07-gtm-plan.md`** — Solo-executable go-to-market, no paid ads, no sales team. Phase 1 (OSS traction): X/Twitter content, GitHub presence, HN Show HN post, OSS community engagement. Phase 2 (Pro conversion): direct outreach to 10 target companies identified from OSS users — the first 10 paying customers come from conversations, not marketing funnels. Conversion metric: what percentage of OSS users become Pro trials, what percentage of trials convert. Mermaid diagram showing the OSS → trial → paid funnel. No channel marketing, no partnerships, no events — those are Phase 3.

- **`08-operations-playbook.md`** — Lean monthly checklist for one person running a bootstrapped SaaS. What to do each month: check MRR/churn, triage support issues, cut releases, review GitHub Sponsors, check Lemon Squeezy dashboard, renew/update any compliance items. 1-2 pages max. Not a full operations manual — just enough to not drop the ball. Includes the scaling trigger: what metric/milestone prompts hiring the first person.

- **Mermaid diagrams** in each document — revenue ramp in pricing model, GTM funnel, LLC formation timeline.

### Out of Scope

- Forming the LLC — human task; the guide documents the steps, the founder executes
- Creating the Lemon Squeezy account — requires identity verification; agent documents the setup, founder executes
- Paid advertising, partnerships, channel marketing, events — Phase 3 GTM motions
- Enterprise tier operations (SOC2, SSO, SLAs) — deferred until mid-market traction is proven
- Hiring plan beyond the single scaling trigger — too speculative at Phase 1
- BSL 2.1 license consideration — proprietary is the decision; no further analysis needed

## Constraints

- **LLC guide must be actionable today** — every step has a direct URL and exact cost. No "research this further" placeholders. Albany RA strategy is the primary recommendation with concrete cost comparison to NYC counties.
- **NYLTA must be prominent** — not a footnote. The 30-day filing window and $500/day fine make it a hard deadline. Put it in its own callout or section.
- **Lemon Squeezy is the payment decision** — don't re-litigate Stripe vs LS in the document. Document the choice with rationale and include the Stripe migration path as a forward-looking section, not a competing option.
- **$99/mo is the starting price** — the pricing model anchors here and models the path to higher pricing, not the other way around. Three scenarios assume different uptake rates at $99 before the price raise.
- **GTM must be executable by one person with zero budget** — if an activity requires a second person or paid spend, it doesn't belong in Phase 1 or Phase 2 GTM.
- **Ops playbook is a checklist, not a manual** — 1-2 pages. Resist the urge to document every edge case. The goal is that nothing falls through the cracks, not comprehensive coverage.
- **All pricing figures reference S01 canonical numbers** — competitor pricing, ICP definition, and feature names come verbatim from `03-product-strategy.md` and `04-product-requirements.md`.

## Integration Points

### Consumes

- `~/Desktop/driftless/03-product-strategy.md` — canonical ICP, competitor pricing (Pendo $47K/yr, WalkMe $79K/yr), and market sizing for the pricing model and GTM plan
- `~/Desktop/driftless/04-product-requirements.md` — canonical feature names (a)-(d) and phased timeline for the GTM plan
- `~/Desktop/driftless/00-vision-strategy.md` — phased milestones (Phase 1/2/3) for the operations playbook scaling triggers

### Produces

- `~/Desktop/driftless/02-business-structure.md` — LLC formation guide (consumed by S03 exec summary for entity details)
- `~/Desktop/driftless/05-pricing-model.md` — pricing tiers and revenue projections (consumed by S03 pitch deck outline)
- `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy decision + setup (consumed by S03 as architecture decision input to DECISIONS.md)
- `~/Desktop/driftless/07-gtm-plan.md` — phased GTM (consumed by S03 exec summary)
- `~/Desktop/driftless/08-operations-playbook.md` — monthly ops checklist (background context for S03 exec summary)

## Open Questions

- **Early adopter pricing duration** — at what milestone does $99/mo get raised? The pricing model should pick a specific trigger (e.g., first 20 paying customers, or 6 months post-launch) rather than leaving it vague. Current thinking: first 20 customers get $99/mo locked, then raise to $199/mo for new customers. Document this explicitly.
- **Lemon Squeezy product configuration** — the payment infrastructure doc should include the exact product/price object setup for the $99/mo monthly subscription and whether to offer annual billing at launch. Current thinking: monthly only at launch, add annual (~$990/yr, 2 months free) after first paying customers validate the product.
