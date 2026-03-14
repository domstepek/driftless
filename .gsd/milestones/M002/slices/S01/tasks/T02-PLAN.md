---
estimated_steps: 5
estimated_files: 5
---

# T02: Wire workflow scaffolding into init command with capability gating

**Slice:** S01 — Doc-update workflow template + init scaffolding
**Milestone:** M002

## Description

Connect the `docUpdateWorkflowTemplate` from T01 to the `driftless init` command so running init with `doc-generator` capability writes `.github/workflows/driftless-doc-update.yml` to the target repo. Follows the established `installSkills` pattern: an `installWorkflows(config, options)` function in core, called from the init command within the transaction boundary.

## Steps

1. Add `InstallWorkflowsOptions` and `InstallWorkflowsResult` interfaces to `packages/core/src/workflows.ts` (mirror `InstallSkillsOptions`/`InstallSkillsResult`). Implement `installWorkflows(config, options)` — maps `doc-generator` capability to `driftless-doc-update.yml`, writes to `{cwd}/.github/workflows/`, respects `dryRun` flag. Returns `{ installed: string[], workflowsDir: string }`.
2. Export `installWorkflows`, `InstallWorkflowsOptions`, `InstallWorkflowsResult` from `packages/core/src/index.ts`
3. Wire `installWorkflows` into `packages/cli/src/commands/init.ts`: call after skill installation, register `.github/workflows/` directory and workflow file(s) with `FileTransaction`, add `logger.log("workflows", ...)` entry, add workflow count to summary output note
4. Update dry-run branch in init to preview workflow file paths (e.g., "Workflows that would be scaffolded: .github/workflows/driftless-doc-update.yml")
5. Add init integration tests in `packages/cli/test/init.test.ts`: workflow file exists at `.github/workflows/driftless-doc-update.yml` after init, file content is valid YAML with claude-code-action step, no workflow file when `doc-generator` not in capabilities, dry-run shows workflow path without writing, rollback removes workflow file on init failure

## Must-Haves

- [ ] `installWorkflows` writes `.github/workflows/driftless-doc-update.yml` when `doc-generator` is in capabilities
- [ ] `installWorkflows` writes nothing when `doc-generator` is not in capabilities
- [ ] `installWorkflows` respects `dryRun: true` (no file writes)
- [ ] Init command calls `installWorkflows` within the transaction boundary
- [ ] Workflow files are registered with `FileTransaction` for rollback
- [ ] Dry-run preview includes workflow file paths
- [ ] Debug log includes `"workflows"` phase entry
- [ ] All 146 existing tests continue to pass

## Verification

- `npx vp test -- packages/cli/test/init.test.ts` — all existing + new tests pass
- `npx vp test` — full suite passes with zero regressions
- New tests verify: file presence, content validity, capability gating, dry-run, rollback

## Inputs

- `packages/core/src/workflows.ts` — `docUpdateWorkflowTemplate` from T01
- `packages/cli/src/commands/init.ts` — existing init command (wiring target)
- `packages/core/src/skills.ts` — `installSkills` pattern to follow
- `packages/cli/test/init.test.ts` — existing test structure (mock patterns, helpers)

## Expected Output

- `packages/core/src/workflows.ts` — extended with `installWorkflows()` function and types
- `packages/core/src/index.ts` — updated exports
- `packages/cli/src/commands/init.ts` — calls `installWorkflows`, registers with transaction, updates dry-run and summary
- `packages/cli/test/init.test.ts` — 5-8 new tests for workflow scaffolding integration

## Observability Impact

- **New debug log phase:** `"workflows"` entry in `.driftless/debug.log` captures which workflow files were installed and the target directory. A future agent can parse this to confirm workflow scaffolding ran and which files were produced.
- **Failure visibility:** `installWorkflows` inherits the init command's existing error/rollback path. If workflow writing fails, the error entry in the debug log will contain the exception message, and all tracked files (including workflows) are rolled back.
- **Dry-run inspection:** Running `driftless init --dry-run` with `doc-generator` capability now previews the workflow file paths that would be scaffolded, without writing. This is the cheapest way to verify capability gating without side effects.
- **Test signals:** New init integration tests assert: file presence at `.github/workflows/driftless-doc-update.yml`, YAML validity with `claude-code-action` step, capability gating (no file without `doc-generator`), dry-run preview, and rollback cleanup.
