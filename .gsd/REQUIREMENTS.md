# Requirements

This file is the explicit capability and coverage contract for the project.

Use it to track what is actively in scope, what has been validated by completed work, what is intentionally deferred, and what is explicitly out of scope.

Guidelines:

- Keep requirements capability-oriented, not a giant feature wishlist.
- Requirements should be atomic, testable, and stated in plain language.
- Every **Active** requirement should be mapped to a slice, deferred, blocked with reason, or moved out of scope.
- Each requirement should have one accountable primary owner and may have supporting slices.
- Research may suggest requirements, but research does not silently make them binding.
- Validation means the requirement was actually proven by completed work and verification, not just discussed.

## Active

### R001 — Interactive CLI setup wizard

- Class: primary-user-loop
- Status: validated
- Description: `npx driftless init` runs an interactive wizard that prompts for e2e test paths, docs output location, doc framework preference, capability selection, and agent harness verification
- Why it matters: This is the primary entry point — the first thing every user does
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: M001/S02 — full prompt flow via @clack/prompts group(), CLI routing for init/version/help/dry-run, 11 init tests + 8 CLI tests pass, bundle executes --version and --help correctly
- Notes: Uses `@clack/prompts` for Vercel-style UX

### R002 — E2E test framework agnostic

- Class: core-capability
- Status: validated
- Description: The agent reads and interprets any e2e test suite (Playwright, Cypress, Selenium, TestCafe, Detox, etc.) without framework-specific parsers
- Why it matters: Broadens adoption — any team with e2e tests can use driftless, not just Playwright/Cypress shops
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: M001/S03 — spawnAgent() sends raw test content via stdin with no framework-specific parsing; adapter prompts instruct the agent to interpret any test framework. 9 agent tests + 22 adapter tests verify the pipeline mechanics.
- Notes: Claude Code does the interpretation; no custom parsers needed

### R003 — Agent-driven doc generation via Claude Code CLI

- Class: core-capability
- Status: validated
- Description: CLI spawns Claude Code in headless mode to generate markdown training docs from e2e test files
- Why it matters: This is the core value proposition — tests become docs
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S04
- Validation: M001/S03 — spawnAgent() spawns `claude -p --output-format json` with stdin piping, timeout escalation, and JSON result parsing. generateDocs() orchestrates per-file generation with glob resolution, output writing, and error accumulation. 9 agent + 8 generator + 6 init integration tests verify the full pipeline.
- Notes: Clean progress-only UX with spinner; full agent output saved to debug log

### R004 — Framework-specific doc adapters

- Class: core-capability
- Status: validated
- Description: Generated docs match the user's chosen framework format — plain markdown (default), fumadocs MDX, or docusaurus MDX
- Why it matters: Docs must fit into the user's existing docs site without manual conversion
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S04
- Validation: M001/S03 — Three adapter prompt templates (plainMdPrompt, fumadocsPrompt, docusaurusPrompt) produce framework-specific frontmatter, callout/admonition syntax, and file extension rules. getAdapterPrompt dispatcher routes by DocFramework. 22 adapter tests verify format markers and routing.
- Notes: Framework choice baked into installed skill so all subsequent generations use the right format

### R005 — Composable skill installer

- Class: core-capability
- Status: validated
- Description: CLI copies genericized agent skills into the target repo's `.skills/` directory (or user-specified location), configured for the user's specific repo layout and doc framework
- Why it matters: Skills are what the GitHub Action invokes — they must be present and correctly configured in the target repo
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: none
- Validation: M001/S04 — `installSkills()` writes parameterized SKILL.md files to `{skillsDir}/{name}/SKILL.md` for each selected capability. Templates are framework-dispatched (plain-md/fumadocs/docusaurus). 25 unit tests + 4 integration tests verify template content, filesystem behavior, capability gating, and init wiring.
- Notes: Two independent skills: e2e test writer and doc generator. User picks one or both.

### R006 — Clean progress-only UX

- Class: quality-attribute
- Status: validated
- Description: During doc generation, user sees a spinner with file-by-file progress (e.g. "Processing sample-assignment.cy.ts... 3/12 files"), not raw Claude output
- Why it matters: Professional UX — the tool should feel polished, not like watching an AI think
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: M001/S03 — Init command creates @clack/prompts spinner, updates message per file via ProgressCallback, hides agent stdout/stderr. 6 init generation tests verify spinner lifecycle, progress updates, and error reporting.
- Notes: Full inference output saved to debug log for troubleshooting

### R007 — Debug logging for issue reporting

- Class: failure-visibility
- Status: validated
- Description: Every `driftless init` run writes a structured debug log (agent output, file operations, config choices) to `.driftless/debug.log`
- Why it matters: When something goes wrong, users can paste the log in a GitHub issue and maintainers get full context
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: M001/S02, M001/S03
- Validation: M001/S05 — DebugLogger accumulates timestamped JSON entries per phase (detect, config, generate, skills, error, rollback, complete). Flush writes JSON array to `.driftless/debug.log`, creating parent dirs. Flush-never-throws pattern ensures logging can't crash init. 5 logger unit tests + debug log integration tests in init.test.ts verify both success and failure paths.
- Notes: Log should be structured enough for issue triage

### R008 — Fail-clean with rollback on init errors

- Class: failure-visibility
- Status: validated
- Description: If init fails mid-run (agent harness not found, inference fails, file write error), all partial changes are rolled back so the repo is unchanged
- Why it matters: Users should never be left with a half-installed broken state
- Source: user
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: M001/S05 — FileTransaction tracks all files/dirs created during init with pre-existence flags. Rollback iterates in reverse order, removing only newly-created paths, excluding debug log. 10 transaction unit tests + rollback integration tests in init.test.ts verify: forced failure removes config, pre-existing files survive, debug log preserved.
- Notes: Init must be idempotent — safe to re-run after failure

### R009 — Config file persisting init choices

- Class: core-capability
- Status: validated
- Description: Init writes a `.driftless.json` config file persisting all choices (test paths, docs location, framework, capabilities) so re-runs and the GitHub Action share configuration
- Why it matters: Config is the bridge between init and the GitHub Action — without it, the Action doesn't know what to do
- Source: research
- Primary owning slice: M001/S02
- Supporting slices: M001/S03, M001/S04
- Validation: M001/S02 — config round-trips through `.driftless.json`, atomic writes verified (temp+rename), configExists works, 8 config tests pass
- Notes: none

### R010 — Test framework auto-detection

- Class: quality-attribute
- Status: validated
- Description: CLI detects existing e2e test configuration files (playwright.config.ts, cypress.config.js, etc.) to pre-fill prompts
- Why it matters: Reduces friction — users shouldn't have to tell the tool what it can discover
- Source: research
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: M001/S02 — detectTestFramework() scans 6 frameworks (Playwright, Cypress, TestCafe, Detox, WebdriverIO, Nightwatch) via config file presence, 11 detection tests pass including priority ordering and undefined for no match
- Notes: Auto-detection is a convenience; user can always override

### R011 — `--dry-run` flag

- Class: quality-attribute
- Status: validated
- Description: `driftless init --dry-run` previews all changes that would be made without writing any files
- Why it matters: Users want to see what the tool will do before committing to it — table stakes for repo-modifying CLIs
- Source: research
- Primary owning slice: M001/S05
- Supporting slices: none
- Validation: M001/S05 — dry-run runs glob resolution to show test files, computes output doc filenames and skill paths, renders structured preview via p.log. No agent spawn, no file writes. Integration tests verify file listing output and zero files written to disk, including 0-file graceful case.
- Notes: none

### R012 — GitHub Action: PR-triggered doc staleness detection + update

- Class: core-capability
- Status: validated
- Description: A distributable GitHub Action that detects changed files in a PR, maps them to affected features, runs the doc-generator skill via claude-code-action to update stale docs, and commits the updates to the PR
- Why it matters: This is the "can't drift" part — docs stay current automatically on every PR
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S02
- Validation: M002/S01 — `docUpdateWorkflowTemplate(config)` produces valid GitHub Actions YAML with pull_request trigger, correct permissions, PR-branch checkout, staleness detection prompt via claude-code-action@v1, and operational edge handling. `installWorkflows` scaffolds the file during init with capability gating. 30 template tests + 8 init integration tests verify structure, content, and scaffolding. Live staleness detection accuracy is milestone-level UAT.
- Notes: Action is installed into user repos by the CLI, not run in the driftless repo itself

### R013 — GitHub Action: PR-triggered e2e test generation

- Class: core-capability
- Status: validated
- Description: A distributable GitHub Action that detects new/changed flows in a PR and generates missing e2e tests via claude-code-action, committing them to the PR
- Why it matters: Closes the loop — not just docs from tests, but tests themselves stay current
- Source: user
- Primary owning slice: M002/S02
- Supporting slices: none
- Validation: M002/S02 — `testGenWorkflowTemplate(config)` produces valid GitHub Actions YAML with pull_request trigger, permissions, PR-branch checkout, fork detection, API key check, bot-loop prevention, and claude-code-action@v1 step with e2e-writer prompt. Init scaffolds the workflow for e2e-writer capability with full capability matrix proven. 35 template tests + capability matrix init tests verify structure, content, and scaffolding. Live test-generation accuracy is milestone-level UAT.
- Notes: Independent from doc updater — user can install one or both

### R014 — GitHub Action uses claude-code-action

- Class: integration
- Status: validated
- Description: Both GitHub Actions use `anthropics/claude-code-action@v1` as the inference backend
- Why it matters: Standard, maintained integration path — no custom API wiring needed
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S02
- Validation: M002/S01 — doc-update workflow template output contains `anthropics/claude-code-action@v1` step with `anthropic_api_key` input and `allowed_tools`. Verified by unit tests on template content.
- Notes: Requires ANTHROPIC_API_KEY as repo secret in user's repo

### R015 — Modular capability selection

- Class: primary-user-loop
- Status: validated
- Description: User can choose to install e2e test generation only, doc generation only, or both — each capability is independent and composable
- Why it matters: Not every team wants both — some just want automated tests, some just want docs
- Source: user
- Primary owning slice: M001/S04
- Supporting slices: M001/S02
- Validation: M001/S04 — `installSkills()` installs only selected capabilities. Empty capabilities = no writes. Each skill installs independently. 25 unit tests verify capability gating and independent installation.
- Notes: Choice persisted in .driftless.json and affects which skills + actions are installed

### R016 — npm package with semantic versioning

- Class: launchability
- Status: active
- Description: driftless is published to npm with proper semantic versioning, `bin` field for CLI, and `files` field for minimal package size
- Why it matters: Users install via `npx driftless init` — it must be on npm
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: unmapped
- Notes: none

### R017 — CHANGELOG.md with conventional commits

- Class: launchability
- Status: active
- Description: Automated CHANGELOG generation from conventional commit messages
- Why it matters: Users and contributors need to see what changed between versions
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: none
- Validation: unmapped
- Notes: none

### R018 — CI/CD pipeline for driftless repo

- Class: operability
- Status: active
- Description: GitHub Actions workflow for test, lint, build on PRs; automated npm publish on tagged releases
- Why it matters: Prevents broken releases and automates the publish flow
- Source: user
- Primary owning slice: M003/S02
- Supporting slices: none
- Validation: unmapped
- Notes: This is CI for driftless itself, not the actions it installs

### R019 — OSS community files

- Class: launchability
- Status: active
- Description: LICENSE (MIT), CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, .github/ISSUE_TEMPLATE/, .github/PULL_REQUEST_TEMPLATE.md
- Why it matters: Professional OSS repos have these — signals trust and invites contribution
- Source: user
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: unmapped
- Notes: none

### R020 — GitHub repo hygiene

- Class: launchability
- Status: active
- Description: Topics, description, social preview, branch protection rules configured on the GitHub repo
- Why it matters: Discoverability and professionalism — first impression for potential users/contributors
- Source: user
- Primary owning slice: M003/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Use agent-browser native skill for GitHub UI operations

### R021 — Vercel landing/marketing page

- Class: launchability
- Status: active
- Description: A polished marketing landing page deployed on Vercel that explains what driftless does, shows usage examples, and links to docs/GitHub
- Why it matters: The front door — first thing potential users see
- Source: user
- Primary owning slice: M004/S01
- Supporting slices: none
- Validation: unmapped
- Notes: none

### R022 — Fumadocs documentation site

- Class: launchability
- Status: active
- Description: A documentation site built with fumadocs covering installation, configuration, usage guides, and API reference for driftless
- Why it matters: Users need to know how to use the tool — and dogfooding fumadocs validates our own adapter
- Source: user
- Primary owning slice: M004/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Dogfooding opportunity — driftless docs built with a framework driftless supports

### R023 — X/Twitter product launch playbook

- Class: launchability
- Status: active
- Description: A day-by-day posting strategy for launching driftless on X/Twitter, targeting SWE communities
- Why it matters: Open source tools need visibility to get adoption and contributors
- Source: user
- Primary owning slice: M004/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Format, structure, and engagement optimization informed by web research during M004 planning

### R024 — Launch playbook informed by web research

- Class: quality-attribute
- Status: active
- Description: M004 planning includes active google_search research for OSS launch best practices, SWE community engagement on X, optimal post structure, and playbook format decisions
- Why it matters: Launch strategy should be evidence-based, not guesswork
- Source: user
- Primary owning slice: M004/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Research covers: playbook format (spreadsheet, doc, tool), post structure for engagement, SWE community norms on X

### R025 — Claude-first with documented future harness support

- Class: constraint
- Status: active
- Description: v1 supports Claude Code CLI only as the agent harness. README and docs clearly state intent to support additional harnesses in the future.
- Why it matters: Focuses v1 scope while preserving the path to broader harness support
- Source: user
- Primary owning slice: M001
- Supporting slices: M003/S03
- Validation: unmapped
- Notes: Other harnesses (Codex, Gemini CLI) are documented as future intent

### R033 — Vite+ as unified toolchain

- Class: constraint
- Status: validated
- Description: Use Vite+ (`vp`) for all development tooling: dev server, linting + formatting + type-checking (`vp check`), testing (`vp test`), building (`vp build`), library packaging (`vp pack`), and monorepo task orchestration (`vp run`)
- Why it matters: One tool instead of six (turborepo + tsup + vitest + biome + eslint + prettier). Less config, fewer dependencies, modern Rust-based performance.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: M001/S01 — vp pack builds both packages, vp check passes format + lint, vp test runs Vitest (5 tests), vp run -r build orchestrates workspace. Note: vp check does not include typecheck (format + lint only).
- Notes: Vite+ manages pnpm and node versions. Uses Oxlint/Oxfmt for lint/format, Vitest for tests, Rolldown/tsdown for build/pack.

### R034 — pnpm workspaces for monorepo structure

- Class: constraint
- Status: validated
- Description: Monorepo uses pnpm workspaces (managed by Vite+) with packages/ and apps/ directories
- Why it matters: Clean separation of CLI, core logic, GitHub Action, landing page, and docs site
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: M001/S01 — pnpm ls -r shows correct workspace topology with packages/cli and packages/core linked via workspace protocol.
- Notes: Workspace protocol for internal deps

### R035 — TypeScript strict mode, ESM-first

- Class: quality-attribute
- Status: validated
- Description: TypeScript strict mode enabled, ESM as primary module format with CJS compatibility where needed
- Why it matters: Type safety and modern module resolution — best practices for 2025+ packages
- Source: research
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: M001/S01 — all tsconfig.json files have strict:true, all package.json files have "type":"module", build output is ESM (.mjs), runtime verified with node packages/cli/dist/index.mjs.
- Notes: none

## Deferred

### R026 — `driftless eject` command

- Class: quality-attribute
- Status: deferred
- Description: A command to cleanly remove all driftless config, skills, and actions from a target repo
- Why it matters: Users who want to stop using driftless shouldn't have to manually clean up
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — focus on install path first, eject is a nice-to-have

### R027 — Monorepo awareness

- Class: quality-attribute
- Status: deferred
- Description: Handle repos where e2e tests and docs live in different packages within a monorepo
- Why it matters: Many teams use monorepos — driftless should work in them
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — single-package repos first, monorepo support as adoption reveals real needs

### R028 — Additional agent harness support

- Class: core-capability
- Status: deferred
- Description: Support Codex, Gemini CLI, and other agent harnesses beyond Claude Code
- Why it matters: Broadens potential user base to teams not on Claude
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Documented as future intent in README and docs

### R029 — Broader doc automation

- Class: core-capability
- Status: deferred
- Description: Generate API docs from code, README sections, and other non-test documentation sources
- Why it matters: Natural extension of the platform once e2e-to-docs is proven
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: On the repo timeline for the future — not in v1

### R030 — Direct Anthropic API fallback

- Class: integration
- Status: deferred
- Description: Support direct Anthropic API usage as an alternative to Claude Code CLI
- Why it matters: Some users may have API keys but not the CLI installed
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Deferred — Claude Code CLI is simpler and avoids key management in driftless

## Out of Scope

### R031 — Generic "AI writes your docs" tool

- Class: anti-feature
- Status: out-of-scope
- Description: driftless is NOT a generic AI documentation tool. It specifically transforms e2e tests into training docs.
- Why it matters: Prevents scope creep and preserves the core differentiator — the insight that e2e tests are always current
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: The constraint is the feature

### R032 — Non-e2e-test doc sources for v1

- Class: anti-feature
- Status: out-of-scope
- Description: v1 does not generate docs from API code, type definitions, README templates, or any source other than e2e tests
- Why it matters: Sharp product boundary — e2e tests ↔ training docs, period
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Broader automation deferred to future milestones

## Traceability

| ID   | Class              | Status       | Primary owner | Supporting         | Proof    |
| ---- | ------------------ | ------------ | ------------- | ------------------ | -------- |
| R001 | primary-user-loop  | validated    | M001/S02      | none               | M001/S02 |
| R002 | core-capability    | validated    | M001/S03      | none               | M001/S03 |
| R003 | core-capability    | validated    | M001/S03      | M001/S04           | M001/S03 |
| R004 | core-capability    | validated    | M001/S03      | M001/S04           | M001/S03 |
| R005 | core-capability    | validated    | M001/S04      | none               | M001/S04 |
| R006 | quality-attribute  | validated    | M001/S03      | none               | M001/S03 |
| R007 | failure-visibility | validated    | M001/S05      | M001/S02, M001/S03 | M001/S05 |
| R008 | failure-visibility | validated    | M001/S05      | none               | M001/S05 |
| R009 | core-capability    | validated    | M001/S02      | M001/S03, M001/S04 | M001/S02 |
| R010 | quality-attribute  | validated    | M001/S02      | none               | M001/S02 |
| R011 | quality-attribute  | validated    | M001/S05      | none               | M001/S05 |
| R012 | core-capability    | validated    | M002/S01      | M002/S02           | M002/S01 |
| R013 | core-capability    | validated    | M002/S02      | none               | M002/S02 |
| R014 | integration        | validated    | M002/S01      | M002/S02           | M002/S01 |
| R015 | primary-user-loop  | validated    | M001/S04      | M001/S02           | M001/S04 |
| R016 | launchability      | active       | M003/S01      | none               | unmapped |
| R017 | launchability      | active       | M003/S01      | none               | unmapped |
| R018 | operability        | active       | M003/S02      | none               | unmapped |
| R019 | launchability      | active       | M003/S03      | none               | unmapped |
| R020 | launchability      | active       | M003/S03      | none               | unmapped |
| R021 | launchability      | active       | M004/S01      | none               | unmapped |
| R022 | launchability      | active       | M004/S02      | none               | unmapped |
| R023 | launchability      | active       | M004/S03      | none               | unmapped |
| R024 | quality-attribute  | active       | M004/S03      | none               | unmapped |
| R025 | constraint         | active       | M001          | M003/S03           | unmapped |
| R026 | quality-attribute  | deferred     | none          | none               | unmapped |
| R027 | quality-attribute  | deferred     | none          | none               | unmapped |
| R028 | core-capability    | deferred     | none          | none               | unmapped |
| R029 | core-capability    | deferred     | none          | none               | unmapped |
| R030 | integration        | deferred     | none          | none               | unmapped |
| R031 | anti-feature       | out-of-scope | none          | none               | n/a      |
| R032 | anti-feature       | out-of-scope | none          | none               | n/a      |
| R033 | constraint         | validated    | M001/S01      | none               | M001/S01 |
| R034 | constraint         | validated    | M001/S01      | none               | M001/S01 |
| R035 | quality-attribute  | validated    | M001/S01      | none               | M001/S01 |

## Coverage Summary

- Active requirements: 10
- Mapped to slices: 10
- Validated: 18
- Unmapped active requirements: 0
