# S02: Test-generation workflow template — UAT

**Milestone:** M002
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The slice produces a YAML template function and init wiring — all outputs are testable by examining generated artifacts (YAML content, file system state). No runtime server or live GitHub Action needed.

## Preconditions

- Repository cloned and dependencies installed (`pnpm install`)
- Core package built (`cd packages/core && npx vp pack`)
- All 222 tests passing (`npx vp test`)

## Smoke Test

Run `npx vp test -- packages/core/test/workflows.test.ts` — 65 tests pass including the `testGenWorkflowTemplate` describe block.

## Test Cases

### 1. testGenWorkflowTemplate produces valid YAML

1. Import `testGenWorkflowTemplate` from `@driftless/core`
2. Call with valid config: `{ outputDir: "docs/", skillsDir: ".skills", testPaths: ["e2e/**/*.spec.ts"], capabilities: ["e2e-writer"], docFramework: "plain-md" }`
3. Parse result with `yaml.parse()`
4. **Expected:** Parses without error; result is an object with `name`, `on`, `permissions`, `jobs` keys

### 2. Workflow has correct name and job structure

1. Generate YAML from `testGenWorkflowTemplate` with valid config
2. Parse and inspect
3. **Expected:** `name` is `"Driftless Test Generation"`, `jobs` contains `generate-tests` key, job has `runs-on: ubuntu-latest`

### 3. Prompt references e2e-writer skill and git diff

1. Generate YAML and inspect the `generate-tests` job's claude-code-action step
2. Read the `prompt` field
3. **Expected:** Prompt contains `e2e-writer/SKILL.md`, `git diff HEAD~1`, references to `.driftless.json`, and instructions about detecting new user flows

### 4. Prompt biases toward suggesting tests (false positives < false negatives)

1. Generate YAML and inspect prompt content
2. **Expected:** Prompt contains explicit language about preferring to suggest a test that might not be needed over missing one that is

### 5. Operational edges present in generated YAML

1. Generate YAML from `testGenWorkflowTemplate`
2. Inspect for fork PR detection step, API key check step, bot loop prevention condition
3. **Expected:** YAML contains `github.event.pull_request.head.repo.fork`, `ANTHROPIC_API_KEY`, and `[bot]` or bot-loop condition in the `if` clause

### 6. Config parameterization

1. Generate YAML with config `{ skillsDir: "custom-skills", testPaths: ["tests/e2e/**/*.ts"] }`
2. **Expected:** Prompt references `custom-skills/e2e-writer/SKILL.md` and `tests/e2e/**/*.ts`

### 7. Init scaffolds test-gen workflow for e2e-writer capability

1. Run init with `capabilities: ["e2e-writer"]` in a temp directory
2. **Expected:** `.github/workflows/driftless-test-gen.yml` is created with valid YAML content

### 8. Init scaffolds both workflows when both capabilities selected

1. Run init with `capabilities: ["doc-generator", "e2e-writer"]` in a temp directory
2. **Expected:** Both `.github/workflows/driftless-doc-update.yml` and `.github/workflows/driftless-test-gen.yml` are created

### 9. Init dry-run shows correct workflow files

1. Run init with `{ capabilities: ["e2e-writer"], dryRun: true }`
2. **Expected:** Preview output includes `driftless-test-gen.yml` path. No files written to disk.

### 10. Init dry-run with both capabilities

1. Run init with `{ capabilities: ["doc-generator", "e2e-writer"], dryRun: true }`
2. **Expected:** Preview lists both `driftless-doc-update.yml` and `driftless-test-gen.yml`

## Edge Cases

### Invalid config — missing outputDir

1. Call `testGenWorkflowTemplate` with config missing `outputDir`
2. **Expected:** Throws error containing `testGenWorkflowTemplate:` and `outputDir`

### Invalid config — missing skillsDir

1. Call `testGenWorkflowTemplate` with config missing `skillsDir`
2. **Expected:** Throws error containing `testGenWorkflowTemplate:` and `skillsDir`

### Invalid config — empty testPaths

1. Call `testGenWorkflowTemplate` with `testPaths: []`
2. **Expected:** Throws error containing `testGenWorkflowTemplate:` and `testPaths`

### Neither capability selected — no workflows scaffolded

1. Run init with `capabilities: []`
2. **Expected:** No workflow files created in `.github/workflows/`

### No leftover template placeholders

1. Generate YAML from `testGenWorkflowTemplate` with valid config
2. Search output for `{{` or `}}`
3. **Expected:** No template placeholders found — all values are resolved

## Failure Signals

- Any test in `workflows.test.ts` or `init.test.ts` failing
- YAML parse errors when loading generated template output
- Missing `driftless-test-gen.yml` in `.github/workflows/` after init with e2e-writer capability
- Dry-run output still showing only `driftless-doc-update.yml` when e2e-writer is selected (hardcoded regression)
- Error messages from `testGenWorkflowTemplate` not containing the function name prefix

## Requirements Proved By This UAT

- R013 — PR-triggered e2e test generation workflow is scaffolded correctly with valid YAML, correct prompt, and operational edge handling
- R014 — Test-gen workflow uses `claude-code-action@v1` (verified by step content assertions)
- R015 — Full capability matrix (doc-only, test-only, both, neither) proven by init tests

## Not Proven By This UAT

- Live test-generation accuracy — whether the prompt actually produces good e2e tests from real PR diffs requires running the scaffolded workflow against a real repository with real PRs
- GitHub Actions runtime behavior — trigger firing, permissions working, checkout ref correctness in production environment

## Notes for Tester

- All 10 test cases and 5 edge cases are already automated in `packages/core/test/workflows.test.ts` (35 tests) and `packages/cli/test/init.test.ts` (capability matrix tests). Running `npx vp test` exercises all of them.
- The core dist rebuild requirement is a known friction point: if you modify `packages/core/src/` files, run `npx vp pack` in `packages/core/` before running CLI tests.
