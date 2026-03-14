---
estimated_steps: 5
estimated_files: 2
---

# T02: Publish to npm and verify from live registry

**Slice:** S01 — npm Package Publishing + v1.0.0 Release
**Milestone:** M003

## Description

Publish both `@driftless/core` and `@driftless/cli` to npm and verify they install and run correctly from the live registry. The user must have created the `@driftless` npm org on npmjs.com before this task runs. This task handles the actual publish, live verification, and git tagging.

## Steps

1. Confirm with user that the `@driftless` npm org exists on npmjs.com and they're logged in (`npm whoami` succeeds, `npm org ls @driftless` shows membership). If not, prompt them to create it — agent cannot do this.
2. Publish both packages: `pnpm -r publish --access public --no-git-checks`. This publishes in topological order (core before CLI) and resolves `workspace:*` to real versions. The `--no-git-checks` flag allows publishing from any branch state.
3. Verify both packages are live: `npm info @driftless/core@1.0.0 version` and `npm info @driftless/cli@1.0.0 version` both return `1.0.0`.
4. Verify install from registry: `npm install -g @driftless/cli` succeeds, `driftless --version` returns version containing `1.0.0`, `npx @driftless/cli@latest --help` shows usage with init command.
5. Tag the release: `git tag v1.0.0` and `git push origin v1.0.0` (with user confirmation for the push since it's an outward-facing action).

## Must-Haves

- [ ] Both packages published to npm at 1.0.0
- [ ] `npm info` returns valid metadata for both packages
- [ ] `driftless --version` works after `npm install -g @driftless/cli`
- [ ] `npx @driftless/cli@latest --help` shows usage
- [ ] Git tag `v1.0.0` created

## Verification

- `npm info @driftless/core@1.0.0 version` — outputs `1.0.0`
- `npm info @driftless/cli@1.0.0 version` — outputs `1.0.0`
- `npm install -g @driftless/cli && driftless --version` — contains `1.0.0`
- `npx @driftless/cli@latest --help` — shows init command in output
- `git tag -l v1.0.0` — tag exists

## Inputs

- T01 output: both packages at 1.0.0 with correct metadata, verified tarballs
- User: `@driftless` npm org created, logged in to npm

## Expected Output

- Both packages live on npmjs.com: `https://www.npmjs.com/package/@driftless/core`, `https://www.npmjs.com/package/@driftless/cli`
- Working install from registry: `npm install -g @driftless/cli && driftless --version` → `1.0.0`
- Git tag `v1.0.0` on the publish commit
