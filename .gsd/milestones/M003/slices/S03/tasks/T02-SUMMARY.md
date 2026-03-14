---
id: T02
parent: S03
milestone: M003
provides:
  - GitHub repo topics (9 topics for discoverability)
  - Homepage URL set to npm package page
  - Branch protection rule on `main` (PR review + CI status check)
key_files: []
key_decisions:
  - Used classic branch protection rules (not rulesets) — simpler for the current needs and compatible with GitHub Free plan
  - Set 1 required approval for PR reviews — appropriate for a solo/small-team project
  - Required "Test & Build" status check matches CI job name exactly from `.github/workflows/ci.yml`
  - Enabled "Require branches to be up to date before merging" for stricter merge safety
patterns_established:
  - GitHub repo metadata configuration via browser automation when API returns 403 on fine-grained PAT
observability_surfaces:
  - Topics visible at `github.com/domstepek/driftless` sidebar — searchable via `topic:cli topic:ai`
  - Homepage URL clickable next to repo description — verifiable via `gh repo view --json homepageUrl`
  - Branch protection at Settings → Branches — `main` rule with required checks listed
  - Failed PR merge (missing review or failing CI) is the runtime signal protection is active
duration: 12m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Configure GitHub repo topics, homepage, and branch protection

**Configured GitHub repo metadata (9 topics, npm homepage URL) and branch protection on `main` requiring PR review and passing CI.**

## What Happened

Used browser automation to configure GitHub repo settings since the fine-grained PAT returns 403 on branch protection APIs.

1. **Repo metadata:** Opened the "Edit repository details" dialog on the repo page. Set homepage URL to `https://www.npmjs.com/package/@driftless-ai/cli`. Added 9 topics: cli, documentation, testing, e2e-testing, developer-tools, claude, ai, typescript, open-source.

2. **Branch protection:** Navigated to Settings → Branches → New classic branch protection rule. Configured for `main` branch:
   - Require a pull request before merging (with 1 required approval)
   - Require status checks to pass before merging ("Test & Build" — matches CI job name exactly)
   - Require branches to be up to date before merging

## Verification

- ✅ Repo page shows all 9 topics below description (screenshot confirmed)
- ✅ Homepage URL visible as clickable link (`www.npmjs.com/package/@driftle...`)
- ✅ "Branch protection rule created." banner confirmed on Settings → Branches
- ✅ `main` rule listed with "Currently applies to 1 branch"
- ✅ All slice-level file checks pass:
  - `ls README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md` — all exist
  - `ls .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/ISSUE_TEMPLATE/config.yml .github/PULL_REQUEST_TEMPLATE.md .github/FUNDING.yml` — all exist
  - `head -1 LICENSE` → "MIT License"
  - `grep '@driftless-ai/cli' README.md` → PASS
  - `grep 'shields.io' README.md` → PASS
  - `grep 'Contributor Covenant' CODE_OF_CONDUCT.md` → PASS
  - `grep 'blank_issues_enabled: false' .github/ISSUE_TEMPLATE/config.yml` → PASS

## Diagnostics

- **Topics:** Browse `github.com/domstepek/driftless` — topics visible in sidebar. Search `topic:cli topic:ai` on GitHub to confirm discoverability.
- **Homepage:** Visible as link next to description. Verify via `gh repo view --json homepageUrl`.
- **Branch protection:** Navigate to Settings → Branches to see `main` rule. Runtime test: attempt a direct push or PR merge without review/CI — should be blocked.
- **Status check name match:** The required check is "Test & Build" which must match the `name:` field in `.github/workflows/ci.yml` job `ci`. If the CI job name changes, the branch protection check will silently stop blocking (it won't find the old name).

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

No local files — all changes were GitHub UI configuration (repo metadata + branch protection).
