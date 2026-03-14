---
id: S04
parent: M001
milestone: M001
provides:
  - docGeneratorTemplate function with framework-specific callout syntax (plain-md, fumadocs, docusaurus)
  - e2eWriterTemplate function parameterized with test paths and framework name
  - installSkills orchestrator writing SKILL.md files to target repo's skills directory
  - Init command integration calling installSkills after config write, gated on capabilities
requires:
  - slice: S02
    provides: DriftlessConfig type, initCommand orchestrator, gatherConfig prompts, writeConfig
  - slice: S03
    provides: generateDocs pipeline, adapter prompt pattern (framework-switch), DocFramework type
affects:
  - S05
key_files:
  - packages/core/src/skills.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/core/test/skills.test.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - Unknown capabilities silently skipped by installSkills — caller can diff config.capabilities vs result.installed to detect
  - Dry-run handled at two levels — installSkills accepts dryRun option, init command gates the call entirely in dry-run mode
patterns_established:
  - Skill templates are inline string functions returning full SKILL.md content, parameterized via DriftlessConfig
  - SKILL_TEMPLATES record maps capability name to template function for extensibility
observability_surfaces:
  - InstallSkillsResult.installed exposes which skills were written, consumed by init summary
  - p.log.info in init announces installed skill names
  - Dry-run mode logs explicit skip message
drill_down_paths:
  - .gsd/milestones/M001/slices/S04/tasks/T01-SUMMARY.md
duration: 20m
verification_result: passed
completed_at: 2026-03-14
---

# S04: Skill installer + capability selection

**Parameterized skill templates and filesystem installer wired into init command — skills install based on user's framework and capability choices.**

## What Happened

Built `packages/core/src/skills.ts` with three exports: `docGeneratorTemplate(config)` generates a doc-generator SKILL.md with three-way framework-dispatched callout syntax (plain-md blockquotes, fumadocs MDX callouts, docusaurus admonitions), `e2eWriterTemplate(config)` generates an e2e-writer SKILL.md parameterized with test paths and framework name, and `installSkills(config, options)` writes `{skillsDir}/{name}/SKILL.md` for each capability in `config.capabilities` via mkdir+writeFile.

Wired `installSkills()` into `initCommand` after the doc generation block — gated on `capabilities.length > 0`, skipped entirely in dry-run mode with a log message. Summary note updated to include installed skill names.

25 test cases in `skills.test.ts` cover template content for all 3 doc frameworks, installer filesystem behavior, capability gating, overwrite behavior, nested dirs, dry-run skip, and unknown capability handling. 4 integration tests in `init.test.ts` verify call ordering, dry-run skip, empty capabilities skip, and summary output.

## Verification

- `npx vp test` — 118 tests pass (89 existing + 29 new), 9 test files
- `npx vp run -r build` — both packages build clean
- `npx vp check` — 0 lint errors, 0 warnings, 0 format issues
- Template content validated via assertions: each framework produces correct callout syntax, no cross-contamination, no leftover placeholders

## Requirements Advanced

- R005 (Composable skill installer) — skill templates and installer fully built, wired into init flow
- R015 (Modular capability selection) — capabilities gating verified: doc-generator only, e2e-writer only, both, or neither

## Requirements Validated

- R005 — `installSkills()` writes correctly parameterized skill files for all framework/capability combinations, tested via 25 unit tests covering filesystem behavior, template content, and capability gating
- R015 — Capability selection drives which skills install. Empty capabilities = no writes. Independent installation verified in tests.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None.

## Known Limitations

- Existing skill files are silently overwritten — rollback protection deferred to S05
- No validation that skillsDir path is writable before attempting writes — S05 adds error handling
- Dry-run doesn't preview skill file contents — just logs that skills would be installed

## Follow-ups

- S05: Rollback support for skill installation (undo on failure)
- S05: Debug logging for skill installer operations

## Files Created/Modified

- `packages/core/src/skills.ts` — new module with template functions and installer
- `packages/core/src/index.ts` — added barrel exports for skills module
- `packages/cli/src/commands/init.ts` — wired installSkills after doc generation, added skills to summary
- `packages/core/test/skills.test.ts` — 25 test cases for templates and installer
- `packages/cli/test/init.test.ts` — 4 new test cases for skill installation integration

## Forward Intelligence

### What the next slice should know
- `installSkills()` returns `InstallSkillsResult` with `installed` array and `skillsDir` — S05 rollback can use this to know exactly which files to remove on failure
- The init command flow is: detect → gather → write config → generate docs → install skills → summary. S05 needs to wrap this entire sequence in a transaction/rollback boundary.

### What's fragile
- `vi.importActual("@driftless/core")` in `init.test.ts` requires the core package to be built first — tests fail if run before `vp run -r build`. This is a test infrastructure ordering dependency, not a runtime issue.

### Authoritative diagnostics
- `packages/core/test/skills.test.ts` — the template content assertions are the ground truth for what each framework's skill file should contain
- `InstallSkillsResult.installed` — diff against `config.capabilities` to detect any silently skipped unknown capabilities

### What assumptions changed
- none — slice executed as planned
