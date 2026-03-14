---
estimated_steps: 6
estimated_files: 8
---

# T01: Build agent spawner, framework adapters, and doc generator

**Slice:** S03 — Agent-driven doc generation
**Milestone:** M001

## Description

Creates the core generation engine in `packages/core`: the agent spawner that invokes Claude Code CLI in headless mode, the framework adapter prompt templates that produce format-specific system prompts, and the generator orchestrator that ties glob resolution → file reading → agent invocation → doc writing into a single pipeline. All code is testable in isolation with mocked subprocesses — no Claude Code auth required for tests.

## Steps

1. **Extend types** — Add `DocGrouping` type (`"per-file"`) and optional `docGrouping` field to `DriftlessConfig` in `types.ts`. Add `AgentResult` interface (success, content, costUsd, error, durationMs, stderr, exitCode) and `GenerateResult` interface (filesGenerated, filesErrored, totalCostUsd, errors array, results array). Add `ProgressEvent` type (type, file, index, total, error) and `ProgressCallback` type.

2. **Build agent spawner** — Create `packages/core/src/agent.ts` exporting `spawnAgent(options)`. Implementation: spawn `claude` with args `["-p", "--output-format", "json", "--no-session-persistence", "--tools", ""]`, plus `--append-system-prompt` with the adapter's system prompt. Pipe test file content to stdin via `proc.stdin.write()` then `proc.stdin.end()`. Collect stdout/stderr into buffers. Set timeout (default 120s) via `setTimeout` → `proc.kill('SIGTERM')`, escalate to `SIGKILL` after 5s grace. On process exit: parse stdout as JSON, extract `result` field for content and `total_cost_usd` for cost. Return `AgentResult`. Handle: non-zero exit (error result with stderr), JSON parse failure (error result with raw stdout snippet), timeout (error result with "timed out" message), spawn error/missing binary (error result with spawn error message). Clean up all listeners on completion.

3. **Build framework adapters** — Create `packages/core/src/adapters.ts`. Export `plainMdPrompt()`, `fumadocsPrompt()`, `docusaurusPrompt()`, and `getAdapterPrompt(framework: DocFramework): string` dispatcher. Each prompt function returns a system prompt string instructing the agent on: (a) the output format (plain md with YAML frontmatter, Fumadocs MDX with `<Callout>` components and `title`/`description` frontmatter, Docusaurus MDX with `:::` admonitions and `id`/`title`/`description`/`sidebar_position` frontmatter), (b) the document structure (frontmatter → intro → numbered steps → common problems), (c) writing style rules (second person, bold UI elements, present tense). Derive structure from the training-material-writer reference skill, genericized to be framework-parameterized.

4. **Build generator orchestrator** — Create `packages/core/src/generator.ts` exporting `generateDocs(config, options)`. Implementation: resolve glob patterns from `config.testPaths` to actual file paths using `node:fs` readdir + minimatch (or simple glob). For each file: read content, call `spawnAgent()` with adapter prompt for `config.docFramework`, determine output filename (test file stem → `{stem}.md` or `{stem}.mdx` based on framework), write to `config.outputDir` using mkdir + writeFile (atomic write pattern). Accept an optional `ProgressCallback` and invoke it with start/complete/error events per file. Accumulate results into `GenerateResult`. Handle: glob resolving to zero files (return early with zero counts), individual file failures (log error, continue to next file), output dir creation.

5. **Update barrel exports** — Add re-exports for `AgentResult`, `GenerateResult`, `ProgressEvent`, `ProgressCallback`, `spawnAgent`, `generateDocs`, `getAdapterPrompt`, `plainMdPrompt`, `fumadocsPrompt`, `docusaurusPrompt` to `packages/core/src/index.ts`.

6. **Write tests** — Create `packages/core/test/agent.test.ts`: mock `child_process.spawn` to return a fake ChildProcess. Test cases: successful generation (mock stdout with valid JSON `{result: "...", total_cost_usd: 0.01}`), timeout (mock process that doesn't exit within timeout), non-zero exit code, spawn error (ENOENT for missing binary), partial/invalid JSON in stdout. Create `packages/core/test/adapters.test.ts`: verify `plainMdPrompt()` mentions YAML frontmatter and doesn't mention Callout or `:::`, `fumadocsPrompt()` mentions `<Callout>` and `title`/`description` frontmatter, `docusaurusPrompt()` mentions `:::` admonitions and `sidebar_position`, `getAdapterPrompt()` dispatches correctly and throws on unknown framework. Create `packages/core/test/generator.test.ts`: mock `spawnAgent` at the module level. Test: generates docs for resolved test files, creates output directory, writes files with correct names and content, calls progress callback in order, accumulates errors for failed files, returns zero-count result for empty glob.

## Must-Haves

- [ ] `spawnAgent()` correctly spawns `claude -p --output-format json` with stdin piping and timeout
- [ ] `spawnAgent()` handles all error cases: timeout, non-zero exit, missing binary, invalid JSON
- [ ] Three adapters produce distinct, correct format instructions (verified by marker assertions)
- [ ] `generateDocs()` resolves globs, spawns per file, writes output, calls progress callback
- [ ] `AgentResult` and `GenerateResult` types exported from core barrel
- [ ] All 44 existing tests still pass
- [ ] New tests cover success path and at least 3 error cases for spawner

## Verification

- `npx vp test` — all existing tests pass + new agent/adapters/generator tests pass
- `npx vp run -r build` — core package builds clean with new exports
- Agent test covers: success, timeout, spawn error (ENOENT), non-zero exit, invalid JSON (5 cases minimum)
- Adapter test verifies format-specific markers for all 3 frameworks
- Generator test verifies file write + progress callback + error accumulation

## Observability Impact

- Signals added: `AgentResult` captures per-invocation stdout, stderr, duration, cost, exit code — all available for S05 debug logging
- How a future agent inspects this: `AgentResult.error` for spawn failures, `AgentResult.stderr` for raw error output, `AgentResult.durationMs` for timeout diagnosis
- Failure state exposed: specific error type (timeout vs spawn failure vs JSON parse vs non-zero exit) in `AgentResult.error` message prefix

## Inputs

- `packages/core/src/types.ts` — existing `DriftlessConfig`, `DocFramework` types (extends these)
- `packages/core/src/config.ts` — atomic write pattern (reference for doc file writes)
- `packages/core/src/index.ts` — barrel exports (adds to these)
- S03 research — Claude Code CLI flags, JSON response schema, stdin piping approach
- Reference skill `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md` — document structure and writing style rules for prompt templates

## Expected Output

- `packages/core/src/types.ts` — extended with `DocGrouping`, `AgentResult`, `GenerateResult`, `ProgressEvent`, `ProgressCallback`
- `packages/core/src/agent.ts` — `spawnAgent()` with subprocess management, timeout, JSON parsing
- `packages/core/src/adapters.ts` — three framework prompt functions + dispatcher
- `packages/core/src/generator.ts` — `generateDocs()` orchestrator with glob, spawn, write, progress
- `packages/core/src/index.ts` — barrel re-exporting all new symbols
- `packages/core/test/agent.test.ts` — 5+ test cases covering success and error paths
- `packages/core/test/adapters.test.ts` — 4+ test cases (one per adapter + dispatcher)
- `packages/core/test/generator.test.ts` — 4+ test cases covering pipeline, progress, errors
