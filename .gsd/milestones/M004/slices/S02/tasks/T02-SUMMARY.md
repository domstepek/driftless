---
id: T02
parent: S02
milestone: M004
provides:
  - GitHub Actions setup guide documenting both workflows and all 5 operational edge handlers
  - Troubleshooting page with real error messages from config.ts, agent.ts, transaction.ts, logger.ts, auto-update.ts
  - Sidebar ordering via meta.json for all 5 docs pages
key_files:
  - apps/web/content/docs/github-actions.mdx
  - apps/web/content/docs/troubleshooting.mdx
  - apps/web/content/docs/meta.json
key_decisions:
  - Showed workflow YAML structure as annotated/abbreviated blocks rather than raw generated output — real output includes long prompts that would overwhelm the docs
patterns_established:
  - Error documentation pattern: exact error message in code block, source explanation, fix steps
observability_surfaces:
  - none — static documentation pages
duration: ~10min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Write GitHub Actions and troubleshooting, wire sidebar ordering

**Wrote GitHub Actions guide, troubleshooting reference with source-derived error messages, and wired sidebar ordering for all 5 docs pages.**

## What Happened

Wrote three files to complete the S02 documentation slice:

1. **GitHub Actions page** — documents both workflows (doc-update and test-gen), explains all 5 operational edge handlers from `workflows.ts` (bot loop prevention, fork PR detection, API key check, PR branch checkout, full history fetch), includes prominent ANTHROPIC_API_KEY callout, and shows annotated workflow structure. Cross-links to configuration and troubleshooting.

2. **Troubleshooting page** — covers 7 real error scenarios with exact error messages from source code: config not found (`config.ts` readConfig), invalid JSON (`config.ts`), Claude Code CLI not found (`agent.ts` spawn error), agent timeout (120s default from `agent.ts`), debug log format (`.driftless/debug.log` JSON array from `logger.ts`), rollback behavior (`transaction.ts` FileTransaction), and auto-update issues (`auto-update.ts` — permission errors, npx notification, major version warnings, CI skip).

3. **meta.json** — orders all 5 pages in the sidebar: Quick Start → Init Walkthrough → GitHub Actions → Configuration → Troubleshooting.

## Verification

- `cd apps/web && pnpm next build` exits 0 — all 5 docs routes appear in route table (configuration, github-actions, docs index, init-walkthrough, troubleshooting)
- `pnpm run test` — 268 tests pass across 14 test files
- `pnpm run check` — 0 lint/format errors (ran `vp fmt` to auto-fix formatting)
- Content spot-checks: `grep -c 'ANTHROPIC_API_KEY' github-actions.mdx` → 5 occurrences, `grep -c 'Config file not found' troubleshooting.mdx` → 2 occurrences
- Cross-link integrity: all `/docs/` links verified — init-walkthrough, configuration, troubleshooting references are consistent with T01 pages

### Slice-level verification status

- ✅ `next build` exits 0 — all MDX pages compile
- ✅ `pnpm run test` — 268 tests pass
- ✅ Build output shows routes for all 5 docs pages
- ✅ `meta.json` orders sidebar correctly
- ⬜ Visual sidebar verification (requires running dev server in browser — deferred to slice-level check)
- ✅ Content accuracy: workflow structure matches `workflows.ts`, error messages match source files

## Diagnostics

Static documentation pages — no runtime diagnostics. Build verification via `next build` catches MDX syntax errors. Content drift detectable by grepping source error messages against troubleshooting page (e.g., `grep 'Config file not found' packages/core/src/config.ts apps/web/content/docs/troubleshooting.mdx`).

## Deviations

Pre-existing MDX files had formatting issues flagged by `vp check`. Ran `vp fmt` to fix all files (including T01's pages) — this is a formatting-only change, no content modifications.

## Known Issues

None.

## Files Created/Modified

- `apps/web/content/docs/github-actions.mdx` — GitHub Actions setup guide with both workflow docs and edge handler explanations
- `apps/web/content/docs/troubleshooting.mdx` — Troubleshooting reference with 7 error scenarios from source code
- `apps/web/content/docs/meta.json` — Sidebar ordering for all 5 docs pages
- `.gsd/milestones/M004/slices/S02/tasks/T02-PLAN.md` — Added Observability Impact section (pre-flight fix)
