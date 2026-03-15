# S03: Synthesis + Scaffold — Exec Summary, Pitch Deck, Private Repo

**Goal:** Executive summary and pitch deck outline synthesize all 8 prior docs, private repo exists on GitHub, architecture decisions formalized, all 10 documents cross-reference consistently.
**Demo:** `ls ~/Desktop/driftless/01-executive-summary.md ~/Desktop/driftless/09-pitch-deck-outline.md` shows both files; `gh repo view domstepek/driftless-pro` confirms private repo; `grep 'B2B SaaS companies with a product-led growth motion' ~/Desktop/driftless/*.md | wc -l` returns 10 (all docs contain canonical ICP).

## Must-Haves

- Executive summary at `~/Desktop/driftless/01-executive-summary.md` — shareable one-pager with narrative arc (not a table of contents), ≥1 Mermaid diagram, canonical ICP/timeline/feature labels
- Pitch deck outline at `~/Desktop/driftless/09-pitch-deck-outline.md` — 10–12 slide structure with speaker notes referencing specific source docs and data points, ≥1 Mermaid diagram
- Private repo `domstepek/driftless-pro` on GitHub with README (explaining OSS repo relationship), proprietary LICENSE, .gitignore, basic directory structure
- D077–D079 appended to `.gsd/DECISIONS.md` (payment provider: Lemon Squeezy, Pro tier license: proprietary, repo organization: same GitHub user)
- Cross-document consistency audit passing across all 10 docs: canonical ICP phrase, phase timeline, feature labels
- Protected files unchanged: `pro-tier-features.md` (MD5: f93972b6985ec540a93df5fe3e120153), `m004-launch-playbook.md` (MD5: 6dc7ac0fa7b45c5d3f37671655530441)

## Verification

```bash
# 1. Both synthesis docs exist
ls ~/Desktop/driftless/01-executive-summary.md ~/Desktop/driftless/09-pitch-deck-outline.md

# 2. All 10 M005 docs exist (00, 01, 02, 03, 04, 05, 06, 07, 08, 09)
test $(ls ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md 2>/dev/null | wc -l) -ge 10

# 3. Every doc has ≥1 Mermaid block
for f in ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md; do
  count=$(grep -c '```mermaid' "$f")
  echo "$f: $count mermaid blocks"
  [ "$count" -ge 1 ] || echo "FAIL: $f has no mermaid"
done

# 4. Canonical ICP in all 10 docs
grep -l 'B2B SaaS companies with a product-led growth motion, 50–500 employees, 10–50 engineers' ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md | wc -l
# expect: 10

# 5. Phase timeline consistency
grep -l 'Q1–Q3 2026' ~/Desktop/driftless/0{0,1,2,3,4,5,6,7,8}*.md ~/Desktop/driftless/09*.md | wc -l
# expect: 10

# 6. Private repo exists
gh repo view domstepek/driftless-pro --json name,visibility

# 7. DECISIONS.md has D077-D079
grep -c 'D077\|D078\|D079' .gsd/DECISIONS.md
# expect: 3

# 8. Protected files unchanged
md5 -q ~/Desktop/driftless/pro-tier-features.md | grep f93972b6985ec540a93df5fe3e120153
md5 -q ~/Desktop/driftless/m004-launch-playbook.md | grep 6dc7ac0fa7b45c5d3f37671655530441

# 9. Diagnostic/failure-path check: verify consistency audit reports failures clearly
# (intentionally grep for a string that should NOT appear to confirm grep returns non-zero)
! grep -q 'NONEXISTENT_CANARY_STRING' ~/Desktop/driftless/01-executive-summary.md && echo "PASS: grep correctly reports missing strings"
```

## Observability / Diagnostics

- **Consistency audit script:** Slice verification bash block serves as the primary diagnostic surface — run it after each task to see incremental pass/fail state across all 10 docs
- **Mermaid block count:** `grep -c '```mermaid' ~/Desktop/driftless/*.md` surfaces any doc missing its required diagram
- **Protected file integrity:** MD5 checks on `pro-tier-features.md` and `m004-launch-playbook.md` catch accidental mutation
- **Failure visibility:** If cross-doc consistency audit finds a mismatch, grep output shows which file(s) are missing the canonical string — no silent failures
- **Redaction:** No secrets or credentials in any business planning doc. All financial figures are projections, not actuals.

## Tasks

- [x] **T01: Write executive summary and pitch deck outline** `est:30m`
  - Why: These are the two synthesis documents that distill all 8 prior docs into shareable artifacts — the exec summary as a standalone one-pager for collaborators/advisors, the pitch deck outline as a slide-by-slide structure with grounded data
  - Files: `~/Desktop/driftless/01-executive-summary.md`, `~/Desktop/driftless/09-pitch-deck-outline.md`
  - Do: Read all 8 existing docs to extract key figures and narrative threads. Write exec summary with narrative arc (problem → solution → why now → market → product → business model → next steps), citing exact figures from source docs (moderate revenue scenario $222K Year 1, $99/mo early adopter pricing, DAP market $1.9B). Write pitch deck outline in standard startup deck structure (10–12 slides) with speaker notes pointing to specific doc sections. Both must include canonical ICP phrase verbatim, phase timeline, feature labels, and ≥1 Mermaid diagram each. Do not paraphrase or round numbers — use exact figures from source docs.
  - Verify: Both files exist, each has ≥1 Mermaid block, canonical ICP appears in both, phase timeline appears in both
  - Done when: Both documents at `~/Desktop/driftless/` with Mermaid diagrams, canonical strings, and grounded data points from all 8 source docs

- [x] **T02: Create private repo, append architecture decisions, run cross-doc consistency audit** `est:15m`
  - Why: Formalizes three architecture decisions already made in S01/S02, creates the private repo scaffold for Pro tier development, and runs the final consistency audit across all 10 docs to retire the internal-consistency risk
  - Files: `.gsd/DECISIONS.md`, remote `domstepek/driftless-pro`
  - Do: Append D077 (payment provider: Lemon Squeezy — MoR eliminates tax registration), D078 (Pro tier license: proprietary — solo founder, no community contribution expectation, simpler than BSL), D079 (repo organization: same GitHub user `domstepek` — no separate org overhead at solo/two-person stage). Create `driftless-pro` private repo via `gh repo create` with README explaining relationship to OSS repo, proprietary LICENSE (All Rights Reserved, no redistribution), .gitignore (Node), and basic directory structure mirroring OSS monorepo patterns. Run full cross-document consistency audit: canonical ICP in all 10 docs, phase timeline in all 10, feature labels in pricing/GTM/PRD, competitor mentions grounded, protected file MD5s unchanged.
  - Verify: `gh repo view domstepek/driftless-pro`, `grep D077 .gsd/DECISIONS.md`, full consistency audit script passes
  - Done when: Private repo visible on GitHub, D077–D079 in DECISIONS.md, consistency audit passes across all 10 docs with zero failures

## Files Likely Touched

- `~/Desktop/driftless/01-executive-summary.md`
- `~/Desktop/driftless/09-pitch-deck-outline.md`
- `.gsd/DECISIONS.md`
- Remote: `domstepek/driftless-pro` (README.md, LICENSE, .gitignore, directory structure)
