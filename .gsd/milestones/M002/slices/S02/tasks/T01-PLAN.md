---
estimated_steps: 8
estimated_files: 5
---

# T01: Add testGenWorkflowTemplate, wire into init, fix dry-run, and test full capability matrix

**Slice:** S02 — Test-generation workflow template
**Milestone:** M002

## Description

Add the test-generation workflow template function following the exact pattern established by `docUpdateWorkflowTemplate` in S01. Wire it into the `WORKFLOW_TEMPLATES` record, fix the hardcoded dry-run preview in init.ts, re-export from index.ts, and add comprehensive tests covering the template output and init integration for the full capability matrix.

The creative work is the test-generation prompt — it must instruct Claude to detect genuinely new user flows in a PR (vs modifications to existing flows) and generate missing e2e tests using the installed e2e-writer skill. The prompt should err on suggesting tests (false positives are less harmful than false negatives for test generation).

## Steps

1. **Write `testGenPrompt(config)`** in `workflows.ts` — a YAML block scalar prompt that instructs Claude to: read the PR diff via `git diff HEAD~1`, identify new user-facing flows (new routes/pages, new API endpoints with UI, new form workflows — as distinct from modifications to existing flows), read the e2e-writer skill at `{config.skillsDir}/e2e-writer/SKILL.md` for test conventions, generate missing e2e test files in the test paths, and post a PR summary comment. Include heuristics: new route/page = likely new flow, new API endpoint with UI = likely new flow, refactored existing code = likely not. Err toward suggesting tests.

2. **Write `testGenWorkflowTemplate(config)`** — validate config (same checks as docUpdate: outputDir, skillsDir, testPaths), call `testGenPrompt(config)`, assemble with the five shared helpers (`botLoopCondition`, `permissionsBlock`, `forkDetectionStep`, `apiKeyCheckStep`, `checkoutStep`). Workflow name: `Driftless Test Generation`. Job name: `generate-tests`. `claude_args: "--allowedTools bash,read,write,edit"`. Escape `${{ }}` as `\${{` in the template literal.

3. **Add `"e2e-writer"` entry to `WORKFLOW_TEMPLATES`** — `{ filename: "driftless-test-gen.yml", template: testGenWorkflowTemplate }`.

4. **Re-export `testGenWorkflowTemplate` from `index.ts`** — add to the existing workflows.ts export block.

5. **Fix init.ts dry-run** (lines 114-116) — replace the hardcoded `.filter((cap) => cap === "doc-generator").map(...)` with a data-driven approach. Options: (a) export `WORKFLOW_TEMPLATES` and use its keys, or (b) create and export a `getWorkflowFilenames(capabilities)` helper. Either way, the dry-run preview must show the correct workflow files for any capability combination. Prefer the simplest approach — importing the mapping or a small helper.

6. **Update init.test.ts** — (a) Update default mock at line 52-55 to handle both capabilities. (b) Update test at line 655 ("does not show workflow paths...") to instead assert that `e2e-writer`-only capabilities DO show the test-gen workflow in dry-run. (c) Add test for both-capabilities showing both workflows. (d) Add test for neither-capability (e.g. empty capabilities) showing no workflows.

7. **Add `describe("testGenWorkflowTemplate")` in workflows.test.ts** — mirror the S01 test structure with these assertion categories:
   - YAML validity: parses as valid YAML
   - Required keys: name, on, jobs present
   - Workflow name: `Driftless Test Generation`
   - Job name: `generate-tests`
   - Permissions: contents:write, pull-requests:write, id-token:write
   - Checkout: uses `actions/checkout@v4` with PR branch ref and `fetch-depth: 0`
   - Fork detection: step with `::notice::` annotation
   - API key check: step with `::warning::` annotation and `ANTHROPIC_API_KEY`
   - Bot-loop: job-level `if` with `endsWith(github.actor, '[bot]')`
   - claude-code-action: `anthropics/claude-code-action@v1` step with `anthropic_api_key` and `allowed_tools`
   - Prompt content: references e2e-writer skill path, mentions new flow detection, mentions git diff, mentions test generation
   - Parameterization: config values appear in output (testPaths, skillsDir, outputDir)
   - No leftover `{{placeholder}}` markers (excluding `${{ }}` GitHub Actions expressions)
   - Error paths: throws on empty outputDir, empty skillsDir, empty testPaths

8. **Run full test suite** — `npx vp test` — verify zero regressions from the 185 baseline, all new tests pass.

## Must-Haves

- [ ] `testGenWorkflowTemplate(config)` produces valid GitHub Actions YAML
- [ ] Prompt references the e2e-writer skill path (not embedded content), instructs new-flow detection with heuristics, instructs use of `git diff`
- [ ] Template reuses all five shared YAML-fragment helpers (identical operational edges to doc-update)
- [ ] `WORKFLOW_TEMPLATES` has `"e2e-writer"` entry with filename `driftless-test-gen.yml`
- [ ] `testGenWorkflowTemplate` re-exported from `packages/core/src/index.ts`
- [ ] Init dry-run preview is data-driven (not hardcoded to `doc-generator`)
- [ ] Init tests cover full capability matrix in dry-run: doc-only, test-only, both, neither
- [ ] Workflow template tests cover YAML validity, structural keys, prompt content, operational edges, parameterization, error paths
- [ ] Full test suite passes with zero regressions

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — all tests pass (existing 30 + new ~15-20)
- `npx vp test -- packages/cli/test/init.test.ts` — all tests pass (existing + updated/new)
- `npx vp test` — full suite passes, 0 failures

## Inputs

- `packages/core/src/workflows.ts` — existing `docUpdateWorkflowTemplate`, five shared helpers, `WORKFLOW_TEMPLATES` record, `stalenessPrompt` as pattern reference
- `packages/core/test/workflows.test.ts` — 30 existing tests as pattern for new tests
- `packages/core/src/index.ts` — current exports to extend
- `packages/cli/src/commands/init.ts` — lines 114-116 with the dry-run bug
- `packages/cli/test/init.test.ts` — lines 52-55 (default mock), line 655 (e2e-writer dry-run test)
- `packages/core/src/skills.ts` — `e2eWriterTemplate` (line 189) for understanding what the skill contains (prompt should reference it, not embed it)
- S01 forward intelligence — `${{ }}` escaping, YAML string assembly, leftover placeholder exclusion pattern

## Expected Output

- `packages/core/src/workflows.ts` — added `testGenPrompt()`, `testGenWorkflowTemplate()`, extended `WORKFLOW_TEMPLATES` with e2e-writer entry
- `packages/core/test/workflows.test.ts` — new `describe("testGenWorkflowTemplate")` block with ~15-20 tests
- `packages/core/src/index.ts` — `testGenWorkflowTemplate` added to exports
- `packages/cli/src/commands/init.ts` — dry-run workflow preview made data-driven
- `packages/cli/test/init.test.ts` — updated mock, updated/new tests for capability matrix

## Observability Impact

- **New error surface**: `testGenWorkflowTemplate` throws with descriptive messages naming the missing field (`outputDir`, `skillsDir`, or `testPaths`) — identical pattern to `docUpdateWorkflowTemplate`. Future agents can detect these in test output by grepping for `testGenWorkflowTemplate:`.
- **Dry-run preview made data-driven**: Init dry-run now derives workflow filenames from `WORKFLOW_TEMPLATES` keys rather than a hardcoded list. A future agent inspecting dry-run output will see correct filenames for any capability combination without code changes.
- **No new runtime processes or APIs** — all observability is through test assertions and structured error messages.
