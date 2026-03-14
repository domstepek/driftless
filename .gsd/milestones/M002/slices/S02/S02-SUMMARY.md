---
id: S02
parent: M002
milestone: M002
provides:
  - testGenWorkflowTemplate function producing valid GitHub Actions YAML for e2e test generation
  - WORKFLOW_TEMPLATES extended with e2e-writer entry (data-driven capability→workflow mapping)
  - getWorkflowFilenames helper for data-driven init dry-run preview
  - Full capability matrix tests (doc-only, test-only, both, neither)
requires:
  - slice: S01
    provides: Shared workflow helpers (permissionsBlock, checkoutStep, forkDetectionStep, apiKeyCheckStep, botLoopCondition), init scaffolding pattern, YAML template structure
affects: []
key_files:
  - packages/core/src/workflows.ts
  - packages/core/test/workflows.test.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - "D041: getWorkflowFilenames helper instead of importing WORKFLOW_TEMPLATES constant in init.ts (vitest mock boundary)"
patterns_established:
  - Test-gen workflow template follows exact same structure as doc-update (five shared helpers, validation, parameterized prompt)
  - WORKFLOW_TEMPLATES as a data-driven registry for capability-to-workflow mapping
observability_surfaces:
  - testGenWorkflowTemplate throws with descriptive messages naming the missing config field
  - Init dry-run preview derives workflow filenames from WORKFLOW_TEMPLATES via getWorkflowFilenames
drill_down_paths:
  - .gsd/milestones/M002/slices/S02/tasks/T01-SUMMARY.md
duration: 20m
verification_result: passed
completed_at: 2026-03-14
---

# S02: Test-generation workflow template

**`testGenWorkflowTemplate` produces valid GitHub Actions YAML for PR-triggered e2e test generation, init scaffolds it for e2e-writer capability, and dry-run preview is now fully data-driven across all capability combinations.**

## What Happened

Added `testGenWorkflowTemplate(config)` to `packages/core/src/workflows.ts`, mirroring the S01 `docUpdateWorkflowTemplate` structure. The function validates config (outputDir, skillsDir, testPaths), builds a YAML block scalar prompt instructing Claude to detect new user flows in the PR diff and generate missing e2e tests using the installed e2e-writer skill, then assembles the workflow with all five shared helpers. Workflow name: `Driftless Test Generation`, job: `generate-tests`.

Extended `WORKFLOW_TEMPLATES` with `"e2e-writer": { filename: "driftless-test-gen.yml", template: testGenWorkflowTemplate }`. Added `getWorkflowFilenames(capabilities)` helper to map capabilities to workflow filenames — needed because importing the `WORKFLOW_TEMPLATES` constant directly in init.ts caused vitest mock proxy boundary errors. The init dry-run was updated from a hardcoded `doc-generator` filter to use `getWorkflowFilenames`, making it work for any capability combination.

35 new tests in `workflows.test.ts` cover YAML validity, structural keys, prompt content markers (e2e-writer skill path, new flow detection, git diff, heuristics, bias toward suggesting), parameterization, and error paths. 2 new + 1 updated test in `init.test.ts` cover the full capability matrix (doc-only, test-only, both, neither).

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — 65 tests pass (30 S01 + 35 S02)
- `npx vp test -- packages/cli/test/init.test.ts` — 44 tests pass (capability matrix covered)
- `npx vp test` — 222 tests pass, 0 failures, 0 regressions from M001 baseline (185) + S01 additions (37)

## Requirements Advanced

- R013 — `testGenWorkflowTemplate` produces valid YAML with correct structure, prompt, and operational edges; init scaffolds it for e2e-writer capability
- R014 — test-gen workflow uses `claude-code-action@v1` (already validated by S01, now also proven for second workflow)

## Requirements Validated

- R013 — Full test coverage: YAML validity, structural keys, prompt content, parameterization, error paths, capability gating in init, dry-run preview

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- D041: Used `getWorkflowFilenames()` helper function instead of importing `WORKFLOW_TEMPLATES` constant directly in init.ts. vitest's mock proxy intercepts the `in` operator on spread constants. Functions survive the mock boundary cleanly.

## Known Limitations

- Live test-generation accuracy (does the prompt produce good tests from real PR diffs?) is milestone-level UAT, not automated. Template structure and prompt content are proven; prompt effectiveness requires real-world testing.
- Core dist must be rebuilt (`npx vp pack` in `packages/core/`) after source changes for CLI tests to pick up new exports via `vi.importActual`.

## Follow-ups

- none — S02 is the final slice in M002

## Files Created/Modified

- `packages/core/src/workflows.ts` — added `testGenPrompt()`, `testGenWorkflowTemplate()`, `getWorkflowFilenames()`, extended `WORKFLOW_TEMPLATES`
- `packages/core/test/workflows.test.ts` — added 35 tests for testGenWorkflowTemplate
- `packages/core/src/index.ts` — added `testGenWorkflowTemplate`, `getWorkflowFilenames`, `WORKFLOW_TEMPLATES` to exports
- `packages/cli/src/commands/init.ts` — replaced hardcoded dry-run filter with `getWorkflowFilenames()` call
- `packages/cli/test/init.test.ts` — added capability matrix tests (test-only, both, neither)

## Forward Intelligence

### What the next slice should know
- M002 is complete. Both workflow templates and init scaffolding are done. The next milestone (M003) focuses on OSS maturity and npm publishing — no dependencies on workflow template internals.

### What's fragile
- Core dist rebuild requirement — CLI tests import from `packages/core/dist/index.mjs` via `vi.importActual`. Source changes without `npx vp pack` will cause test failures with stale exports.

### Authoritative diagnostics
- `npx vp test -- packages/core/test/workflows.test.ts` — 65 tests cover both workflow templates comprehensively
- `npx vp test -- packages/cli/test/init.test.ts` — 44 tests cover the full init flow including capability matrix

### What assumptions changed
- none — S02 was straightforward additive work as planned
