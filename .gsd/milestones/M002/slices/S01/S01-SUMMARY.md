---
id: S01
parent: M002
milestone: M002
provides:
  - "docUpdateWorkflowTemplate(config) — produces complete GitHub Actions YAML for PR-triggered doc staleness detection via claude-code-action@v1"
  - "installWorkflows(config, options) — writes workflow files to .github/workflows/ based on capabilities, with dry-run support"
  - "Five exported YAML-fragment helpers (permissionsBlock, checkoutStep, forkDetectionStep, apiKeyCheckStep, botLoopCondition) for S02 reuse"
  - "Init command wired to scaffold workflows within transaction boundary, with capability gating, rollback, debug logging, and dry-run preview"
requires:
  - slice: none
    provides: first slice
affects:
  - S02
key_files:
  - packages/core/src/workflows.ts
  - packages/core/test/workflows.test.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - "D039: installWorkflows mirrors installSkills pattern — consistent API surface"
  - "D040: Workflow YAML helpers exported for S02 reuse — fragment-builders avoid duplication"
patterns_established:
  - "Workflow template functions: config in, YAML string out (same as skill templates per D035)"
  - "WORKFLOW_TEMPLATES record maps capabilities to {filename, templateFn} — extensible for S02"
  - "GitHub Actions ${{ }} expressions escaped as \\${{ in JS template literals"
observability_surfaces:
  - "DebugLogger phase 'workflows' entry captures installed filenames and workflowsDir"
  - "docUpdateWorkflowTemplate throws with config field name in message on invalid input"
  - "Dry-run preview lists workflow paths that would be scaffolded"
drill_down_paths:
  - .gsd/milestones/M002/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M002/slices/S01/tasks/T02-SUMMARY.md
duration: 35m
verification_result: passed
completed_at: 2026-03-14
---

# S01: Doc-update workflow template + init scaffolding

**`driftless init` with doc-generator capability now scaffolds a production-ready `.github/workflows/driftless-doc-update.yml` containing PR-triggered staleness detection via claude-code-action@v1, with operational edge handling for fork PRs, missing API key, and infinite loop prevention.**

## What Happened

**T01** built the core `docUpdateWorkflowTemplate(config)` function in `packages/core/src/workflows.ts`. It produces a complete GitHub Actions workflow YAML string with: `pull_request` trigger, required permissions (`contents: write`, `pull-requests: write`, `id-token: write`), PR-branch checkout (not merge commit), fork PR detection with `::notice::` annotation, missing `ANTHROPIC_API_KEY` check with `::warning::` annotation, bot-loop prevention via job-level `if` condition, and a `claude-code-action@v1` step with a staleness detection prompt. The prompt instructs Claude to read the git diff, reason about affected features, scan for stale docs, update them following the installed skill file, and post a PR summary comment. Five YAML-fragment helpers were exported for S02 reuse. Added `yaml` as a devDependency for parse validation in tests. 30 tests covering YAML validity, structural keys, prompt content markers, operational edges, parameterization, and error paths.

**T02** wired the template into `driftless init` via `installWorkflows(config, options)` — following the same pattern as `installSkills`. The function maps capabilities to workflow filenames via a `WORKFLOW_TEMPLATES` record, writes to `.github/workflows/`, and respects `dryRun`. Init calls it after skill installation, registers files with `FileTransaction` for rollback, logs to debug logger under the `"workflows"` phase, and adds workflow count to the summary note. Dry-run computes workflow paths from capabilities without calling `installWorkflows`. 8 new integration tests.

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — 30/30 pass (YAML validity, required keys, prompt content, operational edges, parameterization, error paths)
- `npx vp test -- packages/cli/test/init.test.ts` — 42/42 pass (34 existing + 8 new: workflow scaffolding, capability gating, dry-run, rollback, debug logging)
- `npx vp test` — 185/185 pass across 12 test files, zero regressions from M001's 146 baseline
- Failure-path: `workflows.test.ts` verifies `docUpdateWorkflowTemplate` throws descriptive errors on invalid config (empty outputDir, skillsDir, testPaths)

## Requirements Advanced

- R012 (doc staleness detection + update) — workflow template produces the complete YAML with staleness detection prompt. Live runtime accuracy is milestone-level UAT.
- R014 (uses claude-code-action) — template output contains `anthropics/claude-code-action@v1` step with correct inputs

## Requirements Validated

- R012 — contract-level: template output verified by 30 unit tests covering YAML structure, prompt reasoning chain, operational edges, and config parameterization. Live accuracy deferred to integration UAT.
- R014 — template output contains claude-code-action@v1 step with `anthropic_api_key` input and `allowed_tools` — verified by unit tests

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Added `yaml` package as devDependency (plan allowed "yaml or regex" — chose yaml for stronger parse guarantees)
- Test for leftover `{{placeholder}}` markers needed adjustment to exclude `${{ }}` GitHub Actions expressions (intentional, not leftover)

## Known Limitations

- Staleness detection prompt quality is verified structurally (correct reasoning chain in prompt text) but not for live accuracy — real-world PR testing is milestone-level UAT
- Only `doc-generator` capability triggers a workflow in S01; `e2e-writer` capability workflow is S02 scope

## Follow-ups

- S02: Add `testGenWorkflowTemplate` reusing the exported YAML-fragment helpers, extend init to scaffold both workflows when both capabilities selected, test full capability matrix

## Files Created/Modified

- `packages/core/src/workflows.ts` — new module: `docUpdateWorkflowTemplate()`, `installWorkflows()`, 5 exported YAML-fragment helpers, types
- `packages/core/test/workflows.test.ts` — 30 tests for template output
- `packages/core/src/index.ts` — re-exports for template function, install function, and types
- `packages/core/package.json` — added `yaml` devDependency
- `packages/cli/src/commands/init.ts` — wired workflow scaffolding after skills: transaction, debug logging, summary, dry-run preview
- `packages/cli/test/init.test.ts` — 8 new tests in "workflow scaffolding" describe block

## Forward Intelligence

### What the next slice should know
- `WORKFLOW_TEMPLATES` in `workflows.ts` is a record mapping `capability → { filename, templateFn }`. S02 adds a `"e2e-writer"` entry pointing to `testGenWorkflowTemplate` — no structural changes needed.
- The five exported helpers (`permissionsBlock`, `checkoutStep`, `forkDetectionStep`, `apiKeyCheckStep`, `botLoopCondition`) are ready to call from `testGenWorkflowTemplate`. The only new code in S02 is the test-gen-specific prompt and the template assembly function.
- Init's `installWorkflows` already iterates over all capabilities in config — adding a new template to `WORKFLOW_TEMPLATES` automatically makes it installable.
- Dry-run preview also iterates capabilities → workflow filenames, so it picks up new entries automatically.

### What's fragile
- GitHub Actions `${{ }}` expressions in JS template literals require `\${{` escaping — easy to miss when writing the S02 prompt. T01's test for leftover `{{placeholder}}` intentionally excludes `${{ }}`; S02 should follow the same pattern.
- The YAML is string-assembled, not object-then-serialized. This is fine for templates but means indentation errors in the template literal produce invalid YAML. The `yaml.parse()` test catches this.

### Authoritative diagnostics
- `yaml.parse(docUpdateWorkflowTemplate(config))` — parses the template output into a JS object for field-level inspection
- `npx vp test -- packages/core/test/workflows.test.ts` — 30 tests are the fastest signal for any regression in template output

### What assumptions changed
- None — plan executed as written with minor deviations noted above
