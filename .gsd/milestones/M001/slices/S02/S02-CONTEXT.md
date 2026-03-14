---
id: S02
milestone: M001
status: ready
---

# S02: Interactive CLI wizard — Context

## Goal

`npx driftless init` runs a polished interactive wizard that detects the user's test framework, prompts for configuration with smart defaults, and writes `.driftless.json` — the full prompt flow works end-to-end with no doc generation yet.

## Why this Slice

S02 is the user's first experience with driftless. It establishes the CLI's personality and the config schema that S03 (doc generation), S04 (skill installer), and S05 (dry-run/rollback) all consume. Every downstream slice depends on the config and init flow this slice produces.

## Scope

### In Scope

- `driftless init` command registered and routable from the CLI entry point (built in S01)
- Test framework auto-detection: scan for config files (playwright.config.ts, cypress.config.ts, etc.) and pre-fill the framework prompt with the detected value
- Interactive prompts using @clack/prompts (D005):
  - Test framework (pre-filled if detected, user confirms or overrides)
  - Test directory path (smart default from detected config or framework convention)
  - Doc output directory path (smart default)
  - Doc framework (plain md, fumadocs MDX, docusaurus MDX — plain md default per D006)
  - Capabilities (multi-select, both doc-generator and e2e-writer checked by default, user unchecks what they don't want)
  - Skill install path (default `.skills/`, user can override per D010)
- Summary screen before writing: show all chosen values, ask "Looks good?" (Y/n) — one chance to review before anything touches disk
- Write `.driftless.json` to the target repo root (D009)
- Re-init support: if `.driftless.json` already exists, load it and pre-fill all prompts with existing values — existing config is never silently lost
- Cancellation: Ctrl+C or Escape at any point prints "Setup cancelled." and exits cleanly — nothing written to disk, repo unchanged
- Config read/write utilities in `packages/core` for `.driftless.json`
- Full config type schema in `packages/core` (`DriftlessConfig`, `DocFramework`, `Capability`)

### Out of Scope

- Doc generation (S03) — the wizard collects config but does not generate docs
- Skill file installation (S04) — the wizard collects capability choices but does not copy skill files
- `--dry-run` flag behavior (S05) — deferred to the rollback/debug slice
- Rollback on failure (S05)
- Debug logging (S05)
- Path validation beyond basic existence checks — planning decides the depth
- Command routing beyond `init` (help, version flags already handled by S01 entry point)

## Constraints

- **@clack/prompts (D005):** All interactive prompts use @clack/prompts for Vercel-style UX. Cancellation handling is native to the library.
- **Pre-fill, don't skip:** Auto-detection pre-fills prompt defaults — it never skips prompts entirely. The user always sees and confirms every value.
- **Config schema is the contract:** `.driftless.json` schema defined here becomes the shared interface for S03, S04, and S05. Changes to it after S02 require updating all consumers.
- **Plain markdown default (D006):** Doc framework defaults to plain markdown with YAML frontmatter. Fumadocs and Docusaurus are options, not defaults.
- **Both capabilities on by default:** Multi-select defaults to both doc-generator and e2e-writer checked. User opts out, not in.

## Integration Points

### Consumes

- `packages/cli/src/index.ts` — CLI entry point with `main()` and command routing (from S01)
- `packages/core/src/index.ts` — shared types barrel export (from S01)
- `packages/cli/package.json` — `bin.driftless` entry point (from S01)

### Produces

- `packages/cli/src/commands/init.ts` — init command orchestrator (exports: `initCommand()`)
- `packages/cli/src/prompts/` — prompt modules using @clack/prompts (exports: `gatherConfig()`)
- `packages/core/src/config.ts` — config read/write for `.driftless.json` (exports: `readConfig()`, `writeConfig()`, `detectTestFramework()`)
- `packages/core/src/types.ts` — full config schema (exports: `DriftlessConfig`, `DocFramework`, `Capability`)

## Open Questions

- Exact set of test frameworks to detect in v1 — Playwright and Cypress are certain, others (Jest, Vitest, WebDriverIO) TBD during research. Current thinking: detect what we can, always allow manual entry.
- Whether path prompts should validate that the directory exists at prompt time or defer validation — current thinking: basic existence check with a warning, not a blocker.
- Prompt ordering fine-tuning — the logical flow above may shift during planning based on @clack/prompts capabilities (grouping, sections, etc.).
