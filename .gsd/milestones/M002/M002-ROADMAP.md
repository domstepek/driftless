# M002: GitHub Actions + PR Automation

**Vision:** Make training docs stay current automatically — PR-triggered workflows detect stale docs and update them, and optionally generate missing e2e tests, all powered by `claude-code-action@v1`.

## Success Criteria

- Running `driftless init` with `doc-generator` capability selected scaffolds a valid GitHub Actions workflow file at `.github/workflows/driftless-doc-update.yml` in the target repo
- Running `driftless init` with `e2e-writer` capability selected scaffolds a valid GitHub Actions workflow file at `.github/workflows/driftless-test-gen.yml` in the target repo
- Each scaffolded workflow contains correct PR trigger, permissions declarations, checkout of PR branch (not merge commit), and a claude-code-action step with a domain-specific prompt
- Each workflow handles operational edges: missing `ANTHROPIC_API_KEY` (early exit with annotation), fork PRs (skip gracefully), infinite loop prevention (skip bot-authored pushes)
- The workflow prompts reference the installed `.skills/` files and read `.driftless.json` for project config
- `--dry-run` shows workflow files that would be scaffolded

## Key Risks / Unknowns

- **Prompt quality for staleness detection** — the doc-update prompt must instruct Claude to reason from `git diff` → affected features → stale docs. This is semantic inference, not path matching. False negatives undermine the core promise.
- **claude-code-action YAML correctness** — permissions, checkout ref, allowed tools, and prompt format must all be exactly right or the workflow fails silently (no trigger, no error).

## Proof Strategy

- Prompt quality → retire in S01 by building the real doc-update workflow template with its production prompt. Prompt verified via test assertions on template output content, structural review of the reasoning chain. Live accuracy is UAT scope.
- YAML correctness → retire in S01 by asserting template output parses as valid YAML with required keys (permissions, checkout ref, claude-code-action step, allowed tools).

## Verification Classes

- Contract verification: Vitest unit tests for template output content, YAML structure, init scaffolding, capability gating, dry-run preview
- Integration verification: Manual UAT — push scaffolded workflow to a real repo, open a PR, observe the action trigger and behavior. Not automated in this milestone.
- Operational verification: Template output contains fork PR detection, missing API key check, infinite loop prevention. Verified by test assertions on YAML content.
- UAT / human verification: Prompt quality and staleness detection accuracy require real-world PR testing with Claude. Documented as milestone-level UAT.

## Milestone Definition of Done

This milestone is complete only when all are true:

- Both workflow templates produce valid GitHub Actions YAML with correct permissions, triggers, checkout, and claude-code-action configuration
- `driftless init` scaffolds the appropriate workflow file(s) into `.github/workflows/` based on the user's capability selection
- Workflow prompts instruct Claude to read `.driftless.json` config and use the installed `.skills/` files
- All operational edges (fork PR, missing API key, infinite loops) are handled in the workflow YAML
- `--dry-run` previews workflow files that would be created
- All existing M001 tests continue to pass (no regressions)
- New tests cover template content, YAML validity, init scaffolding, and capability gating

## Requirement Coverage

- Covers: R012 (doc staleness detection + update), R013 (e2e test generation), R014 (uses claude-code-action)
- Partially covers: R015 (already validated in M001 — M002 extends capability selection to workflow scaffolding)
- Leaves for later: none
- Orphan risks: none — all candidate requirements from research (infinite loop prevention, fork PR degradation, missing API key detection, PR summary comment, init scaffolds workflows) are addressed within S01/S02

## Slices

- [x] **S01: Doc-update workflow template + init scaffolding** `risk:high` `depends:[]`
  > After this: `driftless init` with doc-generator capability scaffolds `.github/workflows/driftless-doc-update.yml` containing a valid workflow with correct permissions, PR-branch checkout, staleness detection prompt via claude-code-action, and operational edge handling — proven by unit tests on template output and init integration tests.
- [x] **S02: Test-generation workflow template** `risk:low` `depends:[S01]`
  > After this: `driftless init` with e2e-writer capability scaffolds `.github/workflows/driftless-test-gen.yml` alongside the doc-update workflow when both capabilities are selected — proven by unit tests on template output and init integration tests.

## Boundary Map

### S01 → S02

Produces:
- `packages/core/src/workflows.ts` — `docUpdateWorkflowTemplate(config)` function returning valid YAML string, plus shared helpers for workflow YAML generation (permissions block, checkout step, fork detection step, API key check step, infinite loop condition)
- Init scaffolding pattern in `packages/cli/src/commands/init.ts` — transaction-wrapped write of `.github/workflows/` files keyed on `config.capabilities`
- `packages/core/src/types.ts` — no schema changes needed; existing `DriftlessConfig` fields are sufficient for workflow parameterization
- Test patterns in `packages/core/test/workflows.test.ts` — YAML validity assertions, content assertions, parameterization assertions

Consumes:
- nothing (first slice)

### S02 (final)

Produces:
- `testGenWorkflowTemplate(config)` function in `packages/core/src/workflows.ts`
- Init scaffolding extended to include test-gen workflow when `e2e-writer` capability is selected
- Full capability matrix tested (doc-only, test-only, both, neither)

Consumes:
- Shared workflow helpers from S01 (permissions block, checkout step, fork detection, API key check, loop prevention)
- Init scaffolding pattern from S01 (extend, don't rewrite)
