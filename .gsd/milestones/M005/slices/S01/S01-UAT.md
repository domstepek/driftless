# S01: Strategic Foundation — Vision, Product Strategy, PRD — UAT

**Milestone:** M005
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 produces static markdown documents — no running services, no runtime behavior. Verification is file existence, content structure, cross-document consistency, and data grounding. All checkable via filesystem inspection.

## Preconditions

- Three documents exist at `~/Desktop/driftless/`:
  - `00-vision-strategy.md`
  - `03-product-strategy.md`
  - `04-product-requirements.md`
- Pre-existing files also present (not overwritten):
  - `pro-tier-features.md`
  - `m004-launch-playbook.md`

## Smoke Test

Run `ls ~/Desktop/driftless/00-vision-strategy.md ~/Desktop/driftless/03-product-strategy.md ~/Desktop/driftless/04-product-requirements.md` — all three files listed without error.

## Test Cases

### 1. Vision document contains three-phase evolution narrative

1. Open `~/Desktop/driftless/00-vision-strategy.md`
2. Scan for three section headings: Phase 1 (OSS Foundation), Phase 2 (Pro Platform), Phase 3 (Autonomous Pipeline)
3. Verify each phase section includes: milestone range, quarter targets, and key deliverables
4. **Expected:** Three phases clearly articulated with Phase 1 = Q1–Q3 2026 / M001–M004, Phase 2 = Q4 2026–Q2 2027 / M006–M008, Phase 3 = Q3 2027+ / M009+

### 2. Vision document includes Mermaid timeline diagram

1. Run `grep -c '```mermaid' ~/Desktop/driftless/00-vision-strategy.md`
2. **Expected:** Count ≥ 1
3. Open the file and confirm the Mermaid block is a gantt or timeline chart showing the three phases with milestone labels

### 3. Product strategy defines canonical ICP

1. Open `~/Desktop/driftless/03-product-strategy.md`
2. Search for "Ideal Customer Profile" or "ICP"
3. **Expected:** Contains the phrase "B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers, shipping frequently with an existing e2e test suite" — this exact string, not a paraphrase

### 4. Product strategy contains grounded competitive landscape

1. Open `~/Desktop/driftless/03-product-strategy.md`
2. Locate the competitive landscape table
3. Verify at least 5 competitors listed: Pendo, WalkMe, Whatfix, Appcues, Userpilot
4. For each competitor, check that pricing includes specific dollar amounts (not "contact sales" or "varies")
5. For custom-pricing competitors (Pendo, WalkMe, Whatfix), verify the source is cited (e.g., "Vendr", "Spendflo", "G2")
6. **Expected:** Table has ≥5 rows with specific dollar figures and sourcing notes. Run `grep -c 'Pendo\|WalkMe\|Whatfix\|Appcues\|Userpilot' ~/Desktop/driftless/03-product-strategy.md` — count ≥ 5

### 5. Product strategy includes market sizing with analyst citations

1. In `03-product-strategy.md`, locate market sizing section
2. Verify DAP market size figure is present with a specific dollar amount (e.g., "$1.9B" or "$2.5B")
3. Verify an analyst or research firm is cited as the source
4. **Expected:** At least one market size figure with named source (not "industry estimates" or "analysts say")

### 6. Product strategy includes Mermaid diagram

1. Run `grep -c '```mermaid' ~/Desktop/driftless/03-product-strategy.md`
2. **Expected:** Count ≥ 1

### 7. PRD has detailed specs for feature (a) Knowledge Base + Agent Skill

1. Open `~/Desktop/driftless/04-product-requirements.md`
2. Locate feature (a) section
3. Verify presence of: user stories (at least 3 "As a…" statements), acceptance criteria for each story, technical approach section describing ingestion pipeline and query pipeline
4. **Expected:** Feature (a) has ≥3 user stories, each with acceptance criteria, plus a technical approach section

### 8. PRD has detailed specs for feature (b) Guided Walkthroughs

1. In `04-product-requirements.md`, locate feature (b) section
2. Verify presence of: user stories (at least 3), acceptance criteria for each, technical approach covering SDK architecture and element targeting
3. **Expected:** Feature (b) has ≥3 user stories, each with acceptance criteria, plus a technical approach section

### 9. PRD has directional specs for features (c) and (d)

1. In `04-product-requirements.md`, locate features (c) and (d) sections
2. For each, verify: high-level description, target user, key differentiator, and open questions
3. Verify they do NOT have full user stories or acceptance criteria (they should be directional, not detailed)
4. **Expected:** Each has description + target user + differentiator + open questions. Neither has acceptance criteria tables.

### 10. PRD includes Mermaid diagrams

1. Run `grep -c '```mermaid' ~/Desktop/driftless/04-product-requirements.md`
2. **Expected:** Count ≥ 1 (actual: 2 — architecture flowchart and positioning chart)

### 11. Cross-document ICP consistency

1. Run `grep 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/00-vision-strategy.md ~/Desktop/driftless/03-product-strategy.md ~/Desktop/driftless/04-product-requirements.md`
2. **Expected:** At least one match in each of the three files

### 12. Cross-document phase and timeline consistency

1. In all three documents, check that the phase structure uses identical names: "Phase 1: OSS Foundation", "Phase 2: Pro Platform", "Phase 3: Autonomous Pipeline"
2. Check quarter targets: Phase 1 = Q1–Q3 2026, Phase 2 = Q4 2026–Q2 2027, Phase 3 = Q3 2027+
3. **Expected:** No document contradicts another on phase names or timing

### 13. Cross-document feature naming consistency

1. Verify the four feature labels are identical in product strategy and PRD:
   - (a) Knowledge Base + Agent Skill
   - (b) AI-Generated Guided Walkthroughs
   - (c) Automated Product Demo/Tutorial Videos
   - (d) Signal-Driven Autonomous Development Pipeline
2. **Expected:** Labels match exactly — no paraphrasing, no different word order

### 14. Pre-existing files preserved

1. Run `md5 ~/Desktop/driftless/pro-tier-features.md` — expected: f93972b6985ec540a93df5fe3e120153
2. Run `md5 ~/Desktop/driftless/m004-launch-playbook.md` — expected: 6dc7ac0fa7b45c5d3f37671655530441
3. **Expected:** Both checksums match — files were not modified

## Edge Cases

### Competitive pricing gap transparency

1. In `03-product-strategy.md`, check if any competitor row says "custom pricing" or similar
2. If so, verify the table still includes a specific dollar figure (median, average, or range) with a cited source
3. **Expected:** No blank or "N/A" pricing cells. Custom-pricing competitors show sourced estimates (e.g., "~$47K/yr median, Vendr")

### Feature label drift across documents

1. Run `grep -o 'Knowledge Base.*Skill\|Guided Walkthrough\|Auto.*Video\|Autonomous.*Pipeline' ~/Desktop/driftless/00-vision-strategy.md ~/Desktop/driftless/03-product-strategy.md ~/Desktop/driftless/04-product-requirements.md | sort -u`
2. **Expected:** Each feature label appears in a consistent form — no variant spellings (e.g., "Guided Walkthroughs" vs "Interactive Walkthroughs")

## Failure Signals

- Any of the three documents missing from `~/Desktop/driftless/`
- Mermaid block count = 0 for any document
- ICP phrase grep returning no match for any document
- Competitor pricing table with blank cells, "N/A", or fabricated round numbers without sources
- Phase names or quarter targets differing between documents
- Feature labels (a)–(d) using different wording between product strategy and PRD
- PRD features (a)/(b) missing user stories or acceptance criteria
- `pro-tier-features.md` or `m004-launch-playbook.md` MD5 mismatch (accidental modification)

## Requirements Proved By This UAT

- No active requirements in REQUIREMENTS.md are directly relevant to M005 (M005 introduces new capability areas outside the existing requirement contract)

## Not Proven By This UAT

- Mermaid diagram rendering correctness — verified syntax presence only, not visual rendering
- Absolute accuracy of competitor pricing figures — sourced from third-party aggregators, not official vendor confirmations
- Whether PRD detail level for features (a)/(b) is truly sufficient for M006 planning — this is a judgment call during M006 kickoff

## Notes for Tester

- The canonical ICP is a specific string. If you find a paraphrase instead of the exact string, that's a consistency failure — all downstream M005 docs depend on verbatim reuse.
- Competitive pricing data is from procurement aggregators (Vendr, Spendflo, G2), not official vendor pricing pages. Pendo, WalkMe, and Whatfix don't publish public prices. The figures are market medians/averages, not quotes.
- Features (c) and (d) are intentionally less detailed than (a) and (b). This is by design — premature specificity for M008/M009 features would constrain planning.
