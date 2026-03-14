---
estimated_steps: 4
estimated_files: 0
---

# T02: Configure GitHub repo topics, homepage, and branch protection

**Slice:** S03 — README + Community Files + Repo Hygiene
**Milestone:** M003

## Description

Configure GitHub repo metadata and branch protection rules via browser automation. The fine-grained PAT returns 403 on both branch protection and rulesets APIs (documented in research), so this must go through the GitHub Settings UI using agent-browser. Sets topics for discoverability, homepage URL for navigation, and branch protection to enforce PR quality gates.

## Steps

1. Load agent-browser skill (`~/.gsd/agent/skills/agent-browser/SKILL.md`). Navigate to `github.com/domstepek/driftless` repo page.
2. Set repo topics: `cli`, `documentation`, `testing`, `e2e-testing`, `developer-tools`, `claude`, `ai`, `typescript`, `open-source`. Set homepage URL to `https://www.npmjs.com/package/@driftless-ai/cli`.
3. Navigate to Settings → Branches (or Settings → Rules → Rulesets). Add branch protection rule for `main`: require pull request reviews (1 approval), require status checks to pass (specifically "Test & Build" — the CI job name from ci.yml), require branches to be up to date before merging.
4. Verify: browse back to repo main page and confirm topics are visible. Check Settings → Branches to confirm protection rule is active. If browser automation hits authentication or permission issues, document the exact settings needed as a follow-up for the user.

## Must-Haves

- [ ] Topics set on GitHub repo (at least: cli, documentation, testing, typescript, ai)
- [ ] Homepage URL set to npm package page
- [ ] Branch protection on `main` requires PR review
- [ ] Branch protection on `main` requires "Test & Build" status check to pass
- [ ] If browser automation fails, exact manual steps documented

## Verification

- Browse to `github.com/domstepek/driftless` — topics visible below repo description
- Browse to Settings → Branches — protection rule listed for `main`
- Screenshot of repo page showing topics and README rendered

## Inputs

- `.github/workflows/ci.yml` — job name "Test & Build" for required status check
- S03/T01 output — README.md must exist before setting homepage
- D015 — agent-browser is the chosen approach for GitHub UI operations

## Expected Output

- GitHub repo metadata configured (topics, homepage, description)
- Branch protection rule on `main` (PR review + CI status check)
- Screenshot evidence of final repo state

## Observability Impact

- **Topics visibility:** A future agent can verify repo discoverability by browsing to `github.com/domstepek/driftless` and checking for topic badges below the description. Topics also surface in GitHub search — `topic:cli topic:ai` should find this repo.
- **Branch protection signals:** Navigate to Settings → Branches (or Rules → Rulesets) to confirm `main` is protected. A failed PR merge attempt (missing review or failing CI) is the runtime signal that protection is active. The "Test & Build" status check name must match the CI job name in `.github/workflows/ci.yml` exactly — a mismatch silently allows merges without CI.
- **Homepage link:** The npm package URL appears as a clickable link next to the repo description. A future agent can read this from the repo page or via `gh repo view --json homepageUrl`.
- **Failure state:** If browser automation fails due to auth or permissions, the task summary documents the exact manual steps needed. A future agent should check T02-SUMMARY.md for `browser_automation_failed: true` in frontmatter to know manual intervention is required.
