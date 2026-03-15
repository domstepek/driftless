# S02: Business Operations — LLC, Pricing, Payment, GTM, Ops — Research

**Date:** 2026-03-14

## Summary

S02 produces five business documents at `~/Desktop/driftless/` covering LLC formation, pricing model, payment infrastructure, go-to-market, and operations. The work is document writing, not code — the primary challenge is grounding every claim in verifiable data and maintaining cross-document consistency with S01's canonical ICP, timeline, and competitive pricing.

Research surfaced one major correction: **the NY LLC Transparency Act (NYLTA) does NOT apply to domestically-formed LLCs.** Governor Hochul vetoed the expansion bill (S8432) on December 19, 2025, narrowing the Act to non-US LLCs only. The M005-RESEARCH.md incorrectly stated all LLCs formed in 2026 must file within 30 days — that's wrong. The business structure doc should mention NYLTA for completeness but clarify the domestic exemption. The 30-day deadline and $500/day fines apply only to foreign LLCs.

Research also confirmed a pricing tension: S01's product strategy documents "$200–$500/org/month" as the Pro tier range, while S02-CONTEXT sets $99/mo as the early adopter starting price. The pricing model must bridge these — $99/mo is the launch price for the first 20 customers, with a planned raise to $199–$299/mo, within the $200–$500 range established in S01. This isn't a contradiction; it's a deliberate early-adopter strategy documented in the pricing model.

**Primary recommendation:** Two tasks — T01 writes the LLC guide + pricing model + payment infrastructure (the three documents with the most research-intensive content and tightest interdependencies), T02 writes the GTM plan + operations playbook (lighter-weight documents that reference T01's outputs). Both tasks pull canonical data from S01's three documents.

## Recommendation

**Task structure:**

- **T01: LLC + Pricing + Payment (est: 25m)** — These three are tightly coupled. The LLC guide establishes the business entity. The pricing model defines what's being charged. The payment infrastructure doc explains how charges are collected. They share cost data (LLC costs feed into the ops budget, payment fees feed into revenue projections, pricing tiers map to Lemon Squeezy product configuration). Writing them together ensures internal consistency.

- **T02: GTM + Operations (est: 15m)** — The GTM plan references the pricing model and payment provider. The operations playbook references all four preceding docs. These are the synthesis documents of S02. Lighter research load — GTM channel data comes from S01's competitive landscape and the M004 launch playbook pattern. Operations is a 1-2 page checklist by design (per S02-CONTEXT).

**Key decisions already made (per S02-CONTEXT):**
- Lemon Squeezy as payment provider (not re-litigating)
- $99/mo starting price (early adopter, plan to raise)
- Monthly-only at launch (annual added after validation)
- Albany RA strategy as primary LLC recommendation
- Proprietary license for Pro tier (BSL dropped)

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| NY LLC formation steps and costs | NY Dept of State filing guide + Northwest RA / ZenBusiness guides | Exact fees are public: $200 filing, $50 cert of publication, $9 biennial statement. Don't approximate. |
| Albany publication cost estimates | llcpublishers.com, nyllc.org rate tables | Albany County publication runs $150–$350 total (one daily + one weekly, 6 weeks). NYC counties run $1,000–$2,000+. The savings are well-documented. |
| Lemon Squeezy fee structure | Lemon Squeezy public pricing page | 5% + $0.50/txn base, +0.5% subscription surcharge, +1.5% international. No monthly fees. US payouts free. Post-Stripe acquisition, payout fees reduced. |
| SaaS conversion benchmarks | StateShift, ChartMogul, GrowthUnhinged 2025 reports | Freemium-to-paid: 3–5% median (developer tools ~5%). Trial-to-paid: 15–25% for dev tools. Use these to anchor the three revenue scenarios. |
| Revenue projection math | Standard SaaS metrics: MRR, ARR, churn, conversion | Three scenarios with explicit inputs (OSS users → trial rate → conversion rate → ARPU → churn). Every number traceable. |
| Mercury bank setup requirements | Mercury.com documentation | Free checking, no minimums, needs EIN + Articles of Org + Operating Agreement + gov ID. 3-5 day approval. No longer accepts PO Box addresses (2025 policy change). |
| Operating agreement template | Northwest RA / LegalZoom single-member templates | Link to templates — don't draft legal text. Required within 90 days of filing Articles of Organization. |
| EIN application | IRS Form SS-4 online | Free, instant online at irs.gov. Available immediately after LLC formation. Single-member LLC uses SSN as responsible party. |

## Existing Code and Patterns

- `~/Desktop/driftless/03-product-strategy.md` — Canonical competitive pricing table (5 DAP + 3 KB competitors with specific dollar figures). S02's pricing model cites these directly — no re-research needed. The $200–$500/mo Pro tier range is established here; $99/mo early adopter pricing sits below this as a deliberate launch strategy.
- `~/Desktop/driftless/04-product-requirements.md` — Feature names (a)–(d) with canonical labels. GTM plan references these when describing what's being sold at each phase.
- `~/Desktop/driftless/00-vision-strategy.md` — Phased timeline (Phase 1 Q1–Q3 2026, Phase 2 Q4 2026–Q2 2027, Phase 3 Q3 2027+) and growth model stages. Operations playbook uses these phases for scaling triggers.
- `~/Desktop/driftless/m004-launch-playbook.md` — Existing launch strategy for OSS. GTM Phase 1 can reference this as the foundation, extending it rather than duplicating it.
- `~/Desktop/driftless/pro-tier-features.md` — Detailed feature specs. Reference for GTM messaging about Pro tier value prop.
- `.gsd/DECISIONS.md` — 73 decisions recorded through S01. S02 should append decisions about: Lemon Squeezy as payment provider, $99/mo early adopter pricing strategy, Albany RA as primary LLC formation strategy. These get appended during S03 (per roadmap), but the rationale is established in S02's documents.

## Constraints

- **Canonical ICP phrase must appear verbatim** — "B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers, shipping frequently with an existing e2e test suite" in every S02 document. Grep-verifiable.
- **Phase timeline must match S01 exactly** — Phase 1 Q1–Q3 2026, Phase 2 Q4 2026–Q2 2027, Phase 3 Q3 2027+. No rounding or paraphrasing.
- **Feature labels must match S01 exactly** — (a) Knowledge Base + Agent Skill, (b) AI-Generated Guided Walkthroughs, (c) Automated Product Demo/Tutorial Videos, (d) Signal-Driven Autonomous Development Pipeline.
- **$99/mo is the anchor price** — per S02-CONTEXT. Revenue projections model this, not the $200–$500 eventual range. The pricing model documents the path from $99 → higher pricing.
- **Lemon Squeezy is the decision** — per S02-CONTEXT. No Stripe vs LS comparison; just document rationale and include Stripe migration path.
- **Operations playbook is 1-2 pages max** — a monthly checklist, not a manual.
- **Every LLC step needs a direct URL and exact dollar amount** — per milestone success criteria.
- **Mermaid diagram in each document** — per milestone definition of done.
- **`pro-tier-features.md` and `m004-launch-playbook.md` must not be modified** — verify MD5 after each task.

## Common Pitfalls

- **NYLTA misinformation** — M005-RESEARCH.md incorrectly states all 2026 LLCs must file beneficial ownership within 30 days. After Hochul's December 2025 veto, this applies only to foreign (non-US) LLCs. A domestic NY LLC is exempt. The business structure doc must get this right — mention NYLTA but clarify the domestic exemption. Citing it as a hard requirement would be misinformation.
- **Pricing model contradiction with product strategy** — S01 says "$200–$500/org/month." S02-CONTEXT says "$99/mo starting price." The pricing model must explicitly bridge this: $99/mo is the early adopter launch price (first 20 customers or first 6 months), then raises to $199–$299/mo, which is within the range S01 established. Frame this as pricing evolution, not contradiction.
- **Lemon Squeezy fee underestimation** — Base is 5% + $0.50, but subscriptions add another 0.5% surcharge. On a $99/mo subscription: $0.50 flat + 5% ($4.95) + 0.5% sub surcharge ($0.50) = ~$5.95 per transaction, or ~6% effective rate. This is higher than most founders expect and must be explicitly modeled in revenue projections.
- **Operating agreement as optional** — NY law requires a written operating agreement for ALL LLCs within 90 days. It's not filed with the state, which makes people think it's optional. It's not. The LLC guide must be clear about this.
- **GTM that requires a team** — S02-CONTEXT is clear: Phase 1 and 2 GTM must be executable by one person with zero paid spend. Any activity requiring a second person, paid ads, or conference attendance belongs in Phase 3 at earliest.
- **Revenue projections without explicit assumptions** — Each of three scenarios needs: number of OSS users at start, monthly growth rate, free→trial conversion %, trial→paid conversion %, monthly churn %, ARPU. Every number visible and justifiable. "We assume 5% conversion" is good; showing up with 50 paying customers in month 1 with no explanation is not.
- **Albany RA as footnote** — S02-CONTEXT and milestone roadmap both emphasize: Albany RA strategy is the PRIMARY recommendation, not an alternative. NYC publication costs are mentioned as what you're avoiding, not as a valid option.

## Open Risks

- **Lemon Squeezy deprecation timeline** — Stripe acquired LS in 2024 and is building Stripe Managed Payments (MoR). No public deprecation date for LS, but the integration surface may stop receiving new features. The payment infrastructure doc includes a Stripe migration path section to mitigate.
- **$99/mo price validation** — This is an educated guess anchored against competitors. Real validation requires customer conversations once features exist. The pricing model should present three scenarios and flag that pricing will be adjusted based on early customer feedback during M006-M008.
- **Mercury account requirements tightening** — Mercury tightened requirements in 2025 (no more PO Box addresses, stricter identity verification). The business structure doc should note that Mercury approval is selective and suggest Relay or Bluevine as backup options.
- **NY LLC annual filing fee** — In addition to the $9 biennial statement, NY LLCs pay an annual filing fee to the Dept of Taxation and Finance ($25–$4,500 based on NY-source gross income). For a bootstrapped startup with <$100K NY-source income, this is $25. But if Lemon Squeezy remits payments to a NY entity, all revenue could be NY-sourced. The operations playbook should flag this.
- **Certificate of Change timing** — The Albany RA strategy requires filing a Certificate of Change ($30) after publication to update the address. This must happen after the Certificate of Publication is filed. The LLC guide must sequence these steps correctly.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Lemon Squeezy billing | `ihlamury/design-skills@lemonsqueezy-ui-skills` (24 installs) | available — UI-focused, not billing integration. Not relevant. |
| Go-to-market planning | `nicepkg/ai-workflow@go-to-market-planner` (16 installs) | available — very low install count, likely generic template. Not worth installing. |
| Marketing strategy | `ovachiever/droid-tings@marketing-strategy-pmm` (33 installs) | available — low install count, generic PMM approach. Not relevant for bootstrapped dev tool GTM. |
| Stripe billing | `wshobson/agents@stripe-integration` (4.7K installs) | available — relevant only if building Stripe code. S02 documents Lemon Squeezy, doesn't build integration code. |

**Recommendation:** No skills worth installing for S02. The work is document writing with grounded research, not code integration. The Stripe skill would be useful for M006+ when building actual payment integration code.

## Sources

- NY LLC formation costs: $200 Articles of Organization filing fee, $50 Certificate of Publication filing fee, $9 biennial statement. Optional: $20 name reservation, $25/$75/$150 expedited processing. (source: NY Department of State via google_search — ny.gov, wise.com, auerbachlaw.com)
- Albany publication strategy: $150–$350 total newspaper fees in Albany County vs $1,000–$2,000+ in Manhattan/NYC. Process: file with Albany RA address → publish 6 weeks → file Certificate of Publication ($50) → file Certificate of Change ($30) to update address. (source: google_search — northwestregisteredagent.com, llcpublishers.com, nyllc.org)
- NYLTA scope correction: Governor Hochul vetoed S8432 on Dec 19, 2025, narrowing NYLTA to non-US LLCs only. Domestic NY LLCs are EXEMPT from beneficial ownership reporting. US-formed LLCs do NOT need to file any statements or attestations. (source: google_search — hklaw.com, seyfarth.com, venable.com, sidley.com)
- Lemon Squeezy fees: 5% + $0.50/txn base. Additional surcharges: +0.5% subscriptions, +1.5% international, +1.5% PayPal. US payouts free (0%). No monthly fees. Post-Stripe acquisition, payout fees reduced. (source: google_search — airwallex.com, dodopayments.com, designrevision.com)
- Lemon Squeezy subscription setup: Products → Variants (plans) → Price objects. Each variant has unique ID for checkout links. API at api.lemonsqueezy.com/v1/. Webhooks for subscription_created/updated/cancelled/payment_failed/payment_success. Test mode available. (source: google_search — lemonsqueezy.com, makerkit.dev)
- Mercury bank: Free checking, no minimums, 3-5 day approval. Requires EIN + Articles of Org + Operating Agreement + gov ID. No longer accepts PO Box addresses (2025 policy). Up to $5M FDIC coverage via partner banks. QuickBooks integration included. (source: google_search — mercury.com, thefullsend.com, incnow.com)
- SaaS conversion benchmarks: Freemium-to-paid median 3-5% (developer tools ~5%). Trial-to-paid: 15-25% for dev tools, median B2B SaaS 18.5% (2025). Top quartile 35-45%. (source: google_search — stateshift.com, chartmogul.com, growthunhinged.com)
- Competitor pricing (from S01, not re-researched): Pendo ~$47K/yr median mid-market, WalkMe ~$79K/yr avg, Whatfix ~$32K/yr avg, Appcues $249–$879/mo, Userpilot $299–$799/mo. (source: ~/Desktop/driftless/03-product-strategy.md)
- NY LLC operating agreement: Required by law within 90 days of filing Articles of Organization. Not filed with the state. Single-member template available from Northwest RA, LegalZoom. (source: google_search — ny.gov, wise.com)
- NY LLC annual filing fee: $25–$4,500 to Dept of Taxation and Finance based on NY-source gross income (Form IT-204-LL). Due 15th of 3rd month after tax year close. Under $100K income = $25. (source: google_search — ny.gov, auerbachlaw.com)
