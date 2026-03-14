# Contributing to driftless

Thanks for your interest in contributing! This guide covers development setup, workflow, and conventions.

## Development Setup

### Prerequisites

- **Node.js ≥ 22** (see `.nvmrc`)
- **pnpm** (latest — this is a pnpm workspace)

### Getting Started

```bash
# Clone the repo
git clone https://github.com/domstepek/driftless.git
cd driftless

# Install dependencies
pnpm install

# Run checks (lint + types)
pnpm run check

# Run tests
pnpm run test

# Build all packages
pnpm run build
```

### Project Structure

```
packages/
  cli/     — CLI entry point (@driftless-ai/cli)
  core/    — Core library (@driftless-ai/core)
```

Both packages are built with TypeScript and bundled with Vite. The CLI depends on `@driftless-ai/core` via pnpm workspace protocol.

## Making Changes

### Branch Naming

- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `docs/short-description` — documentation changes
- `refactor/short-description` — code restructuring

### Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add cypress adapter support
fix: handle missing test config gracefully
docs: update configuration reference
test: add detection unit tests
chore: update dependencies
```

Scope is optional but encouraged: `feat(core): add fumadocs adapter`.

### Pull Request Guidelines

1. **One concern per PR.** Keep PRs focused — a feature, a bug fix, or a refactor. Not all three.
2. **Write tests.** New features need tests. Bug fixes need a regression test.
3. **Run checks locally.** `pnpm run check && pnpm run test` should pass before pushing.
4. **Describe what and why.** The PR template will guide you.
5. **Keep it reviewable.** If a PR is too large, consider splitting it.

### CI

Every PR runs the [CI workflow](./.github/workflows/ci.yml):

- Lint and type-check (`pnpm run check`)
- Tests (`pnpm run test`)
- Build (`pnpm run build`)

All checks must pass before merge.

## Code Style

- TypeScript strict mode
- Biome for linting and formatting (config in `biome.json`)
- Prefer explicit types at module boundaries, inferred types internally
- No `any` unless genuinely unavoidable (and documented why)

## Questions?

Open a [discussion](https://github.com/domstepek/driftless/discussions) or file an issue.
