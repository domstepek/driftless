# M002: GitHub Actions + PR Automation — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning (after M001 completes)

## Project Description

M002 builds the distributable GitHub Actions that driftless installs into user repos. These actions run on every PR to detect stale docs, update them, and optionally generate missing e2e tests — all powered by `anthropics/claude-code-action@v1`.

## Why This Milestone

M001 gives users generated docs from a one-time `init` run. M002 makes those docs *stay current* — the "can't drift" promise. Without PR-triggered automation, docs rot as the codebase evolves.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Open a PR that changes application flows, and see the GitHub Action automatically update affected training docs
- Open a PR that introduces new flows, and optionally see the Action generate new e2e tests
- See updated docs and tests committed directly to their PR branch
- Configure which capabilities (doc updates, test generation, or both) the Action performs

### Entry point / environment

- Entry point: GitHub Actions triggered by `pull_request` events in the user's repo
- Environment: GitHub Actions runner (ubuntu-latest)
- Live dependencies involved: `anthropics/claude-code-action@v1`, the installed `.skills/` files from M001, `.driftless.json` config

## Completion Class

- Contract complete means: Action workflow YAML is valid, skills are invoked correctly, outputs match expected format
- Integration complete means: Action runs on a real PR in a real repo, detects changes, invokes Claude, commits updated docs
- Operational complete means: Action handles: no changes needed (skip), partial failures (report but don't block PR), ANTHROPIC_API_KEY missing (clear error)

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A PR that modifies an e2e test triggers the doc updater, which commits corrected docs to the PR branch
- A PR that adds a new user flow triggers the test generator (if enabled), which commits a new e2e test
- The Action respects the user's `.driftless.json` config for paths, framework, and capability selection
- The CLI's `init` command now also scaffolds the Action workflow file(s) into the user's `.github/workflows/`

## Risks and Unknowns

- **Staleness detection accuracy** — mapping changed files to affected features/docs is the hardest inference problem. False positives (unnecessary updates) are annoying; false negatives (missed staleness) undermine the core promise.
- **`claude-code-action` limitations** — action may have constraints on context length, execution time, or tool access that affect doc generation quality.
- **New flow detection** — determining whether a PR introduces a genuinely new user flow (vs. refactoring an existing one) requires semantic understanding of the codebase diff.
- **Commit-to-PR mechanics** — the Action needs to commit changes back to the PR branch. This has permissions implications (GITHUB_TOKEN scope, fork PRs, branch protection).

## Existing Codebase / Prior Art

- M001 deliverables: CLI, core package, agent spawner, doc generator, skill installer, config system
- `training-material-writer` skill — the updating workflow section (read existing doc → `git diff` → cross-reference → update) is directly relevant to the staleness detection logic
- `anthropics/claude-code-action@v1` — standard GitHub Action for Claude integration

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R012 — GitHub Action: PR-triggered doc staleness detection + update
- R013 — GitHub Action: PR-triggered e2e test generation for new flows
- R014 — GitHub Action uses claude-code-action
- R015 — Modular capability selection (tests only, docs only, or both)

## Scope

### In Scope

- Distributable GitHub Action workflow templates for doc updates and test generation
- Staleness detection logic (changed files → affected features → stale docs)
- Agent-driven doc update via claude-code-action
- Agent-driven e2e test generation for new flows
- Commit-to-PR mechanics
- CLI `init` updates to scaffold workflow files
- Clear error handling for missing API key, action failures

### Out of Scope / Non-Goals

- Running these actions on driftless's own repo (that's M003)
- Support for non-GitHub CI platforms
- Agent harnesses beyond Claude Code
- Manual doc editing workflows

## Technical Constraints

- Must work with `anthropics/claude-code-action@v1`
- Must respect `.driftless.json` config written by M001's `init`
- Must use the `.skills/` files installed by M001
- Action must handle fork PRs gracefully (may not have write access)
- GitHub Actions runner: ubuntu-latest

## Integration Points

- **`anthropics/claude-code-action@v1`** — the inference engine for the Action
- **`.driftless.json`** — config bridge between CLI (M001) and Actions (M002)
- **`.skills/`** — the agent skills that define how docs/tests are generated
- **GitHub API** — PR file list, branch commits, status checks

## Open Questions

- Should the Action comment on the PR with a summary of what it changed, or just commit silently? Leaning toward a comment for visibility.
- How to handle merge conflicts if the Action's commit conflicts with subsequent pushes to the PR?
- Rate limiting / cost concerns — should the Action have a configurable threshold for how many files trigger a full regeneration vs. targeted updates?
