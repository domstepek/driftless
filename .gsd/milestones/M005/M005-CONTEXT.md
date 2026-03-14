# M005: Business Infrastructure + Platform Vision — Context

**Gathered:** 2026-03-14
**Status:** Queued — pending auto-mode execution

## Project Description

M005 establishes driftless as a real operating business and documents the full product vision — from free OSS CLI to a closed-source Pro tier platform. This milestone produces: (1) the legal entity (Driftless LLC, New York), (2) a comprehensive set of business planning documents written to `~/Desktop/driftless/`, and (3) the payment infrastructure foundation for when the Pro tier ships.

**This is a documentation and business setup milestone, not a code milestone.** The Pro tier features (knowledge base, guided walkthroughs, auto-generated videos, autonomous dev pipeline) are built in M006+. M005 documents the full vision, ICP, competitive landscape, pricing model, and phased execution plan so the founder has complete clarity and can share the vision with collaborators/advisors.

## Why This Milestone

M001–M004 build, ship, and launch the OSS tool. M005 answers: "what is this becoming, and how does it make money?" The output is a complete business planning library — thorough enough to guide execution for the next 18–24 months, share with potential co-founders or first hires, and serve as the foundation for a pitch deck if/when fundraising makes sense.

**Growth model:** Bootstrapped, phased.
- **Phase 1** (M001–M004): Ship OSS CLI, get users, GitHub Sponsors for early revenue
- **Phase 2** (M006–M008): Build Pro tier features (a)–(c) in a separate private codebase with 1 additional dev, funded by sponsors + own money
- **Phase 3** (M009+): Feature (d) — autonomous development pipeline — when platform has traction and revenue

## Product Vision Summary

driftless evolves from a free CLI that generates docs from e2e tests into a **product intelligence platform** for B2B SaaS companies. The OSS CLI is the top of the funnel. The closed-source Pro tier is where revenue comes from.

### Free tier (OSS — MIT license, `domstepek/driftless`)
- `npx driftless init` — interactive setup, doc generation, skill installer
- GitHub Action for public repos / solo devs
- All current M001–M004 functionality

### Pro tier (closed-source — separate private repo, commercial license)

> **Full feature specifications live outside this repo:** `~/Desktop/driftless/pro-tier-features.md`
> That file contains the complete descriptions, differentiators, target users, and pipeline details for all four features.

**Feature (a): Knowledge Base + Agent Skill** — Auto-upload training materials to managed KB + agent skill for chatbot/agent integration
**Feature (b): AI-Generated Guided Walkthroughs** — Dynamic in-app walkthroughs generated from training docs (vs manual Pendo/WalkMe authoring)
**Feature (c): Automated Product Demo/Tutorial Videos** — Programmatic video generation from training docs via Replit Animation or similar
**Feature (d): Autonomous Feature Request → Development Pipeline** — Widget detects unmet user needs → collects requests → demand analysis → auto-ticket → cloud agent develops → auto-PR → auto-docs/tests → preview link → guided walkthrough. Phase 3 moonshot.

## ICP — Ideal Customer Profile

**Primary ICP (Pro tier features a–c):**
- **Company type:** B2B SaaS, product-led growth motion
- **Company size:** 50–500 employees (mid-market)
- **Engineering team:** 10–50 engineers, writes e2e tests, ships frequently
- **Must already have:** e2e test suite, customer-facing product, docs or onboarding gap
- **Likely also have:** AI chatbot/agent (or building one), Jira/Linear for project management
- **Budget authority:** Engineering manager or VP Eng, $200–$1,000/month discretionary
- **Industries:** DevTools, FinTech, HealthTech, EdTech — any B2B SaaS with complex product surface
- **Pain point:** Documentation is always stale, onboarding is manual and expensive, product demos require constant re-recording

**Why mid-market, not enterprise:**
- Enterprise sales cycles are 6–12 months, require SOC2/SSO/audit logs, need a sales team
- Solo founder (growing to 2) can't service enterprise accounts in Phase 2
- Mid-market buys self-serve, decides in weeks, budgets at team level

**Why not individuals/small teams:**
- Features (a)–(c) solve org-level problems (knowledge management, user onboarding, video generation)
- Too small a budget to sustain a product company
- The free OSS tier already serves individuals

## Competitive Landscape

| Feature | Key Competitors | Market Size (2024) | Driftless Differentiation |
|---|---|---|---|
| (a) Knowledge base + agent skill | Guru, Tettra, Notion AI, Slite | ~$1.6B | Auto-generated from e2e tests, not manually maintained. Always current. |
| (b) AI-guided walkthroughs | Pendo ($2B+), WalkMe (acq. SAP), Appcues, Whatfix, Userpilot | ~$2.5B (DAP) | Dynamically generated from training docs. No manual step authoring. |
| (c) Auto demo videos | Replit Animation, Synthesia, Arcade, HeyGen | Emerging | Videos derived from real product behavior via test-generated docs. |
| (d) Autonomous dev pipeline | Nobody (yet) | N/A | First-mover if built after platform credibility established. |

**The wedge:** Every competitor in (a)–(c) relies on manually authored content. Driftless's unique advantage is the automated pipeline: e2e tests → training docs → knowledge base → walkthroughs → videos. The content is always current because it's generated from tests, which are always current. This is the positioning in every document.

## User-Visible Outcome

### When this milestone is complete:

- **Driftless LLC** is formed in New York with an EIN and a Mercury business bank account (or the step-by-step guide is documented with all links/forms for immediate execution)
- **`~/Desktop/driftless/`** contains 10 comprehensive business planning documents with Mermaid diagrams:
  - `00-vision-strategy.md` — full vision from OSS CLI to AI product platform, phased execution
  - `01-executive-summary.md` — one-page summary for sharing with collaborators/advisors
  - `02-business-structure.md` — NY LLC formation, EIN, Mercury bank, accounting — step-by-step with costs
  - `03-product-strategy.md` — ICP, competitive landscape, market sizing, positioning, phased roadmap
  - `04-product-requirements.md` — PRD covering features (a)–(d) at varying detail (detailed for a/b, directional for c/d)
  - `05-pricing-model.md` — free OSS + Pro tier pricing, competitor benchmarks, revenue projections
  - `06-payment-infrastructure.md` — Stripe/Lemon Squeezy SaaS billing setup
  - `07-gtm-plan.md` — realistic phased GTM from OSS adoption to Pro conversion
  - `08-operations-playbook.md` — lean ops for bootstrapped phase, scaling plan
  - `09-pitch-deck-outline.md` — slide-by-slide structure ready to build when needed
- **Payment infrastructure** is configured (Stripe or Lemon Squeezy account, product/price objects) ready for when Pro tier ships in M006
- **Private repo** for Pro tier codebase is created (empty scaffold) with commercial license

### Entry point / environment

- Entry point: `~/Desktop/driftless/*.md` (documents), Stripe dashboard (payment config), GitHub (private repo)
- Environment: local filesystem, Stripe/Lemon Squeezy dashboard, GitHub
- Live dependencies involved: Stripe or Lemon Squeezy (account setup), Mercury (banking), NY Dept of State (LLC)

## Completion Class

- Contract complete means: all 10 business documents written with Mermaid diagrams, LLC formation guide has all links/costs/forms, private repo scaffolded
- Integration complete means: documents cross-reference each other and align on ICP/pricing/phasing; payment provider account exists with product configured
- Operational complete means: a founder reading the documents can start executing business formation and payment setup on the same day without additional research

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- All 10 business documents exist at `~/Desktop/driftless/` with Mermaid diagrams and are internally consistent
- The vision document clearly articulates the phased evolution from OSS CLI → Pro platform → autonomous pipeline
- The PRD covers all four features with enough detail to begin M006 planning without additional research on features (a) and (b)
- Pricing model includes competitor benchmarks, revenue projections for three scenarios (conservative/moderate/aggressive), and justification
- The LLC formation guide is actionable today — every step has a direct link, exact cost, and expected timeline
- Private repo exists on GitHub with a README explaining its relationship to the OSS repo

## Risks and Unknowns

- **NY LLC publication requirement** — $300–$1,600 depending on county. Using a registered agent with an Albany county address reduces to ~$150–$200. The business structure doc must include a concrete strategy.
- **Pro tier pricing without a product** — pricing models in the documents are informed estimates based on competitor analysis and ICP research. They'll be validated/adjusted when features (a)–(c) actually ship.
- **Replit Animation viability for feature (c)** — Replit Animation generates React-based programmatic animations, not traditional video. May need to evaluate alternatives (Synthesia, custom React renderer) during M008 planning.
- **Feature (d) feasibility** — autonomous dev pipeline is speculative. Document the vision clearly but flag technical unknowns. This is Phase 3 for a reason.
- **Separate codebase complexity** — two repos (OSS + Pro) means coordinating releases, shared types, and API contracts. The architecture decision must be documented in DECISIONS.md.

## Existing Prior Art / Dependencies

- M001–M004 deliverables: the complete OSS tool, GitHub Action, landing page, docs site
- M003: GitHub Sponsors setup (Phase 1 revenue)
- M004: Landing page and docs site (the public face that Pro tier links back to)
- ICP research from this discussion phase (B2B SaaS, 50–500 employees, product-led growth)
- Competitive landscape research from this discussion phase

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R026 — Business entity formation (Driftless LLC, New York)
- R027 — Payment infrastructure for future Pro tier subscriptions
- R029 (new) — Comprehensive business planning documents at ~/Desktop/driftless/
- R030 (new) — Private codebase scaffold for closed-source Pro tier
- R031 (new) — Pitch deck outline and executive summary for collaborator/advisor sharing

## Scope

### In Scope

- **10 business planning documents** to `~/Desktop/driftless/` with Mermaid diagrams (see User-Visible Outcome for full list)
- **NY LLC formation guide** — step-by-step, all links, costs, timeline
- **Payment provider setup** — Stripe or Lemon Squeezy account with product/price configuration
- **Private repo scaffold** — GitHub private repo for Pro tier with README, license, and basic project structure
- **Architecture decision** — how OSS and Pro repos share types/contracts (documented in DECISIONS.md)
- **ICP analysis** — embedded in product strategy doc with supporting research
- **Competitive landscape** — embedded in product strategy doc with feature-by-feature comparison

### Out of Scope / Non-Goals

- **Building any Pro tier features** — that's M006+ (knowledge base, walkthroughs, videos, autonomous pipeline)
- **Forming the LLC** — human task, documented in the guide
- **Detailed technical architecture for features (a)–(d)** — the PRD covers product requirements, not system design
- **Investor outreach or fundraising** — the pitch deck outline is for readiness, not active fundraising
- **Enterprise tier planning** — defer until mid-market traction is proven
- ~~License gate on GitHub Action~~ — removed; the old model was replaced by the closed-source Pro tier approach

## Technical Constraints

- **Lemon Squeezy or Stripe** for payment processing — decision made during M005 execution based on latest pricing/features
- **GitHub private repo** for Pro tier — must be under the same GitHub org or user account
- **Commercial license** for Pro tier — BSL (Business Source License) or proprietary; decided during M005 and documented
- **Documents must be Mermaid-compatible** — all diagrams use Mermaid syntax for portability

## Integration Points

- **GitHub** — private repo creation, org settings
- **Stripe or Lemon Squeezy** — payment provider account and product setup
- **Mercury** — business bank account (receives payouts)
- **NY Department of State** — LLC formation (documented, not executed by agent)
- **M004 landing page** — Pro tier will eventually link from pricing page (M006+ adds the page)

## Open Questions

- **Stripe vs Lemon Squeezy for SaaS billing?** Lemon Squeezy is simpler (MoR, handles tax) but Stripe gives more control. For bootstrapped phase, Lemon Squeezy is probably better. Decision during M005 execution.
- **BSL vs proprietary for Pro tier license?** BSL allows source visibility but restricts commercial use; proprietary is simpler but less transparent. Need to decide based on competitive positioning.
- **Mono-org or separate org for private repo?** Keeping both repos under `domstepek` is simplest. Separate org (`driftless-pro` or similar) is cleaner for team access later.
- **How do OSS and Pro repos share types?** Options: npm package of shared types, git submodule, or copy-paste with CI sync check. Decision during M006 planning.
