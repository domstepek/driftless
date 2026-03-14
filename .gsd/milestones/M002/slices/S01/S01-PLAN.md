# S01: Doc-update workflow template + init scaffolding

**Goal:** `driftless init` with `doc-generator` capability scaffolds a production-ready `.github/workflows/driftless-doc-update.yml` into the target repo.
**Demo:** Run `driftless init` selecting `doc-generator` → `.github/workflows/driftless-doc-update.yml` exists with valid YAML containing correct permissions, PR-branch checkout, staleness detection prompt via `claude-code-action@v1`, and operational edge handling (fork PRs, missing API key, infinite loop prevention).

## Must-Haves

- `docUpdateWorkflowTemplate(config)` returns valid YAML string containing a `pull_request` trigger, required permissions (`contents: write`, `pull-requests: write`, `id-token: write`), PR-branch checkout (`ref: ${{ github.event.pull_request.head.ref }}`), and a `claude-code-action@v1` step
- The claude-code-action prompt instructs Claude to: read the git diff, reason about affected features, identify stale docs, update them using the installed `.skills/` files, and read `.driftless.json` for config
- Workflow handles fork PRs (skip with annotation when `head.repo.fork` is true), missing `ANTHROPIC_API_KEY` (early exit with annotation), and infinite loop prevention (skip when `github.actor` ends with `[bot]`)
- Shared helper patterns (permissions block, checkout step, fork detection, API key check, loop condition) are structured for S02 reuse
- `driftless init` writes the workflow file to `.github/workflows/driftless-doc-update.yml` when `doc-generator` is in `config.capabilities`
- `--dry-run` previews the workflow file path without writing
- All existing M001 tests continue to pass (no regressions)

## Proof Level

- This slice proves: contract + operational (template output content, YAML validity, init scaffolding, operational edge presence)
- Real runtime required: no (template output verified by unit tests; live Action execution is milestone-level UAT)
- Human/UAT required: yes — prompt quality and staleness detection accuracy require real PR testing (documented, not gated)

## Verification

- `npx vp test -- packages/core/test/workflows.test.ts` — template output tests: YAML validity, required keys (permissions, checkout ref, claude-code-action step), prompt content (git diff reasoning, skill file reference, config reference), operational edges (fork detection, API key check, loop prevention), parameterization (config values injected)
- `npx vp test -- packages/cli/test/init.test.ts` — init integration tests: workflow file written to correct path, capability gating (doc-generator yes, e2e-writer no, both writes doc-update only in S01), dry-run preview includes workflow path, rollback cleans up workflow file
- `npx vp test` — full suite passes (146 existing + new tests, zero regressions)
- Failure-path check: `workflows.test.ts` includes at least one test that verifies `docUpdateWorkflowTemplate` throws a descriptive error when given invalid config (inspectable failure state)

## Observability / Diagnostics

- Runtime signals: `DebugLogger` phase `"workflows"` entry captures which workflow files were written during init
- Failure visibility: workflow template functions throw with descriptive message if config is invalid; init catches and routes through existing error/rollback path
- Redaction constraints: none — workflow templates contain no secrets (API key is a `${{ secrets.* }}` reference)

## Integration Closure

- Upstream surfaces consumed: `DriftlessConfig` from `types.ts`, `installSkills` pattern from `skills.ts`, `FileTransaction`/`DebugLogger` from init command
- New wiring introduced in this slice: `workflows.ts` module in core, `installWorkflows()` called from init command, core `index.ts` re-exports
- What remains before the milestone is truly usable end-to-end: S02 adds `testGenWorkflowTemplate` and extends init to scaffold it alongside doc-update when both capabilities selected

## Tasks

- [x] **T01: Build docUpdateWorkflowTemplate with staleness detection prompt and operational edges** `est:1h`
  - Why: This is the core deliverable — the template function that produces the entire workflow YAML. Contains the staleness detection prompt (highest risk item) and all operational edge handling.
  - Files: `packages/core/src/workflows.ts`, `packages/core/test/workflows.test.ts`, `packages/core/src/index.ts`
  - Do: Create `workflows.ts` with `docUpdateWorkflowTemplate(config: DriftlessConfig): string` that returns a complete GitHub Actions YAML string. Build the staleness detection prompt that instructs Claude to read `git diff`, reason about affected features, find stale docs, and update them using `.skills/{doc-generator}/SKILL.md`. Include operational edges: fork PR skip (check `github.event.pull_request.head.repo.fork`), missing API key (check `secrets.ANTHROPIC_API_KEY`), infinite loop prevention (check `github.actor` for `[bot]` suffix). Structure shared helpers (permissions block, checkout step, edge conditions) as internal functions that S02 can extract. Export from `index.ts`. Write comprehensive tests asserting YAML validity (parse with `yaml` or regex), required keys, prompt content markers, operational edge markers, and config parameterization.
  - Verify: `npx vp test -- packages/core/test/workflows.test.ts` passes all new tests
  - Done when: Template produces valid YAML with all must-have content verified by passing tests

- [x] **T02: Wire workflow scaffolding into init command with capability gating** `est:45m`
  - Why: The template from T01 is dead code until init writes it to disk. This task connects the template to the user-facing `driftless init` flow following the established `installSkills` pattern.
  - Files: `packages/core/src/workflows.ts` (add `installWorkflows`), `packages/core/src/index.ts`, `packages/cli/src/commands/init.ts`, `packages/cli/test/init.test.ts`
  - Do: Add `installWorkflows(config, options)` function to `workflows.ts` following the `installSkills` pattern — takes config + `{ cwd, dryRun }`, writes `.github/workflows/driftless-doc-update.yml` when `doc-generator` is in capabilities, returns `{ installed: string[], workflowsDir: string }`. Wire into init command after skill installation: create `.github/workflows/` via transaction, call `installWorkflows`, register files with transaction for rollback. Add workflow path to dry-run preview. Add debug logger entry for `"workflows"` phase. Export from core `index.ts`. Add init integration tests: workflow file appears at correct path, content is valid, capability gating works (no workflow when doc-generator not selected), dry-run includes workflow path, rollback removes workflow file.
  - Verify: `npx vp test -- packages/cli/test/init.test.ts` passes all new + existing tests, `npx vp test` passes full suite
  - Done when: `driftless init` with `doc-generator` capability writes the workflow file, dry-run previews it, rollback cleans it up, and all 146+ tests pass

## Files Likely Touched

- `packages/core/src/workflows.ts` (new)
- `packages/core/test/workflows.test.ts` (new)
- `packages/core/src/index.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/test/init.test.ts`
