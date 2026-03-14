# M003: OSS Maturity + v1.0 Release — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning (after M002 completes)

## Project Description

M003 transforms driftless from a working tool into a professional open source project ready for public adoption. This includes npm publishing, semantic releases, CI/CD for the driftless repo itself, community files, and GitHub repo hygiene.

## Why This Milestone

The tool works (M001) and the automation works (M002), but it's not shippable as OSS without proper release infrastructure, community scaffolding, and repo hygiene. This milestone makes driftless something strangers can trust, install, and contribute to.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Install driftless via `npm install -g driftless` or `npx driftless init` from the npm registry
- See a proper README with badges, install instructions, usage examples, and API reference
- Open issues using structured templates, submit PRs following contribution guidelines
- Trust the project has CI (tests, lint, build pass on every PR) and automated releases
- Enable auto-updates during `driftless init` so the CLI self-updates on every launch

### Entry point / environment

- Entry point: npm registry (`npmjs.com/package/driftless`), GitHub repo (`github.com/domstepek/driftless`)
- Environment: npm, GitHub
- Live dependencies involved: npm registry, GitHub Actions

## Completion Class

- Contract complete means: `npm publish` succeeds, package installs and runs correctly from registry
- Integration complete means: CI runs on PRs, automated publish triggers on tagged release
- Operational complete means: full release cycle works end-to-end: tag → CI → publish → changelog → GitHub release

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A tagged release triggers automated npm publish and GitHub release creation
- `npx driftless init` works when installed from the npm registry (not just local)
- The GitHub repo has: MIT license, CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue templates, PR template, topics, description, branch protection
- CHANGELOG.md reflects all changes since initial release

## Risks and Unknowns

- **npm publish permissions and scoping** — need to decide on package name availability, scoped vs unscoped, 2FA requirements
- **Vite+ pack for npm** — need to verify `vp pack` produces a correct npm-publishable package with proper exports, types, and bin fields
- **GitHub Sponsors setup** — account must be enrolled in GitHub Sponsors (personal profile) before FUNDING.yml renders the button. This is a GitHub UI task; agent-browser (native mode) handles it. Some waitlist delay possible — start this early in M003.

## Existing Codebase / Prior Art

- M001 + M002 deliverables: working CLI, core package, GitHub Actions
- OSS skill being built incrementally at `~/.gsd/agent/skills/oss-repo-setup/`
- Research from discussion phase on npm best practices, semantic versioning, conventional commits

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R016 — npm package with semantic versioning
- R017 — CHANGELOG.md with conventional commits
- R018 — CI/CD pipeline for driftless repo
- R019 — OSS community files (MIT license, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, FUNDING.yml)
- R020 — GitHub repo hygiene
- R025 — Claude-first documented in README
- R032 (new) — CLI auto-update: check npm for newer version on every launch, install if autoUpdate enabled

## Scope

### In Scope

- npm package configuration and publish pipeline
- Semantic versioning + automated CHANGELOG
- CI/CD: test, lint, build on PRs; publish on tag
- MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- GitHub issue templates, PR template
- GitHub repo: topics, description, branch protection (via agent-browser)
- `.github/FUNDING.yml` — GitHub Sponsors button (individual account); requires enabling GitHub Sponsors for the account first (GitHub UI, agent-browser)
- README with badges, install, usage, API, contributing sections
- **CLI auto-update:** Last prompt in `driftless init` asks "Would you like to enable auto-updates?" (default: yes). Stored as `autoUpdate: true` in `.driftless.json`. On every CLI launch, if enabled, check npm registry for a newer version and install it before running the command. Adds ~1-2s on cold runs. Must handle: network failures (skip silently, don't block), major version jumps (warn but still update), `npx` vs global install (detect and use the right update mechanism).

### Out of Scope / Non-Goals

- Landing page (M004)
- Documentation site (M004)
- Marketing and launch strategy (M004)

## Technical Constraints

- Package name `driftless` must be available on npm (or use scoped `@driftless/cli`)
- npm granular access tokens for secure publishing
- GitHub Actions for CI/CD (not external CI)
- Use agent-browser native skill for GitHub UI operations (topics, settings, branch protection)

## Integration Points

- **npm registry** — package publishing target
- **GitHub Actions** — CI/CD runner
- **GitHub API / UI** — repo settings, branch protection, topics (via agent-browser)

## Open Questions

- Package name: `driftless` (unscoped) or `@driftless/cli` (scoped)? Unscoped is simpler for `npx` usage.
- Changeset-based releases vs tag-based? Need to decide during M003 planning.
- Should we use `semantic-release` or a simpler manual tag + automated publish flow?
- Auto-update mechanism: `npm install -g driftless@latest` for global installs vs clearing the npx cache for `npx` users? Need to research the right approach during M003 planning. The `update-notifier` pattern (used by npm itself) is a reference, but we want silent auto-install, not just notification.
