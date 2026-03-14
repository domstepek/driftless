---
id: S03
milestone: M001
status: ready
---

# S03: Agent-driven doc generation — Context

## Goal

The CLI spawns Claude Code in headless mode, passes e2e test files per the user's chosen grouping strategy, and writes generated markdown training docs to the configured output directory — proving the core thesis with a clean progress UX.

## Why this Slice

S03 is the highest-risk slice: it proves that Claude Code can reliably transform e2e tests into readable training docs. Every downstream slice (S04 skill installer, S05 rollback/dry-run) depends on doc generation working. S03 also retires the critical unknown from the proof strategy: does Claude Code headless actually work as the integration mechanism?

## Scope

### In Scope

- Spawn Claude Code in headless/print mode as a subprocess, passing test file contents as prompt input
- Support three doc grouping strategies (persisted in `.driftless.json` by the S02 wizard):
  - **Per test file** — one doc per `.spec.ts` / `.test.ts` file, filename-derived output name
  - **Per describe block** — one doc per top-level `describe` block within a file
  - **Agent decides** — Claude Code determines grouping from the content; output filenames chosen by the agent
- Progress UX: spinner showing current filename and count ("Generating docs… login.spec.ts (3/12)") — no raw agent output ever shown to the user (R006)
- Partial failure handling: continue generating remaining files if one fails; show a summary at the end ("10 docs generated, 2 failed" with failed filenames listed)
- Completion screen: list of doc files created with paths, then a summary line ("✓ 12 docs generated in docs/training/")
- Overwrite existing docs silently — no prompt before overwriting (rollback in S05 handles undo)
- Framework-specific output adapters: plain markdown (default), Fumadocs MDX, Docusaurus MDX — driven by `docFramework` in config
- All three adapters required; doc framework choice made in the S02 wizard
- Doc generation is triggered from the init command flow (called after the S02 wizard completes config)

### Out of Scope

- Prompting the user before overwriting existing docs (deferred to S05 dry-run)
- Rollback of written docs on failure (S05)
- Debug logging to `.driftless/debug.log` (S05)
- `--dry-run` mode (S05)
- Skill file installation (S04)
- Any quality review UX — driftless writes what Claude Code returns, the user reads the output themselves
- Retry logic for failed files — log the failure, continue, surface at end (no auto-retry in v1)

## Constraints

- **Claude Code headless only (D001):** No direct API calls. Claude Code CLI is the only inference mechanism. Auth is the user's responsibility (Claude Code must be installed and authenticated).
- **No raw agent output to user (R006):** The user sees a progress spinner, never Claude Code's stdout/stderr. All agent output goes to the debug log (S05) and internal buffers only.
- **Failure = continue, not stop:** A single file failure must not halt generation. The user gets partial output + a failure summary, never a hard crash.
- **Output path from config:** Doc output directory comes from `.driftless.json` (set in S02 wizard). S03 does not re-prompt for paths.
- **Grouping strategy from config:** The doc grouping choice is in `.driftless.json`. S03 reads it; the wizard (S02) collects it.
- **Silent overwrite:** Existing files in the output directory are overwritten without prompting.

## Integration Points

### Consumes

- `packages/core/src/config.ts` → `readConfig()` — reads `.driftless.json` for output path, doc framework, grouping strategy (from S02)
- `packages/core/src/types.ts` → `DriftlessConfig`, `DocFramework`, `Capability` — config schema (from S02)
- `packages/cli/src/commands/init.ts` → `initCommand()` — generation is called as a step in the init flow (from S02)

### Produces

- `packages/core/src/agent.ts` — Claude Code headless spawner (exports: `spawnAgent()`, `AgentResult`)
- `packages/core/src/generator.ts` — doc generation orchestrator (exports: `generateDocs()`)
- `packages/core/src/adapters/` — framework-specific formatters (exports: `PlainMdAdapter`, `FumadocsAdapter`, `DocusaurusAdapter`)

### Cross-Slice Impact on S02

- S02 wizard must add a **doc grouping prompt** (not in original S02 scope): "How should docs be grouped?" with three options — per test file, per describe block, or let the agent decide.
- This choice must be persisted in `.driftless.json` as a `docGrouping` field.
- Update S02 context and types accordingly during S02 planning.

## Open Questions

- Exact Claude Code headless invocation — `claude --print`, `claude -p`, or another flag. Must be verified during S03 research before planning. Current thinking: `claude --print` based on CLI conventions, but this is unconfirmed.
- For "agent decides" grouping, how should output filenames be derived? Options: let the agent suggest filenames in its output, use a slugified version of the first heading, or number them sequentially. Current thinking: the agent includes a suggested filename in its output format (structured prompt that requests `<!-- filename: foo.md -->` at the top).
- Maximum context window size for large test files — if a test file exceeds Claude Code's context, we need a chunking or truncation strategy. Current thinking: pass the full file and let Claude Code handle it; document the limitation if it surfaces during testing.
- Timeout handling — how long to wait per file before marking it as failed. Current thinking: 60s per file, configurable in the future.
