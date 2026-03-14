---
id: S01
milestone: M002
status: ready
---

# S01: Doc-update workflow template + init scaffolding — Context

## Goal

`driftless init` with doc-generator capability auto-scaffolds a valid `.github/workflows/driftless-doc-update.yml` that triggers on every PR, uses claude-code-action to detect stale docs, commits updates to the PR branch, and comments a summary of changes.

## Why this Slice

This is the "can't drift" promise — the core reason driftless exists beyond one-time generation. Without PR-triggered automation, docs rot the moment the codebase evolves. S01 is ordered first because it establishes all shared workflow infrastructure (permissions, checkout, fork detection, API key check, loop prevention) that S02 reuses for test generation.

## Scope

### In Scope

- `docUpdateWorkflowTemplate(config)` function in `packages/core/src/workflows.ts` — returns valid YAML string parameterized from `DriftlessConfig`
- Shared workflow YAML helpers (permissions block, checkout step, fork detection, API key check, infinite loop condition) — reusable by S02
- Init scaffolding: auto-write `.github/workflows/driftless-doc-update.yml` when `doc-generator` capability is selected — no extra prompt
- Overwrite silently if the workflow file already exists (init is idempotent, same as skill files)
- `--dry-run` shows full YAML content of the workflow file (not just path)
- Workflow triggers on every PR (no path filtering) — Claude decides whether docs need updating
- When docs are updated: commit to PR branch + leave a PR comment summarizing what changed
- When nothing needs updating: silent skip — no commit, no comment, clean Action exit
- Operational edge handling in the YAML: fork PR detection (skip gracefully), missing `ANTHROPIC_API_KEY` (early exit with annotation), infinite loop prevention (skip bot-authored pushes)
- Workflow prompt references installed `.skills/` files and reads `.driftless.json` for config
- Unit tests: YAML validity, required keys (permissions, checkout ref, claude-code-action step), content assertions on prompt text, parameterization from config, init integration tests for scaffolding

### Out of Scope

- Test-generation workflow (S02)
- `packages/action` as a compiled JavaScript action — the action is a YAML workflow template, not custom action code
- Live/integration testing against a real GitHub repo (milestone-level UAT)
- Path-filtered triggers (decided against — Claude handles relevance)
- Asking the user whether to scaffold the workflow (decided: auto-scaffold)
- Asking before overwriting existing workflow files (decided: silent overwrite)

## Constraints

- Must use `anthropics/claude-code-action@v1` (D012)
- Workflow is static YAML scaffolded at init time, not generated at Action runtime
- `actions/checkout` must use `ref: ${{ github.event.pull_request.head.ref }}` with `fetch-depth: 0` (not the merge commit)
- Permissions must explicitly declare `contents: write`, `pull-requests: write` — all unspecified scopes default to `none`
- Bash must be explicitly allowed in `claude_args` for `git diff` access: `Bash(git diff:*)`
- Template function follows the same pattern as `docGeneratorTemplate()` / `e2eWriterTemplate()` in `skills.ts` (D035)
- Staleness detection delegated entirely to the prompt — no custom diff-to-doc mapping code (D036)
- PR summary comment instructed in the workflow prompt (D037)
- Workflow file written through the existing `FileTransaction` in init, same as config and skills

## Integration Points

### Consumes

- `packages/core/src/types.ts` — `DriftlessConfig` (no changes needed, existing fields sufficient)
- `packages/core/src/skills.ts` — template function pattern to follow
- `packages/cli/src/commands/init.ts` — existing init flow to extend with workflow scaffolding
- `packages/core/src/transaction.ts` — `FileTransaction` for rollback-safe file writes

### Produces

- `packages/core/src/workflows.ts` — `docUpdateWorkflowTemplate(config)` + shared helpers (permissions, checkout, fork detection, API key check, loop prevention)
- Init scaffolding pattern: `.github/workflows/driftless-doc-update.yml` written during init
- `packages/core/test/workflows.test.ts` — test patterns for YAML validity, content, parameterization
- Dry-run preview: full YAML content rendered inline in terminal

## Open Questions

- **Prompt length vs skill delegation:** Should the workflow prompt be minimal ("read the doc-generator skill and follow its update workflow") or include the full reasoning chain inline? Current thinking: minimal — delegate to skill files, keep YAML clean.
- **`git diff` scope:** Should the prompt tell Claude to diff against the PR base branch or just the last commit? Current thinking: diff against base (`git diff origin/main...HEAD`) to capture all PR changes, not just the latest push.
