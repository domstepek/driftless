# S02: Test-generation workflow template — Research

**Date:** 2026-03-14

## Summary

S02 adds a `testGenWorkflowTemplate(config)` function that produces a GitHub Actions workflow YAML for PR-triggered e2e test generation via `claude-code-action@v1`. The infrastructure from S01 — five exported YAML-fragment helpers, the `WORKFLOW_TEMPLATES` record, `installWorkflows`, and init wiring — is fully generic and ready for extension. The new code is: (1) a test-generation prompt function, (2) a template assembler function, (3) one new entry in `WORKFLOW_TEMPLATES`, (4) a re-export from `index.ts`, and (5) a fix to the hardcoded dry-run preview logic in init.ts.

The hardest piece is the prompt itself — it must instruct Claude to detect genuinely new user flows in a PR (vs. modifications to existing flows) and generate missing e2e tests using the installed `e2e-writer` skill. This is fuzzier than staleness detection (S01) because "new flow" is a judgment call, but the skill file already provides the structure for how tests should be written. The prompt should err on the side of suggesting tests (false positives are less harmful than false negatives for test generation — an unnecessary test is still a valid test, unlike an unnecessary doc update which is noise).

There is one bug in the current init.ts dry-run path that S02 must fix: lines 114-116 hardcode `cap === "doc-generator"` when computing workflow preview paths, rather than using `WORKFLOW_TEMPLATES` or a data-driven mapping. The execution path (`installWorkflows`) is already generic, so only the dry-run preview is broken for new capabilities. The existing test at init.test.ts line 655 ("does not show workflow paths in dry-run when doc-generator not in capabilities") explicitly asserts that `e2e-writer`-only shows no workflow preview — this test will need updating to expect the test-gen workflow.

## Recommendation

Follow the exact same pattern as `docUpdateWorkflowTemplate`:

1. Write `testGenPrompt(config)` — a YAML block scalar prompt instructing Claude to detect new flows and generate tests
2. Write `testGenWorkflowTemplate(config)` — assembles the prompt with the five shared helpers into complete workflow YAML
3. Add `"e2e-writer"` entry to `WORKFLOW_TEMPLATES`
4. Re-export from `index.ts`
5. Fix init.ts dry-run to derive workflow paths from `WORKFLOW_TEMPLATES` (or import the mapping) instead of hardcoding capability names
6. Update the init test that asserts e2e-writer shows no workflow preview
7. Add workflow template tests mirroring the S01 pattern (YAML validity, structural keys, prompt content, operational edges, parameterization, error paths)
8. Add init integration tests for the full capability matrix (doc-only, test-only, both, neither)

The workflow name should be `Driftless Test Generation` and the filename `driftless-test-gen.yml` per the roadmap. The job name should be `generate-tests` (parallel to `update-docs`).

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Workflow YAML structure | Five exported helpers from S01 (`permissionsBlock`, `checkoutStep`, `forkDetectionStep`, `apiKeyCheckStep`, `botLoopCondition`) | Identical operational edges. DRY. |
| Workflow installation | `installWorkflows` + `WORKFLOW_TEMPLATES` record | Adding one entry auto-enables install, transaction registration, debug logging, and summary output. |
| YAML parse validation in tests | `yaml` package (already in devDeps from S01) | Same parse-then-inspect pattern for structural assertions. |
| Prompt domain knowledge | `e2eWriterTemplate` in `skills.ts` | The skill file defines test conventions. The workflow prompt should delegate to it ("read the e2e-writer skill for instructions") rather than duplicating content. |

## Existing Code and Patterns

- `packages/core/src/workflows.ts` — All infrastructure lives here. `WORKFLOW_TEMPLATES` record (line 224) is the extension point. `stalenessPrompt` is the prompt pattern to follow. Five helpers are the building blocks.
- `packages/core/test/workflows.test.ts` — 30 tests for doc-update template. S02 adds a parallel `describe("testGenWorkflowTemplate")` block with the same assertion categories.
- `packages/core/src/index.ts` — Line 38 exports only `docUpdateWorkflowTemplate`. Must add `testGenWorkflowTemplate`.
- `packages/cli/src/commands/init.ts` — Lines 114-116: dry-run workflow preview hardcodes `doc-generator`. Must be made data-driven. The execution path (lines 239-264) is already generic.
- `packages/cli/test/init.test.ts` — Line 52-55: default mock returns only `driftless-doc-update.yml`. Line 655: test asserts e2e-writer shows no workflow. Both need updating.
- `packages/core/src/skills.ts` — `e2eWriterTemplate` (line 189) shows the skill content the workflow prompt should reference. Key sections: Test Framework, File Location, Writing Tests, Assertion Patterns.

## Constraints

- **Prompt must reference the e2e-writer skill, not embed its content.** Same pattern as the doc-update prompt referencing `doc-generator/SKILL.md`. Keeps YAML compact and defers to the skill file as the single source of truth.
- **GitHub Actions `${{ }}` expressions require `\${{` escaping in JS template literals.** Easy to miss — S01 tests catch this via YAML parse validation and the leftover-placeholder check.
- **YAML is string-assembled, not object→serialized.** Indentation errors in the template literal produce invalid YAML. The `yaml.parse()` test is the safety net.
- **`allowed_tools` in `claude_args` must include bash for `git diff`.** Same as S01: `--allowedTools bash,read,write,edit`.
- **Workflow filename must be `driftless-test-gen.yml`** per the roadmap specification.
- **The `Capability` type already includes `"e2e-writer"`** (types.ts line 10). No type changes needed.

## Common Pitfalls

- **Hardcoded dry-run preview** — The init.ts dry-run path (lines 114-116) filters capabilities manually. If S02 only adds to `WORKFLOW_TEMPLATES` without fixing dry-run, the preview will be wrong for e2e-writer-only and both-capabilities cases. Fix: import or duplicate the capability→filename mapping, or export `WORKFLOW_TEMPLATES` keys.
- **Existing test assumes e2e-writer has no workflow** — init.test.ts line 655 asserts that e2e-writer-only capabilities produce no workflow preview. This test must be updated, not deleted — it should now expect the test-gen workflow.
- **Default mock in init tests** — The mock at line 52-55 returns `["driftless-doc-update.yml"]`. Tests for "both capabilities" need the mock to return both filenames.
- **Prompt quality for "new flow" detection** — Unlike staleness detection (comparing diff to existing docs), new-flow detection requires judging whether a code change introduces a genuinely new user workflow. The prompt should provide heuristics: new route/page component = likely new flow, new API endpoint with UI = likely new flow, refactored existing code = likely not. False positives (generating a test for a modified flow) are acceptable — the test is still valid.
- **`claude_args` allowed tools** — Must include `bash` for `git diff` access. If omitted, Claude can't inspect the PR changes. Same value as S01: `--allowedTools bash,read,write,edit`.

## Open Risks

- **New flow detection accuracy** — This is inherently fuzzier than staleness detection. The prompt can provide heuristics, but whether Claude correctly identifies "new flow" vs "modified flow" depends on the PR content. Risk is mitigated by the fact that a generated test for a "modified" flow is still useful (it verifies the new behavior). This is milestone-level UAT scope.
- **Dry-run fix scope** — Making dry-run data-driven requires either exporting `WORKFLOW_TEMPLATES` or extracting the capability→filename mapping. Exporting the record is simplest but exposes internal structure. A `getWorkflowFilenames(capabilities)` helper is cleaner. Either works — minor design decision.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| GitHub Actions | See M002-RESEARCH.md | No external skills warranted (same conclusion as milestone research) |
| claude-code-action | See M002-RESEARCH.md | No external skills warranted |
| Vitest | Already using via `vp test` | Installed toolchain |

No new skills needed. This slice is purely additive within the existing codebase patterns.

## Sources

- S01 forward intelligence (S01-SUMMARY.md) — `WORKFLOW_TEMPLATES` extension point, helper reuse pattern, `${{ }}` escaping gotcha
- `packages/core/src/workflows.ts` — current implementation reviewed in full
- `packages/cli/src/commands/init.ts` lines 114-116 — hardcoded dry-run bug identified by code inspection
- `packages/cli/test/init.test.ts` lines 52-55, 655-668 — existing test assumptions that conflict with S02 scope
- M002-RESEARCH.md — new flow detection risk, `claude-code-action` constraints, allowed tools requirement
