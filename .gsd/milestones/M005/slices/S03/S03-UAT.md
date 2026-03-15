# S03: Synthesis + Scaffold — Exec Summary, Pitch Deck, Private Repo — UAT

**Milestone:** M005
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All deliverables are static documents and a remote repo scaffold — no running services or live runtime to test

## Preconditions

- Access to `~/Desktop/driftless/` directory with all 10 business planning docs
- `gh` CLI installed with access to `domstepek/driftless-pro` (may require `GH_TOKEN` override from the OSS repo's git remote)
- `.gsd/DECISIONS.md` exists in the project root

## Smoke Test

```bash
ls ~/Desktop/driftless/01-executive-summary.md ~/Desktop/driftless/09-pitch-deck-outline.md && echo "PASS"
```

## Test Cases

### 1. Executive summary exists and has required structure

1. Open `~/Desktop/driftless/01-executive-summary.md`
2. Verify it contains a narrative arc with sections covering: problem, solution, why now, market, product, business model, next steps
3. Verify it contains at least one Mermaid diagram: `grep -c '```mermaid' ~/Desktop/driftless/01-executive-summary.md`
4. Verify it contains the canonical ICP phrase: `grep 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/01-executive-summary.md`
5. Verify it references exact figures from source docs (not rounded): $222K Year 1 ARR, $99/mo early adopter, DAP $1.9B
6. **Expected:** File exists, has narrative flow (not a table of contents), contains Mermaid block, canonical ICP, and grounded financial figures

### 2. Pitch deck outline exists with speaker notes and source citations

1. Open `~/Desktop/driftless/09-pitch-deck-outline.md`
2. Verify it has 10–12 slide sections
3. Verify each slide has speaker notes referencing specific source document filenames (e.g., `05-pricing-model.md`)
4. Verify it contains at least one Mermaid diagram: `grep -c '```mermaid' ~/Desktop/driftless/09-pitch-deck-outline.md`
5. Verify it contains the canonical ICP phrase
6. Verify data points are grounded (Pendo ~$47,000/year, WalkMe ~$79,000/year, $99/mo early adopter)
7. **Expected:** 12-slide outline with data-backed bullet points and speaker notes citing source filenames

### 3. All 10 M005 documents exist with Mermaid diagrams

1. Run: `ls ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md | wc -l`
2. Run: `for f in ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md; do count=$(grep -c '```mermaid' "$f"); echo "$(basename $f): $count"; done`
3. **Expected:** Count is ≥10, every file has ≥1 Mermaid block

### 4. Cross-document canonical ICP consistency

1. Run: `grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md | wc -l`
2. **Expected:** Returns 10 — every document contains the exact canonical ICP phrase

### 5. Cross-document phase timeline consistency

1. Run: `grep -l 'Q1–Q3 2026' ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md | wc -l`
2. **Expected:** Returns 10 — every document references the canonical phase timeline

### 6. Private repo exists and is correctly structured

1. Run: `GH_TOKEN=<pat> gh repo view domstepek/driftless-pro --json name,visibility`
2. Verify README.md explains the relationship to the OSS `driftless` repo
3. Verify LICENSE is proprietary (All Rights Reserved), not MIT
4. Verify .gitignore exists
5. **Expected:** Repo is PRIVATE, README describes OSS/Pro split, LICENSE is proprietary

### 7. Architecture decisions D077–D079 in DECISIONS.md

1. Run: `grep 'D077' .gsd/DECISIONS.md` — should show Lemon Squeezy as payment provider (MoR)
2. Run: `grep 'D078' .gsd/DECISIONS.md` — should show proprietary license for Pro tier
3. Run: `grep 'D079' .gsd/DECISIONS.md` — should show same GitHub user (`domstepek`) for repo organization
4. **Expected:** All three decisions present with correct content

### 8. Protected files unchanged

1. Run: `md5 -q ~/Desktop/driftless/pro-tier-features.md`
2. Run: `md5 -q ~/Desktop/driftless/m004-launch-playbook.md`
3. **Expected:** MD5s match f93972b6985ec540a93df5fe3e120153 and 6dc7ac0fa7b45c5d3f37671655530441 respectively

## Edge Cases

### Canonical phrase exact-match sensitivity

1. Run: `grep 'B2B SaaS companies with a product-led growth motion, 50.500 employees' ~/Desktop/driftless/01-executive-summary.md`
2. **Expected:** Fails — the phrase uses an em-dash (–) not a period. Confirms grep is matching the exact canonical string, not a loose approximation.

### gh CLI auth for private repo

1. Run without GH_TOKEN override: `gh repo view domstepek/driftless-pro --json name,visibility`
2. **Expected:** May fail with "Could not resolve to a Repository" if the user's default `gh` keyring token lacks scope. This is a known limitation — the PAT from the OSS repo's git remote is required.

## Failure Signals

- Any of the 10 docs missing from `~/Desktop/driftless/`
- Canonical ICP grep returning < 10 matches
- Phase timeline grep returning < 10 matches
- Any doc missing its Mermaid block
- Protected file MD5 mismatch (accidental mutation)
- D077/D078/D079 missing from DECISIONS.md
- Private repo not found or not PRIVATE

## Requirements Proved By This UAT

- None — M005 is outside the active requirements contract (see M005-ROADMAP.md Requirement Coverage section)

## Not Proven By This UAT

- Live usability of the executive summary as a shareable document (requires human judgment on readability and persuasiveness)
- Pitch deck outline's effectiveness as a presentation tool (requires actual deck creation and delivery)
- Private repo's suitability for Pro tier development (requires M006+ actual code)

## Notes for Tester

- The `gh` CLI check for the private repo requires the PAT from the OSS repo's git remote URL. If `gh repo view` fails, extract the token: `git remote get-url origin | grep -o 'github_pat_[^@]*'` and use as `GH_TOKEN`.
- The em-dash (–) in "50–500" is a Unicode character, not a regular dash. Copy-paste from the doc rather than typing it to ensure grep matches.
- Revenue figures ($222K, $99/mo, etc.) should match exactly across exec summary, pitch deck, and pricing model — spot-check a few to confirm no rounding occurred.
