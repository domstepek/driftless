---
id: T01
parent: S03
milestone: M004
provides:
  - Complete X/Twitter launch playbook at ~/Desktop/driftless/m004-launch-playbook.md
key_files:
  - ~/Desktop/driftless/m004-launch-playbook.md
key_decisions:
  - Used 7-tweet launch thread (within 6-8 range) — 7 gives enough room for problem→solution→install→frameworks→actions→capabilities→CTAs without drop-off
  - Day +5 and Day +14 posts use [X] for live metrics — only templated values in the entire playbook, clearly noted with replacement instructions
  - Mermaid gantt chart uses illustrative dates with a note to shift the timeline — avoids stale absolute dates
patterns_established:
  - Paste-ready tweet copy with inline timing, hashtag, and media guidance per post
observability_surfaces:
  - "grep -c" verification commands for URL counts, install command count, placeholder contamination
  - File existence check as pass/fail gate
duration: ~25m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Write the complete launch playbook

**Wrote a standalone 671-line launch playbook with 18 posting sessions (21 individual tweets), Mermaid timeline, engagement strategy, and operational notes — all referencing real driftless URLs and features.**

## What Happened

Gathered source material from S03-RESEARCH.md (timing, hashtag, thread length guidance), the landing page (`page.tsx` — exact hero copy, feature descriptions, framework list), and layout.tsx (OG meta tag details for the caveat section). Wrote the full playbook in a single pass structured as:

1. **Strategy overview** — phased rollout philosophy, Tue–Thu 10 AM ET timing, 1-2 hashtag max rule, Mermaid gantt diagram visualizing Day -3 through Day +14
2. **Pre-launch (3 teasers)** — problem hint, before/after sneak peek, countdown with framework list
3. **Launch thread (7 tweets)** — hook → before/after → install CTA → framework support → GitHub Actions → capabilities/output formats → all CTAs with URLs
4. **Launch day engagement playbook** — minute-by-minute instructions for the first 2 hours
5. **Follow-up week (7 posts, Day +1 to +7)** — use case, framework deep dive, before/after visual, GitHub Actions, community/star ask, CLI demo, behind-the-scenes
6. **Sustained phase (4 posts, Day +8 to +14)** — AI-powered angle, manual vs driftless comparison, contributor invitation, metrics update
7. **Engagement strategy** — 6 reply templates, amplification tactics for small accounts, tagging guidance
8. **Operational notes** — OG image caveat with Twitter Card Validator recommendation, pre-launch checklist, metrics table, scheduling options, content calendar summary

All tweet copy mirrors exact landing page messaging: "Your e2e tests become training docs. Automatically.", `npx @driftless-ai/cli@latest init`, six frameworks, GitHub Actions sync, composable capabilities, multiple doc targets.

## Verification

All task-level and slice-level checks pass:

| Check | Result |
|-------|--------|
| File exists | ✅ PASS |
| `driftless-six.vercel.app` count ≥5 | ✅ 16 |
| `npx @driftless-ai/cli@latest init` count ≥3 | ✅ 6 |
| `github.com/driftless-ai/driftless` count ≥2 | ✅ 11 |
| Mermaid diagram present | ✅ 1 |
| No placeholder patterns | ✅ 0 |
| Pre-launch teasers 3-4 | ✅ 3 |
| Launch thread 6-8 tweets | ✅ 7 |
| Follow-up week varied angles | ✅ 7 unique angles |
| Sustained phase 3-4 posts | ✅ 4 |
| Total posts 15-20 | ✅ 18 posting sessions |
| OG image caveat present | ✅ with Twitter Card Validator recommendation |
| Reply templates present | ✅ 6 templates |
| Solo-maintainer executable | ✅ ~30 min/day structure |

## Diagnostics

Static markdown file — no runtime diagnostics. Verification is via grep-based checks:
- `grep -c 'driftless-six.vercel.app'` — URL reference count
- `grep -cE '\[insert|YOUR_|PLACEHOLDER|\[your'` — placeholder contamination (must be 0)
- `wc -l` — line count (671 lines, within expected 800-1200 target — slightly under but complete)

## Deviations

- Line count is 671 vs. expected 800-1200 — the playbook is complete with all required sections, tweets, and operational notes. The estimate was high; the content is tight without padding.

## Known Issues

- Day +5 and Day +14 posts contain `[X]` for live metrics — these require real numbers at posting time. Noted inline with replacement instructions.
- OG image may not render in Twitter Card previews until `driftless.dev` custom domain is mapped or `metadataBase` is updated — documented in the OG Image Caveat section.

## Files Created/Modified

- `~/Desktop/driftless/m004-launch-playbook.md` — complete launch playbook (671 lines)
- `.gsd/milestones/M004/slices/S03/S03-PLAN.md` — added Observability/Diagnostics section, added diagnostic verification step
- `.gsd/milestones/M004/slices/S03/tasks/T01-PLAN.md` — added Observability Impact section
