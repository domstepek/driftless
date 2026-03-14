# S04: Skill installer + capability selection — Research

**Date:** 2026-03-14

## Summary

S04 is a straightforward template-and-write slice. The core challenge is **not** the installer mechanics — it's getting the skill template content right so that installed skills are genuinely useful when invoked by Claude Code (via GitHub Action in M002 or manually).

The codebase already has every pattern needed: `adapters.ts` proves that framework-specific templates work as inline TypeScript string functions. `generator.ts` proves the file-write pattern with `mkdir` + `writeFile`. `initCommand` already has the capability-gating pattern (`config.capabilities.includes("doc-generator")`). S04 follows these established patterns closely.

The one non-trivial design question is template parameterization. Skill templates need real config values baked in at install time — output paths, test globs, doc framework syntax rules — so the installed skill file is immediately correct for the user's repo. Simple `{{placeholder}}` string replacement handles this without external dependencies.

## Recommendation

**Inline string template functions in a single `skills.ts` module** (flat, not `skills/` directory). Each skill template is a function that takes config values and returns complete markdown. An `installSkills()` function reads config, selects templates by capability, substitutes values, writes files. Wire into `initCommand()` after doc generation.

Why flat module over directory: same rationale as D029 (adapters). Two template functions and one installer function don't warrant a directory. The templates are ~100-150 lines of markdown each — they're strings, not complex modules.

Why inline strings over external files: `vp pack` produces a single `index.mjs` bundle (verified — `packages/core/dist/` contains only `index.mjs` + `index.d.mts`). External `.md` template files wouldn't be bundled and can't be resolved at runtime from an npm-installed package. Same constraint that shaped `adapters.ts`.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Framework-specific content in templates | `adapters.ts` pattern — framework-dispatched string functions | Already proven, keeps templates consistent with generation prompts |
| File writing with directory creation | `generator.ts` `mkdir({recursive: true})` + `writeFile` | Exact same operation, same error surface |
| Capability gating | `initCommand` `config.capabilities.includes(...)` pattern | Already tested in S03 init integration |
| Atomic writes | `config.ts` temp+rename pattern | Could use for skill files, but silent overwrite is simpler for S04 (S05 adds rollback) |

## Existing Code and Patterns

- `packages/core/src/adapters.ts` — Template pattern to follow: pure functions returning framework-specific strings, dispatched by `DocFramework`. Skill templates follow the same shape but parameterized with more config values.
- `packages/core/src/generator.ts` — `mkdir` + `writeFile` pattern. `outputFilename()` shows how to derive clean names from inputs.
- `packages/cli/src/commands/init.ts` — Integration point. Skill installation hooks in at line ~82 (after doc generation block, before summary). Capability gating at line 46 is the pattern to follow.
- `packages/core/src/types.ts` — `DriftlessConfig` has all needed fields: `skillsDir`, `capabilities`, `docFramework`, `outputDir`, `testPaths`, `testFramework`.
- `packages/cli/src/prompts/init-prompts.ts` — `skillsDir` prompt (line 68-73) defaults to `.skills`. This is the path S04 writes to.
- Reference skill at `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md` — Source material for genericizing the doc-generator skill template. Key elements to preserve: YAML frontmatter, content priority order (e2e tests → page objects → components → hooks → constants → queries), document structure requirements, callout syntax, writing style rules.

## Constraints

- **Single-file bundle**: Templates must be TypeScript string constants, not external files. `vp pack` bundles to one `.mjs` file.
- **No new dependencies**: String replacement with `.replace()` or `.replaceAll()` is sufficient. No template engine needed for `{{placeholder}}` substitution — the template variables are a known, small set.
- **Skill file convention**: Each skill is `{skillsDir}/{skill-name}/SKILL.md`. The directory-per-skill pattern (from reference repo's `.agents/skills/`) allows future addition of reference files alongside the main skill. Install creates both the skill directory and the `SKILL.md` file.
- **Framework-specific content in skill body**: The doc-generator skill must include the correct callout/admonition syntax for the user's chosen `docFramework`. This parallels what `adapters.ts` already does — same three-way switch (plain-md → blockquotes, fumadocs → `<Callout>`, docusaurus → `:::` admonitions).
- **Silent overwrite**: Per S04-CONTEXT scope, existing driftless-managed skill files are replaced without prompting. S05 adds rollback.
- **Two independent skills**: `doc-generator` and `e2e-writer` are installed independently based on `config.capabilities`. Both, one, or neither.

## Template Design

### doc-generator skill
Genericized from `training-material-writer`:
- **Parameterized**: `outputDir`, `testPaths[0]` (for reference), `docFramework`-driven syntax rules (callout format, frontmatter shape, file extension)
- **Static**: content priority order, document structure requirements, writing style rules
- **Framework switch**: three variants of the callout/admonition section, same as adapters

### e2e-writer skill
New creation — no reference implementation:
- **Purpose**: Given a feature description, PR diff, or existing code, write or update e2e tests
- **Parameterized**: `testPaths[0]` (output location for new tests), `testFramework` (target framework for test syntax), `docFramework` (for reading existing docs)
- **Content**: test file conventions (naming, location), assertion patterns, page object conventions (if framework supports), test isolation rules
- **Note**: The e2e-writer skill is more generic than the doc-generator because we can't assume specific test framework patterns. It should instruct the agent on what to produce but let the agent adapt to the specific framework.

### Parameterization approach

Simple `{{key}}` placeholders in template strings, replaced with `String.replaceAll()`:
- `{{outputDir}}` — e.g., `docs/training`
- `{{testPaths}}` — e.g., `tests/**/*.spec.ts`
- `{{docFramework}}` — e.g., `fumadocs`
- `{{fileExtension}}` — `.md` or `.mdx`
- `{{frameworkSyntax}}` — the callout/admonition block (multi-line, framework-specific)
- `{{testFramework}}` — e.g., `playwright` or `your test framework`

## Common Pitfalls

- **Over-engineering the template engine** — Simple `.replaceAll()` is correct here. The variable set is closed (6-8 known keys). Handlebars/Mustache/ejs would add a dependency for zero benefit.
- **Putting templates in separate files** — Won't survive `vp pack` bundling. Must be inline strings. This is not a hack — it's the same pattern that `adapters.ts` uses and it works cleanly.
- **Making skill content too generic** — The installed skill should feel like it was hand-written for this repo. Real paths, real framework syntax, no `TODO: fill in your path`. If it reads like a template, we failed.
- **Forgetting the directory structure** — Skills go in `{skillsDir}/doc-generator/SKILL.md`, not `{skillsDir}/doc-generator.md`. The directory-per-skill convention allows reference files later.
- **Not testing with all three doc frameworks** — The framework-specific sections of the doc-generator template are the most likely place for bugs. Need tests per framework.

## Open Risks

- **e2e-writer skill quality** — No reference implementation exists. The template content is being authored fresh. It may need iteration after real-world testing with Claude Code in M002. Mitigation: keep the skill content focused and minimal — let the agent's intelligence fill gaps rather than trying to anticipate every framework's patterns.
- **Skill file size vs. context window** — The reference `training-material-writer` is ~160 lines. The genericized version with framework-specific sections could grow larger. Need to keep it under ~200 lines per skill to avoid bloating context when the agent loads it. Progressive disclosure (SKILL.md + optional reference files) is the escape valve.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| TypeScript template patterns | None relevant | No external skill needed — simple string replacement |
| Agent skill authoring | `skill-author` (in reference repo) | Read for conventions only — not installable |

## Sources

- `packages/core/dist/` contents confirm single-file bundle constraint (direct inspection)
- Reference `training-material-writer/SKILL.md` at `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md` — source for genericization
- Reference `skill-author/SKILL.md` — skill file conventions (frontmatter, body structure, progressive disclosure)
- `adapters.ts` — proven inline template string pattern
- S04-CONTEXT.md — scope, constraints, integration points
