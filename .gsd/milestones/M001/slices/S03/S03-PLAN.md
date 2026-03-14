# S03: Agent-driven doc generation

**Goal:** The CLI spawns Claude Code in headless mode per test file, generates framework-formatted docs, and writes them to the configured output directory — proving the core thesis that e2e tests become training docs.

**Demo:** After the init wizard writes config, the CLI resolves test file globs, shows a spinner with file-by-file progress, invokes Claude Code per file, and writes formatted docs. Unit tests with mocked subprocess prove the full pipeline end-to-end.

## Must-Haves

- `spawnAgent()` spawns `claude -p --output-format json` with stdin piping, timeout (120s default), structured JSON result parsing, and clean error handling for timeout/crash/partial output
- Three framework adapters (plain-md, fumadocs, docusaurus) produce system prompt fragments with correct format instructions, frontmatter shape, and callout/admonition syntax
- `generateDocs()` resolves test file globs to real files, iterates them, calls `spawnAgent()` per file, writes output docs to the configured output dir, and accumulates errors per-file
- Init command calls `generateDocs()` after config write when `doc-generator` capability is selected, with `@clack/prompts` spinner showing file-by-file progress (R006)
- Agent stdout/stderr captured internally, never shown to user — only spinner messages visible (R006)
- `DocGrouping` type and optional `docGrouping` field added to `DriftlessConfig` (defaults to `"per-file"`)
- `AgentResult`, `GenerateResult`, `spawnAgent`, `generateDocs`, adapters all re-exported from core barrel
- No existing tests broken (44 baseline)

## Proof Level

- This slice proves: integration (subprocess spawning + output pipeline) + contract (S03 → S04/S05 boundary types and exports)
- Real runtime required: no — Claude Code auth required for live generation; unit tests mock the subprocess and prove the full pipeline with synthetic agent output
- Human/UAT required: no for slice completion; generated doc quality is milestone-level UAT

## Verification

- `npx vp test` — all tests pass (44 existing + new agent, adapters, generator, and init-generation tests)
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass
- `packages/core/test/agent.test.ts` — spawner handles success, timeout, kill, non-zero exit, partial JSON, and missing `claude` binary
- `packages/core/test/adapters.test.ts` — each adapter returns format-specific markers (frontmatter shape, callout syntax for fumadocs, admonition syntax for docusaurus)
- `packages/core/test/generator.test.ts` — glob resolution, per-file orchestration, output file writing with correct paths, error accumulation, progress callback invocation
- `packages/cli/test/init.test.ts` — generation called after config write when doc-generator selected, skipped when not selected, skipped in dry-run

## Observability / Diagnostics

- Runtime signals: `AgentResult` captures per-invocation stdout, stderr, duration, cost, exit code, and error message; `GenerateResult` accumulates per-file errors with file path and error string
- Inspection surfaces: `GenerateResult.errors` array for per-file failure diagnosis; `AgentResult.durationMs` and `costUsd` for performance/cost tracking
- Failure visibility: specific test file that failed + error type (timeout, spawn failure, JSON parse error, non-zero exit) + raw stderr preserved in result
- Redaction constraints: none (no secrets in agent output pipeline)

## Integration Closure

- Upstream surfaces consumed: `DriftlessConfig` from `types.ts`, `readConfig`/`writeConfig` from `config.ts`, `initCommand` orchestrator from `init.ts`
- New wiring introduced: `generateDocs()` called from `initCommand()` after config write; `spawnAgent()` spawns `claude` subprocess via `child_process.spawn`
- What remains before the milestone is truly usable end-to-end: S04 (skill installation), S05 (rollback + dry-run behavior + debug logging)

## Tasks

- [x] **T01: Build agent spawner, framework adapters, and doc generator** `est:1h30m`
  - Why: Creates the core generation engine — the agent spawner that shells out to Claude Code, the prompt templates per framework, and the orchestrator that ties them together. This is the slice's critical path and must be testable in isolation before CLI integration.
  - Files: `packages/core/src/types.ts`, `packages/core/src/agent.ts`, `packages/core/src/adapters.ts`, `packages/core/src/generator.ts`, `packages/core/src/index.ts`, `packages/core/test/agent.test.ts`, `packages/core/test/adapters.test.ts`, `packages/core/test/generator.test.ts`
  - Do: (1) Add `DocGrouping` type and optional `docGrouping` field to `DriftlessConfig`. (2) Build `spawnAgent()` using `child_process.spawn` with `claude -p --output-format json --no-session-persistence --tools ""`, stdin piping for test content, `--append-system-prompt` for format instructions, timeout with SIGTERM→SIGKILL escalation, JSON result parsing. (3) Build adapter functions (`plainMdPrompt`, `fumadocsPrompt`, `docusaurusPrompt`) returning system prompt fragments with format-specific frontmatter, callout/admonition syntax, and document structure rules. Build `getAdapterPrompt(framework)` dispatcher. (4) Build `generateDocs()` that resolves globs via `node:fs`, reads each test file, calls `spawnAgent()` with adapter prompt, writes output to configured dir using atomic write pattern, calls progress callback per file. (5) Re-export all new types and functions from barrel. (6) Write tests covering: spawn success/timeout/error/missing-binary, adapter format markers, generator glob→spawn→write pipeline with mocked spawner.
  - Verify: `npx vp test` passes all existing 44 tests + new core tests; `npx vp run -r build` passes
  - Done when: `spawnAgent`, `generateDocs`, and all adapter functions are exported from `@driftless/core` with passing tests covering success paths and error cases

- [x] **T02: Wire generation into init command with progress spinner** `est:45m`
  - Why: Connects the generation engine to the user-facing CLI flow. Without this, the engine exists but isn't reachable. This task proves R006 (progress-only UX) and closes the slice's demo condition.
  - Files: `packages/cli/src/commands/init.ts`, `packages/cli/test/init.test.ts`
  - Do: (1) After config write in `initCommand()`, check if `doc-generator` is in `config.capabilities`. If yes, start `@clack/prompts` spinner, call `generateDocs()` with a progress callback that updates spinner message (e.g., "Generating docs… login.spec.ts (3/12)"), stop spinner on completion or error. (2) Skip generation in dry-run mode. (3) Show generation summary in the outro note (files generated, errors, total cost if available). (4) Update init tests: verify generation is called when doc-generator selected, not called when absent, not called in dry-run. Mock `generateDocs` at the module level.
  - Verify: `npx vp test` — all tests pass; `npx vp run -r build` clean; `npx vp check` passes
  - Done when: init command runs generation with visible spinner progress when doc-generator capability is selected, skips cleanly otherwise, and all tests pass

## Files Likely Touched

- `packages/core/src/types.ts`
- `packages/core/src/agent.ts`
- `packages/core/src/adapters.ts`
- `packages/core/src/generator.ts`
- `packages/core/src/index.ts`
- `packages/core/test/agent.test.ts`
- `packages/core/test/adapters.test.ts`
- `packages/core/test/generator.test.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/test/init.test.ts`
