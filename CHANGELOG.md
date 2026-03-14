# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] — 2026-03-14

Initial release of the driftless CLI and core library.

### Added

- **Interactive CLI wizard** — `driftless init` walks you through setup with auto-detection of your test framework (Playwright, Cypress, TestCafe, Detox, WebdriverIO, Nightwatch) and doc framework selection (plain Markdown, Fumadocs MDX, Docusaurus MDX).

- **Agent-driven doc generation** — Spawns Claude Code in headless mode to read your e2e tests and produce living documentation. Per-file pipeline with timeout escalation and progress reporting.

- **Three doc framework adapters** — Prompt templates tailored to plain Markdown (blockquotes), Fumadocs MDX (callout components), and Docusaurus MDX (admonitions). No post-processing — the AI writes native format directly.

- **Composable skill installer** — Writes parameterized SKILL.md files for `doc-generator` and `e2e-writer` capabilities into your repo's `.skills/` directory, configured for your doc framework and test paths.

- **GitHub Actions workflows** — `doc-update` workflow detects stale docs on PRs via `claude-code-action@v1`. `test-gen` workflow generates missing e2e tests for new user flows. Both scaffold automatically during `driftless init` based on selected capabilities.

- **Fail-safe init** — `FileTransaction` rollback on error (removes created files, preserves pre-existing ones). Structured debug log at `.driftless/debug.log` with timestamped JSON entries per phase. `--dry-run` previews all changes without writing anything.

- **Config persistence** — `.driftless.json` with atomic writes (temp + rename) stores project configuration for workflows and skill templates.

### Packages

- `@driftless/core` — Core types, utilities, framework adapters, workflow templates, and skill templates
- `@driftless/cli` — CLI entry point with interactive wizard, installed as `driftless` binary

[1.0.0]: https://github.com/domstepek/driftless/releases/tag/v1.0.0
