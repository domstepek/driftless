---
estimated_steps: 5
estimated_files: 10
---

# T01: Create README, LICENSE, and all community files

**Slice:** S03 — README + Community Files + Repo Hygiene
**Milestone:** M003

## Description

Create all 10 community and documentation files that make the driftless repo look like a professional OSS project. The README is the most complex piece — it needs accurate install commands, usage examples, API surface documentation, badges, and the Claude-first framing (R025). The remaining files are standard boilerplate adapted for this project.

## Steps

1. Verify current CLI behavior — run `driftless --help` and `driftless --version` output to ensure README documents accurate commands. Review `packages/core/src/index.ts` exports for API reference section.
2. Write `README.md` with structure: hero (one-liner + badges) → What is driftless → Quick Start → How It Works → Configuration Reference → Packages → Claude-first note → Contributing → License. Badges: npm version (`shields.io/npm/v/@driftless-ai%2Fcli`), CI status (`github.com/domstepek/driftless/actions/workflows/ci.yml/badge.svg`), license (`shields.io/npm/l/@driftless-ai%2Fcli`). Install command: `npx @driftless-ai/cli@latest init`. Node ≥22 prerequisite.
3. Write `LICENSE` (bare filename, no extension) — MIT license text with "Dom Stepek" and 2026.
4. Write community files: `CONTRIBUTING.md` (dev setup with pnpm + Vite+, PR guidelines, commit conventions), `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1 verbatim with contact email placeholder), `SECURITY.md` (responsible disclosure instructions, supported versions table).
5. Write GitHub template files: `.github/ISSUE_TEMPLATE/bug_report.yml` and `feature_request.yml` (YAML form schema with validation), `.github/ISSUE_TEMPLATE/config.yml` (`blank_issues_enabled: false`), `.github/PULL_REQUEST_TEMPLATE.md`, `.github/FUNDING.yml` (`github: [domstepek]`).

## Must-Haves

- [ ] README uses `@driftless-ai/cli` (not `@driftless/cli`) everywhere
- [ ] README badges use URL-encoded scope: `@driftless-ai%2Fcli` in shields.io URLs
- [ ] README install command is `npx @driftless-ai/cli@latest init` (with `@latest` to avoid npx caching)
- [ ] README states Node ≥22 prerequisite
- [ ] README includes Claude-first note with future harness support intent (R025)
- [ ] LICENSE is bare filename (no `.md`), detected by GitHub's license checker
- [ ] CODE_OF_CONDUCT.md uses Contributor Covenant v2.1
- [ ] Issue templates use YAML form schema (not freeform markdown)
- [ ] config.yml disables blank issues
- [ ] All 10 files created

## Verification

- `ls README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md` — all 5 root files exist
- `ls .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/ISSUE_TEMPLATE/config.yml .github/PULL_REQUEST_TEMPLATE.md .github/FUNDING.yml` — all 5 GitHub files exist
- `grep -c '@driftless-ai/cli' README.md` — multiple hits
- `grep 'shields.io.*driftless-ai%2Fcli' README.md` — URL-encoded badge
- `grep 'Contributor Covenant' CODE_OF_CONDUCT.md` — correct version
- `head -1 LICENSE` — "MIT License"
- `grep 'blank_issues_enabled: false' .github/ISSUE_TEMPLATE/config.yml` — blank issues disabled

## Inputs

- `packages/cli/src/index.ts` — CLI usage output for README accuracy
- `packages/core/src/index.ts` — public API exports for README reference
- `packages/core/src/types.ts` — key types for README documentation
- `packages/cli/package.json` — package name, version, keywords
- `.github/workflows/ci.yml` — CI badge URL and job name reference
- S01 forward intelligence — npm scope is `@driftless-ai`, install command uses `@latest`

## Expected Output

- `README.md` — professional README with badges, install, usage, API reference, Claude-first note
- `LICENSE` — MIT license text
- `CONTRIBUTING.md` — dev setup and PR guidelines
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- `SECURITY.md` — responsible disclosure policy
- `.github/ISSUE_TEMPLATE/bug_report.yml` — structured bug report form
- `.github/ISSUE_TEMPLATE/feature_request.yml` — structured feature request form
- `.github/ISSUE_TEMPLATE/config.yml` — template chooser config
- `.github/PULL_REQUEST_TEMPLATE.md` — PR description template
- `.github/FUNDING.yml` — sponsor button config

## Observability Impact

- **What signals change:** 10 new static files. No runtime behavior changes. GitHub's license detection, community profile health score, and issue template rendering are the external signals.
- **How a future agent inspects this task:** `ls` the 10 expected paths. `grep` for key content markers (`@driftless-ai/cli`, `Contributor Covenant`, `MIT License`, `blank_issues_enabled: false`). All checks are in the Verification section above.
- **What failure state becomes visible:** Missing files cause `ls` to exit non-zero. Wrong package scope causes `grep '@driftless-ai/cli'` to return 0 matches. Malformed YAML templates cause GitHub to silently fall back to blank issue forms (requires browser verification in T02).
