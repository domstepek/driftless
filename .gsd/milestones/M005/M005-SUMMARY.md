---
id: M005
provides:
  - Ten business planning documents at ~/Desktop/driftless/ with Mermaid diagrams and grep-verified cross-document consistency (canonical ICP, phase timeline, feature labels in all 10 docs)
  - NY LLC formation guide with 8 actionable steps, 18 URLs, Albany RA as primary publication strategy, NYLTA domestic exemption documented, operating agreement requirement
  - Pricing model with three revenue scenarios (conservative/moderate/aggressive), competitor benchmark table from Vendr/G2 data, Lemon Squeezy fee modeling
  - Product requirements document with detailed specs for features (a)/(b) — 10 user stories with acceptance criteria — and directional specs for (c)/(d) with open questions
  - Payment infrastructure recommendation (Lemon Squeezy as MoR) with fee breakdown, webhook lifecycle, and Stripe migration path at scale thresholds
  - Three-phase GTM plan extending m004-launch-playbook with channel strategy and qualitative impact ratings
  - Executive summary as standalone one-pager suitable for collaborators/advisors
  - Pitch deck outline (12 slides) with speaker notes citing specific source document data points
  - Private repo domstepek/driftless-pro scaffolded with README, proprietary LICENSE, .gitignore, directory structure
  - Architecture decisions D077–D079 formalized (payment provider, Pro tier license, repo organization)
key_decisions:
  - "D065: Three-slice document dependency chain — S01 establishes canonical narrative, S02 builds operations docs from it, S03 synthesizes"
  - "D066: M005 introduces capabilities outside REQUIREMENTS.md — business docs tracked by milestone completion, not requirement IDs"
  - "D067: Canonical ICP phrase used verbatim across all 10 docs for grep-verifiable consistency"
  - "D068: Phase timeline fixed — Phase 1 Q1–Q3 2026, Phase 2 Q4 2026–Q2 2027, Phase 3 Q3 2027+"
  - "D069: Competitive pricing from procurement aggregators (Vendr, G2) — no fabricated figures"
  - "D070: Feature (a) KB uses RAG retrieval pattern — skill returns chunks, host agent handles generation"
  - "D071: Feature (b) walkthrough SDK uses Shadow DOM for style isolation"
  - "D072: Feature (b) preserves manual PM edits via per-step merge strategy"
  - "D073: Features (c)/(d) kept directional — premature specificity would constrain M008/M009"
  - "D074: Albany RA as primary LLC recommendation — saves $650–$1,650+ vs NYC publication"
  - "D075: $99/mo early adopter → $199–$299/mo standard — bridges S01's $200–$500 positioning range"
  - "D076: Qualitative-only GTM channel impact — refused to fabricate per-channel conversion numbers"
  - "D077: Payment provider — Lemon Squeezy (MoR) with Stripe migration at $10K MRR / 20% international"
  - "D078: Pro tier license — Proprietary/All Rights Reserved, placeholder pending production EULA"
  - "D079: Repo organization — both repos under domstepek GitHub user, no separate org"
patterns_established:
  - Cross-document canonical phrase consistency — identical ICP, phase names, quarter targets, feature labels across all 10 docs, grep-verifiable
  - Grounded claims — every market size, pricing figure, and competitor data point cites a specific source (analyst report, procurement aggregator, or public pricing page)
  - Context section pattern — each business doc opens with canonical ICP, phase timeline table, and feature list for consistency auditing
  - Revenue scenario modeling — explicit per-scenario assumption tables with benchmark anchors cited
  - Qualitative-over-fabricated — refuse to generate quantitative projections for untested channels/funnels
observability_surfaces:
  - "grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/*.md | wc -l — expect 10"
  - "grep -c '```mermaid' ~/Desktop/driftless/0*.md — confirms Mermaid presence in all 10 docs"
  - "md5 -q ~/Desktop/driftless/pro-tier-features.md — expect f93972b6985ec540a93df5fe3e120153"
  - "md5 -q ~/Desktop/driftless/m004-launch-playbook.md — expect 6dc7ac0fa7b45c5d3f37671655530441"
  - "grep -c 'D077\\|D078\\|D079' .gsd/DECISIONS.md — expect 3"
requirement_outcomes: []
duration: 94m
verification_result: passed
completed_at: 2026-03-14
---

# M005: Business Infrastructure + Platform Vision

**Complete business planning library — 10 documents with Mermaid diagrams, grounded competitive data, and grep-verified cross-document consistency — plus LLC formation guide actionable today, pricing model with three revenue scenarios, private Pro tier repo scaffolded, and architecture decisions formalized.**

## What Happened

**S01 — Strategic Foundation (40m):** Researched current pricing for five DAP competitors and three KB competitors via Vendr, G2, and public pricing pages. Established the canonical narrative: three-phase evolution from OSS CLI → Pro platform → autonomous pipeline. Wrote three foundational documents (vision strategy, product strategy, PRD) that define the ICP, competitive landscape, phased timeline, and feature specifications. Features (a)/(b) got detailed treatment — 10 user stories with acceptance criteria, technical approaches, and non-functional requirements. Features (c)/(d) stayed deliberately directional with open questions preserved. All competitive pricing claims cite specific sources; no fabricated figures.

**S02 — Business Operations (26m):** Built five operational documents on the S01 foundation, consuming its canonical ICP, timeline, and competitive data verbatim. The LLC formation guide has 8 steps with 18 URLs and exact dollar amounts — Albany RA strategy is the primary recommendation with explicit cost comparison ($150–$350 Albany vs $1,000–$2,000+ NYC). NYLTA correctly documented as not applying to domestically-formed NY LLCs (Hochul veto Dec 2025). Pricing model bridges S01's $200–$500 positioning range with a $99/mo early adopter strategy, includes three full revenue scenarios with all assumptions explicit. Payment infrastructure covers Lemon Squeezy rationale (MoR eliminates tax registration), fee modeling, and Stripe migration triggers. GTM plan extends the existing launch playbook through three phases — qualitative channel impact only, refusing to fabricate conversion numbers for untested channels. Operations playbook is a monthly checklist with five scaling triggers tied to concrete thresholds.

**S03 — Synthesis + Scaffold (28m):** Wrote the executive summary as a standalone one-pager synthesizing all 8 source documents with exact figures, and a 12-slide pitch deck outline with speaker notes citing specific source filenames and data points. Scaffolded the private `domstepek/driftless-pro` repo with README explaining OSS relationship, proprietary LICENSE, .gitignore, and directory structure. Confirmed D077–D079 already in DECISIONS.md from S02 work. Ran full 9-check consistency audit: 10/10 docs exist, 10/10 have Mermaid, 10/10 contain canonical ICP, 10/10 contain phase timeline, feature labels present in relevant docs, protected file MD5s intact.

The three slices formed a clean dependency chain: S01 established the single source of truth, S02 consumed it for operational docs, S03 synthesized everything. Cross-document consistency — the primary M005 risk — was retired by using verbatim canonical phrases and verifying via grep at every slice boundary.

## Cross-Slice Verification

**Success Criterion: All 10 business documents exist at `~/Desktop/driftless/` with Mermaid diagrams**
✅ `ls ~/Desktop/driftless/0*.md` returns 10 files. `grep -c '```mermaid'` confirms every file has ≥1 Mermaid block (11 total across 10 files).

**Success Criterion: Documents are internally consistent — ICP, pricing, phasing, and timeline align across all 10 docs**
✅ Canonical ICP phrase grep returns 10 matches. Phase timeline (Q1–Q3 2026) grep returns 10 matches. Feature label (Knowledge Base + Agent Skill) grep returns 10 matches.

**Success Criterion: Vision document clearly articulates phased evolution**
✅ `00-vision-strategy.md` has three-phase narrative (OSS CLI → Pro platform → autonomous pipeline) with Mermaid gantt timeline, confirmed by S01 summary.

**Success Criterion: PRD covers features (a)–(d) with enough detail for M006 planning on (a) and (b)**
✅ PRD has 10 user stories with acceptance criteria for (a)/(b), directional specs with open questions for (c)/(d). Grep confirms 10 "User Story"/"As a" matches and 2 "Open Questions" sections.

**Success Criterion: Pricing model includes competitor benchmarks, three revenue scenarios, and justification**
✅ Competitor names appear 8 times in pricing doc. Conservative/Moderate/Aggressive scenarios appear 9 times. Per-scenario assumption tables with benchmark anchors confirmed by S02 summary.

**Success Criterion: LLC formation guide is actionable today — every step has a direct link, exact cost, and expected timeline, including NYLTA beneficial ownership filing**
✅ Albany RA mentioned 23 times (primary strategy). NYLTA/beneficial ownership mentioned 6 times (documented as domestic exemption per Hochul veto Dec 2025). Operating agreement mentioned 8 times (required within 90 days under LLCL §417). S02 summary confirms 8 steps with 18 URLs.

**Success Criterion: Private repo exists on GitHub under `domstepek` with README**
✅ S03 verified during execution: `{"name":"driftless-pro","visibility":"PRIVATE"}`. README, LICENSE, .gitignore, and `packages/pro-features/.gitkeep` pushed. (403 from unauthenticated context is expected for private repos.)

**Success Criterion: Executive summary is a shareable one-pager**
✅ `01-executive-summary.md` exists with narrative arc (problem → solution → why now → market → product → business model → next steps) and Mermaid timeline, confirmed by S03 summary.

**Success Criterion: Architecture decisions appended to DECISIONS.md**
✅ `grep -c 'D077\|D078\|D079'` returns 3. D077 (Lemon Squeezy), D078 (proprietary license), D079 (same GitHub user).

**Success Criterion: `pro-tier-features.md` and `m004-launch-playbook.md` preserved**
✅ MD5s match: `f93972b6985ec540a93df5fe3e120153` and `6dc7ac0fa7b45c5d3f37671655530441`.

**Definition of Done:**
✅ All 3 slices marked `[x]` in roadmap. All 3 slice summaries exist. All verification_result: passed. No unresolved blockers or follow-ups.

## Requirement Changes

No requirement status transitions during M005. R025 (Claude-first constraint) is the only active requirement and is unrelated to M005's scope. M005 introduces business planning capabilities outside the existing requirement contract (documented in D066).

## Forward Intelligence

### What the next milestone should know
- All 10 business docs share grep-verifiable canonical phrases — any new doc or edit must include the ICP phrase, phase timeline, and feature labels to maintain the consistency guarantee
- `driftless-pro` private repo is scaffolded but empty — M006+ adds actual Pro tier code there
- The canonical ICP is: "B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers, shipping frequently with an existing e2e test suite"
- Phase timeline: Phase 1 Q1–Q3 2026 (M001–M004), Phase 2 Q4 2026–Q2 2027 (M006–M008), Phase 3 Q3 2027+ (M009+)
- Feature labels: (a) Knowledge Base + Agent Skill, (b) AI-Generated Guided Walkthroughs, (c) Automated Product Demo/Tutorial Videos, (d) Signal-Driven Autonomous Development Pipeline
- Pricing evolution: $99/mo early adopter → $199–$299/mo standard. S01's $200–$500 is the competitive positioning range.
- Payment provider: Lemon Squeezy (MoR) now, Stripe migration at $10K MRR / 20% international
- Entity name used throughout: "Driftless AI LLC"
- PRD features (a)/(b) are detailed enough to begin M006 planning without additional research. Features (c)/(d) need research during M008/M009 planning.

### What's fragile
- Cross-document canonical phrase consistency — any edit to a business doc must preserve the exact ICP string (including the em-dash in "50–500"). Grep patterns are exact-match sensitive.
- Revenue projections anchor to SaaS benchmark ranges, not driftless-specific data — recalculate when real funnel exists
- NYLTA exemption depends on Dec 2025 veto — monitor future legislative sessions
- `driftless-pro` LICENSE is a placeholder "All Rights Reserved" — needs production EULA before Pro tier launch

### Authoritative diagnostics
- `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/*.md | wc -l` — must return 10; if less, cross-doc consistency is broken
- `md5 -q ~/Desktop/driftless/pro-tier-features.md` = f93972b6985ec540a93df5fe3e120153
- `md5 -q ~/Desktop/driftless/m004-launch-playbook.md` = 6dc7ac0fa7b45c5d3f37671655530441
- `grep -c 'D077\|D078\|D079' .gsd/DECISIONS.md` — must return 3

### What assumptions changed
- Assumed `gh repo create` would be needed for private repo — user pre-created it; S03 scaffolded and pushed instead
- Assumed D077–D079 would be appended in S03 — they were already present from S02 execution
- NYLTA beneficial ownership filing was assumed to apply — research revealed Hochul vetoed Dec 2025 and it doesn't apply to domestically-formed NY LLCs

## Files Created/Modified

- `~/Desktop/driftless/00-vision-strategy.md` — Vision strategy: three-phase narrative, Mermaid timeline, growth model, strategic risks
- `~/Desktop/driftless/01-executive-summary.md` — Standalone executive summary with narrative arc, Mermaid timeline, grounded figures
- `~/Desktop/driftless/02-business-structure.md` — NY LLC formation guide (8 steps, 18 URLs, Albany RA primary, NYLTA exemption, OA required)
- `~/Desktop/driftless/03-product-strategy.md` — Product strategy: canonical ICP, competitive landscape (8 competitors), market sizing, Mermaid quadrant chart
- `~/Desktop/driftless/04-product-requirements.md` — PRD: detailed (a)/(b) specs with 10 user stories, directional (c)/(d) specs, 2 Mermaid diagrams
- `~/Desktop/driftless/05-pricing-model.md` — Pricing model with competitor benchmarks, 3 revenue scenarios, LS fee modeling
- `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy setup, fee breakdown, webhook lifecycle, Stripe migration path
- `~/Desktop/driftless/07-gtm-plan.md` — Three-phase GTM plan with channel strategy, funnel benchmarks, Mermaid diagram
- `~/Desktop/driftless/08-operations-playbook.md` — Monthly ops checklist with LLC/financial/product checklists, five scaling triggers
- `~/Desktop/driftless/09-pitch-deck-outline.md` — 12-slide pitch deck outline with speaker notes citing source docs
- `domstepek/driftless-pro` — Private repo scaffolded (README, LICENSE, .gitignore, packages/pro-features/.gitkeep)
- `.gsd/DECISIONS.md` — D065–D079 appended across three slices
