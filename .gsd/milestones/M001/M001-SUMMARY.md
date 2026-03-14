---
id: M001
provides:
  - "driftless CLI: `npx driftless init` interactive wizard with test framework auto-detection"
  - "Agent-driven doc generation: Claude Code CLI headless spawner with timeout escalation, per-file pipeline, framework adapters"
  - "Three doc framework adapters: plain-md, fumadocs MDX, docusaurus MDX (prompt templates, not post-processors)"
  - "Composable skill installer: parameterized SKILL.md templates for doc-generator and e2e-writer capabilities"
  - "Fail-safe init: FileTransaction rollback on error, DebugLogger structured JSON output, real --dry-run preview"
  - "Config persistence: .driftless.json with atomic writes, test framework detection for 6 frameworks"
  - "pnpm monorepo with Vite+ toolchain: packages/cli + packages/core, vp pack/check/test all operational"
  - "146 tests across 11 test files covering all packages and integration points"
key_decisions:
  - "D001: Claude Code CLI only as agent harness (headless mode, no API key management)"
  - "D002: Vite+ as unified toolchain (replaces turborepo + tsup + vitest + biome/eslint/prettier)"
  - "D005: @clack/prompts for interactive CLI UX"
  - "D007: Agent-driven test interpretation (no custom parsers per framework)"
  - "D011: Rollback + debug log on init failure"
  - "D017: vp pack (not vp build) for library packages"
  - "D024: Atomic config writes via temp+rename"
  - "D027: Adapters as prompt templates, not post-processors"
  - "D028: One agent invocation per test file"
  - "D033: Pre-existence flag rollback (not content snapshots)"
  - "D034: Integration tests use real temp dirs with real transaction/logger"
patterns_established:
  - "Command pattern: commands/{name}.ts exports async {name}Command(options)"
  - "Prompt pattern: prompts/{name}-prompts.ts exports async gather{Name}() with @clack/prompts group()"
  - "Atomic write pattern: write to temp then fs.rename — config, docs, skills all use this"
  - "Detection map as exported const: FRAMEWORK_CONFIG_MAP inspectable at runtime"
  - "AgentResult captures per-invocation diagnostics (stdout, stderr, duration, cost, exit code, typed error)"
  - "Generator pipeline: resolve globs → read files → spawn per file → write output → accumulate results"
  - "ProgressCallback with start/complete/error events per file for UX consumption"
  - "Skill templates as inline string functions parameterized via DriftlessConfig"
  - "Core utility classes (FileTransaction, DebugLogger) as pure node:fs/promises with no external deps"
  - "Flush-never-throws pattern for diagnostic output"
observability_surfaces:
  - ".driftless/debug.log — JSON array with timestamped entries per init phase (detect, config, generate, skills, error, rollback, complete, dry-run)"
  - "AgentResult.error prefix distinguishes failure type: 'timed out', 'non-zero exit', 'spawn error', 'invalid JSON'"
  - "AgentResult.stderr preserves raw error output from Claude Code CLI"
  - "AgentResult.durationMs and costUsd for performance/cost tracking per invocation"
  - "GenerateResult.errors array with file path and error string per failed file"
  - "FileTransaction.rollback() returns cleaned paths array — auditable"
  - "npx vp test — 146 tests, 11 files, single command for full verification"
  - "node packages/cli/dist/index.mjs --version — proves bundle integrity"
  - "vp check — format + lint pass (35 files formatted, 26 linted)"
requirement_outcomes:
  - id: R001
    from_status: active
    to_status: validated
    proof: "M001/S02 — full prompt flow via @clack/prompts group(), CLI routing, 11 init tests + 8 CLI routing tests pass"
  - id: R002
    from_status: active
    to_status: validated
    proof: "M001/S03 — spawnAgent() sends raw test content with no framework-specific parsing; 9 agent + 22 adapter tests"
  - id: R003
    from_status: active
    to_status: validated
    proof: "M001/S03 — spawnAgent() spawns claude -p in headless mode with timeout escalation; generateDocs() orchestrates pipeline; 9+8+6 tests"
  - id: R004
    from_status: active
    to_status: validated
    proof: "M001/S03 — three adapter prompt templates with format-specific markers; 22 adapter tests verify all frameworks"
  - id: R005
    from_status: active
    to_status: validated
    proof: "M001/S04 — installSkills() writes parameterized SKILL.md files; 25 unit + 4 integration tests"
  - id: R006
    from_status: active
    to_status: validated
    proof: "M001/S03 — spinner with per-file progress via ProgressCallback; agent output hidden; 6 init generation tests"
  - id: R007
    from_status: active
    to_status: validated
    proof: "M001/S05 — DebugLogger writes JSON array to .driftless/debug.log; flush-never-throws; 5 logger + init integration tests"
  - id: R008
    from_status: active
    to_status: validated
    proof: "M001/S05 — FileTransaction rollback removes new files, preserves pre-existing; 10 transaction + rollback integration tests"
  - id: R009
    from_status: active
    to_status: validated
    proof: "M001/S02 — .driftless.json atomic writes with round-trip verification; 8 config tests"
  - id: R010
    from_status: active
    to_status: validated
    proof: "M001/S02 — detectTestFramework() scans 6 frameworks by config file; 11 detection tests"
  - id: R011
    from_status: active
    to_status: validated
    proof: "M001/S05 — dry-run shows file listing, writes nothing; integration tests verify zero files written"
  - id: R015
    from_status: active
    to_status: validated
    proof: "M001/S04 — capability selection drives skill installation; empty/single/both combinations tested"
  - id: R033
    from_status: active
    to_status: validated
    proof: "M001/S01 — vp pack builds both packages, vp check passes, vp test runs 146 tests, vp run -r build orchestrates workspace"
  - id: R034
    from_status: active
    to_status: validated
    proof: "M001/S01 — pnpm ls -r shows workspace topology with workspace protocol linking"
  - id: R035
    from_status: active
    to_status: validated
    proof: "M001/S01 — strict:true in all tsconfigs, type:module in all packages, ESM .mjs output"
duration: ~2.5h
verification_result: passed
completed_at: 2026-03-14
---

# M001: Core CLI + E2E-to-Docs Engine

**Interactive CLI with agent-driven doc generation from e2e tests, framework adapters for 3 doc formats, composable skill installer, fail-safe init with rollback/debug-log/dry-run — 146 tests across the full pipeline.**

## What Happened

Built the driftless CLI from an empty repo to a working `npx driftless init` flow across five slices.

**S01** established the pnpm monorepo with Vite+ (`vp`) as the unified toolchain. Two library packages — `packages/core` (shared types/logic) and `packages/cli` (the CLI tool) — building with ESM output and TypeScript declarations. Hit and resolved several Vite+ alpha-stage issues: curl installer returning 403 (switched to npm global), tsgo failing to resolve native-preview (used standard dts), oxfmt/oxlint needing standalone JSON configs instead of `.ts` config on Node 20.

**S02** built the interactive wizard layer. Extended the core type contract with `Capability`, `TestFramework`, and full `DriftlessConfig` fields. Implemented `detectTestFramework()` scanning 6 frameworks by config file presence, config read/write with atomic temp+rename writes, and the `@clack/prompts` group() wizard flow. CLI routing handles `init`, `--version`, `--help`, `--dry-run`, and unknown commands.

**S03** delivered the core value — agent-driven doc generation. `spawnAgent()` shells out to `claude -p --output-format json` with timeout escalation (SIGTERM→5s grace→SIGKILL), three framework adapter prompt templates (plain-md, fumadocs MDX, docusaurus MDX) providing format-specific instructions without post-processing, and `generateDocs()` orchestrating the glob→read→spawn→write pipeline with per-file progress callbacks. Wired into init command with a spinner showing real-time file-by-file progress.

**S04** added composable skill installation. Template functions produce parameterized SKILL.md content for doc-generator (with framework-dispatched callout syntax) and e2e-writer (with test paths and framework name). `installSkills()` writes to the target repo's skills directory, gated on user's capability selections.

**S05** made init fail-safe. `FileTransaction` tracks all file/directory creation with pre-existence flags and rolls back in reverse order on error. `DebugLogger` accumulates timestamped JSON entries and flushes to `.driftless/debug.log` (flush-never-throws pattern). `--dry-run` runs glob resolution and path computation to show what would be created without spawning the agent or writing files. The full init pipeline — config write, doc generation, skill installation — is wrapped in the transaction boundary.

## Cross-Slice Verification

**Success Criteria:**

1. **"A developer with e2e tests can run `npx driftless init` and get training docs generated"** — ✅ `initCommand()` orchestrates detect→prompt→config→generate→skills with 33 init integration tests covering the full flow. `node packages/cli/dist/index.mjs --help` confirms the built binary exposes the init command.

2. **"Generated docs match the selected framework format"** — ✅ 22 adapter tests verify format-specific markers (blockquotes for plain-md, MDX callouts for fumadocs, admonitions for docusaurus). Generator tests verify `.mdx` extension for fumadocs output. No cross-contamination between formats.

3. **"CLI detects existing test configuration and pre-fills prompts"** — ✅ `detectTestFramework()` returns correct framework from 6 config file types (Playwright, Cypress, TestCafe, Detox, WebdriverIO, Nightwatch). 11 detection tests including priority ordering and undefined for no match.

4. **"Skills installed and configured for user's repo layout and doc framework"** — ✅ `installSkills()` writes framework-parameterized SKILL.md files. 25 unit tests verify template content for all 3 frameworks + installer filesystem behavior. 4 integration tests verify init wiring.

5. **"`--dry-run` previews all changes without modifying the repo"** — ✅ Dry-run resolves globs, computes output filenames and skill paths, renders preview via `p.log`. No agent spawn, no file writes. Integration tests verify zero files written to disk.

6. **"Failed init leaves the repo unchanged with a debug log"** — ✅ FileTransaction rollback removes newly-created files (respecting pre-existing paths). DebugLogger writes structured JSON to `.driftless/debug.log` even on failure. 10 transaction tests + rollback integration tests verify forced-failure cleanup.

**Contract Verification:**
- `npx vp test` — 146 tests pass across 11 test files, 0 failures
- `npx vp run -r build` — both packages build clean (core: 580ms, cli: 411ms)
- `npx vp check` — 35 files formatted, 26 linted, 0 errors/warnings
- `node packages/cli/dist/index.mjs --version` → `driftless v0.0.0`
- `node packages/cli/dist/index.mjs --help` → usage text with all commands/options

**Note on live agent testing:** All generation tests mock the Claude Code subprocess. Live agent integration (real Claude Code auth, real e2e test files, real doc output quality) was correctly scoped as milestone-level UAT requiring a real repo with real tests — not automated test coverage. The pipeline mechanics are proven; output quality depends on Claude Code's inference.

## Requirement Changes

- R001: active → validated — full init wizard with @clack/prompts, 11+8 tests
- R002: active → validated — agent-driven interpretation with no custom parsers, 9+22 tests
- R003: active → validated — Claude Code headless spawner with timeout/error handling, 9+8+6 tests
- R004: active → validated — three framework adapters as prompt templates, 22 tests
- R005: active → validated — skill installer with parameterized templates, 25+4 tests
- R006: active → validated — spinner UX with per-file progress, hidden agent output, 6 tests
- R007: active → validated — DebugLogger with structured JSON output, 5+integration tests
- R008: active → validated — FileTransaction rollback preserving pre-existing files, 10+integration tests
- R009: active → validated — .driftless.json atomic writes with round-trip, 8 tests
- R010: active → validated — 6-framework auto-detection by config file, 11 tests
- R011: active → validated — dry-run preview without writes, integration tests
- R015: active → validated — capability selection drives skill installation, independent install tested
- R033: active → validated — Vite+ vp pack/check/test/run all operational on monorepo
- R034: active → validated — pnpm workspace topology with protocol linking
- R035: active → validated — strict:true, type:module, ESM output everywhere
- R025: remains active — Claude-first implementation complete (agentHarness: "claude-code"), but documentation of future harness support is M003/S03 scope

## Forward Intelligence

### What the next milestone should know
- The CLI is fully functional but unpublished. `packages/cli/package.json` has `bin.driftless` wired to `dist/index.mjs`. M002 (GitHub Actions) needs the config schema from `@driftless/core` — import types and config reader from the barrel export.
- The `DriftlessConfig.capabilities` array drives what gets installed. M002 actions should read `.driftless.json` to determine which automation to run on PRs.
- Agent spawning is in `packages/core/src/agent.ts`. The GitHub Action (M002) will use `claude-code-action@v1` instead, so the agent spawner is CLI-specific. But `AgentResult` types and the adapter prompt templates are reusable.
- `FRAMEWORK_CONFIG_MAP` and `SKILL_TEMPLATES` are exported constants — M002 can inspect them at runtime for coverage/routing decisions.

### What's fragile
- `vi.importActual("@driftless/core")` in `init.test.ts` requires the core package to be built first — `npx vp test` fails if run before `npx vp run -r build`. CI must build before test.
- Agent JSON parsing assumes Claude Code `--output-format json` produces `{ result: string }`. If the CLI output format changes, `agent.ts` fails silently (empty result, not crash).
- `vp check` does not include typecheck — only format + lint via oxfmt/oxlint. TypeScript errors require separate `npx tsc --noEmit`.
- Node 22+ required by engines field. Global `vp` binary needs Node ≥22.12.0. Shell defaulting to older Node causes subtle failures.
- The official Vite+ curl installer returns HTTP 403 as of 2026-03-14. CI must use `npm install -g vite-plus`.

### Authoritative diagnostics
- `npx vp test` — 146 tests, 11 files. Single source of truth for all package behavior.
- `node packages/cli/dist/index.mjs --version` — proves bundle integrity end-to-end.
- `.driftless/debug.log` — parse as JSON array, filter by `.phase` field for per-phase diagnostics.
- `AgentResult.error` prefix string indicates failure type — grep for "timed out", "non-zero exit", "spawn error", "invalid JSON".

### What assumptions changed
- Vite+ scaffold was not directly usable — had to manually create the monorepo structure after studying scaffold output. The scaffold is designed for a different project shape.
- `vp check` doesn't include typecheck (only format + lint). Assumed it was a full check.
- The init command wiring accumulated across S03/S04/S05 rather than being built in one slice — S05's T02 was primarily test alignment and a bug fix rather than greenfield work.
- Test count grew from initial 5 (S01) to 146 (S05) — roughly 30 tests per slice, higher than initial estimates.

## Files Created/Modified

- `pnpm-workspace.yaml` — workspace config with catalog, overrides, packages/* glob
- `package.json` — root package with build/check/test scripts
- `tsconfig.json` — root strict TypeScript config
- `.oxfmtrc.json` — oxfmt formatting config
- `.oxlintrc.json` — oxlint linting config
- `.nvmrc` — pins Node 22
- `.gitignore` — dist/, node_modules/, cache dirs
- `packages/core/package.json` — @driftless/core library package
- `packages/core/vite.config.ts` — pack config with dts:true
- `packages/core/tsconfig.json` — strict TypeScript for library
- `packages/core/src/types.ts` — full type contract (DriftlessConfig, AgentResult, GenerateResult, FileTransaction types, etc.)
- `packages/core/src/index.ts` — barrel re-exports for all modules
- `packages/core/src/detect.ts` — test framework auto-detection (6 frameworks)
- `packages/core/src/config.ts` — .driftless.json read/write with atomic writes
- `packages/core/src/agent.ts` — Claude Code CLI subprocess spawner with timeout escalation
- `packages/core/src/adapters.ts` — three framework prompt templates + dispatcher
- `packages/core/src/generator.ts` — doc generation pipeline orchestrator
- `packages/core/src/skills.ts` — skill template functions and installer
- `packages/core/src/transaction.ts` — FileTransaction class with rollback
- `packages/core/src/logger.ts` — DebugLogger class with flush-never-throws
- `packages/core/test/*.test.ts` — 10 test files covering all core modules (113 tests)
- `packages/cli/package.json` — driftless CLI with bin field and @clack/prompts dep
- `packages/cli/vite.config.ts` — pack config with dts:true
- `packages/cli/tsconfig.json` — strict TypeScript for library
- `packages/cli/src/index.ts` — CLI entry point with arg routing
- `packages/cli/src/commands/init.ts` — init command orchestrator (full pipeline with transaction/logger/dry-run)
- `packages/cli/src/prompts/init-prompts.ts` — @clack/prompts wizard flow
- `packages/cli/test/cli.test.ts` — 8 CLI routing tests
- `packages/cli/test/init.test.ts` — 33 init integration tests with real temp dirs
