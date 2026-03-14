---
estimated_steps: 5
estimated_files: 3
---

# T01: Build docUpdateWorkflowTemplate with staleness detection prompt and operational edges

**Slice:** S01 — Doc-update workflow template + init scaffolding
**Milestone:** M002

## Description

Create `packages/core/src/workflows.ts` with the `docUpdateWorkflowTemplate(config)` function that returns a complete GitHub Actions workflow YAML string. This is the highest-risk deliverable in the slice — it contains the staleness detection prompt (Claude must reason from git diff → affected features → stale docs) and all operational edge handling (fork PRs, missing API key, infinite loop prevention).

The template follows the same pattern as `skills.ts` (D035): a function that takes `DriftlessConfig` and returns a parameterized string. Internal helper functions structure the shared YAML fragments (permissions, checkout, edge conditions) so S02 can reuse them.

## Steps

1. Create `packages/core/src/workflows.ts` with internal helper functions: `permissionsBlock()`, `checkoutStep()`, `forkDetectionStep()`, `apiKeyCheckStep()`, `botLoopCondition()` — each returns a YAML fragment string
2. Implement `docUpdateWorkflowTemplate(config: DriftlessConfig): string` that assembles the full workflow YAML: name, `pull_request` trigger, job with bot-loop condition, permissions, fork detection step, API key check step, checkout step, and `claude-code-action@v1` step with the staleness detection prompt referencing `config.skillsDir`, `config.outputDir`, `config.testPaths`, and `.driftless.json`
3. Write the staleness detection prompt: instruct Claude to read the PR diff, identify which features/flows are affected, find docs in `outputDir` that cover those flows, determine if they're stale relative to the changes, update stale docs following the installed skill at `.skills/doc-generator/SKILL.md`, and post a PR comment summarizing changes
4. Export `docUpdateWorkflowTemplate` from `packages/core/src/index.ts`
5. Write `packages/core/test/workflows.test.ts` with tests covering: YAML structure (parses without error, has required top-level keys), permissions block content, checkout ref targets PR branch, claude-code-action step present with correct `uses:`, prompt contains git diff reasoning chain markers, prompt references config values (outputDir, skillsDir, testPaths), fork detection step present, API key check step present, bot-loop condition in job `if`, config parameterization (different config values produce different output)

## Must-Haves

- [ ] `docUpdateWorkflowTemplate` returns a string that parses as valid YAML
- [ ] YAML contains `on: pull_request` trigger
- [ ] Job has `if` condition preventing bot-authored triggers
- [ ] Permissions include `contents: write`, `pull-requests: write`, `id-token: write`
- [ ] Checkout step uses `${{ github.event.pull_request.head.ref }}` (PR branch, not merge commit)
- [ ] Fork PR detection step: skips with annotation when `head.repo.fork` is true
- [ ] API key check step: fails gracefully with annotation when `ANTHROPIC_API_KEY` is missing
- [ ] `claude-code-action@v1` step present with `anthropic_api_key` input
- [ ] Prompt instructs Claude to read git diff, reason about affected features, find stale docs, update using skill file
- [ ] Prompt references `.driftless.json` and `config.skillsDir` path
- [ ] Config values (outputDir, skillsDir, testPaths) are interpolated into the template output

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — all tests pass
- Template output can be parsed by a YAML parser (test uses `yaml` package or string assertions on structure)
- Each operational edge (fork, API key, bot loop) has at least one test asserting its presence in the output

## Observability Impact

- **New signal:** `docUpdateWorkflowTemplate` throws descriptive errors with config field context when required config values are missing or invalid — a future agent debugging init failures can inspect the error message to identify which config field caused the failure
- **Inspectable state:** The returned YAML string is the primary artifact — a future agent can parse it with a YAML library to inspect any field, step, or prompt content without reading source code
- **Failure visibility:** Invalid config inputs (e.g., empty `capabilities`, missing `outputDir`) produce thrown errors with the invalid field name in the message, not silent empty output

## Inputs

- `packages/core/src/types.ts` — `DriftlessConfig` interface (no changes needed)
- `packages/core/src/skills.ts` — reference pattern for template functions
- claude-code-action@v1 docs — YAML structure: `uses: anthropics/claude-code-action@v1`, inputs: `anthropic_api_key`, `prompt`, `claude_args`, permissions pattern

## Expected Output

- `packages/core/src/workflows.ts` — new module with `docUpdateWorkflowTemplate()` and internal helpers
- `packages/core/test/workflows.test.ts` — comprehensive test file (~15-20 tests)
- `packages/core/src/index.ts` — updated with workflow exports
