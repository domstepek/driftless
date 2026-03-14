# S04: Skill installer + capability selection

**Goal:** CLI installs parameterized skill files into the target repo, configured for the user's doc framework and capability choices.
**Demo:** After `driftless init` completes, `{skillsDir}/doc-generator/SKILL.md` and/or `{skillsDir}/e2e-writer/SKILL.md` exist with real config values baked in — no placeholders, no TODOs.

## Must-Haves

- `installSkills()` writes skill files to `{config.skillsDir}/{skill-name}/SKILL.md`
- Doc-generator skill template includes framework-specific callout/admonition syntax matching the user's `docFramework` choice
- E2e-writer skill template is parameterized with `testPaths`, `testFramework`, and output conventions
- Skills install independently based on `config.capabilities` — "doc-generator" only, "e2e-writer" only, or both
- Neither skill installs when the capability isn't selected
- Skill installation wired into `initCommand()` after doc generation, before summary
- Dry-run skips skill installation with a log message
- Existing skill files silently overwritten (S05 adds rollback)

## Observability / Diagnostics

- `InstallSkillsResult` returned from `installSkills()` reports: which skills were installed by name, the target directory, and the total count — init summary consumes this directly
- `p.log.info` in init command announces each installed skill by name so the user can verify at a glance
- If `installSkills()` is called with unknown capabilities, those are silently skipped (no crash) but absent from the result — the caller can diff `config.capabilities` against `result.installed` to detect this
- Dry-run mode logs an explicit skip message rather than silently doing nothing

## Verification

- `npx vp test` — all existing tests pass + new skills tests pass
  - `packages/core/test/skills.test.ts` — template content correctness per framework, installer filesystem behavior, capability gating
  - `packages/cli/test/init.test.ts` — skill installation integration (called with correct args, skipped when no capabilities, skipped in dry-run)
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass
- Diagnostic: `installSkills()` with an unknown capability in the array returns a result that omits the unknown skill — verifiable via `skills.test.ts` test case

## Integration Closure

- Upstream surfaces consumed: `DriftlessConfig` (types.ts), `initCommand` (init.ts), adapter framework-switch pattern (adapters.ts), `mkdir`+`writeFile` pattern (generator.ts)
- New wiring introduced: `installSkills()` called from `initCommand` after doc generation block
- What remains before milestone is truly usable end-to-end: S05 (rollback, debug logging, dry-run behavior)

## Tasks

- [x] **T01: Build skill templates, installer, and wire into init command** `est:35m`
  - Why: This is the entire slice — template functions, filesystem installer, init integration, and tests are one cohesive unit that can't be meaningfully split
  - Files: `packages/core/src/skills.ts`, `packages/core/src/index.ts`, `packages/cli/src/commands/init.ts`, `packages/core/test/skills.test.ts`, `packages/cli/test/init.test.ts`
  - Do: (1) Create `skills.ts` with `docGeneratorTemplate(config)`, `e2eWriterTemplate(config)`, and `installSkills(config, options)`. Templates are inline string functions returning full SKILL.md content with `{{placeholder}}` replacement. Doc-generator template has three-way framework switch for callout syntax (same as adapters.ts). E2e-writer template parameterized with testPaths/testFramework. Installer creates `{skillsDir}/{name}/SKILL.md` via mkdir+writeFile. (2) Export from core barrel. (3) Wire `installSkills()` into `initCommand` after doc generation, gated on capabilities length > 0, with dry-run skip. Update summary to include skills count. (4) Write `skills.test.ts` covering: both templates for all 3 doc frameworks, installer writes correct directory structure, capability gating (only selected skills install), overwrite behavior, empty capabilities = no writes. (5) Add init integration tests for skill installation.
  - Verify: `npx vp test` passes all existing + new tests, `npx vp run -r build` clean, `npx vp check` clean
  - Done when: `installSkills()` writes correctly parameterized skill files for all framework/capability combinations, init command calls it at the right point, and tests prove all behaviors

## Files Likely Touched

- `packages/core/src/skills.ts` (new)
- `packages/core/src/index.ts`
- `packages/cli/src/commands/init.ts`
- `packages/core/test/skills.test.ts` (new)
- `packages/cli/test/init.test.ts`
