# S03: Agent-driven doc generation — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: All generation logic is tested with mocked subprocesses. Real Claude Code invocation requires auth and is milestone-level UAT — this slice proves the pipeline mechanics (spawn → parse → write → report) work correctly.

## Preconditions

- Repository cloned and dependencies installed (`pnpm install`)
- Vite+ available (`npx vp --version` prints a version)
- All 89 tests passing (`npx vp test`)
- Both packages building clean (`npx vp run -r build`)

## Smoke Test

Run `npx vp test` — all 89 tests pass across 8 test files. This confirms the full generation pipeline (agent spawner, adapters, generator, init integration) is wired correctly.

## Test Cases

### 1. Agent spawner handles successful Claude Code invocation

1. Review `packages/core/test/agent.test.ts` — "returns parsed result on success" test case
2. Confirm the test mocks `child_process.spawn`, feeds JSON stdout `{"result":"# Generated doc","cost_usd":0.01,"duration_ms":1500}`, and emits exit code 0
3. **Expected:** `AgentResult` has `result` = "# Generated doc", `costUsd` = 0.01, `durationMs` populated, `exitCode` = 0, `error` = undefined

### 2. Agent spawner handles timeout with SIGTERM→SIGKILL escalation

1. Review `packages/core/test/agent.test.ts` — timeout and kill escalation test cases
2. Confirm timeout fires SIGTERM first, then SIGKILL after grace period
3. **Expected:** `AgentResult` has `error` containing "timed out", `exitCode` = null

### 3. Agent spawner handles missing claude binary

1. Review `packages/core/test/agent.test.ts` — spawn error (ENOENT) test case
2. Confirm mock emits 'error' event with code ENOENT
3. **Expected:** `AgentResult` has `error` containing "spawn error", `result` = ""

### 4. Framework adapters produce correct format markers

1. Review `packages/core/test/adapters.test.ts` — all 22 test cases
2. Verify plain-md prompt includes "YAML frontmatter" and ".md" extension references
3. Verify fumadocs prompt includes "MDX", "Callout" component syntax, ".mdx" extension
4. Verify docusaurus prompt includes "MDX", ":::" admonition syntax, ".mdx" extension
5. **Expected:** Each adapter produces distinct format instructions; `getAdapterPrompt` dispatches correctly; unknown framework throws

### 5. Generator resolves globs and orchestrates per-file generation

1. Review `packages/core/test/generator.test.ts` — multi-file generation test
2. Confirm test sets up a temp dir with test files matching glob patterns
3. Confirm `generateDocs()` calls the mocked spawner once per matched file
4. **Expected:** Output files written to configured `docsOutputDir` with correct names (test suffixes stripped), correct extensions per framework

### 6. Generator handles per-file errors without stopping

1. Review `packages/core/test/generator.test.ts` — error accumulation test
2. Confirm one file fails (spawner returns error) and subsequent files still process
3. **Expected:** `GenerateResult.errors` contains the failed file entry; `GenerateResult.filesGenerated` counts only successes; generator continues past failures

### 7. Generator reports progress events

1. Review `packages/core/test/generator.test.ts` — progress callback test
2. Confirm callback receives "start" event with file path and index before each file
3. Confirm callback receives "complete" or "error" event after each file
4. **Expected:** Events arrive in order: start(0) → complete/error(0) → start(1) → complete/error(1) → ...

### 8. Init command calls generation when doc-generator capability selected

1. Review `packages/cli/test/init.test.ts` — generation integration tests
2. Confirm `generateDocs` is called with correct config and cwd when capabilities include "doc-generator"
3. **Expected:** `generateDocs` called once with matching config; spinner started and stopped

### 9. Init command skips generation when doc-generator not selected

1. Review `packages/cli/test/init.test.ts` — generation skipped test
2. Confirm capabilities = ["e2e-writer"] only
3. **Expected:** `generateDocs` never called; no spinner created

### 10. Init command skips generation in dry-run mode

1. Review `packages/cli/test/init.test.ts` — dry-run generation test
2. Confirm dry-run flag is true and doc-generator is in capabilities
3. **Expected:** `generateDocs` never called; log message indicates generation would run

### 11. Init shows error summary for failed/partial generation

1. Review `packages/cli/test/init.test.ts` — all-failed and partial-failure tests
2. Confirm all-failed case shows error spinner stop message with code 1
3. Confirm partial failure shows warning with counts (e.g., "Generated 2 docs (1 error)")
4. **Expected:** Per-file errors logged via `p.log.warn()`; summary note includes generation stats

## Edge Cases

### Empty glob matches zero files

1. Review `packages/core/test/generator.test.ts` — empty glob test
2. Confirm glob pattern matches no files in the test directory
3. **Expected:** `GenerateResult` returns immediately with `filesGenerated: 0`, `errors: []`; no spawner calls made

### Invalid JSON in agent stdout

1. Review `packages/core/test/agent.test.ts` — invalid JSON and partial JSON tests
2. Confirm agent emits non-JSON or truncated JSON to stdout
3. **Expected:** `AgentResult.error` contains "invalid JSON", `result` = ""

### Output filename strips test suffixes

1. Review `packages/core/test/generator.test.ts` — suffix stripping test
2. Confirm `login.spec.ts` → `login.md`, `checkout.test.ts` → `checkout.md`, `flow.e2e.ts` → `flow.md`, `signup.cy.ts` → `signup.md`
3. **Expected:** All common test suffixes (.spec, .test, .e2e, .cy) removed from output filenames

### Output directory created if missing

1. Review `packages/core/test/generator.test.ts` — output dir creation test
2. Confirm the configured `docsOutputDir` does not exist before generation
3. **Expected:** Directory created recursively; output files written successfully

## Failure Signals

- `npx vp test` reports fewer than 89 passing tests
- `npx vp run -r build` fails for either package
- `npx vp check` reports lint or format errors
- `AgentResult` types missing from `@driftless/core` exports
- `generateDocs` import fails in init command
- Spinner not created/stopped in init generation flow
- `GenerateResult.errors` doesn't accumulate per-file failures

## Requirements Proved By This UAT

- R002 — Agent-driven interpretation with no framework-specific parsers (adapter prompts are generic)
- R003 — CLI spawns Claude Code headless, receives structured results, generates docs per file
- R004 — Three adapter prompt templates produce framework-specific format instructions
- R006 — Spinner shows file-by-file progress; agent output hidden from user

## Not Proven By This UAT

- Live Claude Code invocation with real API auth — requires milestone-level UAT with real e2e test files
- Generated doc quality and accuracy — requires human review of real output
- Performance under large test suites (100+ files) — not tested
- `docGrouping` modes beyond "per-file" — only default mode implemented

## Notes for Tester

- All tests use mocked subprocesses — no Claude Code binary or API key needed to run the test suite
- The generation pipeline is designed to be testable in isolation: mock `spawnAgent` and the entire flow exercises
- To test live generation, you'd need Claude Code CLI installed and authenticated, then run `driftless init` in a repo with e2e tests
- The adapter prompts are long strings — review them in `packages/core/src/adapters.ts` for format correctness rather than trying to test prompt quality via unit tests
