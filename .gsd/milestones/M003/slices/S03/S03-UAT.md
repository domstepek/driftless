# S03: README + Community Files + Repo Hygiene — UAT

**Milestone:** M003
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed (artifact-driven + human-experience)
- Why this mode is sufficient: Most checks are file existence and content verification (artifact-driven). GitHub repo appearance and README readability require human judgment (human-experience).

## Preconditions

- S03 branch changes pushed to `origin` (community files visible on GitHub)
- Merge to `main` completed (for branch protection to apply)
- Browser access to github.com/domstepek/driftless

## Smoke Test

Run `ls README.md LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/ISSUE_TEMPLATE/config.yml .github/PULL_REQUEST_TEMPLATE.md .github/FUNDING.yml` — all 10 files listed without error.

## Test Cases

### 1. README displays correctly on GitHub

1. Navigate to `github.com/domstepek/driftless`
2. Scroll through the README rendered on the repo page
3. **Expected:** Badges (npm version, CI status, license) render as colored shields at the top. Install command `npx @driftless-ai/cli@latest init` is visible in Quick Start. Configuration table, packages table, and API surface section are present. "AI Harness Support" section notes Claude Code CLI as v1 harness.

### 2. npm version badge resolves

1. Click the npm version badge in the README
2. **Expected:** Navigates to `https://www.npmjs.com/package/@driftless-ai/cli`. Badge shows current version (1.0.0+), not "not found."

### 3. CI status badge resolves

1. Observe the CI badge in the README
2. **Expected:** Badge shows "passing" or "failing" status — not a broken image or "not found."

### 4. License detected by GitHub

1. Look at the repo sidebar (right side of the repo page)
2. **Expected:** "MIT license" appears with a scale icon in the sidebar.

### 5. Community profile completeness

1. Navigate to `github.com/domstepek/driftless/community`
2. **Expected:** Community profile checklist shows checkmarks for: Description, README, Code of conduct, Contributing, License, Security policy, Issue templates. Score should be 100% or near-100%.

### 6. Issue templates render as structured forms

1. Navigate to `github.com/domstepek/driftless/issues/new/choose`
2. Click "Bug Report"
3. **Expected:** A structured form appears with labeled fields (dropdowns, text inputs, textareas) — NOT a freeform markdown editor. Fields have labels like "What happened?", "Steps to reproduce", "Environment."
4. Go back, click "Feature Request"
5. **Expected:** Another structured form with fields for the feature description, use case, and alternatives considered.

### 7. Blank issues are disabled

1. Navigate to `github.com/domstepek/driftless/issues/new/choose`
2. **Expected:** No "Open a blank issue" option. Only structured templates (Bug Report, Feature Request) and possibly a link to Discussions.

### 8. PR template loads on new PR

1. Start creating a new PR (or navigate to the PR creation page)
2. **Expected:** The PR body is pre-filled with the template sections: What, Why, How, Test Plan, and a checklist.

### 9. Topics and homepage visible

1. Navigate to `github.com/domstepek/driftless`
2. **Expected:** Topics visible below the description — should include: cli, documentation, testing, e2e-testing, developer-tools, claude, ai, typescript, open-source. A homepage link to the npm package page is visible.

### 10. Branch protection blocks unreviewed merge

1. Create a test branch, push a trivial change, open a PR to `main`
2. Attempt to merge without requesting review
3. **Expected:** Merge is blocked with a message about required approvals. The "Test & Build" status check also appears as required.

### 11. FUNDING.yml enables Sponsors

1. Navigate to `github.com/domstepek/driftless`
2. **Expected:** A "Sponsor" button (heart icon) appears on the repo page linking to GitHub Sponsors for domstepek.

## Edge Cases

### Shields.io badge with scoped package

1. Inspect badge URLs in README source (view raw)
2. Verify the npm badge URL contains `@driftless-ai%2Fcli` (URL-encoded slash)
3. **Expected:** Badge renders correctly. If the `%2F` encoding is wrong, shields.io returns a broken badge.

### CONTRIBUTING.md dev setup accuracy

1. Follow the dev setup instructions in CONTRIBUTING.md on a fresh clone
2. Run `pnpm install`, `pnpm check`, `pnpm test`, `pnpm build`
3. **Expected:** All commands succeed. If instructions reference commands that don't exist, this catches it.

## Failure Signals

- Any badge renders as broken image or "not found" — URL encoding issue or package not published
- Community profile page shows missing files — file naming or location wrong
- Issue "New Issue" page shows freeform editor instead of forms — YAML template malformed
- "Open a blank issue" link present — config.yml not picked up or malformed
- No "MIT license" in repo sidebar — LICENSE file named wrong (e.g., LICENSE.md instead of LICENSE)
- Branch protection not blocking merge — rule not created or status check name mismatch
- Merge blocked by wrong status check name — CI job renamed without updating branch protection

## Requirements Proved By This UAT

- R019 (OSS community files) — tests 4, 5, 6, 7, 8, 11 prove all community files are present and functional
- R020 (GitHub repo hygiene) — tests 9, 10 prove topics, homepage, and branch protection are configured
- R025 (Claude-first documentation) — test 1 proves README documents Claude Code as v1 harness

## Not Proven By This UAT

- README content accuracy after future CLI changes (would require re-running `driftless --help` and comparing)
- Contact email placeholders in CODE_OF_CONDUCT.md and SECURITY.md still need replacement before public launch
- Full branch protection enforcement under all edge cases (admin bypass, force push)

## Notes for Tester

- Tests 1–9 and 11 can be run immediately after push. Test 10 requires a real PR.
- Badge resolution (tests 2–3) may take a few minutes after initial push for shields.io to cache.
- CODE_OF_CONDUCT.md and SECURITY.md have `[INSERT CONTACT EMAIL]` placeholders — this is a known issue, not a test failure. Flag it if it's still there at public launch.
- The `$schema` URL in the README config example won't resolve until a JSON schema file is committed — cosmetic only, not a functional issue.
