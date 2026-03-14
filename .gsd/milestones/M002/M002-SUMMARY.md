---
id: M002
provides:
  - "docUpdateWorkflowTemplate(config) — produces GitHub Actions YAML for PR-triggered doc staleness detection via claude-code-action@v1"
  - "testGenWorkflowTemplate(config) — produces GitHub Actions YAML for PR-triggered e2e test generation via claude-code-action@v1"
  - "installWorkflows(config, options) — writes workflow files to .github/workflows/ based on capabilities, with dry-run support"
  - "getWorkflowFilenames(capabilities) — data-driven capability-to-filename mapping for init and dry-run"
  - "Five exported YAML-fragment helpers (permissionsBlock, checkoutStep, forkDetectionStep, apiKeyCheckStep, botLoopCondition) shared across both templates"
  - "Init command extended to scaffold workflows with capability gating, rollback, debug logging, and dry-run preview"
key_decisions:
  - "D035: Workflow templates as parameterized YAML functions (same pattern as skill templates)"
  - "D036: Staleness detection delegated to prompt — Claude reasons from git diff, no custom mapping code"
  - "D037: PR summary comment included in workflow prompt for visibility"
  - "D038: Doc-update first (S01) to establish shared infrastructure, test-gen second (S02)"
  - "D039: installWorkflows mirrors installSkills pattern — consistent API surface"
  - "D040: YAML fragment helpers exported for cross-template reuse"
  - "D041: getWorkflowFilenames helper to avoid vitest mock boundary issues with constant imports"
patterns_established:
  - "Workflow template functions: config in, YAML string out (mirrors skill template pattern from D027/D035)"
  - "WORKFLOW_TEMPLATES record as data-driven registry for capability-to-workflow mapping"
  - "GitHub Actions ${{ }} expressions escaped as \\${{ in JS template literals"
  - "YAML validity tested via yaml.parse() on template output"
observability_surfaces:
  - "DebugLogger 'workflows' phase captures installed filenames and workflowsDir"
  - "Both template functions throw with config field name in message on invalid input"
  - "Dry-run preview lists workflow paths via getWorkflowFilenames"
requirement_outcomes:
  - id: R012
    from_status: active
    to_status: validated
    proof: "S01 — docUpdateWorkflowTemplate produces valid YAML with PR trigger, permissions, checkout, staleness prompt, operational edges. 30 template tests + 8 init integration tests. Live accuracy deferred to UAT."
  - id: R013
    from_status: active
    to_status: validated
    proof: "S02 — testGenWorkflowTemplate produces valid YAML with PR trigger, e2e-writer prompt, operational edges. 35 template tests + capability matrix init tests."
  - id: R014
    from_status: active
    to_status: validated
    proof: "S01+S02 — both workflow templates contain anthropics/claude-code-action@v1 step with anthropic_api_key input and allowed_tools. Verified by unit tests on template content."
duration: 55m
verification_result: passed
completed_at: 2026-03-14
---

# M002: GitHub Actions + PR Automation

**Both workflow templates (doc-update and test-gen) produce valid GitHub Actions YAML with PR triggers, claude-code-action@v1 integration, operational edge handling, and domain-specific prompts. `driftless init` scaffolds the appropriate workflow files based on capability selection, with full dry-run support.**

## What Happened

S01 built the core infrastructure: `docUpdateWorkflowTemplate(config)` in `packages/core/src/workflows.ts` produces a complete GitHub Actions workflow YAML string for PR-triggered doc staleness detection. The template includes `pull_request` trigger, required permissions (`contents: write`, `pull-requests: write`, `id-token: write`), PR-branch checkout (not merge commit), and a `claude-code-action@v1` step with a staleness detection prompt. The prompt instructs Claude to read the git diff, reason about affected features, scan for stale docs using the installed skill file, update them, and post a PR summary comment. Five operational edge handlers were built as exported YAML-fragment helpers: fork PR detection with `::notice::` annotation, missing `ANTHROPIC_API_KEY` check with `::warning::` annotation, and bot-loop prevention via job-level `if` condition. `installWorkflows(config, options)` was wired into the init command following the same pattern as `installSkills` — transaction-wrapped, debug-logged, with dry-run support.

S02 added `testGenWorkflowTemplate(config)` reusing all five shared helpers from S01. The test-gen prompt instructs Claude to detect new user flows in the PR diff and generate missing e2e tests using the installed e2e-writer skill. `WORKFLOW_TEMPLATES` was extended with the `"e2e-writer"` entry, and `getWorkflowFilenames(capabilities)` was added to make init's dry-run preview fully data-driven across all capability combinations. The capability matrix (doc-only, test-only, both, neither) is fully tested.

## Cross-Slice Verification

**Success criteria verified:**

1. **doc-generator scaffolds driftless-doc-update.yml** — 30 template tests verify YAML validity, structural keys, prompt content markers, operational edges, and parameterization. 8 init integration tests verify scaffolding, capability gating, and dry-run.
2. **e2e-writer scaffolds driftless-test-gen.yml** — 35 template tests cover the same dimensions. Capability matrix init tests verify doc-only, test-only, both, and neither scenarios.
3. **Correct PR trigger, permissions, checkout, claude-code-action step** — `yaml.parse()` validates each template's output. Tests assert `on.pull_request` trigger, `permissions` block, `actions/checkout` with `${{ github.event.pull_request.head.ref }}`, and `anthropics/claude-code-action@v1` step.
4. **Operational edges** — Template content tests verify fork PR detection step with `::notice::` annotation, missing `ANTHROPIC_API_KEY` check with `::warning::` annotation, and `if:` condition filtering `github-actions[bot]` pushes.
5. **Prompts reference .skills/ and .driftless.json** — Content marker tests verify skill file paths and config references in both prompts.
6. **--dry-run shows workflow files** — Init integration tests verify dry-run lists workflow paths without writing files, using the data-driven `getWorkflowFilenames` helper.
7. **No regressions** — `npx vp test` passes 222/222 across 12 test files (up from M001's 146 baseline).

## Requirement Changes

- R012: active → validated — docUpdateWorkflowTemplate produces valid YAML with staleness detection prompt and operational edges. 30 unit tests + 8 init integration tests. Live accuracy is UAT scope.
- R013: active → validated — testGenWorkflowTemplate produces valid YAML with e2e-writer prompt and operational edges. 35 unit tests + capability matrix init tests.
- R014: active → validated — both workflow templates contain `anthropics/claude-code-action@v1` step with correct inputs. Unit tests verify on both templates.

## Forward Intelligence

### What the next milestone should know
- The workflow templates are string-assembled YAML, not object-then-serialized. This is intentional — templates are the product (scaffolded into user repos), not runtime code. But it means the templates themselves are opaque strings from the perspective of driftless's runtime.
- `WORKFLOW_TEMPLATES` is a data-driven registry. Adding a new capability→workflow mapping is a single record entry + template function. The init command, dry-run, and tests all derive from this registry automatically.
- M002 added `yaml` as a devDependency in `packages/core` for test validation only — it's not in the production bundle.
- 222 tests is the new baseline. M001 had 146, S01 added 38 (30 workflow + 8 init), S02 added 38 (35 workflow + 3 init adjusted).

### What's fragile
- **Core dist rebuild requirement** — CLI tests import from `packages/core/dist/index.mjs` via `vi.importActual`. Source changes to core without running `npx vp pack` in `packages/core/` will cause test failures with stale exports. This is a known developer ergonomics issue, not a production concern.
- **GitHub Actions `${{ }}` escaping** — template literals use `\${{` to produce `${{` in the YAML output. Easy to miss when editing prompts. The `yaml.parse()` test catches malformed YAML but not incorrect expression references.

### Authoritative diagnostics
- `npx vp test -- packages/core/test/workflows.test.ts` — 65 tests covering both workflow templates, fastest signal for template regressions
- `npx vp test -- packages/cli/test/init.test.ts` — 44 tests covering full init flow including workflow scaffolding and capability matrix
- `npx vp test` — 222 tests, full suite, the definitive health check

### What assumptions changed
- None — M002 executed as planned. The two-slice structure (doc-update first to establish infrastructure, test-gen second to reuse it) worked cleanly. No scope changes, no blocked requirements, no surprises.

## Files Created/Modified

- `packages/core/src/workflows.ts` — workflow template functions, install function, YAML fragment helpers, getWorkflowFilenames, WORKFLOW_TEMPLATES registry
- `packages/core/test/workflows.test.ts` — 65 tests for both workflow templates
- `packages/core/src/index.ts` — re-exports for all workflow public API
- `packages/core/package.json` — added `yaml` devDependency
- `packages/cli/src/commands/init.ts` — wired workflow scaffolding with transaction, debug logging, summary, data-driven dry-run
- `packages/cli/test/init.test.ts` — 10 new tests for workflow scaffolding and capability matrix
