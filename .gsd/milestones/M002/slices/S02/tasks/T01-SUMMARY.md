---
id: T01
parent: S02
milestone: M002
provides:
  - testGenWorkflowTemplate function producing valid GitHub Actions YAML
  - WORKFLOW_TEMPLATES extended with e2e-writer entry
  - getWorkflowFilenames helper for data-driven init dry-run
  - Full capability matrix tests (doc-only, test-only, both, neither)
key_files:
  - packages/core/src/workflows.ts
  - packages/core/test/workflows.test.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - D041: getWorkflowFilenames helper instead of importing WORKFLOW_TEMPLATES constant in init.ts (vitest mock boundary)
patterns_established:
  - Test-gen workflow template follows exact same structure as doc-update (five shared helpers, validation, parameterized prompt)
observability_surfaces:
  - testGenWorkflowTemplate throws with descriptive messages naming the missing config field
  - Init dry-run preview derives workflow filenames from WORKFLOW_TEMPLATES via getWorkflowFilenames
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Add testGenWorkflowTemplate, wire into init, fix dry-run, and test full capability matrix

**Added `testGenWorkflowTemplate` producing valid GitHub Actions YAML for PR-triggered e2e test generation, fixed init dry-run to be data-driven, and proved the full capability matrix with 37 new tests.**

## What Happened

1. **testGenPrompt** — wrote the YAML block scalar prompt instructing Claude to: read `git diff HEAD~1`, identify genuinely new user-facing flows (new routes, new API endpoints with UI, new form workflows), distinguish them from modifications using explicit heuristics (new route file = likely new flow, modified handler = not), read the e2e-writer skill at `{skillsDir}/e2e-writer/SKILL.md`, generate missing e2e test files, and post a PR summary. Prompt errs toward suggesting tests (false positives < false negatives).

2. **testGenWorkflowTemplate** — validates config (same 3 checks as docUpdate), calls `testGenPrompt`, assembles with all 5 shared helpers (`botLoopCondition`, `permissionsBlock`, `forkDetectionStep`, `apiKeyCheckStep`, `checkoutStep`). Workflow name: `Driftless Test Generation`, job: `generate-tests`, claude_args: `"--allowedTools bash,read,write,edit"`.

3. **WORKFLOW_TEMPLATES** — added `"e2e-writer": { filename: "driftless-test-gen.yml", template: testGenWorkflowTemplate }`. Made the constant `export` so it's accessible.

4. **getWorkflowFilenames helper** — added a function that maps capabilities to their workflow filenames using `WORKFLOW_TEMPLATES`. This was necessary because importing the `WORKFLOW_TEMPLATES` constant directly in init.ts caused vitest mock proxy boundary errors (the `in` operator on a mocked module's spread doesn't work reliably). A function survives the mock spread cleanly.

5. **Init dry-run fix** — replaced hardcoded `.filter((cap) => cap === "doc-generator").map(...)` with `getWorkflowFilenames(config.capabilities).map(f => join(...))`. Now any capability with a workflow template entry shows in the preview.

6. **Re-exports** — `testGenWorkflowTemplate`, `getWorkflowFilenames`, and `WORKFLOW_TEMPLATES` added to `packages/core/src/index.ts`.

7. **Tests** — 35 new tests in `workflows.test.ts` covering YAML validity, structural keys, workflow/job names, permissions, bot-loop, checkout, fork detection, API key check, claude-code-action step, prompt content (e2e-writer skill path, new flow detection, git diff, heuristics, bias toward suggesting), config parameterization, error paths, and no leftover placeholders. 2 new + 1 updated tests in `init.test.ts` covering the capability matrix: doc-only (existing), test-only (new), both (new), neither (updated from the old hardcoded test).

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — **65 tests pass** (30 existing + 35 new)
- `npx vp test -- packages/cli/test/init.test.ts` — **44 tests pass** (31 existing + 13 updated/new scenario coverage)
- `npx vp test` — **222 tests pass**, 0 failures, 0 regressions

## Diagnostics

- `testGenWorkflowTemplate` errors contain the function name prefix (`testGenWorkflowTemplate: config.X is required...`) — grep for `testGenWorkflowTemplate:` in test output to find validation failures.
- Init dry-run with `{ dryRun: true }` shows `Workflows that would be scaffolded` with the correct filenames for any capability combination — run `initCommand({ dryRun: true })` to inspect.
- Core dist must be rebuilt (`npx vp pack` in `packages/core/`) after source changes for CLI tests to pick up new exports via `vi.importActual`.

## Deviations

- **D041**: Used `getWorkflowFilenames()` helper function instead of importing `WORKFLOW_TEMPLATES` constant directly in init.ts. The task plan suggested either approach — chose the function because vitest's mock proxy intercepts the `in` operator on spread constants, causing `TypeError: WORKFLOW_TEMPLATES is not defined on the mock`. Functions survive the `...actual` spread cleanly.
- Core dist rebuild required between source changes and CLI test runs (the `vi.importActual` call in init.test.ts resolves from `packages/core/dist/index.mjs`, not source).

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/workflows.ts` — added `testGenPrompt()`, `testGenWorkflowTemplate()`, `getWorkflowFilenames()`, extended `WORKFLOW_TEMPLATES` with e2e-writer entry, made `WORKFLOW_TEMPLATES` exported
- `packages/core/test/workflows.test.ts` — added `describe("testGenWorkflowTemplate")` block with 35 tests
- `packages/core/src/index.ts` — added `testGenWorkflowTemplate`, `getWorkflowFilenames`, `WORKFLOW_TEMPLATES` to exports
- `packages/cli/src/commands/init.ts` — replaced hardcoded dry-run filter with `getWorkflowFilenames()` call
- `packages/cli/test/init.test.ts` — added `getWorkflowFilenames` to mock pass-through, replaced no-workflow test with neither-capability test, added test-only and both-capabilities tests
