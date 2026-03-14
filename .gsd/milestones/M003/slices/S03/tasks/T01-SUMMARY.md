---
id: T01
parent: S03
milestone: M003
provides:
  - README.md with badges, install instructions, API reference, Claude-first note
  - MIT LICENSE (bare filename)
  - CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
  - GitHub issue templates (YAML form schema), PR template, FUNDING.yml
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
  - README structure follows hero → What → Quick Start → How It Works → Config → Packages → Claude-first note → Contributing → License
  - Issue templates use YAML form schema with validation (not freeform markdown) for structured data collection
  - CODE_OF_CONDUCT uses verbatim Contributor Covenant v2.1 with placeholder contact email
patterns_established:
  - Shields.io badges use URL-encoded scope (@driftless-ai%2Fcli) for npm packages with scoped names
  - GitHub issue templates use dropdown, input, and textarea form elements with required validation
observability_surfaces:
  - grep checks for package scope, badge URLs, CoC version, and blank issues config serve as drift detection
  - GitHub community profile page (/community) will score file presence after push
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Create README, LICENSE, and all community files

**Created all 10 community and documentation files: professional README with badges, MIT license, contributor docs, and GitHub templates.**

## What Happened

Gathered CLI help output, core package exports, and CI workflow configuration to ensure README accuracy. Wrote README.md with: npm version/CI/license badges using URL-encoded scope, Quick Start with `npx @driftless-ai/cli@latest init`, full configuration reference table sourced from `DriftlessConfig` type, packages table, core API surface listing, and Claude-first harness support note (R025).

Wrote MIT LICENSE as bare filename (no extension) for GitHub auto-detection. Created CONTRIBUTING.md with pnpm workspace dev setup, conventional commit conventions, and PR guidelines. CODE_OF_CONDUCT.md uses verbatim Contributor Covenant v2.1. SECURITY.md covers responsible disclosure with supported versions table and scope definition.

GitHub templates: bug_report.yml and feature_request.yml use YAML form schema with typed fields (dropdowns, validated inputs, textareas with render hints). config.yml disables blank issues and points to Discussions. PR template has What/Why/How sections with CI checklist. FUNDING.yml enables GitHub Sponsors for domstepek.

## Verification

All checks passed:
- `ls` confirms all 10 files exist (5 root, 5 in .github/)
- `grep -c '@driftless-ai/cli' README.md` → 3 hits (correct scope throughout)
- `grep 'shields.io.*driftless-ai%2Fcli' README.md` → 2 URL-encoded badge hits
- `grep 'npx @driftless-ai/cli@latest init' README.md` → install command present with @latest
- `grep 'Node.js ≥ 22' README.md` → prerequisite stated
- `grep 'AI Harness Support' README.md` → Claude-first note present
- `head -1 LICENSE` → "MIT License"
- `grep 'Contributor Covenant' CODE_OF_CONDUCT.md` → v2.1 referenced
- `grep 'blank_issues_enabled: false' .github/ISSUE_TEMPLATE/config.yml` → blank issues disabled

### Slice-level verification (T01 scope):
- ✅ `ls README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md` — all exist
- ✅ `ls .github/ISSUE_TEMPLATE/*.yml .github/PULL_REQUEST_TEMPLATE.md .github/FUNDING.yml` — all exist
- ✅ `head -1 LICENSE` contains "MIT License"
- ✅ `grep -q '@driftless-ai/cli' README.md` — correct package name
- ✅ `grep -q 'shields.io' README.md` — badges present
- ✅ `grep -q 'Contributor Covenant' CODE_OF_CONDUCT.md` — correct version
- ⏳ GitHub repo via browser: topics, branch protection, homepage — deferred to T02

## Diagnostics

- Verify README accuracy after CLI changes: run `driftless --help` and compare against Quick Start / CLI Usage sections
- Verify badge resolution: shields.io URLs use `@driftless-ai%2Fcli` encoding — if package is renamed, badges will 404
- Verify GitHub detection: after push, check repo sidebar for license badge and community profile at `/community`
- Issue template validation: navigate to repo "New Issue" page to confirm YAML forms render (not freeform)

## Deviations

None.

## Known Issues

- CODE_OF_CONDUCT.md and SECURITY.md have `[INSERT CONTACT EMAIL]` placeholder — needs real email before public launch
- README config example references a schema URL on `main` branch that doesn't exist yet (`driftless.schema.json`)

## Files Created/Modified

- `README.md` — Professional README with badges, install, config reference, API surface, Claude-first note
- `LICENSE` — MIT license, bare filename for GitHub auto-detection
- `CONTRIBUTING.md` — Dev setup (pnpm workspace), PR guidelines, commit conventions
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1 verbatim
- `SECURITY.md` — Responsible disclosure policy with supported versions
- `.github/ISSUE_TEMPLATE/bug_report.yml` — Structured bug report form (YAML schema)
- `.github/ISSUE_TEMPLATE/feature_request.yml` — Structured feature request form (YAML schema)
- `.github/ISSUE_TEMPLATE/config.yml` — Template chooser config, blank issues disabled
- `.github/PULL_REQUEST_TEMPLATE.md` — PR description template with checklist
- `.github/FUNDING.yml` — GitHub Sponsors config for domstepek
- `.gsd/milestones/M003/slices/S03/S03-PLAN.md` — Added Observability/Diagnostics section and diagnostic verification step
- `.gsd/milestones/M003/slices/S03/tasks/T01-PLAN.md` — Added Observability Impact section
