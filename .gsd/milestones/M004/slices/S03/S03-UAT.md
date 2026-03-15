# S03: X/Twitter launch playbook — UAT

**Milestone:** M004
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: This slice produces a single static markdown file — no runtime code, no deployed service. All verification is file content inspection.

## Preconditions

- `~/Desktop/driftless/m004-launch-playbook.md` exists on disk
- A Mermaid-capable viewer is available (GitHub preview, VS Code Markdown Preview Enhanced, or mermaid.live) for diagram validation

## Smoke Test

Run `test -f ~/Desktop/driftless/m004-launch-playbook.md && echo "EXISTS" || echo "MISSING"` — should print `EXISTS`.

## Test Cases

### 1. File existence and basic structure

1. Run `test -f ~/Desktop/driftless/m004-launch-playbook.md`
2. Run `head -10 ~/Desktop/driftless/m004-launch-playbook.md`
3. **Expected:** File exists. First lines contain a title heading (`# driftless Launch Playbook` or similar) and a table of contents.

### 2. Real URL density — Vercel landing page

1. Run `grep -c 'driftless-six.vercel.app' ~/Desktop/driftless/m004-launch-playbook.md`
2. **Expected:** Count ≥ 5 (actual: 16). URLs appear across pre-launch, launch thread, follow-up, and operational sections.

### 3. Real URL density — install command

1. Run `grep -c 'npx @driftless-ai/cli@latest init' ~/Desktop/driftless/m004-launch-playbook.md`
2. **Expected:** Count ≥ 3 (actual: 6). The install command appears in the launch thread, follow-up posts, and quick reference.

### 4. Real URL density — GitHub repo

1. Run `grep -c 'github.com/driftless-ai/driftless' ~/Desktop/driftless/m004-launch-playbook.md`
2. **Expected:** Count ≥ 2 (actual: 11). GitHub links appear in launch thread CTA, follow-up posts, and contributor invitation.

### 5. Zero placeholder contamination

1. Run `grep -cE '\[insert|YOUR_|PLACEHOLDER|\[your' ~/Desktop/driftless/m004-launch-playbook.md`
2. **Expected:** 0. No generic placeholder patterns exist anywhere in the file.

### 6. Mermaid diagram renders

1. Run `grep -c 'mermaid' ~/Desktop/driftless/m004-launch-playbook.md` — should be ≥1.
2. Open the file in a Mermaid-capable viewer (VS Code, GitHub, mermaid.live).
3. **Expected:** A gantt chart renders showing Day -3 through Day +14 with labeled phases (Pre-Launch, Launch Day, Follow-Up Week, Sustained Phase).

### 7. Launch thread completeness (6-8 tweets)

1. Search for numbered tweets in the Launch Thread section (e.g., "Tweet 1", "Tweet 2", etc.).
2. **Expected:** 6-8 individually numbered tweets. Each tweet has copy text, is under 280 characters (or clearly structured as a longer-form post), and includes at least one real URL or install command.

### 8. Section completeness

1. Scan the table of contents or section headings.
2. **Expected:** All 7 required sections present:
   - Strategy Overview (with Mermaid timeline)
   - Pre-Launch Phase (Day -3 to Day -1): 3-4 teaser posts
   - Launch Day (Day 0): thread + engagement playbook
   - Follow-Up Week (Day +1 to Day +7): daily posts
   - Sustained Phase (Day +8 to Day +14): 3-4 posts
   - Engagement Strategy (reply templates + amplification)
   - Operational Notes (OG caveat, checklist, metrics)

### 9. Total post count in range

1. Count distinct posting sessions across all phases (pre-launch + launch thread as 1 session + follow-up week + sustained phase).
2. **Expected:** 15-20 total posting sessions. Angles should be varied — no two consecutive posts cover the same topic.

### 10. Paste-ready tweet quality

1. Pick any 3 tweets at random from different sections.
2. For each: copy the tweet text.
3. **Expected:** Each tweet is immediately postable — contains a complete thought, includes relevant URLs/commands where appropriate, has hashtag guidance, and doesn't reference any other tweet context needed to make sense standalone (except within the launch thread where sequential flow is expected).

### 11. OG image caveat documented

1. Search for "OG" or "Twitter Card" in the file.
2. **Expected:** A dedicated section or note explaining that OG images may not render correctly on Twitter until `driftless.dev` is mapped, with a recommendation to verify via Twitter Card Validator before posting.

### 12. Solo-maintainer feasibility

1. Read the engagement playbook for launch day and follow-up week time commitments.
2. **Expected:** Daily time commitment described as ~30 minutes or less. No instructions that require a team, paid tools, or simultaneous multi-platform posting.

## Edge Cases

### Metrics placeholder posts (Day +5, Day +14)

1. Search for `[X]` in the playbook.
2. **Expected:** Exactly 2 occurrences — Day +5 community post and Day +14 metrics update. Each has inline instructions explaining these must be replaced with real numbers at posting time. This is the only templated content in the entire file.

### Long tweet handling

1. Check if any individual tweet exceeds 280 characters.
2. **Expected:** If a post exceeds 280 chars, it's clearly labeled as a long-form post (X Premium) or split into a mini-thread with explicit numbering.

## Failure Signals

- `grep -cE '\[insert|YOUR_|PLACEHOLDER|\[your'` returns non-zero — placeholder contamination
- Any section heading from the required 7 is missing
- Fewer than 5 `driftless-six.vercel.app` references — tweets aren't linking to real URLs
- Mermaid block absent or malformed (no `gantt` keyword inside fenced block)
- Launch thread has fewer than 6 or more than 8 tweets
- File doesn't exist at `~/Desktop/driftless/m004-launch-playbook.md`

## Requirements Proved By This UAT

- R023 — X/Twitter product launch playbook exists with day-by-day strategy, pre-written copy, timing, and engagement approach
- R024 — Playbook structure informed by research: posting times, hashtag limits, thread length, SWE engagement patterns

## Not Proven By This UAT

- Actual engagement metrics from posting (that's operational, not UAT)
- OG image rendering on Twitter (requires live Twitter Card Validator check — documented as pre-launch step)
- Whether the Vercel URL will remain `driftless-six.vercel.app` at posting time (domain may change)

## Notes for Tester

- The `[X]` placeholders on Day +5 and Day +14 are intentional — they're for live metrics that don't exist yet. Don't flag these as failures.
- The OG image issue is documented and mitigated. It's a known limitation, not a bug.
- Read a few tweets aloud — they should sound natural, not like AI-generated marketing copy. Driftless-specific details (framework list, before/after concept, "tests become training docs") should feel concrete, not generic.
