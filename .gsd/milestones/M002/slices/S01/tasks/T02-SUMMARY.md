---
id: T02
parent: S01
milestone: M002
provides:
  - "installWorkflows(config, options) function in core — writes .github/workflows/ files based on capabilities"
  - "Init command wired to scaffold workflows within transaction boundary, with dry-run preview and debug logging"
  - "8 new init integration tests covering workflow scaffolding, capability gating, dry-run, and rollback"
key_files:
  - packages/core/src/workflows.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - "Followed D039 — installWorkflows mirrors installSkills pattern exactly"
patterns_established:
  - "Capability → workflow mapping uses a WORKFLOW_TEMPLATES record (same shape as SKILL_TEMPLATES in skills.ts) for extensibility when S02 adds test-gen workflow"
  - "Dry-run workflow preview computed from capability list without calling installWorkflows (consistent with skill preview pattern)"
observability_surfaces:
  - "DebugLogger phase 'workflows' entry captures installed filenames and workflowsDir"
  - "Dry-run preview lists workflow paths that would be scaffolded"
duration: 15m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Wire workflow scaffolding into init command with capability gating

**Wired `installWorkflows` into `driftless init` — doc-generator capability now scaffolds `.github/workflows/driftless-doc-update.yml` with full transaction, dry-run, and debug logging support.**

## What Happened

Added `InstallWorkflowsOptions`, `InstallWorkflowsResult` interfaces and `installWorkflows()` function to `packages/core/src/workflows.ts`, mirroring the `installSkills` pattern. The function maps capabilities to workflow filenames via a `WORKFLOW_TEMPLATES` record, writes to `{cwd}/.github/workflows/`, and respects `dryRun`.

Wired into init command: called after skill installation, workflow files and `.github/workflows/` directory registered with `FileTransaction` for rollback, `"workflows"` phase logged to debug log, workflow count added to summary note. Dry-run branch computes workflow paths from capabilities and displays them without calling `installWorkflows`.

Exported `installWorkflows`, `InstallWorkflowsOptions`, `InstallWorkflowsResult` from core `index.ts`.

Added 8 new tests to `packages/cli/test/init.test.ts`: calls installWorkflows with correct args, skips in dry-run, skips when capabilities empty, summary includes workflow info, summary omits when none installed, debug log contains workflows phase, dry-run shows workflow paths, dry-run hides workflow paths when doc-generator not selected, and file registration with real writes.

## Verification

- `npx vp test -- packages/cli/test/init.test.ts` — 42 tests pass (34 existing + 8 new)
- `npx vp test` — 185 tests pass, zero regressions
- Slice-level checks:
  - ✅ `npx vp test -- packages/core/test/workflows.test.ts` — 30 tests pass (T01)
  - ✅ `npx vp test -- packages/cli/test/init.test.ts` — 42 tests pass (T01 existing + T02 new)
  - ✅ `npx vp test` — full suite 185 pass, zero regressions
  - ✅ Failure-path check: `workflows.test.ts` verifies `docUpdateWorkflowTemplate` throws descriptive errors on invalid config (from T01)

All slice-level verification checks pass. This is the final task of S01.

## Diagnostics

- Parse debug log at `.driftless/debug.log` for the `"workflows"` phase entry — contains `installed` array and `workflowsDir`
- Run `driftless init --dry-run` to see workflow paths that would be scaffolded without writing
- `installWorkflows` throws standard `Error` if the underlying template function rejects invalid config — error routes through init's catch/rollback path

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/workflows.ts` — added `InstallWorkflowsOptions`, `InstallWorkflowsResult` types, `WORKFLOW_TEMPLATES` map, and `installWorkflows()` function
- `packages/core/src/index.ts` — added exports for `installWorkflows`, `InstallWorkflowsOptions`, `InstallWorkflowsResult`
- `packages/cli/src/commands/init.ts` — imported `installWorkflows`/`InstallWorkflowsResult`, wired workflow scaffolding after skills with transaction registration, debug logging, summary line, and dry-run preview
- `packages/cli/test/init.test.ts` — added `installWorkflows` mock, `mockInstallWorkflows` reference, 8 new tests in "workflow scaffolding" describe block
- `.gsd/milestones/M002/slices/S01/tasks/T02-PLAN.md` — added Observability Impact section (pre-flight fix)
