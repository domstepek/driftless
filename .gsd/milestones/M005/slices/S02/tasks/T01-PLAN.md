---
estimated_steps: 5
estimated_files: 3
---

# T01: Write LLC guide, pricing model, and payment infrastructure docs

**Slice:** S02 — Business Operations — LLC, Pricing, Payment, GTM, Ops
**Milestone:** M005

## Description

Write the three most research-intensive and interdependent S02 documents. The LLC guide establishes the business entity with actionable steps. The pricing model defines what's being charged, with three revenue scenarios anchored to explicit assumptions. The payment infrastructure doc explains how charges are collected via Lemon Squeezy, including fee modeling and a Stripe migration path.

These three share data: LLC costs feed into the operations budget, Lemon Squeezy fees feed into revenue projections, pricing tiers map to LS product configuration. Writing them together ensures internal consistency.

## Steps

1. Read S01 outputs (`00-vision-strategy.md`, `03-product-strategy.md`, `04-product-requirements.md`) to extract canonical ICP phrase, phase timeline, feature labels, and competitive pricing table for direct citation in pricing model.

2. Write `~/Desktop/driftless/02-business-structure.md` — NY LLC formation guide:
   - Step-by-step formation sequence: name reservation ($20 optional), Articles of Organization ($200), EIN (free, instant online), Albany registered agent strategy as PRIMARY recommendation, publication in Albany County ($150–350 vs $1,000–2,000+ in NYC), Certificate of Publication ($50), Certificate of Change ($30), operating agreement (REQUIRED within 90 days — link to templates, don't draft legal text), Mercury bank setup (EIN + Articles + OA + gov ID, 3-5 days, no PO Box), backup banks (Relay, Bluevine).
   - Every step: direct URL, exact dollar amount, expected timeline.
   - NYLTA section: mention for completeness but clearly state domestic LLCs are EXEMPT per Hochul's Dec 19, 2025 veto of S8432. Do NOT present the 30-day filing as a requirement for domestic LLCs.
   - NY annual filing fee ($25 for <$100K income) and biennial statement ($9) documented.
   - Mermaid flowchart showing formation sequence.
   - Canonical ICP, phase timeline, feature labels verbatim.

3. Write `~/Desktop/driftless/05-pricing-model.md` — Pricing and revenue projections:
   - Competitor benchmark table citing specific figures from `03-product-strategy.md` (Pendo ~$47K/yr, WalkMe ~$79K/yr, Whatfix ~$32K/yr, Appcues $249–879/mo, Userpilot $299–799/mo).
   - $99/mo early adopter price as anchor (first 20 customers or first 6 months), then raise to $199–299/mo. Frame as pricing evolution, not contradiction with S01's $200–500 range.
   - Monthly-only at launch, annual added after validation.
   - Lemon Squeezy fee breakdown on $99/mo: $0.50 flat + 5% ($4.95) + 0.5% subscription surcharge ($0.50) = ~$5.95/txn (~6% effective).
   - Three revenue scenarios with ALL inputs explicit per scenario: number of OSS users at start, monthly growth rate, free→trial conversion %, trial→paid conversion %, monthly churn %, ARPU. Anchored to SaaS benchmarks (freemium-to-paid ~5% dev tools, trial-to-paid 15–25%).
   - Mermaid diagram (pricing tier visualization or revenue projection flow).
   - Canonical ICP, phase timeline, feature labels verbatim.

4. Write `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy setup and Stripe migration path:
   - Why Lemon Squeezy: Merchant of Record (handles sales tax, VAT, compliance), no monthly fees, simple integration, test mode available. Post-Stripe acquisition context.
   - Product/variant/price configuration for the Pro tier ($99/mo subscription).
   - Fee structure: 5% + $0.50 base, +0.5% subscriptions, +1.5% international, +1.5% PayPal. US payouts free.
   - Webhook events for subscription lifecycle (created/updated/cancelled/payment_failed/payment_success).
   - Stripe migration path section: when to consider (LS feature freeze, volume thresholds, need for custom billing logic), what changes (MoR → self-managed tax via Stripe Tax), estimated effort.
   - Mermaid sequence diagram showing subscription lifecycle flow.
   - Canonical ICP, phase timeline, feature labels verbatim.

5. Verify T01 outputs: all three files exist, each has ≥1 Mermaid block, canonical ICP grep matches all three, Albany RA prominent, NYLTA exemption stated, operating agreement required, three revenue scenarios present, URLs in LLC guide, protected file MD5s unchanged.

## Must-Haves

- [ ] `02-business-structure.md` exists with every LLC step having a URL and dollar amount
- [ ] Albany RA is the primary recommendation, not a footnote
- [ ] NYLTA correctly documented as not applying to domestic LLCs
- [ ] Operating agreement documented as legally required within 90 days
- [ ] `05-pricing-model.md` has three revenue scenarios with explicit per-scenario assumptions
- [ ] Competitor benchmark table with specific dollar figures from S01
- [ ] $99/mo → $199–299/mo pricing evolution explicitly bridged
- [ ] Lemon Squeezy ~6% effective fee rate modeled in revenue projections
- [ ] `06-payment-infrastructure.md` has LS setup details and Stripe migration path
- [ ] Canonical ICP phrase verbatim in all three docs
- [ ] Phase timeline matches S01 exactly in all three docs
- [ ] Mermaid diagram in each of the three docs

## Verification

- `ls ~/Desktop/driftless/02-business-structure.md ~/Desktop/driftless/05-pricing-model.md ~/Desktop/driftless/06-payment-infrastructure.md` — all three exist
- `grep -c 'mermaid' ~/Desktop/driftless/02-business-structure.md ~/Desktop/driftless/05-pricing-model.md ~/Desktop/driftless/06-payment-infrastructure.md` — each ≥1
- `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/02-business-structure.md ~/Desktop/driftless/05-pricing-model.md ~/Desktop/driftless/06-payment-infrastructure.md` — all three
- `grep -i 'albany' ~/Desktop/driftless/02-business-structure.md | head -5` — prominent
- `grep -i 'exempt\|does not apply' ~/Desktop/driftless/02-business-structure.md` — NYLTA exemption
- `grep -c 'conservative\|moderate\|aggressive' ~/Desktop/driftless/05-pricing-model.md` — ≥3
- `grep 'http' ~/Desktop/driftless/02-business-structure.md | wc -l` — multiple URLs
- `md5 ~/Desktop/driftless/pro-tier-features.md` = f93972b6985ec540a93df5fe3e120153
- `md5 ~/Desktop/driftless/m004-launch-playbook.md` = 6dc7ac0fa7b45c5d3f37671655530441

## Observability Impact

These are static documents, not runtime code. Observability is file-system and content-based:

- **What signals change:** Three new markdown files appear at `~/Desktop/driftless/`. Each contains grep-verifiable canonical phrases, Mermaid blocks, and URLs.
- **How a future agent inspects this task:** `ls` for file existence, `grep` for content checks (ICP phrase, Albany, NYLTA exemption, revenue scenarios, URLs), `md5` for protected file integrity. All verification commands are listed in the Verification section.
- **Failure state visibility:** Missing files → `ls` returns non-zero exit. Missing content → `grep` returns empty or zero count. Protected file tampering → MD5 mismatch. Each failure is specific and actionable.

## Inputs

- `~/Desktop/driftless/03-product-strategy.md` — canonical ICP, competitive pricing table, feature labels, phase timeline
- `~/Desktop/driftless/00-vision-strategy.md` — phase timeline, growth model stages
- `~/Desktop/driftless/04-product-requirements.md` — feature (a)–(d) labels and scope
- S02-RESEARCH.md — LLC costs, Lemon Squeezy fees, SaaS benchmarks, NYLTA correction, Albany publication data, Mercury requirements

## Expected Output

- `~/Desktop/driftless/02-business-structure.md` — NY LLC formation guide with actionable steps, URLs, costs, Albany RA as primary, NYLTA exemption noted, operating agreement required
- `~/Desktop/driftless/05-pricing-model.md` — Pricing model with competitor benchmarks, three revenue scenarios, explicit assumptions, LS fee modeling
- `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy setup guide with fee breakdown, webhook lifecycle, Stripe migration path
