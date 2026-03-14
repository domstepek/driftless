# M005: Business Infrastructure + Monetization — Context

**Gathered:** 2026-03-14
**Status:** Queued — pending auto-mode execution

## Project Description

M005 establishes driftless as a real, operating business with a monetization layer. This means forming the legal entity (Driftless LLC, New York), standing up payment infrastructure (Lemon Squeezy as Merchant of Record), implementing a license key gate on the GitHub Action (the paid capability), and adding a pricing page to the landing site. The output of this milestone includes both the technical implementation AND a comprehensive business plan written to `~/Desktop/driftless/` — detailed enough to start executing the business setup on day one.

## Why This Milestone

M001–M003 build and ship the tool. M004 launches it. M005 makes it a business. Without this, driftless generates no revenue, the GitHub Action (the core ongoing value that teams pay for) is free to everyone, and there is no legal or financial infrastructure to receive, track, or report income. This milestone should be executed after M004 so the pricing page exists at the moment the product is publicly visible.

**Business goal:** Lifestyle / side income. Low overhead, self-serve, no employees, runs on autopilot. Target: $5k MRR.

## Monetization Model (Research-Backed Decision)

**Model: Open-core + license-gated GitHub Action**

- **Free forever:** OSS CLI (`npx driftless init`), local doc generation, skill installer, GitHub Action for public repos and solo developers (≤1 seat / public repo only)
- **Pro ($49/org/month or $39/month billed annually):** GitHub Action on private repos, unlimited team seats within an org, advanced skill templates, priority support via GitHub Discussions

**Why this model:**
- driftless uses a "bring your own Claude" architecture — no inference cost to us, no usage-based billing needed
- The GitHub Action is the recurring value (runs on every PR forever). Once teams adopt it, they stay.
- License key validation requires ~zero infrastructure: one Vercel serverless function + Lemon Squeezy's license key API
- Free tier drives OSS adoption; teams hit the private-repo gate naturally and upgrade
- Lemon Squeezy acts as Merchant of Record: handles global VAT/GST, chargebacks, fraud — zero tax compliance burden on the founder

**Pricing rationale:**
- $49/org/month is below the per-seat cost of comparable tools (Cursor $20/user, GitHub Copilot $19/user, Linear $8-12/user)
- For a 5-person team: $9.80/user/month — extremely competitive for ongoing automation
- Annual discount ($39/month) encourages upfront commitment and improves cash flow predictability
- 1% OSS-to-paid conversion rate × 5,000 active users = 50 paying orgs = $2,450 MRR; 10,000 users = $4,900 MRR

**What is NOT the paid tier:**
- Not a cloud dashboard (requires infrastructure, ongoing ops)
- Not a managed hosted service (inference cost exposure)
- Not per-seat pricing (billing complexity without benefit at this scale)
- Enterprise / SSO / audit logs: out of scope until actual enterprise customers ask for it

## User-Visible Outcome

### When this milestone is complete:

- The founder has a formed Driftless LLC in New York with an EIN and a Mercury business bank account
- `~/Desktop/driftless/` contains a comprehensive, actionable business plan covering: LLC setup, pricing strategy, payment infrastructure setup, GTM plan, and operations playbook — with Mermaid diagrams
- `driftless.dev/pricing` (or a section on the landing page) shows the Free and Pro tiers with a Lemon Squeezy checkout link
- The GitHub Action (from M002) checks for a valid Lemon Squeezy license key for private repo usage; public repos and solo devs are never gated
- Lemon Squeezy is configured: product, two subscription variants (monthly/annual), license key generation, webhook to the validation endpoint
- A Vercel serverless function validates license keys and is called by the GitHub Action before running

### Entry point / environment

- Entry point: `driftless.dev/pricing` (Lemon Squeezy hosted checkout) for new customers; GitHub Action config for license key input
- Environment: Vercel (license validation API), Lemon Squeezy (billing portal), GitHub Actions (license check)
- Live dependencies involved: Lemon Squeezy API, Vercel serverless, GitHub Actions runner

## Completion Class

- Contract complete means: business plan docs written to `~/Desktop/driftless/`, LLC formation steps documented with all forms/links, Lemon Squeezy product configured, validation API deployed
- Integration complete means: GitHub Action checks license key, Lemon Squeezy webhook updates license status on subscription changes (activate/deactivate)
- Operational complete means: a test purchase flows end-to-end (checkout → license key → GitHub Action validates → access granted); a cancelled subscription revokes access

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Business plan documents exist at `~/Desktop/driftless/` covering all five areas (business structure, pricing, payment infra, GTM, operations) with Mermaid diagrams and are detailed enough to execute without additional research
- A real Lemon Squeezy test checkout produces a license key, the GitHub Action validation endpoint accepts it, and a test PR action completes successfully on a private repo
- Cancelling the Lemon Squeezy subscription deactivates the license key and the GitHub Action denies access on the next run
- The pricing page is live on the driftless landing site with working checkout links

## Risks and Unknowns

- **NY LLC publication requirement** — New York requires new LLCs to publish formation notices in two newspapers for six consecutive weeks. Cost can run $300–$1,600 depending on county. Using a registered agent with an Albany county address reduces this to ~$150–$200. The business plan docs must include a concrete strategy for minimizing this cost.
- **Lemon Squeezy stability** — Acquired by Stripe in July 2024; operates independently but long-term direction uncertain. Paddle is the fallback. The validation endpoint should abstract the payment provider so switching is a config change, not an architectural change.
- **GitHub Action license check UX** — If the license check fails (invalid key, network timeout, expired), the Action must fail gracefully with a clear message pointing to the upgrade URL. A bad failure UX loses customers.
- **License key distribution** — After a Lemon Squeezy purchase, the license key must reach the user in a way they can put it into their GitHub repo secrets. This is a UX flow that needs designing.

## Existing Prior Art / Dependencies

- M002 deliverables: GitHub Action (`packages/action`) — the license gate is added here
- M004 deliverables: Vercel landing page — pricing page is added here
- Lemon Squeezy: `https://lemonsqueezy.com` — payment processor, MoR, license key management
- Mercury: `https://mercury.com` — business banking
- New York Department of State: `https://www.dos.ny.gov` — LLC formation

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R026 (new) — Business entity and legal structure for commercial operation
- R027 (new) — Payment infrastructure for Pro tier subscriptions
- R028 (new) — License key gate on GitHub Action for private repos / team use

## Scope

### In Scope

- **Business plan documents** (`~/Desktop/driftless/*.md`) — comprehensive, Mermaid-diagrammed, immediately actionable:
  - `00-overview.md` — strategy summary and decision map
  - `01-business-structure.md` — NY LLC formation, EIN, Mercury bank, accounting setup
  - `02-pricing-model.md` — tier definitions, pricing rationale, competitor analysis, revenue projections
  - `03-payment-infrastructure.md` — Lemon Squeezy setup, license key architecture, Vercel validation endpoint
  - `04-gtm-plan.md` — realistic OSS-to-paid funnel, channels, conversion tactics
  - `05-operations-playbook.md` — recurring tasks, support process, monitoring, taxes
- **License validation API** — Vercel serverless function that validates Lemon Squeezy license keys
- **GitHub Action license gate** — adds license check to the M002 Action for private repo / team usage
- **Lemon Squeezy configuration** — product setup, Free and Pro variants, license key generation, webhook to validation endpoint
- **Pricing page** — section on driftless.dev landing page with tier comparison and Lemon Squeezy checkout links
- **NY LLC formation guide** (in business plan docs) — step-by-step with links, costs, and the Albany county trick

### Out of Scope / Non-Goals

- Forming the LLC itself (this is a human task documented in the plan)
- Enterprise tier (SSO, audit logs, custom contracts) — defer until actual enterprise demand
- Usage-based billing — architecture doesn't support it without server-side tracking
- Customer success or sales outreach — self-serve only
- Billing for the OSS CLI itself — free forever
- Support beyond GitHub Discussions and email

## Technical Constraints

- **Lemon Squeezy as MoR:** Handles VAT/GST/sales tax globally. Founder never files international tax. Non-negotiable for low-overhead ops.
- **Vercel serverless for license API:** Must be stateless, fast, and cold-start tolerant. The GitHub Action can't wait 10s for a function to warm up.
- **License key in GitHub secrets:** Users add `DRIFTLESS_LICENSE_KEY` as a GitHub Actions secret. The Action reads it at runtime. No hardcoded keys in workflow YAML.
- **Graceful degradation:** If the license validation endpoint is unreachable (Vercel outage, network timeout), the Action should warn but NOT block — fail open, not closed. Log the warning; don't break CI.
- **Depends on M002:** The GitHub Action must exist before we can gate it. Depends on M004 for the pricing page.

## Integration Points

- **Lemon Squeezy** — billing, subscription management, license key lifecycle, customer portal (self-serve upgrades/cancellations)
- **Vercel** — hosts the license validation serverless function alongside the landing page
- **GitHub Actions** — the `packages/action` package checks `DRIFTLESS_LICENSE_KEY` env var against the validation endpoint
- **Mercury** — business bank account receives Lemon Squeezy payouts (weekly)
- **Wave (or simple spreadsheet)** — bookkeeping for the NY LLC annual filing fee and quarterly estimated taxes

## Open Questions

- Exact Lemon Squeezy license key validation API shape — need to verify during S02 research whether to use their hosted `/v1/licenses/validate` endpoint or replicate key status via webhook into our own store. Current thinking: call Lemon Squeezy directly from the validation endpoint (simpler, no our-side database).
- What happens to existing free users of the GitHub Action when the gate is added? Current thinking: grandfather in all repos that had the Action configured before the gate was introduced — add a `grandfathered: true` bypass for 30 days with a migration notice.
- Should annual billing be offered from day one or added after validating monthly demand? Current thinking: offer both from launch, annual is just a Lemon Squeezy variant on the same product.
