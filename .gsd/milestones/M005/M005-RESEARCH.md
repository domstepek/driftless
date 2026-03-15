# M005: Business Infrastructure + Platform Vision — Research

**Date:** 2026-03-14

## Summary

M005 is a documentation and business setup milestone — zero production code changes to the driftless repo. The deliverables are: 10 business planning documents to `~/Desktop/driftless/`, a private GitHub repo scaffold for the Pro tier, and payment infrastructure setup. The primary risk isn't technical complexity — it's producing documents that are internally consistent, actionable, and grounded in real market data rather than generic startup boilerplate.

The existing `~/Desktop/driftless/` directory already contains `pro-tier-features.md` (detailed feature specs for all four Pro features) and `m004-launch-playbook.md` (the launch playbook from M004). These are inputs to the business docs, not outputs of M005. The documents must cross-reference each other and align on ICP, pricing, phasing, and competitive positioning throughout.

**Primary recommendation:** Start with the vision/strategy document and product strategy (they establish the narrative and market positioning everything else depends on), then fan out to the remaining docs. The LLC formation guide and payment infrastructure slices are independent and can run in parallel with document writing. Private repo scaffold is trivial and should be last — it's a 10-minute task with no risk.

## Recommendation

**Slice ordering by risk:**

1. **Vision + product strategy + PRD** (highest risk — these establish the narrative, ICP, competitive landscape, and product definition that every other document references. Getting these wrong cascades errors through all 10 docs.)
2. **Pricing model + GTM plan** (medium risk — requires competitor pricing research and revenue modeling with three scenarios. Depends on product strategy being solid.)
3. **LLC formation guide + business structure** (low risk but high research density — every step needs exact URLs, costs, and timelines. The NY LLC Transparency Act effective Jan 1, 2026 is a new requirement that must be included.)
4. **Payment infrastructure + operations + pitch deck outline + executive summary** (lowest risk — payment is a configuration task, operations is lightweight for bootstrapped phase, pitch deck is structural, exec summary synthesizes everything else.)
5. **Private repo scaffold** (trivial — README, license file, basic directory structure.)

**Key decisions to make during execution:**
- Lemon Squeezy vs Stripe for payment infrastructure
- BSL 2.1 vs proprietary license for Pro tier
- Same GitHub user (`domstepek`) vs separate org for private repo

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| NY LLC formation guide | Northwest Registered Agent / LegalZoom / ZenBusiness guides | Real-world costs, timelines, and gotchas. Don't guess at fees — they're publicly documented ($200 filing, $50 cert of publication, $80-$395 Albany publication). |
| Publication requirement cost reduction | Albany County registered agent strategy | Well-established pattern: file with Albany RA address → publish in Albany ($80-$395) → file Certificate of Change ($30) after. Saves $1,000+ vs NYC counties. |
| Competitor pricing benchmarks | Public pricing pages + analyst reports | Pendo ~$47K/yr avg, WalkMe ~$79K/yr, Whatfix ~$24K-$37K/yr. Driftless at $200-$500/mo is an order of magnitude cheaper — this is the positioning. Don't fabricate numbers. |
| SaaS billing setup | Lemon Squeezy (MoR) or Stripe | Stripe acquired Lemon Squeezy in 2024. Lemon Squeezy handles tax/VAT/disputes as MoR (5% + $0.50/txn). Stripe is 2.9% + $0.30 but you handle tax. For bootstrapped solo founder, Lemon Squeezy's simplicity wins. |
| Revenue projection models | Standard SaaS metrics (CAC, LTV, churn, expansion) | Three scenarios (conservative/moderate/aggressive) using standard conversion rates from free→paid. Don't invent metrics. |
| BSL 2.1 license text | MariaDB's BSL 2.1 template | BSL 2.1 is a standardized license with a well-known template. The "Change Date" and "Change License" fields are the only customization needed. |
| Operating agreement template | Northwest RA / LegalZoom templates | Single-member LLC operating agreement is standardized. The doc should link to templates, not attempt to draft legal text. |

## Existing Code and Patterns

- `~/Desktop/driftless/pro-tier-features.md` — Complete feature specifications for all four Pro features (a-d). This is the primary input for the PRD (doc 04). Already includes pipeline diagrams, target users, and differentiators.
- `~/Desktop/driftless/m004-launch-playbook.md` — M004 deliverable. Not an input to M005 docs but establishes the `~/Desktop/driftless/` directory as the output location.
- `packages/core/package.json` — `@driftless-ai/core` package structure. The private repo scaffold should mirror the TypeScript/ESM/pnpm patterns established here.
- `packages/cli/package.json` — `@driftless-ai/cli` package structure. Shows the established naming convention under `@driftless-ai` scope.
- `.gsd/DECISIONS.md` — 64 decisions recorded. M005 execution should append decisions about: payment provider, Pro tier license, repo organization, shared types strategy.
- `.gsd/PROJECT.md` — Living project doc. Needs updating at M005 completion to reflect business entity status and two-repo architecture.
- `LICENSE` — MIT license for OSS repo. The Pro tier repo needs a different license (BSL 2.1 or proprietary).
- Git remote: `github.com/domstepek/driftless` — confirms private repo should be under `domstepek` account (simplest, per context).

## Constraints

- **No code changes to the driftless repo** — this is a documentation and business setup milestone. The only repo change is appending to DECISIONS.md.
- **Documents output to `~/Desktop/driftless/`** — not to the git repo. These are private business planning docs.
- **LLC formation is human-executed** — the agent produces the guide, the founder executes it. Every step must have a direct URL, exact cost, and expected timeline.
- **Payment provider account requires human signup** — agent can document which provider and why, but account creation requires identity verification.
- **Private repo creation requires GitHub API or browser** — agent can scaffold locally, but push requires the existing PAT (which is already configured in the git remote).
- **Mermaid diagrams required in all documents** — per M005-CONTEXT.md. Mermaid renders natively in GitHub and most markdown viewers.
- **NY LLC Transparency Act (NYLTA) effective Jan 1, 2026** — new beneficial ownership reporting requirement. LLCs formed in 2026 must file within 30 days of formation. This is a material compliance requirement that must be in the business structure doc.
- **Operating agreement required within 90 days** — NY law requires a written operating agreement for all LLCs, even single-member. Not filed with state but must exist.

## Common Pitfalls

- **Internally inconsistent documents** — The biggest risk. If the vision doc says "Phase 2 starts Q3 2026" but the GTM plan says "Pro tier launches Q2 2026," the whole planning library loses credibility. All 10 docs must align on timeline, ICP, pricing, and phasing. Mitigation: write vision + product strategy first, establish canonical timeline/ICP/pricing, reference those consistently.
- **Generic startup boilerplate** — Business planning docs generated by AI tend toward vague platitudes ("leverage synergies"). Every claim must be grounded in specific data: competitor pricing from research, market size from analyst reports, revenue projections from explicit assumptions. Mitigation: use real numbers from research (Pendo $47K/yr, WalkMe $79K/yr, DAP market $2.5B).
- **Publication requirement county trap** — Filing the LLC in the founder's home county (likely NYC) triggers $1,500+ publication costs. The Albany RA strategy saves $1,000+. The business structure doc must make this the primary recommendation, not an afterthought.
- **Missing the NYLTA deadline** — LLCs formed on or after Jan 1, 2026 must file beneficial ownership disclosure within 30 days. Daily fines up to $500 for non-compliance. This is new and most LLC formation guides don't cover it yet. The business structure doc must include this.
- **Pricing without anchoring** — Setting Pro tier pricing at $200-$500/mo without explaining why is unconvincing. The pricing model must anchor against competitor pricing (Pendo/WalkMe/Whatfix are 10-50x more expensive) and articulate the value gap.
- **Overdetailing feature (d)** — The autonomous dev pipeline is a Phase 3 moonshot. The PRD should describe the vision clearly but explicitly flag it as speculative. Spending equal space on features (a)-(b) vs (d) suggests false equivalence in readiness.
- **License choice paralysis** — BSL 2.1 vs proprietary is a real decision but shouldn't block the milestone. For a solo-founder bootstrapped project, proprietary is simpler and standard. BSL makes more sense when you want community contributions to the Pro tier (unlikely at Phase 2 scale).

## Open Risks

- **Lemon Squeezy's future post-Stripe acquisition** — Stripe acquired Lemon Squeezy in 2024 and is building "Stripe Managed Payments" (MoR in beta). Lemon Squeezy may eventually be deprecated or folded into Stripe. Recommendation: go with Lemon Squeezy for now (simplest for bootstrapped), document the Stripe migration path.
- **Pro tier pricing validation** — $200-$500/mo is an educated estimate. Real validation requires customer conversations once features exist. The pricing doc should present three scenarios and flag that pricing will be adjusted based on early customer feedback in M006-M008.
- **Market timing for DAP disruption** — The $2.5B DAP market (Pendo, WalkMe) is mature. Incumbents may add AI-generated walkthrough features. Driftless's moat is the automated pipeline (tests → docs → walkthroughs), but this requires proving the full chain works. Speed matters.
- **Two-repo coordination overhead** — Maintaining OSS + Pro repos with shared types/contracts adds operational complexity. The decision on how to share types (npm package, git submodule, copy-paste) is deferred to M006 per context, but the architecture decision doc should lay out the options and trade-offs.
- **Feature (d) market readiness** — Cloud coding agents (Codex, Devin) are still maturing. By Phase 3 timing (~2027-2028), the landscape will have shifted significantly. The autonomous pipeline vision should be documented as directional, not prescriptive.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Stripe billing | `wshobson/agents@stripe-integration` (4.7K installs) | available — relevant if Stripe is chosen over Lemon Squeezy |
| Stripe billing | `stripe/ai@stripe-best-practices` (1.4K installs) | available — official Stripe skill |
| Business planning | `robdtaylor/personal-ai-infrastructure@businessstrategy` (131 installs) | available — low install count, likely generic |
| Business planning | `eddiebe147/claude-settings@business plan writer` (61 installs) | available — very low install count |

**Recommendation:** None of these skills are worth installing for M005. The Stripe skills would be useful if building Stripe integration code, but M005 is only documenting the payment provider choice and possibly creating a Stripe/Lemon Squeezy account. The business planning skills have very low install counts and are likely generic templates that won't match the specific document structure defined in M005-CONTEXT.md. The installed `frontend-design` skill is irrelevant here (no UI work).

## Candidate Requirements

The following emerged from research and should be considered during roadmap planning. None are auto-binding.

| Candidate | What | Rationale | Recommendation |
|-----------|------|-----------|----------------|
| CR-001 | NYLTA beneficial ownership filing within 30 days of formation | New NY law effective Jan 1, 2026. Material compliance risk with $500/day fines. | Include in LLC formation guide as mandatory step. Not a separate requirement — it's part of the formation process. |
| CR-002 | Operating agreement within 90 days | NY law requires written operating agreement for all LLCs. | Include in LLC formation guide. Template link sufficient — don't draft legal text. |
| CR-003 | Document versioning/dating | Business planning docs will evolve as the product ships. Each doc should have a "Last Updated" date and version. | Advisory — add date headers to each document. |
| CR-004 | Stripe migration path from Lemon Squeezy | Stripe acquired LS and is building competing MoR. LS may be deprecated. | Include as a section in the payment infrastructure doc. |

## Sources

- NY LLC formation: $200 filing fee, $50 certificate of publication, 120-day publication window, operating agreement required within 90 days (source: NY Dept of State via google_search — wise.com, zenbusiness.com, tailorbrands.com)
- NY LLC Transparency Act: Effective Jan 1, 2026. LLCs formed after that date must file beneficial ownership within 30 days. $500/day fines for non-compliance. (source: google_search — bizreport.com, northwestregisteredagent.com)
- Albany publication strategy: $80-$395 total publication cost in Albany County vs $1,500+ in NYC. File with Albany RA address, publish, then file Certificate of Change ($30). (source: google_search — llcpublishers.com, nyllc.org, newyorkregisteredagent.com)
- Stripe vs Lemon Squeezy: Stripe 2.9%+$0.30 (you handle tax), LS 5%+$0.50 (MoR handles tax/disputes/VAT). Stripe acquired LS in 2024. Stripe "Managed Payments" MoR in private beta 2025-2026. (source: google_search — getnextkit.com, getsabo.com, globalsolo.global)
- Mercury banking: Free checking, no minimums, free ACH/wires, API access, QuickBooks integration. Requires EIN + formation docs. Not a bank — FDIC via Choice Financial/Column N.A. Up to $5M FDIC coverage. (source: google_search — mercury.com, nerdwallet.com, wise.com)
- Competitor pricing: Pendo ~$47K/yr avg mid-market, WalkMe ~$79K/yr avg, Whatfix ~$24K-$37K/yr. DAP market ~$2.5B. All require manual content authoring. (source: google_search — saastr.com, invespcro.com)
- BSL 2.1: Source-available, not OSI-approved. Restricts competing commercial use for up to 4 years, then converts to open-source. Used by MariaDB, HashiCorp, Cockroach Labs. Proprietary is simpler for solo-founder with no community contribution expectation on Pro tier. (source: google_search — fossa.com, powerpatent.com)
- KB/vector DB landscape: Pinecone (fully managed, serverless) and Weaviate (open-source, self-hostable) are leading options for RAG-backed knowledge bases. Relevant to feature (a) PRD detail in M006+. (source: google_search — cyclr.com, dev.to)
