# S02: Test-generation workflow template

**Goal:** `driftless init` with `e2e-writer` capability scaffolds `.github/workflows/driftless-test-gen.yml` containing a valid GitHub Actions workflow for PR-triggered e2e test generation via claude-code-action@v1, reusing all shared infrastructure from S01.
**Demo:** Run tests — `testGenWorkflowTemplate` produces valid YAML with correct structure, prompt, and operational edges; init scaffolds the workflow for e2e-writer capability; full capability matrix (doc-only, test-only, both, neither) is proven by unit tests.

## Must-Haves

- `testGenWorkflowTemplate(config)` function produces valid GitHub Actions YAML with pull_request trigger, permissions, PR-branch checkout, fork detection, API key check, bot-loop prevention, and claude-code-action@v1 step
- Prompt instructs Claude to detect new user flows in a PR diff and generate missing e2e tests using the installed e2e-writer skill — references `.driftless.json` and `.skills/e2e-writer/SKILL.md`
- `WORKFLOW_TEMPLATES` record includes `"e2e-writer"` entry mapping to `testGenWorkflowTemplate` and filename `driftless-test-gen.yml`
- `testGenWorkflowTemplate` re-exported from `packages/core/src/index.ts`
- Init dry-run preview derives workflow paths from `WORKFLOW_TEMPLATES` (or equivalent data-driven mapping) instead of hardcoding `doc-generator`
- Init integration tests cover full capability matrix: doc-only, test-only, both, neither
- All existing tests continue to pass (185 baseline from S01)

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — new `testGenWorkflowTemplate` tests pass (YAML validity, structural keys, prompt content, operational edges, parameterization, error paths)
- `npx vp test -- packages/cli/test/init.test.ts` — updated/new tests pass (dry-run preview for all capability combos, e2e-writer workflow scaffolding)
- `npx vp test` — full suite passes, zero regressions

## Tasks

- [x] **T01: Add testGenWorkflowTemplate, wire into init, fix dry-run, and test full capability matrix** `est:30m`
  - Why: This is the entire slice — one template function, one WORKFLOW_TEMPLATES entry, one dry-run fix, one re-export, and tests proving it all works. The infrastructure is already generic; the work is additive.
  - Files: `packages/core/src/workflows.ts`, `packages/core/test/workflows.test.ts`, `packages/core/src/index.ts`, `packages/cli/src/commands/init.ts`, `packages/cli/test/init.test.ts`
  - Do: (1) Write `testGenPrompt(config)` — YAML block scalar prompt instructing Claude to detect new user flows in the PR diff and generate missing e2e tests using the installed e2e-writer skill; err on suggesting tests (false positives less harmful than false negatives). (2) Write `testGenWorkflowTemplate(config)` — assembles prompt with the five shared helpers, same validation as `docUpdateWorkflowTemplate`. Workflow name `Driftless Test Generation`, job name `generate-tests`. (3) Add `"e2e-writer": { filename: "driftless-test-gen.yml", template: testGenWorkflowTemplate }` to `WORKFLOW_TEMPLATES`. (4) Re-export `testGenWorkflowTemplate` from `index.ts`. (5) Fix init.ts dry-run (lines 114-116): replace hardcoded `doc-generator` filter with a data-driven lookup using an imported `WORKFLOW_TEMPLATES` or a `getWorkflowFilenames(capabilities)` helper. (6) Update init.test.ts: fix default mock to return both workflow filenames when both capabilities selected, update test at line 655 to expect e2e-writer shows the test-gen workflow, add tests for both-capabilities and neither-capabilities dry-run cases. (7) Add `describe("testGenWorkflowTemplate")` block in workflows.test.ts mirroring the S01 pattern: YAML validity, required keys, workflow name, permissions, checkout ref, fork detection, API key check, bot-loop condition, claude-code-action step, prompt content markers (e2e-writer skill path, new flow detection, git diff), parameterization from config, error paths for invalid config. (8) Run full test suite — zero regressions.
  - Verify: `npx vp test` — all tests pass including new ones
  - Done when: `testGenWorkflowTemplate` produces valid YAML, init scaffolds it for e2e-writer capability, dry-run preview works for all capability combos, full test suite passes

## Observability / Diagnostics

- **Workflow YAML validity**: All generated YAML is parsed with the `yaml` library in tests — parse failures produce descriptive errors with the config that triggered them.
- **Error messages**: `testGenWorkflowTemplate` throws with descriptive messages naming the missing field when `outputDir`, `skillsDir`, or `testPaths` are empty/missing. These messages are tested explicitly.
- **Init dry-run preview**: Dry-run mode logs which workflow files would be scaffolded, derived from `WORKFLOW_TEMPLATES` — a future agent can run `initCommand({ dryRun: true })` to see exactly what capabilities map to which workflow files.
- **Redaction**: No secrets or API keys appear in generated YAML values — only `${{ secrets.ANTHROPIC_API_KEY }}` references (GitHub Actions expression, not actual secret).

## Files Likely Touched

- `packages/core/src/workflows.ts`
- `packages/core/test/workflows.test.ts`
- `packages/core/src/index.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/test/init.test.ts`
