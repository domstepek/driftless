---
id: S01
milestone: M005
status: ready
---

# S01: Strategic Foundation — Vision, Product Strategy, PRD — Context

## Goal

Three accessible, advisor-ready documents at `~/Desktop/driftless/` establish the canonical narrative, competitive positioning, and full product definition that every downstream M005 document references.

## Why this Slice

Everything else in M005 — pricing, LLC structure, GTM, exec summary — draws its numbers, ICP definition, competitive claims, and feature names from these three docs. Writing them first creates a single source of truth. Writing them last means the downstream docs contradict each other.

## Scope

### In Scope

- **`00-vision-strategy.md`** — The full arc: problem (docs drift, onboarding fails, demos go stale), solution (automated pipeline: tests → docs → KB → walkthroughs → videos), phased evolution (OSS CLI → Pro platform → autonomous pipeline). Written for a non-technical advisor or angel investor — narrative-first, story-forward, accessible without engineering context.

- **`03-product-strategy.md`** — ICP (B2B SaaS, 50–500 employees, product-led growth, already has e2e tests), competitive landscape (name competitors directly: Pendo, WalkMe, Guru, Synthesia — with public pricing and the order-of-magnitude price gap), market sizing, positioning. Leads with the problem. Three-scenario revenue projections with explicit assumptions and honest caveats that these are pre-launch estimates.

- **`04-product-requirements.md`** — PRD covering all four Pro features. Features (a) and (b) get detailed specs. Feature (c) is directional. Feature (d) — the autonomous dev pipeline — gets a full directional section (signal ingestion, agent prioritization, cloud coding agents, auto-PR + docs, verification loop) clearly labeled Phase 3 / speculative. The depth on (d) demonstrates the thinking without implying it's imminent.

- **Relative milestone timeline** throughout all three docs — Phase 1 (M001–M004, OSS launch), Phase 2 (M006–M008, Pro features a–c), Phase 3 (M009+, feature d). No calendar dates — these go stale. Relative timing based on milestone completion.

- **Named competitors with prices** — Pendo (~$47K/yr avg), WalkMe (~$79K/yr avg), Whatfix (~$24–37K/yr), Guru, Synthesia. Show the gap: driftless Pro at $200–500/mo is 10–50x cheaper because the content is auto-generated, not manually maintained.

- **Mermaid diagrams** in each document — at minimum: phased evolution diagram in vision doc, competitive positioning quadrant in product strategy, feature pipeline diagram in PRD.

- **Canonical ICP, feature names, and pricing** established here — used verbatim in every S02 document. These become the ground truth for internal consistency.

### Out of Scope

- Pricing model detail (S02 — `05-pricing-model.md` expands the revenue projections with competitor benchmarks and three full scenarios)
- LLC formation steps (S02 — `02-business-structure.md`)
- GTM plan (S02 — `07-gtm-plan.md`)
- Executive summary and pitch deck (S03 — synthesizes S01+S02 outputs)
- Technical architecture for features (a)–(d) — the PRD is product requirements, not system design
- Enterprise tier planning (deferred until mid-market traction is proven)
- Any investor outreach — pitch deck outline is for readiness, not active fundraising

## Constraints

- **Advisor-accessible tone throughout** — no jargon, no assumption of engineering context. If a non-technical angel can't follow the narrative in 10 minutes, it needs to be rewritten.
- **Problem-first structure** — every document leads with the pain (stale docs, failed onboarding, expensive demos) before introducing driftless as the solution.
- **No calendar dates** — use relative milestone anchors only. Calendar dates go stale; milestone-relative timing doesn't.
- **Grounded claims only** — every competitive pricing figure, market size, and revenue projection must come from a real source (public pricing pages, analyst estimates) or be explicitly labeled as an assumption. No fabricated numbers.
- **Feature (d) must be visibly speculative** — the directional spec demonstrates thinking but must be clearly labeled Phase 3 / speculative so readers don't evaluate driftless on whether the moonshot is credible.
- **Mermaid syntax** — all diagrams use Mermaid for portability (renders natively in GitHub, most markdown viewers).
- **`pro-tier-features.md` is the input** — full feature specs already exist at `~/Desktop/driftless/pro-tier-features.md`. The PRD draws from this, doesn't replace it.

## Integration Points

### Consumes

- `~/Desktop/driftless/pro-tier-features.md` — complete feature specs for (a)–(d); primary input to the PRD
- M005-CONTEXT.md ICP definition (B2B SaaS, 50–500 employees, PLG, $200–$1,000/mo budget)
- M005-RESEARCH.md competitive pricing data (Pendo $47K/yr, WalkMe $79K/yr, Whatfix $24–37K/yr, DAP market $2.5B)
- M005-RESEARCH.md phased timeline (Phase 1: M001–M004, Phase 2: M006–M008, Phase 3: M009+)

### Produces

- `~/Desktop/driftless/00-vision-strategy.md` — canonical vision narrative consumed by S03 exec summary and pitch deck
- `~/Desktop/driftless/03-product-strategy.md` — canonical ICP, competitive landscape, and market sizing consumed verbatim by S02 pricing and GTM docs
- `~/Desktop/driftless/04-product-requirements.md` — canonical feature names and scope for features (a)–(d), consumed by all downstream docs and M006 planning

## Open Questions

- **Revenue projection numbers in product strategy vs pricing model** — S01's product strategy doc includes early revenue projections (three scenarios). S02's pricing model expands them with full competitor benchmarks. Decide during execution whether the S01 projections are summaries that reference the pricing model, or standalone estimates that the pricing model elaborates. Current thinking: S01 shows the scenarios at a high level with explicit "these are pre-launch estimates" framing; S02 owns the detailed model.
