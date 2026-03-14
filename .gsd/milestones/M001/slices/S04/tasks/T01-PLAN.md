---
estimated_steps: 5
estimated_files: 5
---

# T01: Build skill templates, installer, and wire into init command

**Slice:** S04 — Skill installer + capability selection
**Milestone:** M001

## Description

Create the skill installation module: two parameterized template functions (doc-generator, e2e-writer), an `installSkills()` orchestrator that writes them to disk, and integration into the init command flow. The doc-generator template is genericized from the training-material-writer reference skill with framework-specific callout syntax. The e2e-writer template is authored fresh with test framework conventions. Both templates use `{{placeholder}}` replacement to bake real config values into the installed skill files.

## Steps

1. **Create `packages/core/src/skills.ts`** with:
   - `docGeneratorTemplate(config: DriftlessConfig): string` — returns complete SKILL.md content for doc-generator skill. Includes YAML frontmatter, content priority order, document structure requirements, writing style rules (from reference training-material-writer), and framework-specific callout/admonition section dispatched by `config.docFramework` (plain-md → blockquotes, fumadocs → `<Callout>`, docusaurus → `:::` admonitions). Parameterized with `outputDir`, `testPaths`, `docFramework`, file extension. Must feel hand-written for the repo — real paths, real syntax, no template placeholders left behind.
   - `e2eWriterTemplate(config: DriftlessConfig): string` — returns SKILL.md for e2e-writer skill. Parameterized with `testPaths`, `testFramework`, `docFramework`. Covers test file conventions (naming, location), assertion patterns, test isolation, and reading existing docs for context. Framework-agnostic by design — instructs the agent on *what* to produce, not framework-specific test syntax.
   - `InstallSkillsOptions` interface with `cwd` and optional `dryRun`
   - `InstallSkillsResult` interface tracking which skills were installed
   - `installSkills(config: DriftlessConfig, options?: InstallSkillsOptions): Promise<InstallSkillsResult>` — iterates `config.capabilities`, selects matching template function, creates `{cwd}/{config.skillsDir}/{skill-name}/SKILL.md` via `mkdir({recursive: true})` + `writeFile`. Returns result with list of installed skill names.

2. **Export from `packages/core/src/index.ts`** — add `installSkills`, `InstallSkillsOptions`, `InstallSkillsResult` to the barrel.

3. **Wire into `packages/cli/src/commands/init.ts`** — after doc generation block (around line 88), before summary:
   - Import `installSkills` from `@driftless/core`
   - If `config.capabilities.length > 0`: if dry-run, log "Dry run — skills would be installed but were skipped"; otherwise call `installSkills(config, { cwd: options.cwd })` and log result (e.g., "Installed 2 skills: doc-generator, e2e-writer")
   - Add skills info to summary note lines

4. **Write `packages/core/test/skills.test.ts`** covering:
   - Doc-generator template: contains YAML frontmatter, real outputDir path, real testPaths, framework-specific callout syntax for each of the 3 doc frameworks, no leftover `{{` placeholders
   - E2e-writer template: contains YAML frontmatter, real testPaths, test framework name, no leftover `{{` placeholders
   - `installSkills`: writes correct directory structure (`{skillsDir}/doc-generator/SKILL.md`), only installs selected capabilities, empty capabilities = no directories created, overwrites existing files, creates nested directories
   - Verify at least 10 test cases across template content and installer behavior

5. **Update `packages/cli/test/init.test.ts`** — add test cases:
   - Skill installation called after config write when capabilities present
   - Skill installation skipped in dry-run mode
   - Skill installation skipped when capabilities array is empty

## Must-Haves

- [ ] `docGeneratorTemplate` returns valid SKILL.md with framework-specific callout syntax for all 3 frameworks
- [ ] `e2eWriterTemplate` returns valid SKILL.md parameterized with test paths and framework
- [ ] `installSkills` writes `{skillsDir}/{name}/SKILL.md` files to disk
- [ ] Only selected capabilities trigger skill installation
- [ ] No `{{placeholder}}` strings remain in installed skill content
- [ ] Init command calls `installSkills` at the correct point in the flow
- [ ] Dry-run skips skill installation with log message
- [ ] All existing 89 tests continue to pass alongside new tests

## Verification

- `npx vp test` — all existing + new tests pass (target: ~110+ total)
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass
- Inspect a template output manually for each doc framework to verify it reads like a hand-written skill, not a template

## Observability Impact

- `InstallSkillsResult` exposes which skills were installed — init summary consumes this
- `p.log.info` in init command announces installed skills by name

## Inputs

- `packages/core/src/types.ts` — `DriftlessConfig`, `Capability`, `DocFramework`, `TestFramework`
- `packages/core/src/adapters.ts` — pattern for framework-specific content dispatch
- `packages/core/src/generator.ts` — pattern for mkdir + writeFile
- `packages/cli/src/commands/init.ts` — integration point after doc generation
- Reference skill at `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md` — source material for doc-generator template genericization

## Expected Output

- `packages/core/src/skills.ts` — new module with template functions and installer
- `packages/core/src/index.ts` — updated barrel exports
- `packages/cli/src/commands/init.ts` — skill installation wired in
- `packages/core/test/skills.test.ts` — new test file with ~15 test cases
- `packages/cli/test/init.test.ts` — updated with ~3 new skill-related test cases
