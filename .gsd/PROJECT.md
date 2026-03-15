# Project

## What This Is

driftless — an open source TypeScript CLI tool that installs automated e2e-test-to-docs (and optionally e2e-test-generation) into any repo. Developers run `npx driftless init` inside their project, answer configuration prompts, and get: generated markdown training docs from their existing e2e tests, composable agent skills installed into their repo, and GitHub Actions scaffolded for PR-triggered automation. The agent harness (Claude Code CLI) does the heavy lifting — reading tests, generating docs, detecting staleness.

The core insight: e2e tests are always current and always structured. The transformation from test actions to human-readable documentation is reliable when driven by an LLM that understands both the test framework and the target doc format.

## Core Value

A developer with e2e tests can run one command and get training documentation that stays current automatically — because it's generated from the tests, and checked on every PR.

## Current State

M001–M006 complete. v1.0.0 released to npm — both `@driftless-ai/core@1.0.0` and `@driftless-ai/cli@1.0.0` published and installable from the live registry. CI/CD pipeline in place: `.github/workflows/ci.yml` gates PRs with check+test+build, `.github/workflows/release.yml` automates npm publish with provenance + GitHub Release on `v*` tag push. GitHub repo has professional OSS presence: README with badges, MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, YAML form issue templates, PR template, FUNDING.yml, 9 topics, homepage URL, branch protection on main (PR review + CI required). CLI auto-update: checks npm registry on launch when `autoUpdate: true`, detects package manager, auto-installs; npx users get notification; network/CI failures skip silently. The CLI (`npx @driftless-ai/cli@latest init`) runs an interactive wizard that auto-detects test frameworks, prompts for configuration (including auto-update preference), spawns Claude Code in headless mode to generate training docs from e2e tests, installs parameterized skill files, scaffolds GitHub Actions workflow files based on selected capabilities, and writes `.driftless.json` config. Three doc framework adapters (plain-md, fumadocs MDX, docusaurus MDX). Fail-safe init with FileTransaction rollback, structured debug logging, and `--dry-run` preview. Two workflow templates for PR-triggered automation via `claude-code-action@v1`. Full capability matrix. 268 tests across 14 files. 32 of 36 requirements validated. Brand identity document at `~/Desktop/driftless/brand-identity.md` with full design token system (colors, typography, spacing, animation, component catalog). Landing page at `driftless-six.vercel.app` rebuilt with brutalist-technical-white brand system: Familjen Grotesk 700 display font, Instrument Sans body, JetBrains Mono data; geological amber `#C4862A` accent; spinning ASCII mesa hero component (Canvas 2D, donut.c-style projection); six page sections (nav, hero, how-it-works, features, framework ticker, footer); fumadocs docs site unchanged at `/docs`. OG image rebuilt with brand visual. X/Twitter launch playbook at `~/Desktop/driftless/m004-launch-playbook.md` with 18 posting sessions, Mermaid timeline, engagement strategy. Business planning library complete: ten documents at `~/Desktop/driftless/` — vision strategy, executive summary, business structure (NY LLC formation guide with Albany RA strategy), product strategy, PRD (detailed features a/b, directional c/d), pricing model (3 revenue scenarios with competitor benchmarks), payment infrastructure (Lemon Squeezy as MoR), GTM plan, operations playbook, and pitch deck outline. All 10 docs share canonical ICP phrase, phase timeline, and feature labels with grep-verified cross-document consistency across every file. Private repo `domstepek/driftless-pro` scaffolded with proprietary license, README, and directory structure. Architecture decisions D065–D087 formalized across M005–M006. Next: M007 (Pro Tier — Knowledge Base + Agent Skill).

## Architecture / Key Patterns

- **Monorepo** with pnpm workspaces, managed by Vite+ (`vp`) as the unified toolchain
- **Packages:** `packages/cli` (the `driftless` CLI), `packages/core` (shared parsing/generation logic), `packages/action` (GitHub Action), `apps/web` (Next.js 15 — landing page + fumadocs docs site)
- **Vite+** handles dev, check (lint+format+typecheck), test (vitest), build, pack, and monorepo task orchestration
- **Claude Code CLI** in headless mode for all inference (init doc generation, PR automation)
- **`claude-code-action@v1`** for GitHub Action integration in user repos
- **ESM-first**, TypeScript strict mode
- **`@clack/prompts`** for interactive CLI UX

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Core CLI + E2E-to-Docs Engine — Setup wizard, agent-driven doc generation from any e2e tests, skill installer
- [x] M002: GitHub Actions + PR Automation — Workflow templates for PR-triggered doc updates and test generation via claude-code-action@v1, init scaffolding with capability matrix
- [x] M003: OSS Maturity + v1.0 Release — npm publish pipeline, semantic releases, CHANGELOG, CI for driftless, community files, repo hygiene, CLI auto-update
- [x] M004: Product Launch — Vercel landing page, fumadocs docs site, X/Twitter OSS launch playbook (output to ~/Desktop/driftless/)
- [x] M005: Business Infrastructure + Platform Vision — Driftless LLC (NY), business planning docs (vision/exec summary/PRD/pricing/GTM/pitch deck outline), payment infra setup, private Pro repo scaffold (output to ~/Desktop/driftless/)
- [x] M006: Brand Identity + Landing Page Revamp — Full visual rebrand (brand identity doc + design system), spinning ASCII mesa hero component, landing page rebuild modeled on sutera.ch brutalist-technical-white aesthetic with geological amber accent
- [ ] M007: Pro Tier — Knowledge Base + Agent Skill (feature a) — auto-upload training materials to managed KB, agent skill for chatbot/agent integration
- [ ] M008: Pro Tier — AI-Generated Guided Walkthroughs (feature b) — dynamic in-app walkthroughs generated from training docs
- [ ] M009: Pro Tier — Automated Demo/Tutorial Videos (feature c) — programmatic video generation from training docs via Replit Animation or similar
- [ ] M010: Pro Tier — Signal-Driven Autonomous Development Pipeline (feature d) — analytics/error tracking/behavioral signals + explicit requests → AI prioritization → auto-ticket → cloud agent develops → auto-PR → auto-docs/tests → preview + walkthrough → verify via signals

## Notes

- **Agent harness:** Claude-first. Other harnesses (Codex, Gemini CLI) are documented as future intent but not supported in v1.
- **OSS skill learning:** Building `~/.gsd/agent/skills/oss-repo-setup/` incrementally as we ship — real learnings from this project, not front-loaded research.
- **Web search:** Use `google_search` tool for all web research. Do NOT use `search-the-web` or `search_and_read`.
- **GitHub updates:** Use the `agent-browser` skill (native mode) for any GitHub repository UI operations.
- **Two-repo architecture:** OSS CLI stays MIT in `domstepek/driftless`. Pro tier features (a)–(d) live in a separate private repo with commercial license. Shared types/contracts TBD during M006 planning.
- **Growth model:** Bootstrapped. Phase 1 (M001–M004) = OSS traction + GitHub Sponsors. Phase 2 (M006–M008) = Pro tier with 1 additional dev. Phase 3 (M009+) = autonomous pipeline when platform has revenue.
