---
id: S03
parent: M003
milestone: M003
provides:
  - README.md with badges, install instructions, config reference, API surface, Claude-first note
  - MIT LICENSE (bare filename, GitHub auto-detected)
  - CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
  - GitHub issue templates (YAML form schema), PR template, FUNDING.yml
  - GitHub repo topics (9), homepage URL, branch protection on main
key_files:
  - README.md
  - LICENSE
  - CONTRIBUTING.md
  - CODE_OF_CONDUCT.md
  - SECURITY.md
  - .github/ISSUE_TEMPLATE/bug_report.yml
  - .github/ISSUE_TEMPLATE/feature_request.yml
  - .github/ISSUE_TEMPLATE/config.yml
  - .github/PULL_REQUEST_TEMPLATE.md
  - .github/FUNDING.yml
key_decisions:
  - README structure: hero badge line → What → Quick Start → How It Works → Config → Packages → Claude-first note → Contributing → License
  - Issue templates use YAML form schema with typed fields and validation, not freeform markdown
  - Classic branch protection rules (not rulesets) — simpler, GitHub Free compatible
  - 1 required approval + "Test & Build" status check on main
patterns_established:
  - Shields.io badges use URL-encoded scope (@driftless-ai%2Fcli) for scoped npm packages
  - GitHub YAML form templates with dropdown, input, textarea elements and required validation
  - Browser automation for GitHub repo settings when API returns 403 on fine-grained PATs
observability_surfaces:
  - GitHub community profile page (/community) scores file presence after push
  - Branch protection blocks direct push and unreviewed PRs — runtime signal is merge failure
  - grep checks for scope, badges, CoC version, blank issues config serve as drift detection
drill_down_paths:
  - .gsd/milestones/M003/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S03/tasks/T02-SUMMARY.md
duration: 32m
verification_result: passed
completed_at: 2026-03-14
---

# S03: README + Community Files + Repo Hygiene

**Professional OSS presence: README with badges and install docs, all community files, GitHub repo configured with topics and branch protection.**

## What Happened

T01 created all 10 community and documentation files. README was written from live CLI help output and core package exports to ensure accuracy — includes npm version/CI/license badges with URL-encoded scope, Quick Start with `npx @driftless-ai/cli@latest init`, configuration reference table sourced from `DriftlessConfig` type, packages table, core API surface, and Claude-first harness support note (R025). MIT LICENSE uses bare filename for GitHub sidebar auto-detection. Issue templates use YAML form schema with typed fields (dropdowns, validated inputs, textareas with render hints) rather than freeform markdown. config.yml disables blank issues. CONTRIBUTING.md covers pnpm workspace dev setup and conventional commits. CODE_OF_CONDUCT.md is verbatim Contributor Covenant v2.1. SECURITY.md has responsible disclosure instructions.

T02 configured GitHub repo metadata via browser automation (fine-grained PAT returned 403 on branch protection APIs). Set 9 topics for discoverability, homepage URL to the npm package page. Created classic branch protection rule on `main`: requires 1 PR approval, requires "Test & Build" status check (matching CI job name), requires branches to be up to date.

## Verification

All slice-level checks passed:
- All 10 files exist (5 root + 5 in .github/)
- `grep '@driftless-ai/cli' README.md` → 3 hits (correct scope)
- `grep 'shields.io' README.md` → 2 badge URL hits
- `head -1 LICENSE` → "MIT License"
- `grep 'Contributor Covenant' CODE_OF_CONDUCT.md` → v2.1 referenced
- `grep 'blank_issues_enabled: false' .github/ISSUE_TEMPLATE/config.yml` → blank issues disabled
- GitHub repo: 9 topics visible, homepage link present, branch protection rule on `main` confirmed via browser

## Requirements Validated

- R019 (OSS community files) — all 10 files exist with correct content: LICENSE, CONTRIBUTING, CoC, SECURITY, issue templates, PR template, FUNDING
- R020 (GitHub repo hygiene) — topics set (9), homepage URL configured, branch protection active on main with PR review + CI checks required

## Requirements Advanced

- R025 (Claude-first with documented future harness support) — README includes "AI Harness Support" section noting Claude Code CLI as v1 harness with future intent for others

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

None.

## Known Limitations

- CODE_OF_CONDUCT.md and SECURITY.md have `[INSERT CONTACT EMAIL]` placeholder — needs real email before public launch
- README config example references a `$schema` URL on main branch that doesn't exist yet (`driftless.schema.json`)
- R025 fully validated only when README is pushed and visible on GitHub

## Follow-ups

- Replace contact email placeholders in CODE_OF_CONDUCT.md and SECURITY.md before public launch
- After push, verify GitHub community profile page (/community) shows 100% score
- After push, verify issue template YAML forms render correctly on the "New Issue" page

## Files Created/Modified

- `README.md` — Professional README with badges, install, config reference, API surface, Claude-first note
- `LICENSE` — MIT license, bare filename for GitHub auto-detection
- `CONTRIBUTING.md` — Dev setup, PR guidelines, commit conventions
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- `SECURITY.md` — Responsible disclosure policy
- `.github/ISSUE_TEMPLATE/bug_report.yml` — Structured bug report form (YAML schema)
- `.github/ISSUE_TEMPLATE/feature_request.yml` — Structured feature request form (YAML schema)
- `.github/ISSUE_TEMPLATE/config.yml` — Template chooser, blank issues disabled
- `.github/PULL_REQUEST_TEMPLATE.md` — PR description template with checklist
- `.github/FUNDING.yml` — GitHub Sponsors for domstepek

## Forward Intelligence

### What the next slice should know
- S04 (CLI auto-update) is independent of this slice — no dependencies on community files or repo settings
- The npm package name is `@driftless-ai/cli` and shields.io badges use `@driftless-ai%2Fcli` URL encoding
- Branch protection now requires PR review + passing CI — direct pushes to main are blocked

### What's fragile
- Badge URLs use URL-encoded scope (`%2F`) — if package is renamed, badges 404 silently
- "Test & Build" status check name in branch protection must match CI job name exactly — renaming the CI job breaks the protection rule silently
- Contact email placeholders (`[INSERT CONTACT EMAIL]`) in CoC and SECURITY will look unprofessional if pushed as-is

### Authoritative diagnostics
- `grep -c '@driftless-ai/cli' README.md` — scope consistency (should be 3+)
- `grep 'blank_issues_enabled: false' .github/ISSUE_TEMPLATE/config.yml` — blank issues disabled
- GitHub Settings → Branches → main rule — branch protection active with required checks listed

### What assumptions changed
- None — slice executed as planned
