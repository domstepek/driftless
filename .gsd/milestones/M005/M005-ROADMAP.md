# M005: Business Infrastructure + Platform Vision

**Vision:** Complete business planning library and infrastructure so the founder can start executing business formation, payment setup, and Pro tier development on the same day — without additional research.

## Success Criteria

- All 10 business documents exist at `~/Desktop/driftless/` with Mermaid diagrams
- Documents are internally consistent: ICP, pricing, phasing, and timeline align across all 10 docs
- The vision document clearly articulates the phased evolution: OSS CLI → Pro platform → autonomous pipeline
- PRD covers features (a)–(d) with enough detail to begin M006 planning without additional research on (a) and (b)
- Pricing model includes competitor benchmarks, three revenue projection scenarios (conservative/moderate/aggressive), and justification
- LLC formation guide is actionable today — every step has a direct link, exact cost, and expected timeline, including NYLTA beneficial ownership filing
- Private repo exists on GitHub under `domstepek` with README explaining its relationship to the OSS repo
- Executive summary is a shareable one-pager suitable for collaborators/advisors
- Architecture decisions (payment provider, Pro tier license, repo organization) are appended to `.gsd/DECISIONS.md`

## Key Risks / Unknowns

- **Internal consistency across 10 documents** — If the vision says "Phase 2 starts Q3 2026" but the GTM plan says "Pro tier launches Q2 2026", the planning library loses credibility. All docs must share a canonical timeline, ICP, and pricing model.
- **Generic boilerplate vs grounded analysis** — AI-generated business docs tend toward platitudes. Every claim must anchor to specific data: competitor pricing from public pages, market size from analyst estimates, revenue projections from explicit assumptions.
- **NY LLC publication cost trap** — Filing in NYC triggers $1,500+ publication costs. The Albany RA strategy saves $1,000+ and must be the primary recommendation, not a footnote.

## Proof Strategy

- Internal consistency → retire in S03 by writing the executive summary that synthesizes all docs and verifying cross-references align (timeline, ICP, pricing numbers match across all 10 docs)
- Grounded analysis → retire in S01 by anchoring product strategy and PRD to specific competitor pricing (Pendo $47K/yr, WalkMe $79K/yr, DAP market $2.5B), not vague market claims
- Publication cost trap → retire in S02 by making the Albany RA strategy the primary recommendation with step-by-step instructions and exact cost comparison

## Verification Classes

- Contract verification: file existence checks (`ls ~/Desktop/driftless/0*.md`), Mermaid syntax validation, cross-reference consistency grep
- Integration verification: cross-document alignment audit — ICP description, pricing figures, timeline phases, and feature names are identical across all 10 docs
- Operational verification: none (no running services)
- UAT / human verification: founder reads the LLC formation guide and can identify every next step with a direct URL — no additional research needed

## Milestone Definition of Done

This milestone is complete only when all are true:

- All 10 documents exist at `~/Desktop/driftless/` and each contains at least one Mermaid diagram
- Cross-document consistency verified: ICP, pricing, timeline, and feature names match across all docs
- LLC formation guide includes NYLTA filing requirement (30-day deadline), Albany publication strategy with exact costs, and operating agreement requirement
- Pricing model has three revenue scenarios with explicit assumptions and competitor benchmark table
- PRD has detailed specs for features (a) and (b), directional specs for (c) and (d)
- Private repo exists on GitHub with README, license file, and basic structure
- Architecture decisions appended to `.gsd/DECISIONS.md`: payment provider, Pro tier license, repo organization
- `~/Desktop/driftless/pro-tier-features.md` and `m004-launch-playbook.md` are preserved (not overwritten)

## Requirement Coverage

- Covers: No active requirements in REQUIREMENTS.md are directly relevant to M005. M005's scope is defined by M005-CONTEXT.md capability list (business documents, LLC guide, payment infrastructure, private repo scaffold, pitch deck outline).
- Note: M005-CONTEXT.md references R026/R027/R029-R031 but those IDs are already assigned to different capabilities in REQUIREMENTS.md (eject command, monorepo awareness, broader doc automation, API fallback, anti-feature). M005 introduces new capability areas outside the existing requirement contract.
- Orphan risks: none — R025 (Claude-first constraint) is the only active requirement and is unrelated to M005.

## Slices

- [ ] **S01: Strategic Foundation — Vision, Product Strategy, PRD** `risk:high` `depends:[]`
  > After this: three documents at `~/Desktop/driftless/` (00-vision-strategy.md, 03-product-strategy.md, 04-product-requirements.md) establish the canonical narrative, ICP, competitive landscape, and full product definition with Mermaid diagrams
- [ ] **S02: Business Operations — LLC, Pricing, Payment, GTM, Ops** `risk:medium` `depends:[S01]`
  > After this: five documents at `~/Desktop/driftless/` (02-business-structure.md, 05-pricing-model.md, 06-payment-infrastructure.md, 07-gtm-plan.md, 08-operations-playbook.md) cover LLC formation with actionable steps, pricing with competitor benchmarks, payment provider recommendation, go-to-market plan, and operations playbook
- [ ] **S03: Synthesis + Scaffold — Exec Summary, Pitch Deck, Private Repo** `risk:low` `depends:[S01,S02]`
  > After this: executive summary and pitch deck outline at `~/Desktop/driftless/` synthesize all prior docs, private repo exists on GitHub with README and license, architecture decisions appended to DECISIONS.md, all 10 documents cross-reference consistently

## Boundary Map

### S01 → S02

Produces:
- Canonical ICP definition (B2B SaaS, 50–500 employees, product-led growth) referenced verbatim in pricing, GTM, and operations docs
- Canonical phased timeline (Phase 1: OSS/M001-M004, Phase 2: Pro features a-c/M006-M008, Phase 3: autonomous pipeline/M009+) with quarter estimates
- Competitive landscape table (Pendo, WalkMe, Whatfix, Appcues pricing and positioning) reused in pricing model
- Feature naming and scope (features a-d with exact names and descriptions) used consistently across all downstream docs
- `~/Desktop/driftless/00-vision-strategy.md`, `~/Desktop/driftless/03-product-strategy.md`, `~/Desktop/driftless/04-product-requirements.md`

Consumes:
- `~/Desktop/driftless/pro-tier-features.md` (existing feature specs — input to PRD)

### S01 → S03

Produces:
- Same canonical ICP, timeline, competitive landscape, and feature definitions that S03's executive summary and pitch deck outline synthesize

Consumes:
- nothing (first slice)

### S02 → S03

Produces:
- LLC formation details (entity name, state, cost breakdown) for executive summary
- Pricing model (tier structure, price points, revenue projections) for pitch deck outline
- Payment provider decision (Lemon Squeezy vs Stripe) for architecture decisions
- GTM strategy summary for executive summary and pitch deck
- `~/Desktop/driftless/02-business-structure.md`, `~/Desktop/driftless/05-pricing-model.md`, `~/Desktop/driftless/06-payment-infrastructure.md`, `~/Desktop/driftless/07-gtm-plan.md`, `~/Desktop/driftless/08-operations-playbook.md`

Consumes:
- S01's canonical ICP, timeline, competitive landscape, feature definitions
