# M002: GitHub Actions + PR Automation — Research

**Date:** 2026-03-14

## Summary

M002's core deliverable is a set of GitHub Action workflow templates that driftless's `init` command scaffolds into user repos. These workflows fire on `pull_request` events and use `anthropics/claude-code-action@v1` to run Claude Code against the checked-out repo — invoking the `.skills/` files installed by M001 to update stale docs or generate missing e2e tests, then committing the results back to the PR branch.

The architecture is simpler than it first appears. `claude-code-action@v1` already handles: running Claude Code in the checked-out repo, auto-discovering `.skills/` directories (standard Claude Code behavior), file Read/Write/Edit operations, and git committing. The action's `prompt` input is the primary control surface — it tells Claude what to do. The `.skills/` SKILL.md files (already installed by M001) provide the domain knowledge for how to do it. This means M002 is primarily about: (1) authoring the right prompt templates for the two workflow files, (2) scaffolding those templates into user repos during `init`, and (3) handling the operational edges (missing API key, fork PRs, no-op when nothing changed, configurable capability selection).

The hardest inference problem — staleness detection (mapping changed files to affected docs) — is deliberately delegated to Claude via the prompt, not implemented as custom code. The prompt instructs Claude to inspect `git diff`, read the existing docs in `outputDir`, and determine which need updating. This is the same "agent interprets, no custom parsers" philosophy from M001 (D007). The risk is accuracy, but the mitigation is the same: the installed skill files provide enough structure that Claude produces reasonable results, and false positives (unnecessary doc updates) are annoying but not destructive.

## Recommendation

**Prove the doc-update workflow first.** It's the core "can't drift" promise and touches more operational edges (staleness detection, diff-based reasoning, commit-to-PR). The test generation workflow is structurally identical but lower risk — it only fires for genuinely new flows. Build the doc-update workflow template + init scaffolding as S01, then layer test generation as S02 reusing the same patterns.

The workflow templates should NOT be complex YAML. Each is a single job with 2-3 steps: checkout, then claude-code-action with a carefully-crafted prompt. The prompt is the product — it's where the intelligence lives. Keep the YAML minimal and put the domain knowledge in the skill files that are already in the repo.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Running Claude in GitHub Actions | `anthropics/claude-code-action@v1` | Standard maintained integration. Handles Claude process lifecycle, tool permissions, GitHub context. Required by D012. |
| File operations + git commit in Actions | claude-code-action built-in tools | Action has Read/Write/Edit and commit built-in by default. No need for separate `git add && git commit` bash steps. |
| Skill discovery in user repos | Claude Code auto-discovery of `.skills/` | Standard Claude Code behavior — scans `skills/` subdirectories for SKILL.md files. Already working from M001's install. |
| PR file change detection | `git diff` via claude-code-action prompt | Claude has read-only git access by default. Prompt instructs it to `git diff` the PR to identify changed files. No custom diff parsing needed. |
| Interactive CLI prompts | `@clack/prompts` (already in CLI) | Reuse existing prompt patterns from M001 init flow for capability/workflow selection. |

## Existing Code and Patterns

- `packages/core/src/skills.ts` — Skill template system. `docGeneratorTemplate()` and `e2eWriterTemplate()` produce parameterized SKILL.md content. **M002 extends this** with workflow template functions that produce GitHub Actions YAML, parameterized from `DriftlessConfig`.
- `packages/core/src/types.ts` — `DriftlessConfig` shape. No changes needed — `capabilities`, `testPaths`, `outputDir`, `docFramework`, `skillsDir` are all present and sufficient for workflow template parameterization.
- `packages/core/src/config.ts` — Config read/write. GitHub Action workflows will read `.driftless.json` at runtime (via Claude's Read tool) to understand the project's config. No config schema changes required.
- `packages/cli/src/commands/init.ts` — Init command flow. **M002 extends this** to scaffold workflow files into `.github/workflows/` after skill installation. Follow the existing transaction-wrapped write pattern.
- `packages/cli/src/prompts/init-prompts.ts` — Prompt flow. No changes needed — capability selection already captures whether user wants doc-generator, e2e-writer, or both. Workflow scaffolding can key off `config.capabilities`.
- `packages/core/src/adapters.ts` — Adapter prompts as system prompt fragments. The workflow templates' prompts should reference the skill files (which contain the adapter knowledge) rather than embedding adapter logic in the YAML.

## Constraints

- **Must use `anthropics/claude-code-action@v1`** (D012). No custom API integration.
- **Workflow files are static YAML templates** scaffolded at `init` time. They're not generated at runtime — they live in the user's `.github/workflows/` directory and reference `.driftless.json` + `.skills/` at action runtime.
- **Fork PRs cannot write** to the base repo. `GITHUB_TOKEN` from fork PRs has read-only permissions. The workflow must detect this and skip gracefully (log a message, don't fail the PR).
- **`contents: write` permission** required for the action to commit back to PR branches. Must be explicitly declared in the workflow YAML. When permissions are set for any scope, all unspecified scopes default to `none` — so `pull-requests: write` must also be declared for PR comments.
- **`actions/checkout` must use `ref: ${{ github.event.pull_request.head.ref }}`** to check out the actual PR branch (not the merge commit), so commits land on the correct branch.
- **Bash is disabled by default** in claude-code-action. Must explicitly allow `Bash(git diff:*)` in `claude_args` so Claude can inspect the PR diff. Read-only git is available by default, but `git diff` with specific arguments may need explicit allowlisting.
- **No `packages/action` runtime code needed.** The action is a YAML workflow template, not a custom JavaScript action. It delegates everything to claude-code-action. The `packages/action` workspace (mentioned in D003) is for the workflow templates and their tests, not for compiled action code.
- **Skills auto-discovered**: Claude Code automatically discovers `.skills/*/SKILL.md` files when running in the repo. The workflow prompt can reference skills by name without file paths.

## Common Pitfalls

- **Checking out the merge commit instead of the PR branch** — `pull_request` event defaults to checking out the merge commit (`refs/pull/N/merge`). Commits made here don't appear on the PR branch. Must use `ref: ${{ github.event.pull_request.head.ref }}` and `fetch-depth: 0` for full history.
- **Missing permission declarations** — If any `permissions:` key is set in the workflow YAML, all unspecified permissions default to `none`. Must declare `contents: write`, `pull-requests: write`, and `id-token: write` explicitly.
- **Infinite trigger loops** — Action commits trigger new `push` events. The workflow must use `[skip ci]` in commit messages or use conditional checks (`if: github.actor != 'github-actions[bot]'`) to prevent infinite re-triggering.
- **Overwriting user changes** — If the action commits to the PR branch while the user is also pushing, merge conflicts arise. The action should pull before committing, or use `git push --force-with-lease` as a safety mechanism.
- **Prompt sprawl** — Temptation to put all logic in the prompt. The prompt should delegate to the skill files ("read the doc-generator skill for instructions") rather than duplicating their content inline.
- **Testing workflow YAML validity** — YAML syntax errors in scaffolded workflows break silently (workflow doesn't trigger, no error). Integration tests should validate the YAML parses correctly and contains required keys.
- **ANTHROPIC_API_KEY not set** — Most common user setup failure. The workflow should have a clear early-exit step that checks for the secret and posts a helpful PR comment if missing, rather than failing with a cryptic claude-code-action error.

## Open Risks

- **Staleness detection accuracy** — Claude must infer which docs are affected by a given code change. This is semantic reasoning, not file-path matching. False negatives (missed stale docs) undermine the core promise. Mitigation: the prompt should be explicit about the reasoning chain (changed files → affected features → docs that describe those features), and the skill files already describe the doc↔test mapping.
- **Claude context window limits** — Large PRs with many changed files may exceed context limits when combined with all existing docs. May need a "targeted update" mode that only sends relevant docs, not all of them. This is a v1.1 concern — for launch, document the limitation.
- **Action execution time** — Claude inference is slow (30-120s per invocation). For PRs touching many docs, total time could exceed GitHub Actions limits. The prompt should instruct Claude to batch updates efficiently rather than one-doc-at-a-time.
- **`claude-code-action` breaking changes** — Pinned to `@v1` but action updates could change behavior. The prompt surface area is the primary risk — if the action changes how prompts are processed, workflows break silently.
- **New flow detection** (R013) — Determining whether a PR introduces a genuinely new user flow vs. refactoring an existing one is harder than staleness detection. This is inherently fuzzy. The skill file should provide heuristics (new test file = likely new flow; modified test file = likely existing flow change).

## Candidate Requirements

These emerged from research but are not yet in REQUIREMENTS.md. Flagging for planning review:

- **R-candidate: Infinite loop prevention** — Workflow must prevent re-triggering when the action commits to the PR branch. Table stakes for any commit-to-PR automation.
- **R-candidate: Fork PR graceful degradation** — Workflow must detect fork PRs and skip (with a PR comment explaining why) rather than failing. Expected behavior for OSS repos.
- **R-candidate: Missing API key detection** — Workflow should check for `ANTHROPIC_API_KEY` and post a helpful comment/annotation if missing, before attempting to invoke claude-code-action.
- **R-candidate: PR summary comment** — After updating docs or generating tests, the action should comment on the PR with a summary of what changed. This addresses the open question from M002-CONTEXT.md and is standard practice for bot-assisted PRs.
- **R-candidate: Init scaffolds workflow files** — `driftless init` should write `.github/workflows/driftless-*.yml` files based on selected capabilities. This is stated in the milestone context but not captured as a formal requirement.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| GitHub Actions | `wshobson/agents@github-actions-templates` | Available (5.1K installs) — generic GA templates, not specific enough to our use case |
| GitHub Actions | `dalestudy/skills@github-actions` | Available (282 installs) — low relevance |
| claude-code-action | `codyswanngt/lisa@claude-code-action` | Available (21 installs) — too niche/immature |

**Recommendation:** No external skills warranted. The workflow templates are straightforward YAML + prompt engineering, and the domain knowledge is specific to driftless's skill file format. General-purpose GA skills would add noise, not value.

## Sources

- claude-code-action v1 API: `prompt` input for automation mode, `claude_args` for `--allowedTools`, `--system-prompt`, `--max-turns`. Default tools include Read/Write/Edit and git commit. Bash disabled by default. (source: [claude-code-action docs](https://github.com/anthropics/claude-code-action))
- claude-code-action commit-to-PR pattern: checkout with `ref: ${{ github.event.pull_request.head.ref }}`, `permissions: contents: write`, `fetch-depth: 0`. Action commits via built-in tool. (source: [claude-code-action custom-automations](https://github.com/anthropics/claude-code-action/blob/main/docs/custom-automations.md))
- Claude Code skill auto-discovery: `.skills/*/SKILL.md` files are automatically discovered and loaded by Claude Code. Metadata loaded immediately, body loaded on trigger. (source: [Claude Code plugin docs](https://github.com/anthropics/claude-code))
- GitHub Actions fork PR permissions: `GITHUB_TOKEN` from fork PRs has read-only access. `pull_request` event runs in merge commit context. `pull_request_target` has elevated permissions but security risks. (source: [GitHub docs on pull_request permissions](https://github.blog))
- GitHub Actions permission scoping: When any `permissions:` key is declared, all unspecified scopes default to `none`. Must explicitly declare all needed scopes. (source: [GitHub Actions permissions docs](https://graphite.com))
- Infinite loop prevention: Commits by `github-actions[bot]` trigger `push` events. Use `[skip ci]` commit messages or actor-based conditionals to prevent loops. (source: [GitHub community](https://github.com))
