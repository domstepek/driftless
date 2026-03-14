# driftless

**Generate living documentation from your test suite — powered by AI.**

[![npm version](https://img.shields.io/npm/v/@driftless-ai%2Fcli)](https://www.npmjs.com/package/@driftless-ai/cli)
[![CI](https://github.com/domstepek/driftless/actions/workflows/ci.yml/badge.svg)](https://github.com/domstepek/driftless/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@driftless-ai%2Fcli)](./LICENSE)

---

## What is driftless?

Driftless reads your end-to-end tests and generates human-readable documentation that stays in sync with your actual application behavior. When your tests change, your docs update automatically.

It supports multiple test frameworks (Playwright, Cypress, TestCafe, Detox, WebDriverIO, Nightwatch) and multiple documentation targets (plain Markdown, Fumadocs, Docusaurus).

## Quick Start

**Prerequisites:** Node.js ≥ 22

```bash
# Initialize driftless in your project
npx @driftless-ai/cli@latest init
```

The `init` command will:

1. Detect your test framework automatically
2. Walk you through an interactive setup (test paths, output directory, doc framework, capabilities)
3. Write a `.driftless.json` config file
4. Install skill definitions and GitHub Actions workflows
5. Generate your first batch of documentation

### CLI Usage

```
driftless — generate training docs from your test suite

Usage: driftless <command> [options]

Commands:
  init          Initialize a new .driftless.json config

Options:
  --dry-run     Show what would be created without writing files
  --version     Print version
  --help        Show this help message
```

## How It Works

1. **Detect** — Driftless scans your project for test framework config files and identifies your test runner.
2. **Configure** — Interactive prompts let you choose test paths, output directory, documentation framework, and capabilities (`doc-generator`, `e2e-writer`).
3. **Generate** — Each test file is processed by an AI agent that reads the test code and produces structured documentation in your chosen format.
4. **Automate** — GitHub Actions workflows keep docs in sync: generate on push, update on PR.

All file writes are wrapped in a `FileTransaction` for atomic rollback on failure. A structured debug log is written to `.driftless/debug.log` on every run.

## Configuration Reference

Driftless is configured via `.driftless.json` at your project root:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/domstepek/driftless/main/packages/core/driftless.schema.json",
  "testPaths": ["tests/e2e/**/*.spec.ts"],
  "outputDir": "docs/generated",
  "docFramework": "plain-md",       // "plain-md" | "fumadocs" | "docusaurus"
  "capabilities": ["doc-generator"], // "doc-generator" | "e2e-writer"
  "skillsDir": ".driftless/skills",
  "testFramework": "playwright",     // auto-detected, or set manually
  "agentHarness": "claude-code",
  "docGrouping": "per-file"          // one doc per test file
}
```

| Field | Type | Description |
|---|---|---|
| `testPaths` | `string[]` | Glob patterns for test files to analyze |
| `outputDir` | `string` | Directory where generated docs are written |
| `docFramework` | `"plain-md" \| "fumadocs" \| "docusaurus"` | Target documentation framework |
| `capabilities` | `Capability[]` | Features to enable: `"doc-generator"`, `"e2e-writer"` |
| `skillsDir` | `string` | Directory for skill definition files |
| `testFramework` | `TestFramework` | Detected or manually set test framework |
| `agentHarness` | `"claude-code"` | Agent harness used to run generation |
| `docGrouping` | `"per-file"` | How test files map to generated docs |

### Supported Test Frameworks

Playwright · Cypress · TestCafe · Detox · WebDriverIO · Nightwatch

### Supported Doc Frameworks

- **plain-md** — Standard Markdown files
- **fumadocs** — [Fumadocs](https://fumadocs.vercel.app/) compatible output
- **docusaurus** — [Docusaurus](https://docusaurus.io/) compatible output

## Packages

| Package | Description |
|---|---|
| [`@driftless-ai/cli`](./packages/cli) | CLI entry point — `driftless init` and future commands |
| [`@driftless-ai/core`](./packages/core) | Core library — config, detection, generation, adapters, workflows |

### Core API Surface

The `@driftless-ai/core` package exports:

- **Config** — `readConfig`, `writeConfig`, `configExists`, `configPath`
- **Detection** — `detectTestFramework`, `FRAMEWORK_CONFIG_MAP`
- **Generation** — `generateDocs`, `resolveGlobs`, `outputFilename`
- **Agent** — `spawnAgent`
- **Adapters** — `getAdapterPrompt`, `plainMdPrompt`, `fumadocsPrompt`, `docusaurusPrompt`
- **Skills** — `installSkills`, `docGeneratorTemplate`, `e2eWriterTemplate`
- **Workflows** — `installWorkflows`, `getWorkflowFilenames`, `WORKFLOW_TEMPLATES`
- **Utilities** — `FileTransaction`, `DebugLogger`
- **Types** — `DriftlessConfig`, `AgentResult`, `GenerateResult`, `ProgressEvent`, and more

## A Note on AI Harness Support

Driftless currently uses [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) as its agent harness for documentation generation. This is the only supported harness in v1.

We intend to support additional AI agent harnesses in future versions. The architecture is designed with this extensibility in mind — the `agentHarness` config field and adapter pattern exist to make adding new harnesses straightforward. If you're interested in contributing support for another harness, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, PR guidelines, and commit conventions.

## License

[MIT](./LICENSE) © 2026 Dom Stepek
