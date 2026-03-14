# S04: Skill installer + capability selection — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: Skill installation writes files to disk and integrates into the init flow — all behaviors are verifiable via test assertions and filesystem inspection without a running server

## Preconditions

- Repository cloned and dependencies installed (`pnpm install`)
- Both packages built: `npx vp run -r build`
- All tests passing: `npx vp test` (118 pass)

## Smoke Test

Run `npx vp test -- --filter skills` and confirm all 25 skills tests pass. This proves templates render correctly for all frameworks and the installer writes files.

## Test Cases

### 1. Doc-generator template produces correct plain-md callout syntax

1. In `skills.test.ts`, find the test: "doc-generator template includes plain-md callout syntax"
2. Verify the template output contains blockquote-style callouts (`> **Note:**` or `> [!NOTE]`)
3. Verify YAML frontmatter is present
4. Verify the user's `outputDir` and `testPaths` are baked into the template content
5. **Expected:** No `{{placeholder}}` tokens remain. Real config values appear in the output.

### 2. Doc-generator template produces correct fumadocs callout syntax

1. Call `docGeneratorTemplate()` with `docFramework: "fumadocs"`
2. Verify the output contains fumadocs-specific MDX callout syntax (e.g., `<Callout>` or fumadocs admonition markers)
3. **Expected:** Output differs from plain-md template. Framework-specific syntax present.

### 3. Doc-generator template produces correct docusaurus admonition syntax

1. Call `docGeneratorTemplate()` with `docFramework: "docusaurus"`
2. Verify the output contains docusaurus admonition syntax (e.g., `:::note` / `:::tip`)
3. **Expected:** Output differs from both plain-md and fumadocs templates.

### 4. E2e-writer template is parameterized with test paths and framework

1. Call `e2eWriterTemplate()` with `testPaths: ["tests/e2e/**/*.spec.ts"]` and `testFramework: "cypress"`
2. Verify the output contains the literal test path and "cypress"
3. **Expected:** The template references the user's actual test paths and framework name.

### 5. installSkills writes both skill files when both capabilities selected

1. Call `installSkills(config, { cwd: tmpDir })` with `capabilities: ["doc-generator", "e2e-writer"]` and `skillsDir: ".skills"`
2. Check filesystem: `{tmpDir}/.skills/doc-generator/SKILL.md` exists
3. Check filesystem: `{tmpDir}/.skills/e2e-writer/SKILL.md` exists
4. **Expected:** Both files exist with non-empty content. `InstallSkillsResult.installed` contains both names.

### 6. installSkills writes only doc-generator when only that capability selected

1. Call `installSkills(config, { cwd: tmpDir })` with `capabilities: ["doc-generator"]`
2. **Expected:** `doc-generator/SKILL.md` exists. `e2e-writer/` directory does not exist. `result.installed` is `["doc-generator"]`.

### 7. installSkills writes only e2e-writer when only that capability selected

1. Call `installSkills(config, { cwd: tmpDir })` with `capabilities: ["e2e-writer"]`
2. **Expected:** `e2e-writer/SKILL.md` exists. `doc-generator/` directory does not exist. `result.installed` is `["e2e-writer"]`.

### 8. Init command calls installSkills after config write

1. In `init.test.ts`, find the test: "calls installSkills after config write when capabilities present"
2. Verify the call order tracking shows `write` before `skills`
3. **Expected:** `installSkills` called with the gathered config and correct `cwd`.

### 9. Init command includes installed skills in summary

1. Run initCommand with capabilities `["doc-generator"]`
2. Check the `p.note` call arguments
3. **Expected:** Summary note contains "Skills installed: doc-generator"

### 10. Init command skips skill installation in dry-run mode

1. Run `initCommand({ dryRun: true })`
2. **Expected:** `installSkills` is NOT called. `p.log.info` receives message containing "skills would be installed but were skipped".

## Edge Cases

### Empty capabilities array

1. Run `initCommand` with `capabilities: []`
2. **Expected:** `installSkills` is NOT called. No skill files written. No error.

### Unknown capability in array

1. Call `installSkills(config)` with `capabilities: ["doc-generator", "unknown-thing"]`
2. **Expected:** Only `doc-generator/SKILL.md` written. `result.installed` is `["doc-generator"]`. No crash, no error thrown.

### Overwrite existing skill files

1. Write a dummy file to `{skillsDir}/doc-generator/SKILL.md`
2. Call `installSkills(config)` with `capabilities: ["doc-generator"]`
3. **Expected:** File is overwritten with new template content. No error about existing file.

### Nested skillsDir path

1. Call `installSkills(config)` with `skillsDir: "deep/nested/.skills"`
2. **Expected:** Intermediate directories created. Skill files written at the correct nested path.

## Failure Signals

- Any `skills.test.ts` test failing — indicates template content or installer logic broke
- `init.test.ts` skill integration tests failing — indicates wiring between init command and installer is broken
- `{{placeholder}}` appearing in any template output — indicates template function isn't parameterizing correctly
- `InstallSkillsResult.installed` being empty when capabilities were provided — indicates installer is not writing files
- Build failure in either package — indicates type errors from the new exports

## Requirements Proved By This UAT

- R005 — Skill files are installed to the correct location with framework-specific content
- R015 — Each capability installs independently based on user selection

## Not Proven By This UAT

- Rollback on failure (R008) — deferred to S05
- Debug logging for skill operations (R007) — deferred to S05
- Dry-run previewing skill file contents (R011) — S05 scope
- End-to-end `npx driftless init` with a real repo and real Claude Code — requires live environment

## Notes for Tester

- The `init.test.ts` tests require `@driftless/core` to be built first (`npx vp run -r build`). If tests fail with "Failed to resolve entry for package @driftless/core", run the build and retry.
- Template content assertions in `skills.test.ts` are the authoritative source for what each framework's skill file should contain — if you need to understand the expected output, read those tests.
