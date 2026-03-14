---
estimated_steps: 4
estimated_files: 2
---

# T02: Wire generation into init command with progress spinner

**Slice:** S03 — Agent-driven doc generation
**Milestone:** M001

## Description

Connects the generation engine (built in T01) to the CLI's init command flow. After config is written, the init command checks if `doc-generator` is in the selected capabilities and, if so, starts a `@clack/prompts` spinner and calls `generateDocs()` with a progress callback that updates the spinner message per file. Generation is skipped in dry-run mode. The completion summary includes generation stats. This task proves R006 (clean progress-only UX) and closes the slice's demo condition.

## Steps

1. **Modify initCommand** — In `packages/cli/src/commands/init.ts`, after the config write block and before the summary note: check `config.capabilities.includes("doc-generator")`. If true, create a `@clack/prompts` spinner, start it with "Generating docs…", call `generateDocs(config, { cwd: options.cwd, onProgress })` where the `onProgress` callback updates the spinner message to show the current file and count (e.g., `"Generating docs… login.spec.ts (3/12)"`). On completion, stop the spinner with a success or error message based on `GenerateResult`. On error (all files failed), stop spinner with error. In dry-run mode, log that generation would run but skip actual invocation. Import `generateDocs` and `GenerateResult` from `@driftless/core`.

2. **Enhance summary** — Update the summary note to include generation stats when doc-generator was run: files generated, files errored, total cost. List any per-file errors as warnings via `p.log.warn()` before the note.

3. **Update init tests** — In `packages/cli/test/init.test.ts`: mock `generateDocs` from `@driftless/core` at the module level (add to the existing core mock). Add test cases: (a) generation called with correct config when doc-generator in capabilities, (b) generation not called when doc-generator not in capabilities, (c) generation not called in dry-run mode, (d) spinner shows error message when generation fails. Verify the mock was/wasn't called with expected arguments.

4. **Full verification** — Run `npx vp test` (all tests pass), `npx vp run -r build` (both packages build), `npx vp check` (format + lint clean). Verify no regressions in existing CLI or init tests.

## Must-Haves

- [ ] `generateDocs()` called from init when `doc-generator` capability is selected
- [ ] Generation skipped when `doc-generator` not in capabilities
- [ ] Generation skipped in dry-run mode
- [ ] Spinner shows file-by-file progress (not raw agent output)
- [ ] Generation errors reported as warnings, don't crash the init flow
- [ ] Summary includes generation stats (files generated, errors)
- [ ] All existing tests still pass

## Verification

- `npx vp test` — all tests pass (existing + new init-generation tests)
- `npx vp run -r build` — both packages build clean
- `npx vp check` — format and lint pass
- Init tests verify: generation called/skipped based on capabilities and dry-run flag

## Inputs

- `packages/core/src/generator.ts` — `generateDocs()` function (from T01)
- `packages/core/src/types.ts` — `GenerateResult`, `ProgressCallback` types (from T01)
- `packages/cli/src/commands/init.ts` — existing init orchestrator (modify)
- `packages/cli/test/init.test.ts` — existing test suite (extend)

## Expected Output

- `packages/cli/src/commands/init.ts` — init command with generation integration and spinner progress
- `packages/cli/test/init.test.ts` — 4+ new test cases for generation wiring

## Observability Impact

- **Spinner messages** — Real-time progress visible to users: file name and count (e.g., "Generating docs… login.spec.ts (3/12)"). A future agent running `init` can observe progress events via the `onProgress` callback.
- **Generation stats in summary** — Files generated, files errored, and total cost printed in the summary note. Allows post-run inspection of generation outcome without re-running.
- **Per-file error warnings** — Each failed file logged via `p.log.warn()` with file path and error string before the summary. Provides immediate diagnostic signal for partial failures.
- **Dry-run visibility** — Dry-run mode logs that generation would run, making the skip explicit rather than silent.
