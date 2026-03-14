---
id: T01
parent: S04
milestone: M001
provides:
  - docGeneratorTemplate function with framework-specific callout syntax
  - e2eWriterTemplate function parameterized with test paths and framework
  - installSkills orchestrator writing SKILL.md files to disk
  - init command integration calling installSkills after config write
key_files:
  - packages/core/src/skills.ts
  - packages/core/src/index.ts
  - packages/cli/src/commands/init.ts
  - packages/core/test/skills.test.ts
  - packages/cli/test/init.test.ts
key_decisions:
  - Unknown capabilities silently skipped by installSkills (caller can diff config.capabilities vs result.installed to detect)
  - Dry-run handled at two levels — installSkills accepts dryRun option, init command gates the call entirely in dry-run mode
patterns_established:
  - Skill templates are inline string functions returning full SKILL.md content, parameterized via DriftlessConfig
  - SKILL_TEMPLATES record maps capability name to template function for extensibility
observability_surfaces:
  - InstallSkillsResult.installed exposes which skills were written, consumed by init summary
  - p.log.info in init announces installed skill names
  - Dry-run mode logs explicit skip message
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Build skill templates, installer, and wire into init command

**Created skill template functions, filesystem installer, and init command integration — 118 tests pass (29 new), builds and lint clean.**

## What Happened

Built `packages/core/src/skills.ts` with three exports: `docGeneratorTemplate` (framework-dispatched callout syntax for plain-md/fumadocs/docusaurus), `e2eWriterTemplate` (parameterized with test paths and framework name), and `installSkills` (writes `{skillsDir}/{name}/SKILL.md` for each selected capability). Templates are inline string functions returning complete SKILL.md content with real config values baked in — no `{{placeholder}}` leftovers.

Wired `installSkills` into `initCommand` after the doc generation block. Gated on `capabilities.length > 0`, with dry-run skip logging. Skills install info added to the summary note.

Wrote 25 test cases in `skills.test.ts` covering: YAML frontmatter presence, real path parameterization, framework-specific callout syntax for all 3 frameworks, placeholder absence, installer directory structure, capability gating, overwrite behavior, nested dirs, dry-run skip, and unknown capability handling. Added 4 test cases in `init.test.ts` for integration: correct call ordering, dry-run skip, empty capabilities skip, and summary output.

## Verification

- `npx vp test` — 118 tests pass (89 existing + 29 new), 9 test files
- `npx vp run -r build` — both packages build clean
- `npx vp check` — 0 lint errors, 0 warnings, 0 format issues
- Template content validated via test assertions: each framework produces correct callout syntax, no cross-contamination, no leftover placeholders

## Diagnostics

- `InstallSkillsResult` returned from `installSkills()` reports installed skill names and target dir — diff against `config.capabilities` to detect unknown/skipped capabilities
- Init command logs installed skill count and names via `p.log.info`
- Dry-run mode produces explicit "skills would be installed but were skipped" message

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `packages/core/src/skills.ts` — new module with template functions and installer
- `packages/core/src/index.ts` — added barrel exports for skills module
- `packages/cli/src/commands/init.ts` — wired installSkills after doc generation, added skills to summary
- `packages/core/test/skills.test.ts` — 25 test cases for templates and installer
- `packages/cli/test/init.test.ts` — 4 new test cases for skill installation integration
- `.gsd/milestones/M001/slices/S04/S04-PLAN.md` — added Observability/Diagnostics section and diagnostic verification step
