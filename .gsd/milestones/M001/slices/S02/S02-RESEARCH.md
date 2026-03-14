# S02: Interactive CLI wizard — Research

**Date:** 2026-03-14

## Summary

S02 builds the interactive init wizard — the user-facing entry point to driftless. The slice touches three packages/modules: CLI arg routing + prompt flow in `packages/cli`, config read/write + test framework detection in `packages/core`, and the `DriftlessConfig` type contract that downstream slices (S03, S04, S05) consume.

The approach is straightforward: `@clack/prompts` with `group()` for the wizard flow, simple `process.argv` parsing for command routing (no framework needed — there's one command), `fs.stat` checks against a known config-file map for auto-detection, and a `writeConfig`/`readConfig` pair that serializes `DriftlessConfig` to `.driftless.json`.

The riskiest part is getting the type contract right. S03 and S04 both consume `DriftlessConfig` and `Capability` — getting the schema wrong here means rework across three slices. The prompt flow itself is well-served by @clack/prompts' existing patterns.

## Recommendation

Use `@clack/prompts` `group()` for the wizard, keep CLI routing minimal (no commander/yargs — just `process.argv` switch on first positional arg), put all detection + config logic in `packages/core` where downstream slices can import it, and test prompts via `vi.mock('@clack/prompts')` with `mockResolvedValueOnce`.

Module structure:
- `packages/cli/src/index.ts` — restructure `main()` to parse args: `init` → run wizard, `--version` → print version, `--help` → print usage. No auto-invoke of init on bare import.
- `packages/cli/src/commands/init.ts` — init command orchestrator. Calls `gatherConfig()` then `writeConfig()`.
- `packages/cli/src/prompts/init-prompts.ts` — pure prompt-gathering function using @clack/prompts `group()`.
- `packages/core/src/config.ts` — `readConfig()`, `writeConfig()`, `configExists()` for `.driftless.json`.
- `packages/core/src/detect.ts` — `detectTestFramework()` scanning for known config file patterns.
- `packages/core/src/types.ts` — extend with `Capability`, `TestFramework`, flesh out `DriftlessConfig`.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Interactive CLI prompts (text, select, multiselect, confirm) | `@clack/prompts` | Vercel-style UX, built-in cancel handling via `isCancel`, `group()` for wizard flow. Already decided (D005). |
| CLI spinner for async operations | `@clack/prompts` `spinner()` | Included in same package — no extra dep. S03 will use this for doc generation progress. |
| JSON config serialization | `JSON.stringify`/`JSON.parse` | .driftless.json is simple JSON — no need for a config library (cosmiconfig, etc.). The config shape is owned by us. |
| Arg parsing | `process.argv` | One command (`init`), two flags (`--version`, `--help`), optional `--dry-run`. A 20-line switch statement beats importing commander (40KB). |

## Existing Code and Patterns

- `packages/cli/src/index.ts` — current entry point auto-invokes `main()` at module level. Must restructure: `main()` becomes the arg parser/router, `init` command lives in a separate module. The auto-invoke stays (D022) but `main()` becomes async and routes based on args.
- `packages/core/src/types.ts` — has `DriftlessConfig`, `InitOptions`, `DocFramework`. These are the boundary contract from S01. Extend, don't replace.
- `packages/core/src/index.ts` — re-exports from types.ts. Will also re-export from `config.ts` and `detect.ts`.
- `packages/cli/test/cli.test.ts` — mocks `console.log` before dynamic import to handle auto-invocation (D022 pattern). New tests will follow this same mock-before-import pattern.
- `packages/core/test/types.test.ts` — type-level smoke tests. New detection and config tests will follow this test structure.

## Constraints

- **No command framework** — adding commander or yargs would be over-engineering for a single command. Keep it to `process.argv` parsing.
- **@clack/prompts is the only prompt library** (D005). No fallback needed.
- **Config is `.driftless.json` at target repo root** (D009). Not `.driftlessrc`, not in a subdirectory.
- **Skill install path defaults to `.skills/`** (D010), user-configurable during init.
- **ESM-first** (D004, R035). All new modules use ESM imports/exports.
- **`main()` auto-invokes at module level** (D022). The init command module must NOT auto-invoke — only the entry point does.
- **tsdown bundles to single ESM file** — `@clack/prompts` will be bundled into the CLI dist. Verify the bundle works after adding the dep.
- **`vp check` does not include typecheck** — must run `npx tsc --noEmit` separately for type verification (S01 known limitation).
- **`Capability` type must be a string union, not an enum** — matches the existing `DocFramework` pattern and keeps JSON serialization simple.

## Common Pitfalls

- **Auto-invocation breaks tests** — `main()` runs on import. Tests must spy/mock before dynamic `import()`. S01 established this pattern; don't deviate.
- **@clack/prompts `group()` types** — the `results` parameter in group callbacks uses a progressively-built type. TypeScript inference works, but explicit typing of the group return type prevents downstream confusion.
- **Config file race conditions** — `writeConfig` should write atomically (write to temp, rename) to prevent partial writes on crash. Simple for now since S05 owns rollback, but don't make it harder for S05 by using streaming writes.
- **Detection false positives** — a repo might have `playwright.config.ts` but use it for component testing, not e2e. Detection should report what it finds; the user confirms via prompt. Don't over-interpret.
- **`--dry-run` is S05's scope** — S02 should accept the flag in `InitOptions` and thread it through, but NOT implement the dry-run behavior. Just pass it along so S05 can wire it up.
- **Glob validation** — test path globs entered by the user should be syntactically valid. Light validation only (non-empty, no obvious errors). Don't try to resolve them against the filesystem during init — that's the agent's job in S03.
- **Existing config handling** — if `.driftless.json` already exists, prompt the user: overwrite or exit. Init must be re-runnable (D011 idempotency requirement).

## Open Risks

- **@clack/prompts bundle size in tsdown** — untested with the current `vp pack` setup. The package is ~15KB, should bundle fine, but the first build after adding it will reveal any issues.
- **Type contract stability** — `DriftlessConfig` is consumed by S03, S04, and S05. Any field we add now that turns out wrong means rework across multiple slices. Mitigate by keeping the schema minimal (only what the config file actually needs to persist) and not speculatively adding fields for future use.
- **Auto-detection coverage** — we're targeting 7 frameworks (Playwright, Cypress, TestCafe, Detox, WebdriverIO, Nightwatch, Selenium). Selenium has no standard config file — it's the one framework that can't be auto-detected. Acceptable gap; the user enters paths manually.

## Config Schema Design

The `DriftlessConfig` type from S01 has the right shape but needs fleshing out for the actual config file:

```typescript
type Capability = "doc-generator" | "e2e-writer";
type TestFramework = "playwright" | "cypress" | "testcafe" | "detox" | "webdriverio" | "nightwatch" | "other";

interface DriftlessConfig {
  $schema?: string;           // JSON schema URL for editor support (future)
  testPaths: string[];        // glob patterns for e2e test files
  outputDir: string;          // where generated docs go
  docFramework: DocFramework; // "plain-md" | "fumadocs" | "docusaurus"
  capabilities: Capability[]; // which skills to install
  skillsDir: string;          // where skills are installed (default: ".skills")
  testFramework?: TestFramework; // detected or user-specified
  agentHarness: "claude-code"; // v1 only supports claude-code (D001)
}
```

Key changes from S01's placeholder: `capabilities` is now typed as `Capability[]` instead of `string[]`, and `testFramework` + `agentHarness` are added. The `$schema` field is optional and deferred.

## Test Framework Detection Map

Config files to scan for auto-detection (`detectTestFramework()`):

| Framework | Config files |
|-----------|-------------|
| Playwright | `playwright.config.ts`, `playwright.config.js`, `playwright.config.mjs` |
| Cypress | `cypress.config.ts`, `cypress.config.js`, `cypress.config.mjs`, `cypress.config.cjs` |
| TestCafe | `.testcaferc.json`, `.testcaferc.js` |
| Detox | `detox.config.js`, `detox.config.ts`, `.detoxrc.js`, `.detoxrc.json` |
| WebdriverIO | `wdio.conf.ts`, `wdio.conf.js` |
| Nightwatch | `nightwatch.conf.ts`, `nightwatch.conf.js`, `nightwatch.json` |

Detection logic: scan the target directory for each config file in order, return the first match. Return `undefined` if nothing found. The user can always override or manually specify.

## Prompt Flow Design

```
intro("driftless")
  │
  ├─ [auto-detect test framework → show result or "none detected"]
  │
  ├─ text: test file paths (pre-filled from detection if available)
  │
  ├─ text: docs output directory (default: "docs/training")
  │
  ├─ select: doc framework (plain-md / fumadocs / docusaurus)
  │
  ├─ multiselect: capabilities (doc-generator / e2e-writer)
  │
  ├─ text: skills directory (default: ".skills")
  │
  ├─ [check for existing .driftless.json → confirm overwrite if present]
  │
  ├─ [write .driftless.json]
  │
  └─ note: summary of what was written + next steps
outro("Config saved. Run `driftless generate` to create docs.")
```

Cancel at any prompt exits cleanly via `isCancel` + `process.exit(0)`.

## Testing Strategy

- **Config read/write** — unit test with `tmp` dirs. Write config, read it back, assert round-trip.
- **Test framework detection** — unit test with mock directory structures (create temp dirs with config file names, assert detection).
- **Prompt flow** — `vi.mock('@clack/prompts')` with `mockResolvedValueOnce` for each prompt. Test the `gatherConfig()` function in isolation — verify it produces the right `DriftlessConfig` from canned prompt responses.
- **CLI routing** — test that `main()` dispatches to init, version, help based on argv. Mock the init module to avoid running prompts.
- **Integration** — build with `vp pack`, verify the bundle runs: `node packages/cli/dist/index.mjs --version` prints version, `node packages/cli/dist/index.mjs --help` prints usage.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| @clack/prompts | none found | — |
| CLI wizard patterns | none found | — |

No relevant installable skills. @clack/prompts is well-documented and the Context7 docs cover the full API.

## Sources

- @clack/prompts API: `group()`, `text()`, `select()`, `multiselect()`, `confirm()`, `spinner()`, `intro()`, `outro()`, `note()`, `log.*`, `isCancel()` (source: [Clack README](https://github.com/bombshell-dev/clack/blob/main/packages/prompts/README.md))
- Test framework config file conventions for Playwright, Cypress, TestCafe, Detox, WebdriverIO, Nightwatch (source: Google Search, framework official docs)
- @clack/prompts testing pattern: `vi.mock` + `mockResolvedValueOnce` (source: Google Search, community patterns)
- S01 forward intelligence: CLI auto-invoke pattern (D022), vp check limitation, type contract boundary (source: S01-SUMMARY.md)
