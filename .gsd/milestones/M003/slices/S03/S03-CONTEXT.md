---
id: S03
milestone: M003
status: ready
---

# S03: README + Community Files + Repo Hygiene — Context

## Goal

The GitHub repo looks like a professional OSS project that a stranger can evaluate, trust, install from, and contribute to — README with badges and install instructions, community files, issue/PR templates, FUNDING.yml, repo metadata, and branch protection.

## Why this Slice

S01 publishes the package. S02 automates releases. But none of that matters if the repo looks like a work-in-progress when someone visits it. This slice is the public face — the first thing a potential user sees. It also establishes contribution infrastructure (templates, guidelines, branch protection) before any outside PRs arrive.

## Scope

### In Scope

- **README.md** — written for a developer evaluating the tool for the first time. Concise, scannable, shows the value prop fast. Structure: badges → one-liner description → quick install → usage example → deeper sections (config, adapters, API reference, Claude-first note per R025, contributing link). Uses published package name and npx invocation from S01.
- **LICENSE** — MIT, standard text, copyright `Dom Stepek`.
- **CONTRIBUTING.md** — how to set up the dev environment (pnpm, Vite+, Node 22), run tests, submit PRs. Matches actual toolchain.
- **CODE_OF_CONDUCT.md** — Contributor Covenant v2.1 (industry standard, don't hand-roll).
- **SECURITY.md** — responsible disclosure policy with contact method (email or GitHub security advisories).
- **`.github/ISSUE_TEMPLATE/bug_report.yml`** — structured bug report template (YAML form format).
- **`.github/ISSUE_TEMPLATE/feature_request.yml`** — structured feature request template.
- **`.github/PULL_REQUEST_TEMPLATE.md`** — PR checklist template.
- **`.github/FUNDING.yml`** — GitHub Sponsors button pointing to `domstepek`. Requires GitHub Sponsors enrollment first (see below).
- **GitHub Sponsors enrollment** — enroll `domstepek` account in GitHub Sponsors via browser automation (D015). May hit a waitlist — start early, don't block on it.
- **GitHub repo settings** (via agent-browser per D015):
  - Repository description and topics (e.g., `cli`, `documentation`, `e2e-testing`, `ai`, `claude`)
  - Branch protection on `main`: require CI status checks to pass AND require at least 1 PR review before merge. Direct push to main blocked.
- **Badges in README** — npm version, CI status, license, at minimum.

### Out of Scope

- Landing page / marketing site (M004)
- Documentation site (M004)
- Launch strategy / social media (M004)
- Detailed API reference docs beyond what fits in README (M004)
- Commitlint / conventional commit enforcement (can layer later)

## Constraints

- README must use the published package name and npx invocation pattern from S01 — don't hardcode until S01 resolves the final scope
- Branch protection requires CI workflow from S02 to exist for "require status checks" to reference. If S03 runs before S02, branch protection status check config may need a follow-up step. Alternatively, S03 can set up protection after S02 merges.
- GitHub Sponsors enrollment is a GitHub UI task — agent handles via browser automation but there may be a waitlist. FUNDING.yml can be committed regardless; the Sponsor button just won't render until enrollment completes.
- All community files are net-new — nothing to migrate or preserve.

## Integration Points

### Consumes from S01

- Published package name (scoped, e.g., `@driftless/cli` or final resolution)
- npm URL for badges and install instructions
- Version number for badge display
- Verified `npx` invocation pattern for README examples

### Consumes from S02

- CI workflow name/path for branch protection "require status checks" config
- CI badge URL for README

### Produces

- README.md, LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`, `.github/FUNDING.yml`
- GitHub repo: topics, description, branch protection (CI + 1 review required)

## Open Questions

- **S02 dependency for branch protection:** Branch protection's "require status checks" needs to reference the CI workflow job name from S02. If S03 runs in parallel with S02, the status check name won't exist yet. Current leaning: commit all files in S03, configure branch protection as the last step after confirming S02's CI workflow is merged.
