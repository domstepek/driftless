# S03: Synthesis + Scaffold — Research

**Date:** 2026-03-14

## Summary

S03 is synthesis, not creation. All the raw material exists across 8 documents (~2,035 lines) produced by S01 and S02. The executive summary distills these into a one-pager suitable for sharing with collaborators/advisors. The pitch deck outline structures the narrative into slide-by-slide format. The private repo scaffold is a `gh repo create` plus a few files. The architecture decisions are already made — S03 just formalizes them in DECISIONS.md.

The primary risk is getting the synthesis wrong — the exec summary and pitch deck must be consistent with all 8 source docs while being concise enough to be useful as standalone artifacts. The secondary risk is the cross-document consistency audit: S01 and S02 both verified consistency within their respective doc sets, but S03 is the first time all 10 docs (including the two new ones) are verified together.

**Primary recommendation:** Write exec summary first (it forces a complete synthesis pass across all 8 docs), then the pitch deck outline (which shares the same narrative arc but in presentation structure). Append architecture decisions to DECISIONS.md. Create private repo last — it's the trivial mechanical step. Run the full cross-document consistency audit at the end, covering all 10 docs.

## Recommendation

**Task decomposition:**

1. **T01: Executive summary + pitch deck outline** — These are the two synthesis documents. Write `01-executive-summary.md` first as a one-pager that distills: what driftless is, the market opportunity, the product (three-phase evolution), pricing/revenue, business structure, and next steps. Then write `09-pitch-deck-outline.md` as a slide-by-slide structure with speaker notes pointing back to the detailed docs. Both need Mermaid diagrams (1 each minimum). Both need the canonical ICP phrase, phase timeline, and feature labels.

2. **T02: Private repo scaffold + architecture decisions + cross-document consistency audit** — Create `driftless-pro` as a private repo under `domstepek` with README explaining its relationship to the OSS repo, a proprietary LICENSE file (not BSL — see rationale below), and basic directory structure mirroring the OSS monorepo patterns. Append three architecture decisions to DECISIONS.md: payment provider (Lemon Squeezy), Pro tier license (proprietary), repo organization (same GitHub user). Run the full consistency audit across all 10 docs.

**Key decision: Proprietary over BSL 2.1 for Pro tier license.**

The research (M005-RESEARCH.md) identified both options. Proprietary is the right call:
- BSL 2.1 makes sense when you want community contributions to the source-visible codebase. A solo founder with 0–1 employees has no community contribution expectation for the Pro tier.
- BSL adds complexity (Change Date, Change License fields, explaining to customers what "source-available but not open-source" means).
- Proprietary is simple, standard, and matches the competitive landscape (Pendo, WalkMe, Whatfix are all proprietary).
- If community contribution becomes desirable later, the license can be relaxed. Going the other direction (BSL → proprietary) is harder.

**Key decision: Same GitHub user (`domstepek`) for private repo.**

Per M005-CONTEXT.md, keeping both repos under `domstepek` is simplest. A separate org adds access management overhead with zero benefit at the solo/two-person stage. The README in the private repo explains the relationship to the OSS repo.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Private repo creation | `gh repo create domstepek/driftless-pro --private` | gh CLI is authenticated and working. One command. |
| Proprietary license text | Standard "All Rights Reserved" copyright notice | No template needed — proprietary is the default. Short header stating copyright holder, all rights reserved, no redistribution. |
| Cross-document consistency audit | grep-based verification from S01/S02 patterns | S01 and S02 established grep patterns for canonical ICP, phase timeline, feature labels. Extend these to cover all 10 docs. |
| Pitch deck structure | Standard startup deck (problem → solution → market → product → business model → traction → team → ask) | Well-established 10–12 slide structure. Don't invent a format. |

## Existing Code and Patterns

- `~/Desktop/driftless/00-vision-strategy.md` (137 lines) — Three-phase narrative, growth model, strategic risks. Primary source for exec summary's "what we're building" section.
- `~/Desktop/driftless/03-product-strategy.md` (204 lines) — Canonical ICP, competitive landscape (8 competitors with pricing), market sizing (TAM/SAM/SOM). Primary source for pitch deck's market slide.
- `~/Desktop/driftless/04-product-requirements.md` (417 lines) — Detailed feature specs (a)/(b), directional (c)/(d). Product slides in pitch deck reference this.
- `~/Desktop/driftless/05-pricing-model.md` (234 lines) — Three revenue scenarios. Conservative: $26K ARR Year 1. Moderate: $222K ARR Year 1. Aggressive: $1.6M ARR Year 1. Exec summary should cite moderate scenario as the base case.
- `~/Desktop/driftless/02-business-structure.md` (284 lines) — LLC formation guide with Albany RA strategy. Exec summary's business section references entity status.
- `~/Desktop/driftless/06-payment-infrastructure.md` (298 lines) — Lemon Squeezy rationale and setup. Architecture decision source.
- `~/Desktop/driftless/07-gtm-plan.md` (166 lines) — Three-phase GTM, zero-spend through Phase 2. Exec summary's go-to-market section.
- `~/Desktop/driftless/08-operations-playbook.md` (94 lines) — Monthly ops checklist, scaling triggers. Lightest doc — exec summary needs one sentence.
- `packages/core/package.json`, `packages/cli/package.json` — `@driftless-ai/*` scope, ESM-first, TypeScript. Private repo scaffold should mirror these conventions.
- `.gsd/DECISIONS.md` — 76 decisions (D001–D076). Last M005 decision is D076. S03 appends D077–D079 (payment provider, license, repo org).
- `LICENSE` — MIT for OSS repo. Private repo gets proprietary license.

## Constraints

- **Executive summary must be a shareable one-pager** — per M005-CONTEXT.md success criteria, suitable for collaborators/advisors. This means it must stand alone without requiring the reader to open other docs.
- **Both new docs need ≥1 Mermaid diagram** — per milestone DoD, all 10 docs must contain Mermaid.
- **Canonical consistency strings must appear in all 10 docs** — the grep-verifiable canonical ICP phrase, phase timeline references, and feature labels.
- **Protected files must not be modified** — `pro-tier-features.md` (MD5: f93972b6985ec540a93df5fe3e120153) and `m004-launch-playbook.md` (MD5: 6dc7ac0fa7b45c5d3f37671655530441).
- **Private repo under `domstepek` account** — gh CLI authenticated, no private repos exist yet.
- **No code changes to the driftless repo** — only DECISIONS.md gets appended to.
- **DECISIONS.md is append-only** — new entries are D077+, never modify existing entries.
- **gh CLI is available and authenticated** — `gh auth status` confirms `domstepek` account with PAT.

## Common Pitfalls

- **Exec summary becomes a table of contents** — A synthesis document should tell a story, not list headings from the other 8 docs. It needs a narrative arc: problem → solution → why now → how it makes money → what's next. The reader should understand the business without opening anything else.
- **Pitch deck outline as generic template** — Every slide should reference the specific grounded data from S01/S02 docs. "Market: $X TAM" not "Market: large and growing." Speaker notes should cite the specific doc and section where the full analysis lives.
- **Cross-doc inconsistency in the new synthesis docs** — Easiest place to introduce drift is in the summary documents, where there's temptation to round numbers or paraphrase. Use exact figures from the source docs.
- **Private repo with wrong license** — The LICENSE file in the private repo must NOT be MIT. Proprietary with explicit "All Rights Reserved" and no redistribution clause.
- **Overly complex private repo scaffold** — It's an empty scaffold. README, LICENSE, .gitignore, and a basic directory structure. No code, no package.json, no build system. Those are M006 concerns.
- **Architecture decisions that contradict existing docs** — D077 (payment provider) and D078 (license) must be consistent with what's already written in the payment infrastructure and vision docs.

## Open Risks

- **Private repo naming** — `driftless-pro` is the obvious name, but it reveals the product strategy in the repo name visible on GitHub profiles (even if private, the owner sees it). Alternatives: `driftless-platform`, `driftless-commercial`. Low risk — naming can change later.
- **Proprietary license wording** — A simple "All Rights Reserved" header is sufficient for a scaffold, but a production Pro tier will eventually need a proper EULA/SaaS agreement. The scaffold license is a placeholder. Flag this in the README.
- **Cross-document consistency at scale** — With 10 documents totaling ~2,300+ lines, there may be minor inconsistencies that grep patterns don't catch (e.g., a figure cited as "$47K" in one doc and "~$47,000" in another). The audit focuses on the canonical strings and major data points, not every number.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| GitHub repo management | gh (installed skill at `~/.gsd/agent/skills/github-workflows/references/gh/SKILL.md`) | installed — covers repo creation and management |
| Pitch deck writing | none found | N/A — pitch deck outline is a markdown document, not a presentation tool task |
| Executive summary | none found | N/A — synthesis writing, not a tool-specific task |

No additional skills needed. The gh skill covers GitHub repo operations. The rest is document writing and grep-based auditing.

## Sources

- S01 summary forward intelligence: canonical ICP phrase, phase timeline, feature labels, competitive pricing data — all defined and grep-verified
- S02 summary forward intelligence: entity name "Driftless AI LLC" (per S02 summary, though M005-CONTEXT says "Driftless LLC"), pricing evolution $99→$199–$299, payment provider Lemon Squeezy, scaling triggers
- M005-RESEARCH.md: BSL 2.1 vs proprietary analysis — proprietary recommended for solo-founder with no community contribution expectation on Pro tier
- M005-CONTEXT.md: Private repo under `domstepek` (simplest), commercial license needed, README explaining relationship to OSS repo
- `gh auth status`: Confirmed authentication as `domstepek` with PAT — repo creation is feasible via CLI
- `gh repo list domstepek --visibility private`: No existing private repos — `driftless-pro` name is available
- Existing docs cross-check: All 8 docs contain canonical ICP phrase, phase timeline, and feature labels — verified via grep
- Protected file integrity: Both MD5s match (pro-tier-features.md: f93972b6985ec540a93df5fe3e120153, m004-launch-playbook.md: 6dc7ac0fa7b45c5d3f37671655530441)
