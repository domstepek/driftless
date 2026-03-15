# S02: Documentation content — Research

**Date:** 2026-03-14

## Summary

S02 is a pure content slice — no new code, no new dependencies, no build changes. The fumadocs pipeline from S01 is proven: drop MDX files into `apps/web/content/docs/`, and they appear in the sidebar automatically. The work is writing five accurate docs sections (expanding the existing Quick Start + four new pages) sourced primarily from the README and actual source code.

The main risk isn't technical — it's content accuracy. Every config field, every CLI prompt step, every workflow YAML snippet must match the actual code. The README is the closest existing prose, but it's summary-level. The docs need to go deeper: show every init prompt, explain every config field's effect, document the full generated workflow YAML with annotations, and cover real failure modes from the error paths in the code.

Fumadocs sidebar ordering is controlled by `meta.json` files with a `pages` array. The existing `content/docs/index.mdx` becomes the landing page for `/docs`. New pages go into the same directory (flat structure is fine for 5 pages) or into subdirectories if grouping makes sense. Given the small page count, a flat structure with `meta.json` ordering is simplest.

## Recommendation

**Flat structure with `meta.json` ordering.** Five MDX files in `content/docs/` plus one `meta.json`:

```
content/docs/
  meta.json          ← controls sidebar order
  index.mdx          ← Quick Start (expand existing)
  init-walkthrough.mdx
  github-actions.mdx
  configuration.mdx
  troubleshooting.mdx
```

**Source content from code, not memory.** Each page's content should be derived from the actual source files:

| Page | Primary source | Secondary source |
|------|---------------|-----------------|
| Quick Start | README "Quick Start" section | `packages/cli/src/index.ts` (CLI usage) |
| Init Walkthrough | `packages/cli/src/commands/init.ts` + `prompts/init-prompts.ts` | README "How It Works" |
| GitHub Actions | `packages/core/src/workflows.ts` (both templates) | README (brief mention) |
| Configuration | `packages/core/src/types.ts` (DriftlessConfig) + `detect.ts` + `adapters.ts` | README "Configuration Reference" |
| Troubleshooting | Error paths across `config.ts`, `agent.ts`, `transaction.ts`, `logger.ts` | Common GitHub Action edge cases from workflow templates |

**Write in the established style.** The existing Quick Start page uses second person, bold UI elements, short sentences — consistent with the driftless writing style (which mirrors the training-material-writer conventions). All new pages should match.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Sidebar ordering | fumadocs `meta.json` with `pages` array | Standard fumadocs pattern. Controls page order without filename prefixes. |
| Callout components | fumadocs `<Callout>` MDX component | Auto-available in fumadocs MDX — no import needed. Types: `info`, `warn`, `error`. |
| Code blocks with titles | fumadocs MDX code blocks with `title` meta | Fumadocs renders titled code blocks natively: ` ```json title=".driftless.json" ` |
| Page metadata | MDX frontmatter `title` + `description` | Fumadocs renders `title` as page heading, `description` as subtitle. No separate `# Title` needed (see D060). |
| Internal linking | Relative MDX links | fumadocs resolves `[link](/docs/configuration)` to the correct route. |

## Existing Code and Patterns

- `apps/web/content/docs/index.mdx` — Existing Quick Start page. Reference for MDX conventions: YAML frontmatter with `title`/`description`, no `# Title` heading (fumadocs renders from frontmatter), standard markdown body. This is the template all new pages should follow.
- `README.md` — Contains a Configuration Reference table, CLI usage block, "How It Works" section, supported frameworks list, and Core API Surface. The docs should expand on this, not contradict it.
- `packages/cli/src/prompts/init-prompts.ts` — Six prompt steps in exact order: test file glob → output dir → doc framework → capabilities → skills dir → auto-update confirm. Each has `message`, `placeholder`, `defaultValue`. The init walkthrough page must mirror this sequence precisely.
- `packages/cli/src/commands/init.ts` — Full init flow: detect framework → gather config → check existing config → dry-run branch → transaction-wrapped writes (config → generate docs → install skills → install workflows → debug log → commit). Shows what happens at each stage.
- `packages/core/src/types.ts` — `DriftlessConfig` interface with all fields. The config reference page must document every field with type, default, and description — matching this interface exactly.
- `packages/core/src/workflows.ts` — Both workflow templates (`docUpdateWorkflowTemplate`, `testGenWorkflowTemplate`) with shared helpers. The GitHub Actions page needs to show the generated YAML structure and explain each operational edge (fork detection, API key check, bot loop prevention).
- `packages/core/src/detect.ts` — `FRAMEWORK_CONFIG_MAP` with exact config file names per framework. The config reference should list these for users who want to understand auto-detection.
- `packages/core/src/adapters.ts` — Three adapter prompts with framework-specific syntax (callout vs admonition vs blockquote). The config reference should explain what each `docFramework` choice means for output.
- `packages/core/src/agent.ts` — `spawnAgent` spawns `claude -p --output-format json --no-session-persistence --tools "" --append-system-prompt`. The troubleshooting page needs to cover "Claude Code not found" and timeout scenarios.
- `packages/core/src/config.ts` — `readConfig` throws with `Config file not found` or `Invalid JSON in config file` messages. These are common errors to document.
- `packages/core/src/transaction.ts` — `FileTransaction` tracks all writes and rolls back on failure. Explains why partial state doesn't happen.
- `packages/core/src/logger.ts` — `DebugLogger` writes JSON to `.driftless/debug.log`. The troubleshooting page should explain how to read this.
- `packages/core/src/auto-update.ts` — `performUpdate` checks registry, handles npx context, major version warnings. Worth mentioning in config reference (autoUpdate field) and troubleshooting (update failures).

## Constraints

- **No code changes** — S02 is content-only. No changes to `apps/web` components, layouts, or configuration. Only new/modified MDX files in `content/docs/` and a `meta.json`.
- **Frontmatter format must match existing** — `title` and `description` fields only, YAML delimiters. No `id`, `sidebar_position`, or other fields (those are Docusaurus conventions, not fumadocs).
- **No manual `# Title` headings** — fumadocs renders the frontmatter `title` as the page heading. Adding a markdown `# Title` would produce a duplicate (noted in D060 and in the existing Quick Start page pattern).
- **fumadocs `<Callout>` syntax** — Available types: `info` (default), `warn`, `error`, `success`, `idea`. Must have blank lines before/after. No import statement needed.
- **Content must match v1.0.0** — The published CLI is v1.0.0. Docs should reflect this version's behavior, not planned features. The only command is `init`. The `generate` command is mentioned in the Quick Start but is actually run as part of `init` — the standalone `generate` command doesn't exist as a separate CLI entry point yet (it's triggered during init when doc-generator capability is selected).
- **Cross-links must use absolute paths** — `/docs/configuration`, `/docs/troubleshooting`, etc. fumadocs resolves these from the docs baseUrl.
- **268 tests must still pass** — Content changes shouldn't break tests, but `next build` must still succeed (MDX syntax errors would break it).

## Common Pitfalls

- **Documenting `generate` as a standalone command** — The README mentions `npx @driftless-ai/cli@latest generate` but the CLI only has `init` as a routed command. Doc generation happens _during_ init when `doc-generator` capability is selected. The Quick Start should be corrected to reflect this accurately.
- **Config field descriptions drifting from types.ts** — The README's config table is close but not identical to the TypeScript interface. The docs should be sourced from `types.ts` directly, not copy-pasted from the README.
- **Missing Claude Code prerequisite** — Users need Claude Code CLI installed (`claude` binary in PATH) for doc generation to work. This is the most critical prerequisite and the most likely source of confusion. Must be prominent in Quick Start and troubleshooting.
- **Workflow YAML snippets going stale** — Rather than hard-coding workflow YAML in docs, describe the structure and reference that `driftless init` generates the workflows automatically. Show what the generated YAML looks like, but note it's generated — not hand-written.
- **Forgetting the ANTHROPIC_API_KEY requirement** — Both GitHub Actions workflows need this secret. Easy to miss during setup. Should be a callout in the GitHub Actions page.
- **Overwriting existing Quick Start content** — The existing Quick Start has some inaccuracies (mentions `generate` as standalone command, oversimplifies the GitHub Action setup). Need to fix these while expanding, not just append.

## Open Risks

- **`generate` command ambiguity** — The README and current Quick Start reference a standalone `generate` command that doesn't exist as a separate CLI command. The actual flow is: `init` runs generation during setup. Need to decide how to document this: remove the `generate` reference entirely, or note it as "coming soon"? Safest to document what v1.0.0 actually does.
- **fumadocs search indexing** — Adding 4 new MDX pages should be indexed by fumadocs search automatically at build time (via the `/api/search` route handler). Verify after writing that search works for the new content.
- **Page ordering stability** — fumadocs `meta.json` `pages` array uses file slugs (without extension). If a file is renamed, the meta.json reference breaks silently (page just doesn't appear in sidebar). Worth noting in forward intelligence.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Fumadocs MDX structure | `theorcdev/8bitcn-ui@fumadocs-mdx-structure` (103 installs) | available — patterns for MDX content organization |
| Fumadocs docs reading | `fuma-nama/fumadocs@read-docs` (79 installs) | available — official fumadocs skill |
| Frontend design | `frontend-design` (bundled GSD skill) | installed — not needed for content-only slice |

**Assessment:** Neither available skill is necessary for S02. The fumadocs pipeline is already established in S01, and S02 is pure content writing. The existing Quick Start page + fumadocs Context7 docs provide sufficient conventions.

## Sources

- fumadocs `meta.json` controls sidebar ordering via `pages` array of file slugs (source: [Context7 fumadocs docs](/fuma-nama/fumadocs) — page conventions)
- fumadocs `<Callout>` component available without import, types: `info`, `warn`, `error`, `success`, `idea` (source: [fumadocs UI docs](https://fumadocs.dev))
- CLI init flow: 6 prompts via `@clack/prompts group()` + auto-update confirm (source: `packages/cli/src/prompts/init-prompts.ts`)
- Agent spawn uses `claude -p --output-format json --no-session-persistence` with stdin piping (source: `packages/core/src/agent.ts`)
- Both workflow templates share 5 operational edge handlers: bot loop, fork detection, API key check, PR branch checkout, full history fetch (source: `packages/core/src/workflows.ts`)
- Auto-detection scans 6 frameworks in priority order: Playwright, Cypress, TestCafe, Detox, WebDriverIO, Nightwatch (source: `packages/core/src/detect.ts`)
- `DriftlessConfig` has 10 fields, 3 optional (`testFramework`, `docGrouping`, `autoUpdate`, `packageManager`) (source: `packages/core/src/types.ts`)
