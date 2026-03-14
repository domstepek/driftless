---
id: S04
milestone: M001
status: ready
---

# S04: Skill installer + capability selection — Context

## Goal

The CLI copies genericized skill files into the target repo's `.skills/` directory, fully configured with real paths and doc framework values from the user's init choices, with a final completion summary and next-steps hint after the full `driftless init` flow.

## Why this Slice

S04 is what makes driftless sticky: the installed skills are the mechanism for ongoing automation (GitHub Actions in M002). Without correctly parameterized skill files in the user's repo, M002 has nothing to invoke. S04 also closes the `driftless init` happy-path experience — it's the last major step before S05 adds operational safety (rollback, dry-run, debug log).

## Scope

### In Scope

- Install skill files into the target repo's `.skills/` directory (default path, user-configurable per D010, set in the S02 wizard)
- Only install skills for the capabilities the user selected in the wizard (per D013): doc-generator only, e2e-writer only, or both
- **Fully configured on install**: real values substituted into skill templates at install time — actual doc output path, actual test directory, actual doc framework (callout syntax, file extension, etc.). The user opens the installed file and it's already correct for their repo.
- Silent overwrite: existing driftless-managed skill files are replaced without prompting (rollback in S05 handles undo)
- Completion output per skill file: list each installed file with path and one-liner purpose (e.g., `✓ .skills/doc-generator.md — teaches your agent to write training docs from e2e tests`)
- Final `driftless init` completion screen after skill installation: brief summary of what was configured, what docs were generated, and what skills were installed — followed by a "Next steps" hint pointing toward the GitHub Action setup (M002)
- Skill templates in `packages/core/src/skills/templates/` — genericized versions of the reference `training-material-writer` pattern, made framework-agnostic and parameterizable
- Skill installer in `packages/core/src/skills/` — reads config, selects templates, substitutes values, writes files

### Out of Scope

- GitHub Action file generation (`.github/workflows/`) — M002
- Skill file validation or linting after install — not in v1
- Prompting before overwriting existing skill files (deferred to S05 dry-run)
- Debug logging of skill installation (S05)
- `--dry-run` preview of skill files (S05)
- Any skill content beyond the two v1 skills: doc-generator and e2e-writer
- The e2e-writer skill content/template design is research-time work — S04 discuss phase does not define what the e2e-writer skill says, only that it exists and gets installed
- Skill versioning or update checking — not in v1

## Constraints

- **Only selected capabilities (D013):** Only install skill files for capabilities the user chose. If user selected doc-generator only, do not install the e2e-writer skill.
- **Fully configured, not generic templates:** Values from `.driftless.json` (doc output path, test dir, doc framework, skill install path) must be substituted into skill files at install time. No placeholder comments left for the user to fill in.
- **Silent overwrite:** No prompt before replacing existing files — consistent with how docs are handled in S03.
- **Skill install path from config:** The `.skills/` path comes from `.driftless.json` (set in S02 wizard). S04 reads it; does not re-prompt.
- **Doc framework drives template selection:** The installed skill template must match the user's doc framework — fumadocs MDX skills reference fumadocs callout syntax, docusaurus skills use docusaurus admonitions, plain markdown skills use plain formatting.

## Integration Points

### Consumes

- `packages/core/src/config.ts` → `readConfig()` — reads `.driftless.json` for skill install path, capability choices, doc framework, test dir, doc output path (from S02)
- `packages/core/src/types.ts` → `DriftlessConfig`, `Capability` — config schema (from S02)
- `packages/core/src/adapters/` → framework adapter selection — skill templates reference the same framework as the doc adapters (from S03)

### Produces

- `packages/core/src/skills/` — skill template files and installer (exports: `installSkills()`)
- `packages/core/src/skills/templates/` — genericized skill templates for doc-generator and e2e-writer, with `{{placeholder}}` variables for substitution
- Final `driftless init` completion screen logic — summary + next-steps hint rendered after `installSkills()` completes

## Open Questions

- Exact content and structure of the genericized doc-generator skill template — derived from `training-material-writer/SKILL.md` reference, but which parts are static vs parameterized needs to be settled during S04 research. Current thinking: doc output path, test dir, doc framework syntax, and file extension are parameterized; the content priority order (e2e tests → page objects → components) stays in the template body.
- Content and structure of the e2e-writer skill template — no reference implementation exists. Current thinking: define during S04 research, modeled on the doc-generator skill but inverted (given docs or feature descriptions, writes e2e tests).
- What the "Next steps" hint should say precisely — current thinking: a brief note that the GitHub Action setup is the next step, pointing to the driftless docs URL (not yet live in M001, so likely a placeholder or GitHub repo link).
