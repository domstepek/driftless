# S01: Doc-update workflow template + init scaffolding — UAT

**Milestone:** M002
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven + live-runtime)
- Why this mode is sufficient: Template output verified by unit tests (artifact-driven). Init integration verified by tests with real filesystem (artifact-driven). Live Action execution in a real GitHub repo is the runtime component — documented here but not gated for slice completion.

## Preconditions

- Repository cloned and dependencies installed (`pnpm install`)
- Both packages build clean (`npx vp run -r build`)
- All 185 tests pass (`npx vp test`)
- For live testing: a GitHub repo with `ANTHROPIC_API_KEY` set as a repo secret

## Smoke Test

Run `npx vp test -- packages/core/test/workflows.test.ts` — 30 tests pass, confirming the doc-update workflow template produces valid, correctly-structured YAML.

## Test Cases

### 1. Template produces valid YAML

1. Call `docUpdateWorkflowTemplate(validConfig)` where validConfig has `outputDir: "docs"`, `skillsDir: ".skills"`, `testPaths: ["tests/**/*.spec.ts"]`
2. Pass the returned string to `yaml.parse()`
3. **Expected:** Parses without error, returns an object with keys `name`, `on`, `jobs`

### 2. Workflow has correct PR trigger

1. Parse the template output as YAML
2. Inspect `on.pull_request`
3. **Expected:** `types` includes `opened` and `synchronize`

### 3. Permissions are correct

1. Parse the template output as YAML
2. Inspect `jobs.update-docs.permissions`
3. **Expected:** Contains `contents: write`, `pull-requests: write`, `id-token: write`

### 4. Checkout uses PR branch ref (not merge commit)

1. Parse the template output as YAML
2. Find the checkout step in `jobs.update-docs.steps`
3. **Expected:** Step uses `actions/checkout` with `ref: ${{ github.event.pull_request.head.ref }}`

### 5. Fork PR detection skips with annotation

1. Inspect the template output string
2. Look for a step that checks `github.event.pull_request.head.repo.fork`
3. **Expected:** Step exists, contains `::notice::` annotation about skipping fork PRs

### 6. Missing API key check with warning

1. Inspect the template output string
2. Look for a step that checks `secrets.ANTHROPIC_API_KEY`
3. **Expected:** Step exists, contains `::warning::` annotation about missing API key, exits with `exit 0`

### 7. Bot loop prevention

1. Parse the template output as YAML
2. Inspect the job-level `if` condition
3. **Expected:** Condition checks that `github.actor` does not end with `[bot]`

### 8. Claude-code-action step is present

1. Parse the template output as YAML
2. Find a step using `anthropics/claude-code-action@v1`
3. **Expected:** Step exists with `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}` and `allowed_tools` specified

### 9. Staleness detection prompt contains reasoning chain

1. Inspect the claude-code-action step's `prompt` input
2. **Expected:** Prompt mentions: reading `git diff`, identifying affected features, scanning for stale docs, updating using the skill file at `{skillsDir}/doc-generator/SKILL.md`, reading `.driftless.json` for config

### 10. Config values are injected into template

1. Call `docUpdateWorkflowTemplate` with `outputDir: "custom/docs"`, `skillsDir: "my-skills"`, `testPaths: ["e2e/**/*.cy.ts"]`
2. Inspect the output string
3. **Expected:** Output contains `custom/docs`, `my-skills`, and `e2e/**/*.cy.ts` — not hardcoded defaults

### 11. Init scaffolds workflow file with doc-generator capability

1. Run `driftless init` (or simulate via test) with `capabilities: ["doc-generator"]`
2. Check `.github/workflows/` directory
3. **Expected:** `driftless-doc-update.yml` exists, content matches `docUpdateWorkflowTemplate` output

### 12. Init skips workflow when doc-generator not selected

1. Run `driftless init` with `capabilities: ["e2e-writer"]` (no doc-generator)
2. Check `.github/workflows/` directory
3. **Expected:** No `driftless-doc-update.yml` created

### 13. Dry-run previews workflow path without writing

1. Run `driftless init --dry-run` with `capabilities: ["doc-generator"]`
2. Check console output and filesystem
3. **Expected:** Output mentions `.github/workflows/driftless-doc-update.yml` as a file that would be created. No actual file written.

### 14. Rollback removes workflow file on init failure

1. Simulate init failure after workflow file is written (e.g., agent harness check fails)
2. Check `.github/workflows/` directory
3. **Expected:** `driftless-doc-update.yml` is removed. `.github/workflows/` directory is removed if it was newly created.

### 15. Debug log contains workflows phase

1. Run `driftless init` with `capabilities: ["doc-generator"]`
2. Parse `.driftless/debug.log` as JSON
3. **Expected:** Array contains an entry with `phase: "workflows"`, `installed` array including `driftless-doc-update.yml`, and `workflowsDir` path

## Edge Cases

### Invalid config — empty outputDir

1. Call `docUpdateWorkflowTemplate` with `outputDir: ""`
2. **Expected:** Throws `Error` with message containing "config.outputDir"

### Invalid config — empty skillsDir

1. Call `docUpdateWorkflowTemplate` with `skillsDir: ""`
2. **Expected:** Throws `Error` with message containing "config.skillsDir"

### Invalid config — empty testPaths

1. Call `docUpdateWorkflowTemplate` with `testPaths: []`
2. **Expected:** Throws `Error` with message containing "config.testPaths"

### No capabilities selected

1. Run `driftless init` with `capabilities: []`
2. **Expected:** No workflow files written, no `.github/workflows/` directory created, no error

### No leftover template placeholders

1. Inspect template output for `{{...}}` patterns (excluding `${{ }}` GitHub Actions expressions)
2. **Expected:** No matches — all template variables are resolved from config

## Failure Signals

- `yaml.parse()` throws on template output → YAML structure is broken
- Any of the 185 tests fail → regression in template, init wiring, or existing functionality
- `.github/workflows/driftless-doc-update.yml` missing after init with doc-generator → capability gating or file write broken
- Debug log missing `workflows` phase → logging not wired correctly
- Rollback leaves orphaned workflow file → transaction registration broken

## Requirements Proved By This UAT

- R012 — contract-level proof that the doc-update workflow template contains correct structure, staleness detection prompt, and operational edges. Live accuracy is not proven.
- R014 — workflow template uses `anthropics/claude-code-action@v1` with correct inputs

## Not Proven By This UAT

- R012 live accuracy — whether the staleness detection prompt actually identifies stale docs in a real PR requires runtime testing with Claude in a real GitHub repo
- R013 — test-generation workflow is S02 scope
- Full capability matrix (doc-only + test-only + both) — S02 scope; S01 tests only doc-generator gating

## Notes for Tester

- Test cases 1–10 and the edge cases are all automated in `packages/core/test/workflows.test.ts` (30 tests). Running `npx vp test -- packages/core/test/workflows.test.ts` exercises all of them.
- Test cases 11–15 are automated in `packages/cli/test/init.test.ts` (8 new tests in the "workflow scaffolding" describe block). Running `npx vp test -- packages/cli/test/init.test.ts` exercises them.
- For live integration testing: push the scaffolded workflow to a real repo with `ANTHROPIC_API_KEY` as a secret, open a PR that changes a file covered by the test paths, and observe whether the action triggers and Claude's staleness analysis is reasonable. This is milestone-level UAT, not slice-level.
