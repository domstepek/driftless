# Project

## What This Is

driftless — an open source TypeScript CLI tool that installs automated e2e-test-to-docs (and optionally e2e-test-generation) into any repo. Developers run `npx driftless init` inside their project, answer configuration prompts, and get: generated markdown training docs from their existing e2e tests, composable agent skills installed into their repo, and GitHub Actions scaffolded for PR-triggered automation. The agent harness (Claude Code CLI) does the heavy lifting — reading tests, generating docs, detecting staleness.

The core insight: e2e tests are always current and always structured. The transformation from test actions to human-readable documentation is reliable when driven by an LLM that understands both the test framework and the target doc format.

## Core Value

A developer with e2e tests can run one command and get training documentation that stays current automatically — because it's generated from the tests, and checked on every PR.

## Current State

M001/S04 complete. Skill installer built and wired into init flow: `docGeneratorTemplate()` and `e2eWriterTemplate()` produce parameterized SKILL.md content with framework-specific callout syntax, `installSkills()` writes them to `{skillsDir}/{name}/SKILL.md` gated on capability selection. Init command calls installer after doc generation with dry-run skip. 118 tests pass across both packages. Next: S05 (Rollback, debug logging, dry-run).

## Architecture / Key Patterns

- **Monorepo** with pnpm workspaces, managed by Vite+ (`vp`) as the unified toolchain
- **Packages:** `packages/cli` (the `driftless` CLI), `packages/core` (shared parsing/generation logic), `packages/action` (GitHub Action), `apps/web` (landing page), `apps/docs` (fumadocs site)
- **Vite+** handles dev, check (lint+format+typecheck), test (vitest), build, pack, and monorepo task orchestration
- **Claude Code CLI** in headless mode for all inference (init doc generation, PR automation)
- **`claude-code-action@v1`** for GitHub Action integration in user repos
- **ESM-first**, TypeScript strict mode
- **`@clack/prompts`** for interactive CLI UX

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: Core CLI + E2E-to-Docs Engine — Setup wizard, agent-driven doc generation from any e2e tests, skill installer
- [ ] M002: GitHub Actions + PR Automation — Distributable actions for doc staleness detection, doc updates, and e2e test generation in user repos
- [ ] M003: OSS Maturity + v1.0 Release — npm publish pipeline, semantic releases, CHANGELOG, CI for driftless, community files, repo hygiene
- [ ] M004: Product Launch — Vercel landing page, fumadocs docs site, X/Twitter OSS launch playbook (output to ~/Desktop/driftless/)
- [ ] M005: Business Infrastructure + Monetization — Driftless LLC (NY) formation, Lemon Squeezy payment infrastructure, GitHub Action license gate for Pro tier, pricing page, comprehensive business plan (output to ~/Desktop/driftless/)

## Notes

- **Agent harness:** Claude-first. Other harnesses (Codex, Gemini CLI) are documented as future intent but not supported in v1.
- **OSS skill learning:** Building `~/.gsd/agent/skills/oss-repo-setup/` incrementally as we ship — real learnings from this project, not front-loaded research.
- **Web search:** Use `google_search` tool for all web research. Do NOT use `search-the-web` or `search_and_read`.
- **GitHub updates:** Use the `agent-browser` skill (native mode) for any GitHub repository UI operations.
