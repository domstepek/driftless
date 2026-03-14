---
id: S05
milestone: M001
status: ready
---

# S05: Rollback, debug logging, dry-run — Context

## Goal

Add the three operational safety features to `driftless init`: `--dry-run` previews all changes as a file-by-file list without writing anything, hard failures trigger a full rollback to pre-init state, and every run writes a structured plaintext debug log for bug reporting.

## Why this Slice

S05 is what makes `driftless init` trustworthy. Without it, users can't safely run init in real repos (risk of partial state on failure), can't preview before committing (especially important for first-time runs), and have no way to report issues. S05 also finalizes the idempotency guarantee: failed init leaves the repo exactly as found, making re-running safe. This closes the M001 operational completeness requirement.

## Scope

### In Scope

- `--dry-run` flag on `driftless init`:
  - Show a file-by-file preview list of every file that _would_ be created or modified, with destination paths and change type (new/update)
  - Example output format: `  + docs/training/login.md (new)` / `  ~ .driftless.json (update)` / `  + .skills/doc-generator.md (new)`
  - Nothing written to disk — all S02/S03/S04 operations run in dry-run mode (no filesystem writes)
  - Same prompt flow as normal init, but writes produce preview entries instead of files
- Full rollback on hard failure:
  - Triggers: Claude Code not found, auth error, process crash, unhandled exception
  - Does NOT trigger on: partial doc generation (some files fail) — that's a warning with summary, not a rollback
  - Scope: rolls back everything — docs, skill files, AND `.driftless.json`. Post-rollback, repo is exactly as it was before init ran
  - Rollback must restore any files that were overwritten (pre-rollback snapshots needed before writes)
- Debug log at `.driftless/debug.log`:
  - Overwrites on every run — only the last run is kept, no disk growth
  - Content: Claude Code stdout/stderr, all file operations attempted (path, type, success/fail), error stack traces, timing per step
  - Format: structured plaintext readable by a developer; primarily for sharing as a bug report
  - Always written, even on successful runs and dry-run (dry-run log notes "dry-run mode — no files written")
- Idempotency: re-running init after rollback leaves no trace of the failed run (log is the only artifact; log is overwritten)

### Out of Scope

- Log rotation or log history across multiple runs — single file, overwritten each run
- User-facing log viewer or log summary command — not in v1
- Structured JSON log format — plaintext only in v1
- Selective rollback (e.g., rolling back only docs but keeping config) — full rollback or nothing
- `--verbose` flag exposing raw Claude Code output to the terminal — raw output always goes to log only (R006)
- GitHub Action dry-run support — M002
- Rollback of changes to files that already existed before init ran but were overwritten (e.g., existing docs in the output directory) — current thinking: snapshot pre-existing files before overwriting so they can be restored

## Constraints

- **Full rollback or nothing (D011):** Hard failures roll back everything including `.driftless.json`. No partial state left behind.
- **Hard failures only trigger rollback:** Partial doc generation (some files fail) is not a hard failure — continue + summarize as established in S03.
- **Debug log always written:** Even on success. Even on dry-run (noting it was a dry run). The log is not optional.
- **Log overwrites each run:** `.driftless/debug.log` is replaced on every init run. No append behavior.
- **Dry-run is non-destructive:** The prompt flow runs normally but all filesystem writes produce preview list entries instead of actual files. `.driftless.json` is not written. Skills are not copied. Docs are not generated.
- **No raw agent output to terminal (R006):** Claude Code stdout/stderr always goes to the debug log, never the terminal. This applies in both dry-run and normal mode.

## Integration Points

### Consumes

- All S02 prompt + config modules — dry-run wraps the same flow, intercepting writes
- `packages/core/src/generator.ts` → `generateDocs()` — must accept a dry-run flag and return preview entries instead of writing files (from S03)
- `packages/core/src/skills/` → `installSkills()` — must accept a dry-run flag (from S04)
- `packages/core/src/config.ts` → `writeConfig()` — must accept a dry-run flag (from S02)
- All file-writing paths in S02/S03/S04 — S05 wraps or modifies these to support rollback snapshots and dry-run interception

### Produces

- `packages/core/src/rollback.ts` — rollback manager (exports: `beginTransaction()`, `commit()`, `rollback()`) — snapshots pre-existing files before writes, restores on rollback
- `packages/core/src/logger.ts` — debug logger (exports: `createLogger()`, `Logger`) — writes structured plaintext to `.driftless/debug.log`
- `--dry-run` flag handling wired into `initCommand()` in `packages/cli/src/commands/init.ts`

## Open Questions

- How to snapshot files for rollback: copy pre-existing file contents to memory before overwriting, or write temp files to `.driftless/.tmp/`? Current thinking: in-memory snapshots for simplicity (files are small — docs and skill templates). If memory is a concern for large doc suites, fall back to temp files.
- What happens if rollback itself fails (e.g., permission error restoring a file)? Current thinking: log the rollback failure, print a warning to the user listing which files could not be restored, and exit with a non-zero code. Don't crash silently.
- Does dry-run run the actual Claude Code generation (to preview what docs would be created) or skip it and just predict what files would be written based on the test file list? Current thinking: skip actual generation in dry-run — list test files that would be processed and predicted output filenames, but don't invoke Claude Code. This keeps dry-run fast and avoids auth requirements.
