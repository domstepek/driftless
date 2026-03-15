---
id: S03
milestone: M005
status: ready
---

# S03: Synthesis + Scaffold — Exec Summary, Pitch Deck, Private Repo — Context

## Goal

Two synthesis documents (exec summary + pitch deck outline) complete the 10-doc business planning library, the private Pro tier repo is scaffolded on GitHub, PROJECT.md in the public repo is updated to acknowledge the two-repo architecture, and a cross-document consistency audit confirms all 10 docs align on ICP, pricing, timeline, and feature names.

## Why this Slice

S01 and S02 produce the foundational and operational documents. S03 is the capstone: it synthesizes everything into the two most-shared artifacts (exec summary and pitch deck outline), provisions the private repo that M006 will build into, and closes the internal consistency risk by auditing and fixing cross-doc mismatches before M005 is declared complete.

## Scope

### In Scope

- **`01-executive-summary.md`** — Strict one-page document, designed to be forwarded as-is to an advisor or co-founder candidate. Structure: problem (1 paragraph), solution and differentiation (1 paragraph), ICP (3 bullet points), phased traction narrative (Phase 1 OSS → Phase 2 Pro), pricing and revenue potential (one data point each), ask/next step (1 sentence). Must stand alone without the reader needing to read any other document. Accessible to non-technical readers. Includes a Mermaid diagram (timeline or funnel — agent's discretion on which fits better).

- **`09-pitch-deck-outline.md`** — Populated slide-by-slide outline. Each slide gets: slide title, 3–5 content bullets, and a speaker note indicating what to show, say, or emphasize. Standard pre-seed narrative arc: Problem → Solution → Why Now → Product → Market Size → Business Model → Traction → Team → Ask. The outline should be complete enough that a designer can build the deck from it without additional input. Includes a Mermaid diagram showing the company timeline or product evolution arc.

- **Private repo scaffold** — Create `domstepek/driftless-pro` as a private GitHub repository containing only: `README.md` explaining what the repo is, its relationship to the OSS `domstepek/driftless` repo, and that it contains the closed-source Pro tier codebase; `LICENSE` with a standard proprietary/all-rights-reserved notice. No directory structure, no code, no package.json. M006 adds the codebase shape.

- **Cross-document consistency audit** — Agent reads all 10 completed documents and checks: ICP description is identical across docs that reference it, pricing figures ($99/mo early adopter, competitor benchmarks) are consistent, phased timeline language (Phase 1/2/3, milestone references) matches, feature names (a)/(b)/(c)/(d) and their descriptions are used consistently. Agent fixes any mismatches directly — no report, no review step. The goal is a coherent library, not a list of problems.

- **`PROJECT.md` update** — Update `.gsd/PROJECT.md` in the public OSS repo (not gitignored) to add a brief note on the two-repo architecture: the OSS CLI lives in this repo (MIT license), Pro tier features live in a separate private repo (`domstepek/driftless-pro`, proprietary license). Non-sensitive — it's describing the architecture, not the Pro tier features or business plans.

### Out of Scope

- Architecture decisions appended to `.gsd/DECISIONS.md` — these stay private. Payment provider (Lemon Squeezy), Pro tier license (proprietary), and repo organization decisions are documented in `~/Desktop/driftless/` only, not committed to the public repo.
- Actual pitch deck slides (PowerPoint, Keynote, Figma) — the outline is the deliverable; building the visual deck is a future human task.
- Any Pro tier codebase, directory structure, or package.json in the private repo — M006 owns that.
- Investor outreach or sharing the exec summary — the document is for readiness, not active distribution.
- Updating `STATE.md` to reflect M005 complete — that's the milestone completion step after S03, not part of S03 itself.

## Constraints

- **Exec summary must be truly one page** — if it reads long when printed or shared as a PDF, trim it. Prioritize: problem, solution, ICP, ask. Deprioritize: operational detail, feature specs, legal structure.
- **Pitch deck outline must be self-contained** — a designer or co-founder reading only this doc should be able to build the deck without opening any other M005 document.
- **Consistency audit fixes, not just flags** — if the GTM doc says "Phase 2" starts with a different milestone than the vision doc, the agent picks the canonical version (from S01's `00-vision-strategy.md`) and updates the inconsistent doc. No review loop.
- **Private repo is README + LICENSE only** — resist adding directory structure. M006 will define the project shape based on what features (a) and (b) actually need.
- **PROJECT.md change must be minimal and non-sensitive** — one paragraph or a new section. No Pro tier feature descriptions, no pricing, no business strategy. Just: "two repos exist, here's why."
- **Preserve `pro-tier-features.md` and `m004-launch-playbook.md`** — do not overwrite these existing files in `~/Desktop/driftless/`.

## Integration Points

### Consumes

- All 9 prior documents from S01 and S02 (`~/Desktop/driftless/00-*.md` through `08-*.md`) — exec summary and pitch deck outline synthesize these
- `~/Desktop/driftless/pro-tier-features.md` — feature specs referenced in pitch deck outline
- `.gsd/PROJECT.md` — updated in place (public repo, not gitignored)

### Produces

- `~/Desktop/driftless/01-executive-summary.md` — one-page shareable summary
- `~/Desktop/driftless/09-pitch-deck-outline.md` — populated slide-by-slide outline with speaker notes
- `domstepek/driftless-pro` — private GitHub repo with README + LICENSE
- Updated `.gsd/PROJECT.md` — two-repo architecture note added
- Internally consistent document library — all 10 docs aligned on ICP, pricing, timeline, feature names

## Open Questions

- **Exec summary "ask"** — at this stage (pre-launch), the "ask" in the exec summary is ambiguous. Options: ask for introductions to potential early customers, ask for co-founder conversations, no explicit ask at all. Current thinking: keep it generic — "looking for early design partners and advisors" — so the doc ages well as the company evolves through Phase 1.
- **Pitch deck narrative: pre-seed vs series A arc** — pre-seed decks are vision-heavy and founder-credibility-focused; Series A decks are metrics-heavy. At Phase 1 (pre-launch), this should be a pre-seed arc. Current thinking: use the standard pre-seed arc with a clear "traction" slide that initially shows OSS adoption metrics as a proxy for demand signal, with a note that Pro conversion data will replace it in Phase 2.
