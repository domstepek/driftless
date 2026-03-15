---
id: S02
milestone: M004
status: ready
---

# S02: Documentation Content — Context

## Goal

All six documentation pages are complete with accurate, tutorial-style content using the S01 design system — covering Quick Start, init walkthrough, GitHub Action setup, config reference, troubleshooting, and a dedicated Claude-first design page.

## Why this Slice

S01 ships the scaffold. S02 fills it with content that actually makes driftless usable for a first-timer. Without this, the docs site is a skeleton — the launch playbook (S03) can't link to meaningful docs, and new users will bounce.

## Scope

### In Scope

**Six documentation pages (tutorial-style, first-timer oriented):**

1. **Quick Start** (expanded from S01 stub) — Prerequisites, one-command install (`npx @driftless-ai/cli@latest init`), what happens during init, and what exists in the project when it's done. Terminal screenshots/gifs showing the init flow.
2. **Full Init Walkthrough** — Step-by-step narrative of every interactive prompt: test framework detection, test paths selection, output dir, doc framework choice, capabilities selection, skills installation, workflow installation, first doc generation. Unified flow with inline framework callouts for Playwright/Cypress/etc. differences.
3. **GitHub Action Setup** — What the installed workflows do (doc-update on PR, test-gen on push), required repo secrets (`ANTHROPIC_API_KEY`), permissions the workflows need, how to verify they're working. Documents the generated YAML structure.
4. **Configuration Reference** — Every field in `.driftless.json` with type, default, and description. Maps directly to `DriftlessConfig` in `packages/core/src/types.ts`. Code block showing a complete example config with all fields.
5. **Troubleshooting** — Inferred from the codebase: agent invocation failures (missing Claude API key, rate limits), partial doc generation (which files failed and why), debug log at `.driftless/debug.log` (what's in it, how to read it), rollback behavior (when it triggers, what state is left), GitHub Actions permission errors, test path globs not matching.
6. **Claude-First Design** (R025) — Standalone page explaining: why Claude Code is the only harness in v1 (D001), what "agent-driven" means (D007), what users need (Claude API key, Claude Code installed), and that other harnesses are on the roadmap (R028) with no timeline committed.

**Design system:** All pages use the S01 design system — shadcn/ui components (callouts, badges, code blocks) plus fumadocs-ui built-in components. Consistent with the landing page aesthetic.

**Content source:** README.md is the source of truth — docs expand on it, don't contradict it. Port relevant sections, add depth (troubleshooting, edge cases, framework callouts).

**Terminal assets:** Init walkthrough includes terminal screenshots or animated gifs showing the interactive prompt flow. Static code blocks for config reference and action setup.

### Out of Scope

- Video content (M008 — automated demo/tutorial videos)
- Per-framework sub-pages (Playwright guide, Cypress guide as separate pages) — use inline callouts instead
- API documentation beyond config reference (not in M004 scope)
- Versioned docs (single version for v1)
- i18n / translations

## Constraints

- Content must be accurate — docs must reflect what the code actually does, not what we wish it did. Read `packages/cli/src/commands/init.ts`, `packages/core/src/types.ts`, `packages/core/src/workflows.ts` during execution before writing.
- README.md is the canonical source — docs expand it, never contradict it.
- Tutorial style throughout — write for a first-timer who has never used driftless. Second-person voice ("You'll see...", "Run this command...").
- The Claude-first page should be honest about limitations (only Claude Code in v1, API key required) without being apologetic.
- Terminal screenshots/gifs: capture the actual `driftless init` interactive flow — not placeholder images.

## Integration Points

### Consumes from S01

- `apps/web` fumadocs scaffold with `source.config.ts`, MDX content directory, page tree
- Quick Start page as structural/MDX convention reference
- Design system (shadcn/ui + fumadocs-ui) — use same components

### Produces

- 6 MDX pages in `apps/web/content/docs/`:
  - `quick-start.mdx`
  - `init-walkthrough.mdx`
  - `github-action-setup.mdx`
  - `configuration-reference.mdx`
  - `troubleshooting.mdx`
  - `claude-first-design.mdx`
- Updated fumadocs page tree (sidebar navigation) reflecting all 6 pages
- Terminal screenshots/gifs in `apps/web/public/docs/` for init walkthrough

## Open Questions

- **Terminal gif tooling:** The init walkthrough needs animated terminal screenshots. Options: `vhs` (Charm's tape-based terminal recorder), `asciinema`, or static PNG screenshots. Determine best approach during execution — `vhs` produces `.gif` directly from a script and is the cleanest option, but requires the tool installed.
