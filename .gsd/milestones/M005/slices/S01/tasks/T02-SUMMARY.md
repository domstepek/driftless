---
id: T02
parent: S01
milestone: M005
provides:
  - Product Requirements Document (04-product-requirements.md) with detailed specs for features (a) and (b) and directional specs for (c) and (d)
  - Detailed user stories and acceptance criteria for Knowledge Base + Agent Skill (5 stories) and Guided Walkthroughs (5 stories)
  - Technical approach sections for features (a) and (b) covering ingestion pipeline, query pipeline, SDK architecture, and element targeting
  - Directional specs for Auto Videos and Autonomous Pipeline with open questions for future milestone planning
  - Two Mermaid diagrams: product architecture flowchart and competitive positioning quadrant chart
key_files:
  - ~/Desktop/driftless/04-product-requirements.md
key_decisions:
  - Feature (a) agent skill uses RAG retrieval pattern (returns chunks + metadata) rather than performing generation — host chatbot/agent handles generation. Keeps the skill composable.
  - Feature (b) walkthrough SDK uses Shadow DOM for overlay rendering to prevent style conflicts with host applications
  - Feature (b) manual PM edits are preserved across auto-regeneration via a merge strategy that only updates unedited steps
  - Features (c)/(d) kept deliberately directional with open questions — premature specificity would constrain M008/M009 planning
patterns_established:
  - Cross-document consistency: identical ICP phrase, phase names, quarter targets, feature labels, and competitor pricing across all three M005 docs
  - Detailed feature specs pattern: user stories → acceptance criteria → technical approach → non-functional requirements → integration points
  - Directional feature specs pattern: description → target user → key differentiator → high-level approach → open questions
observability_surfaces:
  - grep canonical ICP phrase across ~/Desktop/driftless/0*.md — confirms cross-doc consistency
  - grep -c '```mermaid' per doc — confirms diagram presence
  - MD5 of pro-tier-features.md (f93972b6985ec540a93df5fe3e120153) and m004-launch-playbook.md (6dc7ac0fa7b45c5d3f37671655530441) — confirms no collateral damage
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Write product requirements document with detailed specs for features (a)–(b) and directional specs for (c)–(d)

**Wrote 04-product-requirements.md with 10 user stories across features (a)/(b), technical approach for both, two Mermaid diagrams, competitive context with specific pricing, and directional specs with open questions for (c)/(d) — fully consistent with T01's vision and product strategy docs.**

## What Happened

1. **Read T01 outputs** (`00-vision-strategy.md`, `03-product-strategy.md`, `pro-tier-features.md`) to establish the consistency baseline: canonical ICP, phase timeline, feature labels (a)–(d), competitive pricing data, and milestone mapping.

2. **Wrote 04-product-requirements.md** with the following structure:
   - **Document header** referencing the canonical ICP verbatim and phased delivery table
   - **Product architecture Mermaid diagram** showing the data pipeline from e2e tests through all four features
   - **Feature (a) — Knowledge Base + Agent Skill:** 5 user stories (KB setup, auto sync, agent skill install, KB browsing, freshness monitoring) with acceptance criteria for each, technical approach covering ingestion pipeline (chunking, embedding, vector store), query pipeline (RAG pattern), hosting infrastructure, and integration points
   - **Feature (b) — AI-Generated Guided Walkthroughs:** 5 user stories (auto generation, SDK embed, triggering, customization, analytics) with acceptance criteria for each, technical approach covering generation pipeline, client SDK architecture (Shadow DOM), element targeting strategy (e2e test selectors as primary), and integration points
   - **Feature (c) — Automated Product Demo/Tutorial Videos:** directional spec with description, target user, key differentiator, high-level approach, and 5 open questions for M008 planning
   - **Feature (d) — Signal-Driven Autonomous Development Pipeline:** directional spec with description, target user, key differentiator, high-level approach (signal sources + pipeline outputs), and 6 open questions for M009 planning
   - **Competitive context** section with specific competitor pricing from T01 research (Pendo, WalkMe, Whatfix, Appcues, Userpilot) plus a Mermaid positioning quadrant chart
   - **Cross-reference feature label index** ensuring identical naming with product strategy
   - **Success metrics** and **dependency table**

3. **Cross-reference audit:** Verified ICP phrase, phase names, quarter targets, feature labels, and competitor pricing are identical across all three documents.

## Verification

All slice-level checks passed:
- ✅ `ls` — all three docs exist at ~/Desktop/driftless/
- ✅ `grep -c '```mermaid'` — 00-vision-strategy.md: 1, 03-product-strategy.md: 1, 04-product-requirements.md: 2
- ✅ `grep -l 'Pendo'` — present in both product strategy and PRD
- ✅ Canonical ICP phrase ("B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers") — present in all three docs (1 match each)
- ✅ Phase names (1/2/3) and quarter targets (Q1–Q3 2026, Q4 2026–Q2 2027, Q3 2027+) match across vision and PRD
- ✅ Feature names (a)–(d) use identical labels in product strategy (7 matches) and PRD (10 matches)
- ✅ PRD features (a) and (b) each have: user stories (5 each), acceptance criteria, technical approach section
- ✅ PRD features (c) and (d) each have: description, target user, key differentiator (3 directional fields each)
- ✅ Competitor mentions in PRD: 6 (≥4 required)
- ✅ `pro-tier-features.md` MD5: f93972b6985ec540a93df5fe3e120153 (unchanged)
- ✅ `m004-launch-playbook.md` MD5: 6dc7ac0fa7b45c5d3f37671655530441 (unchanged)

## Diagnostics

- `grep 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0*.md` — confirms canonical ICP in all docs
- `grep -c '```mermaid' ~/Desktop/driftless/0*.md` — confirms Mermaid presence per doc
- `md5 ~/Desktop/driftless/pro-tier-features.md ~/Desktop/driftless/m004-launch-playbook.md` — confirms untouched files
- `grep -c 'Pendo\|WalkMe\|Whatfix\|Appcues' ~/Desktop/driftless/04-product-requirements.md` — confirms competitor grounding

## Deviations

None. Executed as planned. T02-PLAN.md didn't exist as a standalone file — used the slice plan's T02 entry as the authoritative contract.

## Known Issues

None.

## Files Created/Modified

- `~/Desktop/driftless/04-product-requirements.md` — Full PRD with detailed (a)/(b) specs, directional (c)/(d) specs, two Mermaid diagrams, competitive context, cross-reference index
- `.gsd/milestones/M005/slices/S01/S01-PLAN.md` — Marked T02 as complete
- `.gsd/milestones/M005/slices/S01/tasks/T02-SUMMARY.md` — This file
