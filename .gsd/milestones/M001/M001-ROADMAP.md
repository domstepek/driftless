# M001: Core CLI + E2E-to-Docs Engine

**Vision:** A developer runs `npx driftless init` in their repo, answers a few prompts, and gets generated markdown training docs from their e2e tests — with composable skills installed for ongoing automation. The CLI handles detection, generation, and configuration in one interactive flow.

## Success Criteria

- A developer with e2e tests can run `npx driftless init` and get training docs generated from their tests
- The generated docs match the selected framework format (plain md, fumadocs MDX, docusaurus MDX)
- The CLI detects existing test configuration and pre-fills prompts
- Skills are installed and configured for the user's specific repo layout and doc framework
- `--dry-run` previews all changes without modifying the repo
- Failed init leaves the repo unchanged with a debug log for troubleshooting

## Key Risks / Unknowns

- Claude Code headless mode integration — spawning as subprocess, parsing output, handling failures. This is the critical path.
- Prompt quality for test interpretation — the agent must reliably understand arbitrary e2e frameworks and produce consistent docs. Quality variance across frameworks is the risk.
- Vite+ maturity — alpha-stage tooling may have gaps for our monorepo shape.

## Proof Strategy

- Claude Code headless integration → retire in S03 by proving the CLI can spawn Claude Code, pass test files, receive generated docs, and handle failure gracefully
- Prompt quality → retire in S03 by generating docs from at least two different test frameworks (Playwright and one other) and verifying output quality
- Vite+ maturity → retire in S01 by proving `vp build`, `vp check`, `vp test` all work on our monorepo structure

## Verification Classes

- Contract verification: `vp check` passes (lint + format + typecheck), `vp test` passes, all packages build
- Integration verification: CLI spawns Claude Code, receives output, writes correctly formatted docs
- Operational verification: `--dry-run` mode works, rollback on failure works, debug log captures full run
- UAT / human verification: generated docs are readable and accurate for a real repo's tests

## Milestone Definition of Done

This milestone is complete only when all are true:

- All five slices are complete with passing verification
- `npx driftless init` works end-to-end in a real repo with real e2e tests
- Claude Code generates docs that match the selected framework format
- Skills are installed and configured correctly in the target repo
- `--dry-run` shows what would happen without writing files
- Failed init (e.g., agent not found) leaves repo unchanged with a useful debug log
- All success criteria are re-checked against live behavior

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R015, R025, R033, R034, R035
- Partially covers: none
- Leaves for later: R012, R013, R014 (M002); R016-R020 (M003); R021-R024 (M004)
- Orphan risks: none

## Slices

- [ ] **S01: Monorepo scaffold + Vite+ toolchain** `risk:medium` `depends:[]`
  > After this: `vp build`, `vp check`, `vp test` all pass on the project skeleton. CLI package has a working entry point that prints `driftless v0.0.0`. The monorepo structure is real and exercised — not just files on disk.

- [ ] **S02: Interactive CLI wizard** `risk:medium` `depends:[S01]`
  > After this: `npx driftless init` runs an interactive wizard — detects test framework config, prompts for paths/framework/capabilities, writes `.driftless.json`. No doc generation yet, but the full prompt flow works end-to-end.

- [ ] **S03: Agent-driven doc generation** `risk:high` `depends:[S02]`
  > After this: The CLI spawns Claude Code in headless mode, passes e2e test files, and receives generated markdown docs in the correct framework format. Progress spinner shows file-by-file status. This proves the core thesis.

- [ ] **S04: Skill installer + capability selection** `risk:medium` `depends:[S02,S03]`
  > After this: CLI copies genericized skill files into the target repo's `.skills/` directory, configured for the user's doc framework and capability choices. Skills are correctly parameterized and ready for the GitHub Action (M002).

- [ ] **S05: Rollback, debug logging, dry-run** `risk:low` `depends:[S02,S03,S04]`
  > After this: `--dry-run` previews all init changes. Failed init rolls back all filesystem changes. Every run writes a structured debug log to `.driftless/debug.log`. Init is idempotent — safe to re-run.

## Boundary Map

### S01 → S02

Produces:
- `packages/cli/src/index.ts` — CLI entry point with command routing (exports: `main()`)
- `packages/core/src/index.ts` — shared types and utilities (exports: `DriftlessConfig`, `InitOptions`, `DocFramework`)
- `packages/cli/package.json` — `bin.driftless` pointing to built CLI
- Working Vite+ toolchain: `vp build`, `vp check`, `vp test` all functional

Consumes:
- nothing (first slice)

### S02 → S03

Produces:
- `packages/cli/src/commands/init.ts` — init command orchestrator (exports: `initCommand()`)
- `packages/cli/src/prompts/` — prompt modules using @clack/prompts (exports: `gatherConfig()`)
- `packages/core/src/config.ts` — config read/write for `.driftless.json` (exports: `readConfig()`, `writeConfig()`, `detectTestFramework()`)
- `packages/core/src/types.ts` — full config schema (exports: `DriftlessConfig`, `DocFramework`, `Capability`)

Consumes from S01:
- CLI entry point and command routing
- Core package types

### S02 → S04

Produces:
- Same as S02 → S03 (config + types are shared)

Consumes from S01:
- CLI entry point and command routing

### S03 → S04

Produces:
- `packages/core/src/agent.ts` — Claude Code headless spawner (exports: `spawnAgent()`, `AgentResult`)
- `packages/core/src/generator.ts` — doc generation orchestrator (exports: `generateDocs()`)
- `packages/core/src/adapters/` — framework-specific formatters (exports: `PlainMdAdapter`, `FumadocsAdapter`, `DocusaurusAdapter`)

Consumes from S02:
- Config schema and reader
- Init command orchestrator (generation is called from init flow)

### S03 → S05

Produces:
- Agent spawning and doc generation logic (same as S03 → S04)

Consumes from S02:
- Config and init flow

### S04 → S05

Produces:
- `packages/core/src/skills/` — skill template files and installer (exports: `installSkills()`)
- `packages/core/src/skills/templates/` — genericized skill templates for doc-generator and e2e-writer

Consumes from S02:
- Config (capability choices, skill install path)
Consumes from S03:
- Adapter selection (skill templates reference the same framework adapters)
