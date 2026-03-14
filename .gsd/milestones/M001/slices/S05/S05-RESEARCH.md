# S05: Rollback, debug logging, dry-run — Research

**Date:** 2026-03-14

## Summary

S05 delivers three capabilities: filesystem rollback on init failure (R008), structured debug logging to `.driftless/debug.log` (R007), and real dry-run preview (R011). The codebase is well-prepared — atomic writes exist (D024), `AgentResult` already captures per-invocation diagnostics, `InstallSkillsResult.installed` tracks exactly which files were written, and `InitOptions.dryRun` is threaded through the entire init flow but only gates execution (skips work) rather than previewing what _would_ happen.

The approach is a transaction wrapper around the init command's write operations. Before any writes, create a `FileTransaction` that tracks every file/directory created. On success, commit (no-op — files are already on disk). On failure, rollback deletes all tracked artifacts in reverse order. Debug logging captures a structured run log (config, detection, per-file agent results, skill installs, errors) and writes it to `.driftless/debug.log` regardless of success/failure. Dry-run collects the same planned operations but writes nothing, then prints the preview.

All three features live in `packages/core/` as pure utilities consumed by the CLI's `initCommand`. No new dependencies needed — just `node:fs/promises`.

## Recommendation

Build a `FileTransaction` class in `packages/core/src/transaction.ts` and a `DebugLogger` in `packages/core/src/logger.ts`. Wire both into `initCommand` as cross-cutting concerns.

**FileTransaction** tracks all file creation (config, generated docs, skill files, output dirs, `.driftless/` dir). On failure, it removes everything it created in reverse order. It also powers dry-run: in dry-run mode, the transaction collects planned operations without executing them, then the CLI renders the preview.

**DebugLogger** accumulates structured log entries (timestamped, categorized: detection, config, generation, skills, error) and flushes to `.driftless/debug.log` at the end of every run. The logger captures `AgentResult` diagnostics (stderr, duration, cost, exit code) that are currently discarded after the spinner closes.

This keeps the init command's orchestration logic clean — it calls `transaction.writeFile()` instead of raw `writeFile()`, and `logger.log()` at each step.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Atomic config writes | `writeConfig()` in `config.ts` (D024: temp+rename) | Already proven, S05 transaction wraps it rather than replacing it |
| Glob resolution | `resolveGlobs()` in `generator.ts` | Reuse for dry-run to preview which test files would be processed |
| Agent result diagnostics | `AgentResult` type with stderr/duration/cost/exitCode | Already structured — just persist to debug log |
| Skills tracking | `InstallSkillsResult.installed` | Tells rollback exactly which skill files to remove |

## Existing Code and Patterns

- `packages/cli/src/commands/init.ts` — The orchestrator. Current flow: detect → gather → write config → generate docs → install skills → summary. S05 wraps this entire sequence in a transaction boundary and adds logging at each step.
- `packages/core/src/config.ts` — `writeConfig()` uses temp+rename (D024). Transaction should track the final `.driftless.json` path, not the temp file. `configPath()` exported for path resolution.
- `packages/core/src/generator.ts` — `generateDocs()` creates the output directory via `mkdir({ recursive: true })` and writes doc files via `writeFile()`. Transaction needs to track both the directory and each file written. The function currently doesn't expose which files it wrote — only `GenerateResult.filesGenerated` count and `errors`. **This is a gap**: rollback needs the list of written file paths. Options: (a) add `filesWritten: string[]` to `GenerateResult`, or (b) have the transaction intercept file writes. Option (a) is cleaner — extends the existing result type.
- `packages/core/src/skills.ts` — `installSkills()` returns `InstallSkillsResult.installed` (capability names) and `skillsDir`. Rollback can reconstruct paths: `{cwd}/{skillsDir}/{capability}/SKILL.md`.
- `packages/core/src/types.ts` — `InitOptions` already has `dryRun: boolean` and `verbose: boolean` (unused). Verbose could gate debug log verbosity or console output.
- `packages/core/src/agent.ts` — `AgentResult` has `stderr`, `durationMs`, `costUsd`, `exitCode`, `error` — all valuable for debug log. Currently only `costUsd` is aggregated; the rest is discarded after spinner updates.

## Constraints

- **No new runtime dependencies.** All three features use `node:fs/promises` only. This is a convention established in S01-S04.
- **Rollback must handle partial states.** If generation succeeds for 3/5 files then fails, rollback removes the 3 written docs, the output dir (if we created it), the config file, and any installed skills. But it must NOT remove pre-existing files — only files the current init run created.
- **Debug log directory `.driftless/` is itself a created artifact.** If init fails and rollback runs, the debug log must be written _before_ rollback cleans up `.driftless/`. Sequence: flush debug log → rollback other files (but preserve `.driftless/debug.log`).
- **`GenerateResult` needs extension.** Add `filesWritten: string[]` to track which output files were actually created. This is the simplest way to give the transaction visibility into generator output without coupling the generator to the transaction.
- **Dry-run must not spawn Claude Code.** The current dry-run already skips generation and skill install. Real dry-run should preview: config that would be written, test files that would be processed (glob resolution), docs that would be generated (filenames), skills that would be installed (paths). This means running glob resolution and path computation without spawning agents.
- **Idempotent init** means re-running on a repo that already has `.driftless.json`, docs, and skills should work cleanly — overwriting existing files (with user confirmation for config). The overwrite confirmation prompt already exists (S02). Rollback should only undo files created in _this_ run, not pre-existing files that were overwritten.

## Common Pitfalls

- **Rollback deleting user files** — If the output dir already existed with user-written docs, rollback must not delete it. Track only files/dirs _created_ by this run, not overwritten ones. For files that existed before and were overwritten, we'd need to back them up first. The simplest safe approach: record whether each file existed before writing, and on rollback, only delete files that didn't exist before. For files that did exist, restore from backup (copy original before overwrite).
- **Debug log write failing** — If `.driftless/` can't be created (permissions), the debug log silently fails. Don't let a logging failure cause init to fail — catch and warn.
- **Race between rollback and debug log** — Debug log must flush before rollback starts, and rollback must skip `.driftless/debug.log`. Implementation: rollback excludes the debug log path from its cleanup list.
- **Dry-run glob resolution on empty repo** — If test paths don't match any files, dry-run should say "0 test files found" not crash. `resolveGlobs()` already returns empty array for no matches.
- **Directory cleanup order** — Rollback must delete files before their parent directories. Process tracked paths in reverse creation order. Only delete directories that were created by the transaction (not pre-existing ones).

## Open Risks

- **Overwritten file backup adds complexity.** The simplest v1 approach is: rollback only deletes files that didn't exist before the run. Files that existed and were overwritten stay as-is (they were already confirmed by the user). This means a failed re-init leaves the old config overwritten — but the debug log captures the original config for manual recovery. This is an acceptable tradeoff for v1.
- **Generator coupling.** Adding `filesWritten` to `GenerateResult` is a clean extension, but it means the generator must track output paths internally. Small change — just push to an array alongside each `writeFile()` call.
- **Test mocking complexity.** The transaction and logger need to be mockable in init.test.ts. Following the established pattern (mock `@driftless/core` at module level), this should work naturally since transaction/logger will be imported from core.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Node.js fs transactions | none found | No relevant skill — this is straightforward fs work |
| CLI debug logging | none found | No relevant skill — structured JSON logging is simple enough |

## Sources

- Codebase exploration: `packages/core/src/config.ts`, `generator.ts`, `skills.ts`, `agent.ts`, `types.ts`, `packages/cli/src/commands/init.ts`
- Decision register: D011 (rollback + debug log), D024 (atomic writes via temp+rename), D025 (Error.cause chaining)
- S02 Forward Intelligence: "S05 rollback can build on atomic write pattern"
- S03 Forward Intelligence: "S05 needs to wrap generateDocs() in rollback logic and persist AgentResult diagnostics to debug log"
- S04 Forward Intelligence: "InstallSkillsResult.installed — S05 rollback can use this to know exactly which files to remove"
