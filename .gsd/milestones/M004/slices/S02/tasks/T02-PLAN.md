---
estimated_steps: 5
estimated_files: 4
---

# T02: Write GitHub Actions and troubleshooting, wire sidebar ordering

**Slice:** S02 — Documentation content
**Milestone:** M004

## Description

Write the two "operating and debugging" docs pages, add sidebar ordering via `meta.json`, and run final verification. The GitHub Actions page documents both workflow templates with their operational edge handlers — this is the page users consult when setting up CI. The troubleshooting page covers real error messages from the codebase so users can self-diagnose without filing issues.

## Steps

1. **Write GitHub Actions page** (`content/docs/github-actions.mdx`): Document both workflows — doc-update and test-gen. Explain the ANTHROPIC_API_KEY secret requirement prominently with a `<Callout type="warn">`. Describe each operational edge handler from `workflows.ts`: bot loop prevention (`!endsWith(github.actor, '[bot]')`), fork PR detection (fork PRs can't access secrets), API key check (graceful skip with warning annotation), PR branch checkout (not merge commit, so commits can be pushed back), full history fetch (`fetch-depth: 0`). Show the overall workflow structure as annotated YAML but note that `driftless init` generates these automatically — users don't write them by hand. Explain what each workflow does when triggered. Link to `/docs/configuration` for capability selection and `/docs/troubleshooting` for CI debugging.

2. **Write troubleshooting page** (`content/docs/troubleshooting.mdx`): Document real error scenarios from the codebase. "Config file not found" — from `config.ts` `readConfig`, means `.driftless.json` is missing (run `driftless init`). "Invalid JSON in config file" — from `config.ts`, means corrupted config (delete and re-run init). Claude Code CLI not found — `spawnAgent` gets spawn error, explain `claude` must be in PATH, link to Claude Code install. Agent timeout — default 120s from `agent.ts`, explain when this happens (large test files, slow API). Debug log — explain `.driftless/debug.log` is JSON array from `logger.ts`, how to read it for issue reporting. Rollback behavior — from `transaction.ts`, explain that failed init cleans up automatically. Auto-update issues — from `auto-update.ts`, permission errors on global install, npx notification behavior.

3. **Write `meta.json`** (`content/docs/meta.json`): Create with `pages` array ordering the sidebar: `["index", "init-walkthrough", "github-actions", "configuration", "troubleshooting"]`.

4. **Verify build**: Run `cd apps/web && pnpm next build` — all 5 docs pages must appear in the route table.

5. **Verify monorepo**: Run `pnpm run test` at root — 268+ tests must pass. Run `pnpm run check` — no lint/format errors in new files.

## Must-Haves

- [ ] GitHub Actions page documents both workflows (doc-update and test-gen)
- [ ] GitHub Actions page has prominent ANTHROPIC_API_KEY callout
- [ ] GitHub Actions page explains all 5 operational edge handlers
- [ ] Troubleshooting page covers "Config file not found" and "Invalid JSON" errors
- [ ] Troubleshooting page covers Claude Code CLI not found scenario
- [ ] Troubleshooting page explains debug log location and format
- [ ] `meta.json` orders all 5 pages in the sidebar correctly
- [ ] `next build` exits 0 with all 5 docs routes
- [ ] `pnpm run test` passes 268+ tests

## Verification

- `cd apps/web && pnpm next build` exits 0, route table shows all 5 docs pages
- `pnpm run test` at monorepo root — 268+ tests pass
- Sidebar order matches: Quick Start → Init Walkthrough → GitHub Actions → Configuration → Troubleshooting
- Content spot-checks: grep for `ANTHROPIC_API_KEY` in github-actions page, grep for "Config file not found" in troubleshooting page

## Observability Impact

- **Static documentation pages** — no runtime signals change. These are build-time MDX files.
- **Build verification**: `cd apps/web && pnpm next build` — route table in output confirms pages compile. MDX syntax errors surface as build failures with file paths.
- **Sidebar ordering**: `cat apps/web/content/docs/meta.json` confirms page order. Fumadocs uses this file to render navigation.
- **Content accuracy**: `grep -c 'ANTHROPIC_API_KEY' apps/web/content/docs/github-actions.mdx` and `grep -c 'Config file not found' apps/web/content/docs/troubleshooting.mdx` verify source-derived content is present.
- **Cross-link integrity**: `grep -r '/docs/' apps/web/content/docs/*.mdx` lists all internal links for broken-link detection.
- **Future agent inspection**: Read `meta.json` for sidebar structure, grep MDX files for specific error messages or keywords to confirm content drift hasn't occurred.

## Inputs

- `packages/core/src/workflows.ts` — both workflow templates and shared helpers for GitHub Actions page
- `packages/core/src/config.ts` — error messages for troubleshooting
- `packages/core/src/agent.ts` — spawn error and timeout behavior for troubleshooting
- `packages/core/src/transaction.ts` — rollback behavior for troubleshooting
- `packages/core/src/logger.ts` — debug log format for troubleshooting
- `packages/core/src/auto-update.ts` — update failure modes for troubleshooting
- T01 output — the three pages already written, for cross-link consistency

## Expected Output

- `apps/web/content/docs/github-actions.mdx` — complete GitHub Actions setup guide
- `apps/web/content/docs/troubleshooting.mdx` — complete troubleshooting reference
- `apps/web/content/docs/meta.json` — sidebar ordering for all 5 pages
