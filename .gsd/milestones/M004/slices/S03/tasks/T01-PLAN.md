---
estimated_steps: 4
estimated_files: 1
---

# T01: Write the complete launch playbook

**Slice:** S03 — X/Twitter launch playbook
**Milestone:** M004

## Description

Write `~/Desktop/driftless/m004-launch-playbook.md` — a standalone, research-informed, day-by-day X/Twitter launch strategy with 15-20 pre-written tweets. Every tweet references actual driftless URLs, the real install command, and real feature descriptions pulled from the landing page. The playbook is structured for a solo maintainer to execute in ~30 min/day over 3 weeks.

## Steps

1. **Write strategy overview** — Open with the launch philosophy (phased rollout > big-bang), key timing guidance (Tue–Thu 9am–12pm ET), hashtag strategy (1-2 per post, `#opensource` primary), and a Mermaid `gantt` diagram visualizing the Day -3 → Day +14 timeline with labeled phases.

2. **Write all tweet copy by phase** — Pre-launch (Day -3 to -1): 3-4 teasers building curiosity without revealing the full product. Launch day (Day 0): 6-8 tweet thread covering problem → solution → before/after → features → install CTA → star CTA, plus a dedicated engagement playbook for the first 2 hours. Follow-up week (Day +1 to +7): daily standalone posts rotating angles (use cases, framework support, before/after visual, GitHub Action, community/star ask, behind-the-scenes). Sustained phase (Day +8 to +14): 3-4 posts on deeper topics (Claude-powered, comparing to manual docs, contributor invitation, metrics update). Mirror the landing page messaging exactly: "Your e2e tests become training docs", `npx @driftless-ai/cli@latest init`, six frameworks, GitHub Actions sync.

3. **Write engagement strategy and operational notes** — Reply templates for common responses (questions, feature requests, comparisons). Amplification tactics for small accounts (tag framework maintainers, engage in relevant threads, cross-post note). OG image caveat (driftless.dev not mapped — verify with Twitter Card Validator, use Vercel URL). Pre-launch checklist. Metrics to track (impressions, profile visits, GitHub stars, npm installs).

4. **Verify completeness and accuracy** — Check all URLs resolve. Confirm no placeholder patterns. Count total tweets (target 15-20). Confirm Mermaid diagram syntax. Ensure angles are varied across the follow-up week (no two consecutive posts about the same topic).

## Must-Haves

- [ ] File at `~/Desktop/driftless/m004-launch-playbook.md`
- [ ] Mermaid timeline diagram covering all phases
- [ ] 3-4 pre-launch teaser tweets (Day -3 to -1)
- [ ] 6-8 tweet launch thread (Day 0)
- [ ] 7 follow-up week posts (Day +1 to +7), varied angles
- [ ] 3-4 sustained phase posts (Day +8 to +14)
- [ ] Engagement strategy with reply templates
- [ ] All URLs real: `https://driftless-six.vercel.app`, `https://driftless-six.vercel.app/docs`, `https://github.com/driftless-ai/driftless`, `https://www.npmjs.com/package/@driftless-ai/cli`
- [ ] Install command: `npx @driftless-ai/cli@latest init` (not `npx driftless init`)
- [ ] Zero placeholder patterns (`[insert`, `YOUR_`, `[your`, etc.)
- [ ] OG image caveat with Twitter Card Validator recommendation
- [ ] Solo-maintainer executable (~30 min/day)
- [ ] Timing tied to research: Tue–Thu 9am–12pm ET launch window
- [ ] 1-2 hashtags per tweet max

## Verification

- `test -f ~/Desktop/driftless/m004-launch-playbook.md` → exit 0
- `grep -c 'driftless-six.vercel.app' ~/Desktop/driftless/m004-launch-playbook.md` → ≥5
- `grep -c 'npx @driftless-ai/cli@latest init' ~/Desktop/driftless/m004-launch-playbook.md` → ≥3
- `grep -c 'github.com/driftless-ai/driftless' ~/Desktop/driftless/m004-launch-playbook.md` → ≥2
- `grep -c 'mermaid' ~/Desktop/driftless/m004-launch-playbook.md` → ≥1
- `grep -cE '\[insert|YOUR_|PLACEHOLDER|\[your' ~/Desktop/driftless/m004-launch-playbook.md` → 0

## Inputs

- `.gsd/milestones/M004/slices/S03/S03-RESEARCH.md` — research findings on timing, hashtags, thread length, phased rollout, engagement tactics
- `apps/web/app/(home)/page.tsx` — exact hero copy, feature descriptions, and framework list to mirror in tweets
- `apps/web/app/layout.tsx` — OG/Twitter Card meta tag details for the caveat section
- S01 summary — live URL (`driftless-six.vercel.app`), OG image status, deployment details

## Observability Impact

- **No runtime signals** — this is a static markdown file, not code. No logs, metrics, or status endpoints.
- **Inspectability:** A future agent verifies this task via `grep -c` checks (URL counts, install command count, placeholder patterns) and file existence. These are the diagnostic signals.
- **Failure visibility:** If the file is incomplete, `grep` counts fall below thresholds and the placeholder check returns non-zero. No silent failure mode — all checks are deterministic.

## Expected Output

- `~/Desktop/driftless/m004-launch-playbook.md` — complete launch playbook, ~800-1200 lines of markdown, paste-ready tweet copy, Mermaid diagram, engagement strategy, operational notes
