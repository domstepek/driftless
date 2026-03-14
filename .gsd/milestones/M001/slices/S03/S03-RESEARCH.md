# S03: Agent-driven doc generation — Research

**Date:** 2026-03-14

## Summary

S03 is the critical path — spawning Claude Code in headless mode, passing test files, and writing framework-formatted docs. Research confirms the approach is viable: `claude -p --output-format json` works cleanly from Node.js `child_process.spawn()`, returning structured JSON with the generated text in a `result` field. The stream-json format (requires `--verbose`) provides real-time events for progress tracking but adds complexity. The simpler approach — one `claude -p` invocation per test file with `--output-format json` — is reliable, testable, and sufficient for v1.

The three framework adapter formats are well-understood: plain markdown (YAML frontmatter + md), Fumadocs MDX (`<Callout>` components, `title`/`description` frontmatter), and Docusaurus MDX (`:::` admonition syntax, `id`/`title`/`description`/`sidebar_position` frontmatter). Adapters are post-processing — they transform the agent's raw markdown output into the target format. However, the better strategy is to bake the format into the prompt itself so the agent generates the correct format natively, with adapters as a validation/normalization layer rather than a transformation layer.

The reference skill (`training-material-writer`) provides the prompt structure template — content source priority (e2e tests → page objects → components), document structure (frontmatter, intro, numbered steps, common problems), and writing style (second person, bold UI elements, present tense). This needs genericization: framework-specific components (Fumadocs `<Callout>`) become framework-parameterized, and the repo-specific paths become config-driven.

## Recommendation

**Use CLI spawning with `claude -p --output-format json` per file.** One invocation per test file (or describe block). The prompt includes:
1. The test file content
2. Format instructions specific to the chosen doc framework
3. The genericized training-material-writer structure

For progress UX, use `@clack/prompts` `spinner()` with `.message()` updates between files. No stream-json parsing needed — each file is a discrete unit with a spinner update on start/completion.

For the agent spawner, use `child_process.spawn` with:
- `stdin.end()` immediately (prompt passed as CLI arg)
- Timeout via `setTimeout` + `proc.kill()` (default 120s per file)
- `--no-session-persistence` to avoid polluting the user's Claude session list
- `--system-prompt` or `--append-system-prompt` for format instructions
- `--tools ""` to disable all tools (agent shouldn't be editing files or running commands — just generating text)

**Adapters are prompt templates, not post-processors.** Each adapter produces the system prompt fragment that instructs Claude on the output format (frontmatter shape, callout syntax, admonition syntax). The agent generates docs in the correct format directly. A lightweight normalization pass catches missing frontmatter or broken syntax.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| CLI arg parsing for claude invocation | `child_process.spawn` (Node built-in) | No dependency needed; proven to work with claude CLI |
| Progress spinner | `@clack/prompts` `spinner()` | Already installed (S02); has `.message()` for per-file updates, `.error()` for failures |
| Test file globbing | `node:fs` + `glob` or `node:fs/promises` with `readdir` | Need to resolve glob patterns from config to actual file paths |
| JSON parsing of agent output | Built-in `JSON.parse` | Claude `--output-format json` returns a single JSON blob |
| File writing | `node:fs/promises` `writeFile` + `mkdir` | Atomic write pattern from S02 config.ts can be reused |

## Existing Code and Patterns

- `packages/core/src/config.ts` — atomic write pattern (temp + rename). Reuse for doc file writes.
- `packages/core/src/types.ts` — `DriftlessConfig` type contract. Needs extension: `docGrouping` field (`"per-file" | "per-describe" | "agent-decides"`).
- `packages/cli/src/commands/init.ts` — `initCommand()` orchestrator. Generation hooks in after config write, before outro. This is the integration point.
- `packages/cli/src/prompts/init-prompts.ts` — prompt flow pattern with `@clack/prompts` `group()`. Needs a new `docGrouping` prompt added.
- `packages/core/src/index.ts` — barrel re-exports. New modules (`agent.ts`, `generator.ts`, adapters) must be added here.
- `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md` — reference skill for prompt engineering. Key patterns: content source priority order, required document structure (frontmatter → intro → numbered steps → common problems), writing style rules, Fumadocs callout syntax.

## Constraints

- **Claude Code CLI must be installed and authenticated on the user's machine.** Driftless does not manage Claude Code auth (D001). If `claude` is not in PATH or auth has expired, spawnAgent must fail with a clear error message.
- **No raw agent output visible to the user (R006).** All stdout/stderr from claude goes to internal buffers only. User sees spinner + file progress.
- **`--output-format json` returns a single JSON object**, not streaming. The `result` field contains the text. The `is_error` field and `subtype` indicate success/failure. `total_cost_usd` is available for logging.
- **`stream-json` requires `--verbose` flag.** This is more complex and unnecessary for v1 since we process one file at a time — spinner updates between files are sufficient.
- **Prompt is passed as a CLI positional argument**, not via stdin. Long prompts (full test files) may hit OS argument length limits (~2MB on macOS, ~128KB on some Linux). For safety, use stdin piping for the test file content and put the format instructions in `--system-prompt`.
- **`--tools ""`** disables all built-in tools. The agent should only generate text, not interact with the filesystem.
- **`--no-session-persistence`** prevents session pollution in the user's Claude session list.
- **`DriftlessConfig` needs `docGrouping` field** — not present in current types. S03 must add this to the type and update the S02 prompt flow. This is a backward-compatible addition (optional field with default).
- **`vp pack`** handles bundling with auto-discovered entry points from `src/index.ts`. New modules must be re-exported from the barrel.
- **Existing tests: 25 in core, 19 in CLI (44 total).** S03 tests must not break these.

## Common Pitfalls

- **OS argument length limits** — Passing large test files as CLI positional args will fail on some systems. Pipe test content via stdin instead: `proc.stdin.write(content); proc.stdin.end()`. Put the system prompt in `--system-prompt` or `--append-system-prompt`.
- **Claude CLI hanging in spawn** — Must close stdin (`proc.stdin.end()`) immediately after writing, or the process waits for more input. Confirmed working in direct testing.
- **Session persistence pollution** — Without `--no-session-persistence`, each generation run creates a session entry in the user's `claude --resume` list. Use the flag to keep things clean.
- **Timeout without cleanup** — If a spawn times out, `proc.kill()` sends SIGTERM but the process may linger. Use `proc.kill('SIGKILL')` as a fallback after a grace period, and ensure stdout/stderr listeners are removed to prevent memory leaks.
- **Partial JSON on timeout** — If the process is killed mid-output, `JSON.parse` on the partial stdout will throw. Handle this as a generation failure for that file.
- **Adapter as post-processor vs. prompt** — Post-processing markdown into MDX is fragile (regex on generated content). Better to include framework format instructions in the prompt so the agent generates correctly-formatted output. Light normalization only.
- **Missing `docGrouping` in existing configs** — Users who ran S02's wizard already have a `.driftless.json` without this field. Must default to `"per-file"` when reading configs missing this field.

## Open Risks

- **Prompt quality variance across test frameworks** — The agent must interpret Playwright `.spec.ts`, Cypress `.cy.js`, and arbitrary test frameworks. Quality of generated docs may vary. Mitigation: strong prompt template with explicit output structure expectations. Real validation requires testing with multiple framework samples.
- **Large test file context limits** — If a single test file exceeds Claude's context window (~200K tokens), generation will fail. No chunking strategy in v1 — document the limitation and let it surface as a generation error for that file.
- **Claude Code CLI version drift** — The `--output-format json` response schema isn't formally versioned. Field names (`result`, `is_error`, `subtype`) could change in future CLI versions. Pin to known behavior and add defensive parsing.
- **Cost visibility** — Each file generation is an API call. Users with large test suites (50+ files) could incur significant costs. Should surface total cost in the completion summary (available in the JSON response `total_cost_usd`).
- **"Agent decides" grouping strategy** — Requires the agent to output multiple docs from a single invocation with clear file boundaries. This is harder to parse reliably than one-file-in-one-doc-out. Consider deferring this mode or implementing with a structured output schema (`--json-schema`).

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Claude Code CLI | `mattpocock/skills@git-guardrails-claude-code` (441 installs) | available — tangential (git guardrails, not spawning) |
| Claude Code CLI | `davila7/claude-code-templates@claude-code-guide` (339 installs) | available — tangential (templates, not programmatic usage) |
| @clack/prompts | (none specific found) | already installed |
| Fumadocs | (none found) | none |
| Docusaurus | (none found) | none |

No skills are directly relevant to S03's core work (subprocess spawning, prompt engineering, doc generation). The existing codebase patterns and Claude Code CLI docs are sufficient.

## Sources

- Claude Code CLI `-p`/`--print` flag runs non-interactive mode, `--output-format json` returns structured JSON with `result` field (source: [Anthropic CLI docs](https://docs.anthropic.com/en/docs/claude-code/cli-usage))
- `stream-json` output requires `--verbose` flag; provides NDJSON with `system`, `assistant`, and `result` events (source: verified locally with `claude -p --output-format stream-json --verbose`)
- `child_process.spawn` with `stdin.end()` works cleanly — no hanging. JSON output parsed successfully. Exit code 0 on success (source: local Node.js spawn test against claude CLI v2.1.76)
- `@clack/prompts` spinner supports `.start()`, `.message()` for updates, `.stop()` for completion, `.error()` for failures (source: [Clack docs](https://github.com/bombshell-dev/clack))
- Fumadocs MDX uses `<Callout type="warn" title="...">` components, YAML frontmatter with `title`/`description`, no H1 in content (source: [Fumadocs docs](https://fumadocs.dev))
- Docusaurus MDX uses `:::tip`, `:::warning` admonition syntax, YAML frontmatter with `id`/`title`/`description`/`sidebar_position` (source: [Docusaurus docs](https://docusaurus.io))
- training-material-writer skill uses content priority: e2e tests → page objects → components → hooks → constants → queries. Required structure: frontmatter, intro, numbered steps, common problems (source: reference skill at `/Users/jstepek/Repos/full_sample_tracking/sample_tracking/.agents/skills/training-material-writer/SKILL.md`)
- `@anthropic-ai/claude-agent-sdk` exists as an alternative but requires API key management — conflicts with D001 (CLI-only, no key management in driftless) (source: npm registry + Google search)
