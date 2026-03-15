---
estimated_steps: 5
estimated_files: 3
---

# T01: Write Quick Start, init walkthrough, and configuration reference

**Slice:** S02 — Documentation content
**Milestone:** M004

## Description

Write the three "getting started and configuring" docs pages. The existing Quick Start has inaccuracies — it references `generate` as a standalone CLI command (it doesn't exist in v1.0.0) and only lists 3 of 6 init prompts. The init walkthrough is the deep-dive companion. The configuration reference documents every DriftlessConfig field with its type, default, and effect.

All content must be derived from source code, not memory or README copy-paste.

## Steps

1. **Rewrite Quick Start** (`content/docs/index.mdx`): Remove `generate` as standalone command. Add `<Callout>` for Claude Code CLI prerequisite. List all 6 init prompt steps (test glob, output dir, doc framework, capabilities, skills dir, auto-update). Keep the How It Works section but fix it to describe init-time generation. Update GitHub Actions section to mention both workflows and link to `/docs/github-actions`. Update Next Steps links to point to new pages.

2. **Write init walkthrough** (`content/docs/init-walkthrough.mdx`): Document the full init flow from `init.ts` and `init-prompts.ts`. Show each of the 6 prompts with its exact message, placeholder, and default value. Explain what happens after prompts complete: framework auto-detection (from `detect.ts`), config write (atomic via `config.ts`), dry-run preview branch, doc generation (if doc-generator capability selected), skill installation, workflow installation, debug log write, completion. Use `<Callout type="info">` for tips about defaults and `<Callout type="warn">` for the Claude Code requirement.

3. **Write configuration reference** (`content/docs/configuration.mdx`): Table of every DriftlessConfig field from `types.ts` — field name, type, required/optional, default, description. Include the framework detection priority table from `detect.ts` (6 frameworks with their config files). Document each `docFramework` option and what output format it produces (from `adapters.ts`). Document each `Capability` option and what it installs. Document `docGrouping`, `autoUpdate`, `packageManager` optional fields.

4. **Add cross-links**: Ensure Quick Start links to `/docs/init-walkthrough`, `/docs/configuration`, `/docs/github-actions`, `/docs/troubleshooting`. Init walkthrough links to config reference for field details. Config reference links to init walkthrough for how values are set.

5. **Verify build**: Run `cd apps/web && pnpm next build` — all three new pages must compile without errors.

## Must-Haves

- [ ] Quick Start no longer references `generate` as a standalone CLI command
- [ ] Quick Start lists all 6 init prompts accurately
- [ ] Quick Start has Claude Code prerequisite callout
- [ ] Init walkthrough prompt messages/placeholders/defaults match `init-prompts.ts` exactly
- [ ] Init walkthrough documents the full post-prompt flow (detect → config → generate → skills → workflows → debug log)
- [ ] Config reference documents every DriftlessConfig field from `types.ts`
- [ ] Config reference includes framework detection table from `detect.ts`
- [ ] Config reference documents all three docFramework options
- [ ] All pages use fumadocs MDX conventions (YAML frontmatter, no `# Title`, `<Callout>`)
- [ ] Cross-links between pages use absolute paths

## Verification

- `cd apps/web && pnpm next build` exits 0
- Build output includes routes for `/docs`, `/docs/init-walkthrough`, `/docs/configuration`
- Content spot-checks: grep for all 6 prompt messages from `init-prompts.ts` in the walkthrough page

## Inputs

- `apps/web/content/docs/index.mdx` — existing Quick Start to rewrite (has inaccuracies to fix)
- `packages/cli/src/prompts/init-prompts.ts` — exact prompt messages, placeholders, defaults for init walkthrough
- `packages/cli/src/commands/init.ts` — full init flow for walkthrough post-prompt section
- `packages/core/src/types.ts` — DriftlessConfig interface for config reference
- `packages/core/src/detect.ts` — FRAMEWORK_CONFIG_MAP for detection table
- `packages/core/src/adapters.ts` — adapter descriptions for docFramework documentation

## Observability Impact

- **No runtime signals change** — this task produces static MDX documentation pages, not runtime code.
- **Build-time verification**: A future agent inspects this task by running `cd apps/web && pnpm next build` and checking that `/docs`, `/docs/init-walkthrough`, and `/docs/configuration` appear in the route output. Build failure with a file path pinpoints broken MDX syntax.
- **Content drift detection**: `grep` the walkthrough page for prompt messages from `init-prompts.ts` and the config reference for field names from `types.ts`. Mismatches indicate stale docs.
- **No failure state to persist** — documentation pages are stateless build artifacts.

## Expected Output

- `apps/web/content/docs/index.mdx` — rewritten Quick Start with accurate v1.0.0 content
- `apps/web/content/docs/init-walkthrough.mdx` — complete init walkthrough matching source code
- `apps/web/content/docs/configuration.mdx` — complete config reference matching `types.ts`
