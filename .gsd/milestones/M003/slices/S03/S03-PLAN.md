# S03: README + Community Files + Repo Hygiene

**Goal:** The GitHub repo has all standard OSS community files, a professional README with badges and install instructions, and branch protection configured.
**Demo:** Visiting github.com/domstepek/driftless shows a polished README with badges, license detected in sidebar, community profile health check passes, and PRs require status checks + review to merge.

## Must-Haves

- README.md with badges (npm version, CI status, license), install instructions (`npx @driftless-ai/cli@latest init`), usage examples, API surface, and Claude-first note (R025)
- MIT LICENSE file (bare, no extension) with "Dom Stepek" and year 2026
- CONTRIBUTING.md with dev setup instructions and PR guidelines
- CODE_OF_CONDUCT.md using Contributor Covenant v2.1
- SECURITY.md with responsible disclosure instructions
- `.github/ISSUE_TEMPLATE/bug_report.yml` and `feature_request.yml` (YAML form schema)
- `.github/ISSUE_TEMPLATE/config.yml` with `blank_issues_enabled: false`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/FUNDING.yml` with `github: [domstepek]`
- GitHub repo: topics set, homepage URL set, branch protection on `main` (require PR review, require "Test & Build" status check)

## Proof Level

- This slice proves: final-assembly (community files + repo settings)
- Real runtime required: no (static files + GitHub UI configuration)
- Human/UAT required: yes (README readability, GitHub repo appearance)

## Verification

- `ls README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md` — all exist
- `ls .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/ISSUE_TEMPLATE/config.yml .github/PULL_REQUEST_TEMPLATE.md .github/FUNDING.yml` — all exist
- `head -1 LICENSE` contains "MIT License"
- `grep -q '@driftless-ai/cli' README.md` — correct package name used
- `grep -q 'shields.io' README.md` — badges present
- `grep -q 'Contributor Covenant' CODE_OF_CONDUCT.md` — correct CoC version
- GitHub repo via browser: topics visible, branch protection active, homepage set
- `grep 'blank_issues_enabled: false' .github/ISSUE_TEMPLATE/config.yml` — blank issues disabled (diagnostic: malformed config would silently allow blank issues)

## Tasks

- [x] **T01: Create README, LICENSE, and all community files** `est:45m`
  - Why: R019 (community files) and R025 (Claude-first documentation) — the core deliverables of this slice
  - Files: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/FUNDING.yml`
  - Do: Write all 10 files. README structure: one-liner + badges → What is driftless → Quick Start (3 commands) → How It Works → Configuration → Packages → Claude-first note → Contributing → License. Use `@driftless-ai%2Fcli` encoding for shields.io badge URLs. Verify CLI help output and core exports before writing to ensure accuracy. LICENSE must be bare filename (no .md extension). Issue templates use GitHub YAML form schema with validation. config.yml disables blank issues.
  - Verify: `ls README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/ISSUE_TEMPLATE/config.yml .github/PULL_REQUEST_TEMPLATE.md .github/FUNDING.yml` — all 10 files exist. `grep '@driftless-ai/cli' README.md` hits. `grep 'shields.io' README.md` hits. `head -1 LICENSE` is "MIT License".
  - Done when: all 10 files exist with correct content, README uses accurate package names and install commands, badges use correct URL encoding

- [x] **T02: Configure GitHub repo topics, homepage, and branch protection** `est:20m`
  - Why: R020 (repo hygiene) — topics for discoverability, homepage for navigation, branch protection to enforce PR quality
  - Files: none (GitHub UI configuration only)
  - Do: Load agent-browser skill. Navigate to GitHub repo settings. Set topics (cli, documentation, testing, e2e-testing, developer-tools, claude, ai, typescript, open-source). Set homepage to npm package URL. Configure branch protection on `main`: require PR reviews (1 approval), require "Test & Build" status check to pass, require branches to be up to date. If browser automation hits auth issues, document exact settings for user.
  - Verify: Browse to github.com/domstepek/driftless — topics visible below description, homepage link present. Browse to Settings → Branches — protection rule on `main` with required checks.
  - Done when: topics are set on the repo, branch protection requires PR review and passing CI

## Observability / Diagnostics

- **README accuracy signals:** CLI `--help` output and `packages/core/src/index.ts` exports are the source of truth. If either changes, README sections (Quick Start, API Reference) may drift. A future agent can `grep '@driftless-ai/cli' README.md` to verify scope consistency.
- **License detection:** GitHub auto-detects `LICENSE` (no extension) and shows it in the repo sidebar. Verification: check GitHub UI or `head -1 LICENSE` locally.
- **Community profile health:** GitHub's community profile page (`/community`) scores the presence of these files. A future agent can browser-check that page for 100% score.
- **Issue template validation:** GitHub renders YAML form templates differently from markdown templates. Malformed YAML will silently fall back to blank issues. Verify by navigating to the "New Issue" page and confirming structured forms appear.
- **Failure visibility:** If any file is missing or malformed, `ls` checks and `grep` checks in Verification fail immediately with non-zero exit. No silent failures.

## Files Likely Touched

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/FUNDING.yml`
