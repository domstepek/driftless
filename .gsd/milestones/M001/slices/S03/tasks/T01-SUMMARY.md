---
id: T01
parent: S03
milestone: M001
provides:
  - spawnAgent() — Claude Code CLI subprocess manager with timeout and error handling
  - Framework adapter prompt templates (plain-md, fumadocs, docusaurus)
  - generateDocs() — glob-to-doc pipeline orchestrator with progress callbacks
  - AgentResult, GenerateResult, ProgressEvent, ProgressCallback types
  - DocGrouping type and optional docGrouping field on DriftlessConfig
key_files:
  - packages/core/src/agent.ts
  - packages/core/src/adapters.ts
  - packages/core/src/generator.ts
  - packages/core/src/types.ts
  - packages/core/src/index.ts
key_decisions:
  - Adapters are prompt templates (not post-processors) — the agent generates correct format natively
  - Test file content piped via stdin, system prompt via --append-system-prompt, user prompt as positional arg
  - Timeout uses SIGTERM → 5s grace → SIGKILL escalation, with timedOut flag for clean close-handler coordination
  - minimatch added as devDependency for glob resolution (bundled by vp pack)
  - Output filenames strip common test suffixes (.spec, .test, .e2e, .cy) for cleaner doc names
patterns_established:
  - AgentResult captures per-invocation diagnostics (stdout, stderr, duration, cost, exit code, typed error)
  - Generator pipeline pattern: resolve globs → read files → spawn per file → write output → accumulate results
  - ProgressCallback with start/complete/error events per file for UX layer consumption
observability_surfaces:
  - AgentResult.error distinguishes timeout, spawn failure, JSON parse error, and non-zero exit
  - AgentResult.stderr preserves raw error output for debugging
  - AgentResult.durationMs and costUsd for performance/cost tracking
  - GenerateResult.errors array with file path and error string for per-file failure diagnosis
duration: ~25min
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Build agent spawner, framework adapters, and doc generator

**Built the core generation engine: agent spawner with subprocess management, three framework adapter prompt templates, and the glob-to-doc orchestrator pipeline.**

## What Happened

Extended `types.ts` with `DocGrouping`, `AgentResult`, `GenerateResult`, `GenerateFileError`, `ProgressEvent`, and `ProgressCallback` types plus optional `docGrouping` field on `DriftlessConfig`.

Built `agent.ts` with `spawnAgent()` that spawns `claude -p --output-format json --no-session-persistence --tools "" --append-system-prompt` with stdin piping for test file content. Handles timeout (SIGTERM → SIGKILL escalation), non-zero exit, spawn errors, and invalid JSON parsing. Uses a `timedOut` flag to coordinate between the timeout handler and the close handler cleanly.

Built `adapters.ts` with three prompt template functions (`plainMdPrompt`, `fumadocsPrompt`, `docusaurusPrompt`) and a `getAdapterPrompt` dispatcher. Each prompt includes framework-specific format instructions (frontmatter shape, callout/admonition syntax, file extension) plus shared writing style and document structure rules derived from the training-material-writer reference skill.

Built `generator.ts` with `generateDocs()` that resolves glob patterns via recursive readdir + minimatch, reads each matched test file, spawns an agent per file, writes output to the configured directory with framework-appropriate extension, and reports progress via callback. Handles empty globs, individual file failures, and output directory creation.

Updated barrel exports in `index.ts` with all new symbols.

## Verification

- `npx vp test` — 83 tests pass (44 existing + 39 new)
- `npx vp run -r build` — both core and cli packages build clean
- `npx vp check` — format and lint pass, zero errors/warnings
- Agent tests (8 cases): success with JSON parsing, non-zero exit, timeout with SIGTERM, SIGKILL escalation, spawn error (ENOENT), invalid JSON, partial JSON, missing result field, chunked stdout
- Adapter tests (22 cases): format-specific markers for all 3 frameworks, shared rules inclusion, dispatcher routing, unknown framework error
- Generator tests (8 cases): multi-file generation, output dir creation, .mdx extension for fumadocs, empty glob early return, error accumulation with continuation, progress callback events, test suffix stripping, multiple glob patterns

## Diagnostics

- `AgentResult.error` prefix indicates failure type: "timed out", "non-zero exit", "spawn error", "invalid JSON in stdout"
- `AgentResult.stderr` has raw process error output
- `GenerateResult.errors` array maps each failed file to its error string
- `AgentResult.durationMs` and `costUsd` available per invocation for performance analysis

## Deviations

- Added `GenerateFileError` interface (not in original plan) for typed error entries in `GenerateResult.errors` — cleaner than inline `{file, error}` tuples
- Added `minimatch` as explicit devDependency rather than relying on transitive availability

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/types.ts` — Extended with DocGrouping, AgentResult, GenerateResult, GenerateFileError, ProgressEvent, ProgressCallback
- `packages/core/src/agent.ts` — New: spawnAgent() with subprocess management, timeout, JSON parsing
- `packages/core/src/adapters.ts` — New: three framework prompt templates + dispatcher
- `packages/core/src/generator.ts` — New: generateDocs() orchestrator with glob, spawn, write, progress
- `packages/core/src/index.ts` — Updated barrel with all new exports
- `packages/core/test/agent.test.ts` — New: 8 test cases for spawner success/error paths
- `packages/core/test/adapters.test.ts` — New: 22 test cases for adapter prompts and dispatcher
- `packages/core/test/generator.test.ts` — New: 8 test cases for pipeline, progress, errors
- `packages/core/package.json` — Added minimatch, @types/minimatch devDependencies
