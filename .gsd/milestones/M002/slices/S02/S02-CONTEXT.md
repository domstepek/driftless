---
id: S02
milestone: M002
status: ready
---

# S02: Test-generation workflow template — Context

## Goal

`driftless init` with e2e-writer capability auto-scaffolds `.github/workflows/driftless-test-gen.yml` — a workflow that triggers on every PR, uses claude-code-action to detect new untested flows, generates e2e tests, commits them to the PR branch, and comments a summary.

## Why this Slice

S01 established the doc-update workflow and all shared infrastructure (helpers, init scaffolding pattern, operational edge handling). S02 layers the test-generation workflow on top, reusing those patterns. This completes M002's full capability: docs stay current AND test coverage expands automatically. S02 is low-risk because the YAML structure, init wiring, and edge handling are proven from S01 — the only new work is the test-gen prompt and the full capability matrix tests.

## Scope

### In Scope

- `testGenWorkflowTemplate(config)` function in `packages/core/src/workflows.ts` — returns valid YAML string, reuses shared helpers from S01
- Workflow triggers on every PR (same as doc-update) — Claude decides if a new flow exists that needs testing
- When tests are generated: commit directly to the PR branch (same as doc-update) + leave a PR comment summarizing what was generated
- When no new flows detected: silent skip — no commit, no comment, clean exit (same as doc-update)
- Generated test files placed in the same directory as existing tests (configured `testPaths`) — no separate subdirectory
- Workflow prompt references the installed `e2e-writer` skill and reads `.driftless.json` for test framework, test paths, and output dir
- Same operational edge handling as S01: fork PR detection, missing `ANTHROPIC_API_KEY`, infinite loop prevention
- Init scaffolding extended: when `e2e-writer` capability is selected, `.github/workflows/driftless-test-gen.yml` is scaffolded alongside doc-update (if both selected)
- `--dry-run` shows full YAML content for test-gen workflow (same as S01 pattern)
- Overwrite silently if workflow file already exists (same as S01)
- Full capability matrix tested: doc-only, test-only, both, neither — all combinations produce correct workflow file sets and init output

### Out of Scope

- Modifying the doc-update workflow or shared helpers from S01 (consume as-is unless a bug is found)
- Running generated tests as part of the workflow (Claude generates the test file; running it is the user's CI responsibility)
- Test quality validation (whether the generated test actually passes) — that's inherently a UAT concern
- Configurable thresholds for when test generation triggers (Claude decides based on the diff)

## Constraints

- Must reuse S01's shared workflow helpers — permissions block, checkout step, fork detection, API key check, loop prevention. Do not duplicate.
- Must follow the same `installWorkflows` pattern from S01 (D039) — extend, don't rewrite
- Test-gen workflow is a separate YAML file (`driftless-test-gen.yml`), not combined with the doc-update workflow — capabilities are independent (D013)
- Workflow prompt delegates to the `e2e-writer` skill for test-writing instructions — prompt stays minimal, skill has the domain knowledge

## Integration Points

### Consumes

- `packages/core/src/workflows.ts` — shared helpers from S01 (permissions, checkout, fork detection, API key check, loop prevention)
- `packages/cli/src/commands/init.ts` — init scaffolding pattern from S01 (extend to handle test-gen workflow)
- `packages/core/src/skills.ts` — `e2eWriterTemplate()` (already exists from M001/S04) — the skill the workflow prompt delegates to
- `packages/core/src/types.ts` — `DriftlessConfig` with `capabilities`, `testPaths`, `testFramework`

### Produces

- `testGenWorkflowTemplate(config)` function in `packages/core/src/workflows.ts`
- Init scaffolding for `.github/workflows/driftless-test-gen.yml`
- Full capability matrix test coverage in `packages/core/test/workflows.test.ts`
- Init integration tests covering both-capabilities, test-only, and neither scenarios

## Open Questions

- **New flow heuristics in the prompt:** How explicit should the prompt be about what constitutes a "new flow"? Current thinking: provide heuristics (new route file = likely new flow, new page component = likely new flow, modified existing test = probably not a new flow) but let Claude make the final judgment. The e2e-writer skill already covers test structure conventions.
