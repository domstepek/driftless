---
id: S03
parent: M001
milestone: M001
provides:
  - spawnAgent() — Claude Code CLI subprocess spawner with timeout escalation and structured results
  - Framework adapter prompt templates (plain-md, fumadocs, docusaurus) with format-specific instructions
  - generateDocs() — glob-to-doc pipeline orchestrator with per-file progress callbacks
  - Init command integration — generation wired into CLI wizard with @clack/prompts spinner
  - AgentResult, GenerateResult, GenerateFileError, ProgressEvent, ProgressCallback types
  - DocGrouping type and optional docGrouping field on DriftlessConfig
requires:
  - slice: S02
    provides: DriftlessConfig types, readConfig/writeConfig, initCommand orchestrator, @clack/prompts wizard flow
affects:
  - S04
  - S05
key_files:
  - packages/core/src/agent.ts
  - packages/core/src/adapters.ts
  - packages/core/src/generator.ts
  - packages/core/src/types.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
key_decisions:
  - D027 — Adapters are prompt templates (system prompt fragments), not post-processors
  - D028 — One agent invocation per test file for simplicity and testability
  - D029 — Flat adapters.ts module (three functions, no directory)
  - D030 — docGrouping defaults to "per-file", no prompt for other modes in v1
  - D031 — minimatch as explicit devDep for glob resolution (bundled by vp pack)
patterns_established:
  - AgentResult captures per-invocation diagnostics (stdout, stderr, duration, cost, exit code, typed error)
  - Generator pipeline: resolve globs → read files → spawn per file → write output → accumulate results
  - ProgressCallback with start/complete/error events per file for UX layer consumption
  - Init command post-write hook pattern — capability-gated async work after config write, with dry-run skip
observability_surfaces:
  - AgentResult.error distinguishes timeout, spawn failure, JSON parse error, and non-zero exit
  - AgentResult.stderr preserves raw error output
  - AgentResult.durationMs and costUsd for performance/cost tracking
  - GenerateResult.errors array with file path and error string per failed file
  - Spinner messages show real-time file-by-file progress
  - p.log.warn() per failed file with path and error string
  - Summary note includes generation stats (files, errors, cost)
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T02-SUMMARY.md
duration: ~40min
verification_result: passed
completed_at: 2026-03-14
---

# S03: Agent-driven doc generation

**Built the core generation engine — agent spawner, framework adapters, doc generator pipeline — and wired it into the init command with progress spinner and error reporting.**

## What Happened

Built the generation engine in three layers. First, `agent.ts` implements `spawnAgent()` which shells out to `claude -p --output-format json --no-session-persistence --tools "" --append-system-prompt` with test file content piped via stdin. It handles timeout with SIGTERM→5s grace→SIGKILL escalation, non-zero exits, spawn errors (missing binary), and invalid JSON parsing. Results are captured as structured `AgentResult` with stdout, stderr, duration, cost, exit code, and typed error.

Second, `adapters.ts` provides three prompt template functions (`plainMdPrompt`, `fumadocsPrompt`, `docusaurusPrompt`) and a `getAdapterPrompt` dispatcher. Each template includes framework-specific format instructions — frontmatter shape, callout/admonition syntax, file extension rules — plus shared writing style rules derived from the training-material-writer reference skill. Adapters are pure prompt fragments, not post-processors.

Third, `generator.ts` implements `generateDocs()` which resolves glob patterns via recursive readdir + minimatch, reads each matched test file, spawns an agent per file with the appropriate adapter prompt, writes output to the configured directory (with atomic write and correct extension per framework), and reports progress via callback. Output filenames strip common test suffixes (.spec, .test, .e2e, .cy).

Finally, wired generation into `initCommand`: after config write, if `doc-generator` is in capabilities, a spinner starts showing per-file progress, `generateDocs()` runs, per-file errors get `p.log.warn()`, and the summary note includes generation stats. Dry-run skips generation with a log message.

## Verification

- `npx vp test` — 89 tests pass across 8 test files
- `npx vp run -r build` — both core and cli packages build clean
- `npx vp check` — format and lint pass, zero errors/warnings
- Agent tests (9 cases): success with JSON parsing, non-zero exit, timeout/SIGTERM, SIGKILL escalation, spawn error (ENOENT), invalid JSON, partial JSON, missing result field, chunked stdout
- Adapter tests (22 cases): format-specific markers for all 3 frameworks, shared rules inclusion, dispatcher routing, unknown framework error
- Generator tests (8 cases): multi-file generation, output dir creation, .mdx extension for fumadocs, empty glob early return, error accumulation with continuation, progress callback events, test suffix stripping, multiple glob patterns
- Init generation tests (6 cases): generation called with correct args, skipped when capability missing, skipped in dry-run, all-failed error, partial failure, stats in summary

## Requirements Advanced

- R002 (E2E test framework agnostic) — agent-driven interpretation with no custom parsers; adapter prompts instruct the agent to read any test framework
- R003 (Agent-driven doc generation via Claude Code CLI) — `spawnAgent()` shells out to Claude Code in headless mode, `generateDocs()` orchestrates per-file generation
- R004 (Framework-specific doc adapters) — three adapters produce correct format instructions for plain-md, fumadocs MDX, and docusaurus MDX
- R006 (Clean progress-only UX) — spinner with file-by-file progress, agent output captured internally

## Requirements Validated

- R002 — Agent spawner sends test content as-is with format instructions via system prompt; no framework-specific parsing. Adapter tests verify format-specific output markers for all three doc frameworks. (Full validation requires live agent run against multiple test frameworks — that's milestone-level UAT.)
- R003 — `spawnAgent()` spawns `claude -p` in headless mode, pipes test content, parses JSON result. 9 agent tests cover success, timeout, kill, spawn error, and malformed output. `generateDocs()` orchestrates the full pipeline with 8 tests covering glob→spawn→write→error.
- R004 — Three adapter prompt templates return framework-specific frontmatter, callout/admonition syntax, and file extension rules. 22 adapter tests verify format markers and dispatcher routing.
- R006 — Init command wires spinner with per-file progress messages, hides agent stdout/stderr from user. 6 init generation tests verify spinner updates and error reporting.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Added `GenerateFileError` interface (not in original plan) for typed error entries — cleaner than inline object literals
- Added `minimatch` as explicit devDep for glob resolution
- 6 init generation tests written instead of planned 4 — extra coverage for partial failure and stats verification

## Known Limitations

- Live agent generation untested — all tests mock the subprocess. Real Claude Code auth required for live runs. This is by design: live generation quality is milestone-level UAT, not slice-level.
- `docGrouping` only supports `"per-file"` mode. Other grouping strategies deferred.
- No rollback on generation failure — partial output files may remain if generation is interrupted. S05 handles this.
- No debug logging yet — agent output is captured in `AgentResult` but not persisted to disk. S05 adds `.driftless/debug.log`.

## Follow-ups

- S04 needs the adapter selection and config types to parameterize skill templates
- S05 needs to wrap `generateDocs()` in rollback logic and persist `AgentResult` diagnostics to debug log

## Files Created/Modified

- `packages/core/src/types.ts` — Extended with DocGrouping, AgentResult, GenerateResult, GenerateFileError, ProgressEvent, ProgressCallback
- `packages/core/src/agent.ts` — New: spawnAgent() with subprocess management, timeout, JSON parsing
- `packages/core/src/adapters.ts` — New: three framework prompt templates + dispatcher
- `packages/core/src/generator.ts` — New: generateDocs() orchestrator with glob, spawn, write, progress
- `packages/core/src/index.ts` — Updated barrel with all new exports
- `packages/core/test/agent.test.ts` — New: 9 test cases for spawner
- `packages/core/test/adapters.test.ts` — New: 22 test cases for adapters
- `packages/core/test/generator.test.ts` — New: 8 test cases for generator pipeline
- `packages/cli/src/commands/init.ts` — Added generation integration with spinner and error handling
- `packages/cli/test/init.test.ts` — Added 6 generation test cases
- `packages/core/package.json` — Added minimatch, @types/minimatch devDependencies

## Forward Intelligence

### What the next slice should know
- All generation types and functions are exported from `@driftless/core` barrel — import from there, not individual files
- `generateDocs()` accepts a `GenerateDocsOptions` with `cwd` and `onProgress` — skill installer (S04) can reuse this options pattern
- Adapter prompt strings are pure functions with no state — easy to compose or extend for skill templates
- `DriftlessConfig.docGrouping` exists but only `"per-file"` is implemented

### What's fragile
- Agent JSON parsing assumes Claude Code `--output-format json` produces `{ result: string }` — if the format changes, `agent.ts` line parsing breaks silently (returns empty result, not crash)
- Glob resolution uses recursive readdir + minimatch — deep directory trees could be slow; no depth limit currently

### Authoritative diagnostics
- `npx vp test` — 89 tests, 8 files — the single source of truth for all S03 behavior
- `AgentResult.error` prefix string indicates failure type — grep for "timed out", "non-zero exit", "spawn error", "invalid JSON"

### What assumptions changed
- Planned 44 existing + ~39 new tests, got exactly 89 total — estimate was accurate
- Build time stayed fast (~450ms per package) despite adding minimatch bundle
