# M001: Core CLI + E2E-to-Docs Engine — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

## Project Description

driftless is an open source TypeScript CLI that installs automated e2e-test-to-docs into any repo. The user runs `npx driftless init`, answers prompts, and gets: generated markdown training docs from their e2e tests, composable agent skills in their repo, and configuration for PR-triggered automation.

## Why This Milestone

M001 is the foundation — without the CLI, nothing else works. The interactive wizard is the entry point, the agent-driven doc generation is the core value, and the skill installer is what makes the GitHub Actions (M002) possible. This milestone proves the central thesis: an LLM can reliably transform e2e tests into training documentation.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Run `npx driftless init` in any repo with e2e tests
- Walk through an interactive wizard that detects their test framework and prompts for configuration
- Watch as Claude Code generates markdown training docs from their tests with a clean progress UX
- Find installed skill files in their repo's `.skills/` directory, configured for their doc framework
- Re-run init safely after failure (rollback + idempotent)
- Preview what init would do with `--dry-run`

### Entry point / environment

- Entry point: `npx driftless init` CLI command
- Environment: local dev (any machine with Node.js + Claude Code CLI installed)
- Live dependencies involved: Claude Code CLI (spawned in headless mode for inference)

## Completion Class

- Contract complete means: CLI builds, tests pass, `vp check` clean, all packages resolve
- Integration complete means: CLI successfully spawns Claude Code, receives output, writes docs
- Operational complete means: `--dry-run` works, rollback works on failure, debug log captures full run

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- `npx driftless init` works end-to-end in a real repo with real e2e tests (not just fixtures)
- Claude Code generates docs that match the selected framework format (plain md, fumadocs MDX, or docusaurus MDX)
- A failed init (e.g., agent harness not found) leaves the repo unchanged and produces a useful debug log

## Risks and Unknowns

- **Claude Code headless mode reliability** — spawning Claude Code as a subprocess and parsing its output is the critical integration point. Failure modes (timeout, malformed output, auth issues) need handling.
- **Prompt engineering for test interpretation** — the agent needs to reliably understand arbitrary e2e test frameworks and produce consistent, high-quality docs. Quality may vary across frameworks.
- **Vite+ maturity** — Vite+ is relatively new (alpha). We may hit tooling gaps that require workarounds.

## Existing Codebase / Prior Art

- `training-material-writer` skill at `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md` — the reference implementation for what gets genericized. It targets Fumadocs MDX with callout components, derives content from e2e tests + page objects + components, and follows a specific document structure (frontmatter, intro, numbered steps, common problems).
- Empty driftless repo — git initialized, GitHub remote at domstepek/driftless (public), no code.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — Interactive CLI setup wizard (primary entry point)
- R002 — E2E test framework agnostic (agent interprets any test suite)
- R003 — Agent-driven doc generation via Claude Code CLI (core value)
- R004 — Framework-specific doc adapters (plain md, fumadocs, docusaurus)
- R005 — Composable skill installer (e2e writer, doc generator, or both)
- R006 — Clean progress-only UX (spinner + progress, not raw agent output)
- R007 — Debug logging for issue reporting
- R008 — Fail-clean with rollback on init errors
- R009 — Config file (.driftless.json) persisting init choices
- R010 — Test framework auto-detection
- R011 — `--dry-run` flag
- R015 — Modular capability selection
- R025 — Claude-first with documented future harness support
- R033 — Vite+ as unified toolchain
- R034 — pnpm workspaces for monorepo structure
- R035 — TypeScript strict mode, ESM-first

## Scope

### In Scope

- CLI setup wizard with `@clack/prompts`
- Agent-driven doc generation from any e2e test framework via Claude Code headless
- Framework-specific output (plain md, fumadocs MDX, docusaurus MDX)
- Skill installer (doc generator skill, e2e test writer skill, or both)
- Config file (`.driftless.json`)
- `--dry-run` mode
- Rollback on failure + debug logging
- Monorepo scaffold with Vite+ toolchain

### Out of Scope / Non-Goals

- GitHub Actions (M002)
- npm publishing pipeline (M003)
- OSS community files and repo hygiene (M003)
- Landing page and docs site (M004)
- Non-e2e-test documentation sources
- Agent harness support beyond Claude Code

## Technical Constraints

- Requires Node.js (managed by Vite+)
- Requires Claude Code CLI installed and authenticated on the user's machine
- pnpm as package manager (managed by Vite+)
- ESM-first, TypeScript strict mode
- The training-material-writer skill is the reference for genericization — preserve its core insight (content sources priority: e2e tests → page objects → components → hooks → constants → queries) while making the structure framework-agnostic

## Integration Points

- **Claude Code CLI** — spawned as subprocess in headless/print mode. Input: prompt with test file contents. Output: generated markdown docs. Must handle: auth failures, timeouts, malformed output.
- **Target repo filesystem** — driftless reads test files and writes docs + config + skills. Must handle: permission errors, existing files, git dirty state.

## Open Questions

- Exact Claude Code headless invocation pattern — need to verify `claude --print` or equivalent for non-interactive use during S03 research
- Whether Vite+ supports our exact monorepo shape out of the box or needs config tuning — will discover in S01
- Optimal prompt structure for test-to-doc generation across different frameworks — will iterate during S03
