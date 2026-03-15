# S01: Strategic Foundation — Vision, Product Strategy, PRD

**Goal:** Three business documents at `~/Desktop/driftless/` establish the canonical narrative, ICP, competitive landscape, and full product definition — anchored to specific market data, not platitudes.
**Demo:** `00-vision-strategy.md`, `03-product-strategy.md`, and `04-product-requirements.md` exist with Mermaid diagrams, share a consistent ICP/timeline/feature naming, and cite specific competitor pricing (Pendo, WalkMe, Whatfix, Appcues).

## Must-Haves

- Vision document articulates three-phase evolution: OSS CLI → Pro platform → autonomous pipeline, with quarter estimates
- Product strategy defines canonical ICP (B2B SaaS, 50–500 employees, PLG) used verbatim in all downstream docs
- Product strategy contains competitive landscape table with specific pricing data from public sources (not guesses)
- Product strategy includes market sizing anchored to analyst estimates (DAP market $2.5B+)
- PRD covers features (a)–(d): detailed specs with user stories and acceptance criteria for (a) and (b), directional specs for (c) and (d)
- Each document contains at least one Mermaid diagram
- ICP description, phased timeline, feature names, and competitive data are internally consistent across all three documents
- Existing files `pro-tier-features.md` and `m004-launch-playbook.md` are preserved (not overwritten)

## Verification

- `ls ~/Desktop/driftless/00-vision-strategy.md ~/Desktop/driftless/03-product-strategy.md ~/Desktop/driftless/04-product-requirements.md` — all three exist
- `grep -c '```mermaid' ~/Desktop/driftless/00-vision-strategy.md` — ≥ 1
- `grep -c '```mermaid' ~/Desktop/driftless/03-product-strategy.md` — ≥ 1
- `grep -c '```mermaid' ~/Desktop/driftless/04-product-requirements.md` — ≥ 1
- `grep -l 'Pendo' ~/Desktop/driftless/03-product-strategy.md ~/Desktop/driftless/04-product-requirements.md` — competitor data grounded in both
- Cross-reference: ICP description ("B2B SaaS, 50–500 employees") appears in all three docs
- Cross-reference: Phase names (Phase 1/2/3) and quarter targets match across vision and PRD
- Cross-reference: Feature names (a)–(d) use identical labels in product strategy and PRD
- PRD features (a) and (b) each have: user stories, acceptance criteria, technical approach section
- PRD features (c) and (d) each have: high-level description, target user, key differentiator
- `ls ~/Desktop/driftless/pro-tier-features.md ~/Desktop/driftless/m004-launch-playbook.md` — preserved
- Diagnostic: If any competitive pricing cell says "custom pricing, not publicly listed", verify the research step documented the failed lookup — no silent gaps

## Observability / Diagnostics

- **Document consistency signals:** `grep` for canonical ICP phrase ("B2B SaaS, 50–500 employees") across all three output docs confirms cross-doc alignment. Mismatch = authoring error.
- **Competitive data grounding:** `grep -c 'Pendo\|WalkMe\|Whatfix\|Appcues'` on product strategy and PRD. Count < 4 = insufficient sourcing.
- **Mermaid diagram presence:** `grep -c '```mermaid'` per doc. 0 = missing required visual.
- **File integrity:** MD5 checksums of `pro-tier-features.md` and `m004-launch-playbook.md` before and after slice execution must match — any change = accidental modification.
- **Failure visibility:** If competitive pricing research yields no public data for a competitor, document that explicitly in the competitive table (e.g., "custom pricing, not publicly listed") rather than silently omitting or inventing figures.

## Tasks

- [x] **T01: Write vision strategy and product strategy documents with grounded competitive research** `est:1h`
  - Why: Establishes the canonical narrative, ICP, competitive landscape, and phased timeline that all other M005 docs reference. Retires the "generic boilerplate" risk by anchoring every market claim to specific public data.
  - Files: `~/Desktop/driftless/00-vision-strategy.md`, `~/Desktop/driftless/03-product-strategy.md`
  - Do: Research current competitor pricing (Pendo, WalkMe, Whatfix, Appcues, Userpilot) and DAP market size via web search. Write `00-vision-strategy.md` with three-phase evolution narrative and Mermaid timeline. Write `03-product-strategy.md` with canonical ICP definition, competitive landscape table (specific pricing, positioning), market sizing, and positioning statement. Both docs must use identical ICP description, phase names, and quarter targets.
  - Verify: Both files exist, each has ≥1 Mermaid block, competitive landscape table has specific dollar figures for ≥4 competitors, ICP description matches between docs
  - Done when: `00-vision-strategy.md` and `03-product-strategy.md` exist at `~/Desktop/driftless/` with Mermaid diagrams, grounded competitor data, and internally consistent canonical definitions

- [x] **T02: Write product requirements document with detailed specs for features (a)–(b) and directional specs for (c)–(d)** `est:1h`
  - Why: The PRD is the actionable product definition that M006 planning consumes directly. Features (a) and (b) need enough detail to begin implementation without additional research. Features (c) and (d) need direction without premature specificity.
  - Files: `~/Desktop/driftless/04-product-requirements.md`
  - Do: Read T01's output (`00-vision-strategy.md`, `03-product-strategy.md`) and `pro-tier-features.md` as inputs. Write `04-product-requirements.md` with: document header referencing the canonical ICP and vision, detailed specs for features (a) Knowledge Base and (b) Guided Walkthroughs (user stories, acceptance criteria, technical approach, integration points), directional specs for features (c) Auto Videos and (d) Autonomous Pipeline (description, target user, key differentiator, open questions). Include Mermaid architecture/flow diagrams. Use identical ICP, timeline, feature names, and competitor references from T01.
  - Verify: File exists with ≥1 Mermaid block, features (a)/(b) each have user stories + acceptance criteria + technical approach, features (c)/(d) each have description + target user + differentiator, ICP/timeline/feature names match T01 docs exactly
  - Done when: `04-product-requirements.md` exists at `~/Desktop/driftless/` with Mermaid diagrams, detailed (a)/(b) specs sufficient for M006 planning, directional (c)/(d) specs, and full consistency with T01 outputs

## Files Likely Touched

- `~/Desktop/driftless/00-vision-strategy.md`
- `~/Desktop/driftless/03-product-strategy.md`
- `~/Desktop/driftless/04-product-requirements.md`
