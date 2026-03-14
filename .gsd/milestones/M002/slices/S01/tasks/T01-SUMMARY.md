---
id: T01
parent: S01
milestone: M002
provides:
  - docUpdateWorkflowTemplate function returning complete GitHub Actions YAML
  - Exported YAML-fragment helpers (permissionsBlock, checkoutStep, forkDetectionStep, apiKeyCheckStep, botLoopCondition) for S02 reuse
  - Staleness detection prompt with git-diff reasoning chain
  - Input validation with descriptive errors
key_files:
  - packages/core/src/workflows.ts
  - packages/core/test/workflows.test.ts
  - packages/core/src/index.ts
key_decisions:
  - "D040: Workflow YAML helpers exported for S02 reuse — fragment-builders avoid duplication while each template assembles its own YAML"
patterns_established:
  - "Workflow template functions follow same pattern as skill templates (D035): config in, YAML string out"
  - "GitHub Actions ${{ }} expressions in template strings use \\${{ to escape in JS template literals"
observability_surfaces:
  - "docUpdateWorkflowTemplate throws with config field name in message on invalid input (empty outputDir, skillsDir, or testPaths)"
  - "Template output is parseable YAML — future agents can inspect any field with yaml.parse()"
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Build docUpdateWorkflowTemplate with staleness detection prompt and operational edges

**Built `docUpdateWorkflowTemplate(config)` producing a complete GitHub Actions workflow YAML with staleness detection prompt, operational edge handling, and config parameterization. 30 tests, all passing.**

## What Happened

Created `packages/core/src/workflows.ts` with six exported helper functions that produce YAML fragments (permissions, checkout, fork detection, API key check, bot-loop condition) and the main `docUpdateWorkflowTemplate(config)` function that assembles them into a complete workflow.

The staleness detection prompt instructs Claude to: (1) read the PR diff via `git diff HEAD~1`, (2) identify affected features from changed tests/code/config, (3) scan `outputDir/` for stale docs, (4) update stale docs following the skill file at `skillsDir/doc-generator/SKILL.md`, and (5) post a PR comment summarizing changes.

Operational edges: fork PRs skip with `::notice::` annotation, missing API key exits with `::warning::` annotation, bot-authored PRs blocked by job-level `if` condition.

Added `yaml` as dev dependency of `@driftless/core` for YAML parse validation in tests.

Exported `docUpdateWorkflowTemplate` from `packages/core/src/index.ts`.

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — **30/30 pass**: YAML validity (parses without error), top-level keys (name, on, jobs), pull_request trigger, permissions (contents/pull-requests/id-token: write), bot-loop condition, checkout PR branch ref, fork detection step + annotation, API key check + warning annotation, claude-code-action@v1 step + anthropic_api_key input, prompt content (git diff, affected features, stale docs, skill file reference, .driftless.json), config parameterization (outputDir, skillsDir, testPaths), different configs produce different output, 3 error-path tests (empty outputDir/skillsDir/testPaths throw descriptive errors), no leftover template placeholders
- `npx vp test` — **176/176 pass**, zero regressions across all 12 test files
- Slice-level: `packages/cli/test/init.test.ts` not yet updated (T02 scope), existing 33 tests pass

## Diagnostics

- Parse the template output with `yaml.parse(docUpdateWorkflowTemplate(config))` to inspect any field
- Invalid config throws `Error` with field name in message (e.g., "config.outputDir is required but was empty or missing")
- Helper functions are independently callable for testing fragments

## Deviations

- Added `yaml` package as devDependency to `@driftless/core` for proper YAML parse validation in tests (plan said "yaml package or string assertions" — chose yaml for stronger guarantees)
- Test for `{{placeholder}}` needed adjustment to exclude `${{ }}` GitHub Actions expressions — these are intentional, not leftover templates

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/workflows.ts` — new module with `docUpdateWorkflowTemplate()`, staleness prompt, and 5 exported YAML-fragment helpers
- `packages/core/test/workflows.test.ts` — 30 tests covering YAML structure, operational edges, prompt content, parameterization, and error paths
- `packages/core/src/index.ts` — added `docUpdateWorkflowTemplate` export
- `packages/core/package.json` — added `yaml` dev dependency for tests
- `.gsd/milestones/M002/slices/S01/tasks/T01-PLAN.md` — added Observability Impact section (pre-flight fix)
- `.gsd/milestones/M002/slices/S01/S01-PLAN.md` — added failure-path verification step (pre-flight fix), marked T01 done
- `.gsd/DECISIONS.md` — appended D040 (exported workflow helpers for S02 reuse)
