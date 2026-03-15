---
estimated_steps: 5
estimated_files: 3
---

# T02: Create private repo, append architecture decisions, run cross-doc consistency audit

**Slice:** S03 — Synthesis + Scaffold — Exec Summary, Pitch Deck, Private Repo
**Milestone:** M005

## Description

Three mechanical tasks that close out the milestone. Append D077–D079 to DECISIONS.md — these are architecture decisions already made in S01/S02, just not yet formalized. Create `driftless-pro` private repo as an empty scaffold for Pro tier development. Run the full cross-document consistency audit across all 10 docs to retire the internal-consistency risk identified as the primary M005 risk.

## Steps

1. Append three decisions to `.gsd/DECISIONS.md`:
   - D077: Payment provider — Lemon Squeezy (MoR eliminates sales tax registration burden; Stripe migration path at $10K MRR / 20% international revenue)
   - D078: Pro tier license — Proprietary/All Rights Reserved (solo founder, no community contribution expectation on Pro tier, simpler than BSL 2.1, matches competitive landscape)
   - D079: Repo organization — Same GitHub user `domstepek` for both OSS and private repos (no separate org overhead at solo/two-person stage, can create org later)
2. Create private repo: `gh repo create domstepek/driftless-pro --private --description "Driftless Pro tier — proprietary extensions for @driftless-ai"`. Clone it, add README.md (explains relationship to `driftless` OSS repo, placeholder license notice, basic directory structure description), LICENSE (proprietary — copyright Driftless AI LLC, All Rights Reserved, no redistribution), .gitignore (Node template), and basic directory structure (`packages/`, `packages/pro-features/`). Commit and push.
3. Run full cross-document consistency audit across all 10 docs at `~/Desktop/driftless/`:
   - Canonical ICP phrase in all 10 docs
   - Phase timeline (Q1–Q3 2026) in all 10 docs
   - Feature labels (Knowledge Base + Agent Skill) in relevant docs (at minimum: product strategy, PRD, pricing, pitch deck)
   - Every doc has ≥1 Mermaid block
   - Protected file MD5s unchanged
4. If any audit check fails, fix the inconsistency and re-run
5. Verify private repo accessible via `gh repo view domstepek/driftless-pro`

## Must-Haves

- [ ] D077 (payment provider), D078 (Pro tier license), D079 (repo organization) appended to `.gsd/DECISIONS.md` — never modifying existing D001–D076 entries
- [ ] `domstepek/driftless-pro` exists as private repo on GitHub with README, proprietary LICENSE, .gitignore, and `packages/` directory
- [ ] README in private repo explains relationship to OSS `driftless` repo and notes license is placeholder pending production EULA
- [ ] LICENSE in private repo is proprietary (NOT MIT, NOT BSL) — copyright Driftless AI LLC, All Rights Reserved, no redistribution
- [ ] Cross-document consistency audit passes: canonical ICP in 10/10 docs, phase timeline in 10/10, Mermaid in 10/10, protected files intact

## Verification

- `grep -c 'D077\|D078\|D079' .gsd/DECISIONS.md` — returns 3
- `gh repo view domstepek/driftless-pro --json name,visibility` — shows `{"name":"driftless-pro","visibility":"PRIVATE"}`
- Full consistency audit script (see S03-PLAN.md verification section) — all checks pass
- `md5 -q ~/Desktop/driftless/pro-tier-features.md` = f93972b6985ec540a93df5fe3e120153
- `md5 -q ~/Desktop/driftless/m004-launch-playbook.md` = 6dc7ac0fa7b45c5d3f37671655530441

## Observability Impact

- **DECISIONS.md** — D077–D079 are append-only; future agents grep `D077\|D078\|D079` to verify presence. Existing D001–D076 must remain untouched (diff should show only additions).
- **driftless-pro repo** — `gh repo view domstepek/driftless-pro --json name,visibility` is the durable status surface. README contains relationship context for future agents landing in that repo.
- **Cross-document consistency** — The audit script in S03-PLAN.md verification section is the reusable diagnostic. Any future doc edit should re-run it. Failure output shows which specific file(s) are missing canonical strings — no silent failures.
- **Protected file integrity** — MD5 checksums for `pro-tier-features.md` and `m004-launch-playbook.md` detect accidental mutation of files outside this task's scope.

## Inputs

- `.gsd/DECISIONS.md` — existing D001–D076 entries; append D077–D079
- `~/Desktop/driftless/06-payment-infrastructure.md` — Lemon Squeezy rationale (source for D077)
- S03-RESEARCH.md — proprietary license rationale (source for D078), same-user repo rationale (source for D079)
- T01 outputs: `~/Desktop/driftless/01-executive-summary.md`, `~/Desktop/driftless/09-pitch-deck-outline.md` — needed for consistency audit
- All 8 existing docs at `~/Desktop/driftless/` — needed for consistency audit

## Expected Output

- `.gsd/DECISIONS.md` — D077–D079 appended (3 new rows in the table)
- `domstepek/driftless-pro` on GitHub — private repo with README.md, LICENSE, .gitignore, packages/ directory
- Consistency audit results — all 10 docs passing canonical string checks
