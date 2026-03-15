# S02: Documentation content — UAT

**Milestone:** M004
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven build verification + live-runtime visual checks)
- Why this mode is sufficient: Documentation is static content — build verification proves compilation and search indexing, while visual checks confirm navigation, sidebar ordering, and content rendering. No runtime state or API calls to test.

## Preconditions

- `apps/web` dev server running: `cd apps/web && pnpm next dev`
- Browser pointed at `http://localhost:3000`
- Source files available for cross-reference: `packages/core/src/init-prompts.ts`, `packages/core/src/types.ts`, `packages/core/src/workflows.ts`, `packages/core/src/config.ts`, `packages/core/src/agent.ts`

## Smoke Test

1. Navigate to `http://localhost:3000/docs`
2. **Expected:** Quick Start page renders with title, install command `npx @driftless-ai/cli@latest init`, and a Claude Code prerequisite callout. Sidebar shows all 5 pages.

## Test Cases

### 1. Sidebar ordering and navigation

1. Navigate to `/docs`
2. Inspect the sidebar navigation
3. **Expected:** Pages appear in order: Quick Start, Init Walkthrough, GitHub Actions, Configuration, Troubleshooting
4. Click each sidebar link in sequence
5. **Expected:** Each page loads without error, page title matches sidebar link text

### 2. Quick Start content accuracy

1. Navigate to `/docs`
2. Verify the install command shows `npx @driftless-ai/cli@latest init`
3. Verify there is NO reference to a standalone `driftless generate` command
4. Count the listed init prompts
5. **Expected:** Exactly 6 prompts listed: e2e test file paths, docs output directory, documentation framework, capabilities, auto-update preference, agent harness verification
6. Verify a Callout component renders for the Claude Code prerequisite (should show styled warning/info box, not raw `<Callout>` text)
7. Verify "Next steps" links to all 4 other doc pages

### 3. Init walkthrough prompt accuracy

1. Navigate to `/docs/init-walkthrough`
2. Open `packages/core/src/init-prompts.ts` for cross-reference
3. For each of the 6 prompts, verify:
   - Prompt message text matches `init-prompts.ts`
   - Placeholder text matches (where applicable)
   - Default value matches (where applicable)
4. **Expected:** All prompt details match source code exactly
5. Verify post-prompt flow section covers: framework detection → config write → doc generation → skill installation → workflow installation → debug log → completion

### 4. Configuration reference completeness

1. Navigate to `/docs/configuration`
2. Open `packages/core/src/types.ts` for cross-reference
3. Count fields in the DriftlessConfig table
4. **Expected:** All 11 fields present with correct types and defaults
5. Verify framework detection table lists 6 frameworks with config file names
6. **Expected:** Matches `packages/core/src/detect.ts` detection order
7. Verify all 3 docFramework options documented (plain-md, fumadocs, docusaurus)
8. Verify both capabilities documented (doc-generator, e2e-writer)

### 5. GitHub Actions guide completeness

1. Navigate to `/docs/github-actions`
2. Verify both workflows documented: doc-update and test-gen
3. Verify ANTHROPIC_API_KEY callout is prominent (styled Callout component, not plain text)
4. Verify all 5 operational edge handlers explained:
   - Bot loop prevention
   - Fork PR detection
   - API key check
   - PR branch checkout
   - Full history fetch
5. **Expected:** Each handler has an explanation of what it does and why
6. Verify cross-links to `/docs/configuration` and `/docs/troubleshooting`

### 6. Troubleshooting error coverage

1. Navigate to `/docs/troubleshooting`
2. Verify the following error scenarios are covered:
   - "Config file not found" (from `config.ts`)
   - "Invalid JSON in config file" (from `config.ts`)
   - Claude Code CLI not found / spawn error (from `agent.ts`)
   - Agent timeout (120s default from `agent.ts`)
   - Debug log location and format (`.driftless/debug.log` from `logger.ts`)
   - Rollback behavior (from `transaction.ts`)
   - Auto-update issues (permission errors, npx notification, major version warning, CI skip)
3. **Expected:** Each scenario shows the exact error message in a code block with fix steps

### 7. Search indexes all pages

1. Click the search input (or press Ctrl+K / Cmd+K)
2. Type "ANTHROPIC_API_KEY"
3. **Expected:** GitHub Actions page appears in results
4. Clear and type "rollback"
5. **Expected:** Troubleshooting page appears in results
6. Clear and type "docFramework"
7. **Expected:** Configuration page appears in results

### 8. Cross-link integrity

1. On each of the 5 docs pages, click every internal `/docs/` link
2. **Expected:** All links resolve to valid pages (no 404s, no broken anchors)
3. Verify Quick Start links to all 4 other pages
4. Verify init walkthrough links to configuration and GitHub Actions
5. Verify GitHub Actions links to configuration and troubleshooting

## Edge Cases

### Callout component rendering

1. Navigate to `/docs` (Quick Start)
2. Find the Claude Code prerequisite callout
3. **Expected:** Renders as a styled info/warning box with icon and background color — NOT as raw `<Callout>` text or a broken component

### Dark mode rendering

1. Toggle dark mode (if fumadocs theme toggle is present)
2. Navigate through all 5 docs pages
3. **Expected:** All content is legible, code blocks have appropriate syntax highlighting, callouts have visible borders/backgrounds

### Mobile responsive layout

1. Resize browser to mobile width (~375px)
2. Navigate to `/docs`
3. **Expected:** Sidebar collapses to hamburger/drawer, content is readable, code blocks scroll horizontally

## Failure Signals

- `<Callout>` appearing as raw text instead of a styled component → `defaultMdxComponents` not wired
- 404 on any `/docs/*` route → MDX file missing or `meta.json` slug mismatch
- Sidebar showing fewer than 5 pages → `meta.json` missing entries
- Sidebar in wrong order → `meta.json` pages array order incorrect
- Search returning no results for known content → fumadocs search indexer not picking up new pages
- Build failure with MDX syntax errors → malformed frontmatter or JSX in content files

## Requirements Proved By This UAT

- R022 — fumadocs documentation site with all five required sections, working navigation, search, and accurate content

## Not Proven By This UAT

- Live Vercel deployment serving the new docs content (requires deploy after merge — operational verification)
- R025 — Claude-first with documented future harness support (docs mention Claude Code but don't explicitly discuss future harness intent — primary owner is M001 README)

## Notes for Tester

- The dev server (`pnpm next dev`) may take a few seconds to compile MDX on first visit to each page.
- Content accuracy checks (tests 3 and 4) require having the source files open side-by-side. The key files are in `packages/core/src/`.
- The site is deployed at `driftless-six.vercel.app` — visual checks can also be done there after the deploy propagates.
