# S03: README + Community Files + Repo Hygiene — Research

**Date:** 2026-03-14

## Summary

S03 is a clean-slate file creation slice — no README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue templates, PR template, or FUNDING.yml exist yet. The `.github/` directory has only `workflows/` from S02. The repo already has a description set on GitHub ("Documentation that can't drift — generated from tests, checked on every PR.") but no topics, no homepage, and no branch protection.

The work is straightforward: create ~10 files following well-established OSS conventions, set GitHub repo metadata via API, and configure branch protection. The main complexity is in the README, which needs to be genuinely useful — install instructions, usage examples, API surface documentation, and the Claude-first framing (R025). All the content inputs are available: package names (`@driftless-ai/cli`, `@driftless-ai/core`), version (1.0.0), CLI commands, core exports, prompt flow, and workflow templates.

One constraint discovered: the fine-grained PAT returns 403 on both branch protection and rulesets APIs. Branch protection must be configured via browser automation (agent-browser per D015) or documented as a manual step for the user.

## Recommendation

**Approach:** Create all community files as static content in two tasks. T01 handles all file creation (README, LICENSE, community files, templates, FUNDING.yml). T02 handles GitHub repo settings (topics, homepage, branch protection via agent-browser).

**README structure:** Hero section with one-liner + badges → What is driftless (the pitch) → Quick Start (3 commands) → How it Works (test→doc pipeline) → Configuration Reference → Packages → Claude-first note (R025) → Contributing → License. Keep it scannable — a developer should understand what driftless does and how to install it in under 30 seconds.

**Badges:** npm version, CI status, license, Node.js version requirement. Use shields.io for npm/license, GitHub Actions badge URL for CI.

**Branch protection:** Use agent-browser to configure via GitHub Settings UI since the API is blocked by PAT permissions. Required settings: require PR reviews (1 approval), require status checks to pass ("Test & Build" from ci.yml), require branches to be up to date.

**Community files:** Standard patterns — Contributor Covenant v2.1 for CODE_OF_CONDUCT, MIT license text, SECURITY.md with responsible disclosure instructions, CONTRIBUTING.md with dev setup + PR guidelines.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Code of Conduct | Contributor Covenant v2.1 | Industry standard, recognized by GitHub's community profile checker |
| License text | SPDX MIT template | Standard boilerplate, matches `license: "MIT"` in both package.json files |
| Issue templates | GitHub YAML form schema | Structured forms with validation, better than freeform markdown templates |
| CI status badge | GitHub Actions badge URL | `https://github.com/{owner}/{repo}/actions/workflows/ci.yml/badge.svg` — native, no third-party |
| npm version badge | shields.io | `https://img.shields.io/npm/v/@driftless-ai/cli` — auto-updates from registry |
| License badge | shields.io | `https://img.shields.io/npm/l/@driftless-ai/cli` — reads from npm metadata |
| PR template | GitHub `.github/PULL_REQUEST_TEMPLATE.md` | Auto-populates PR description body |

## Existing Code and Patterns

- `packages/cli/package.json` — Contains `name: "@driftless-ai/cli"`, `description`, `keywords`, `homepage`, `license: "MIT"`, `author: "Dom Stepek"`. README install instructions must match these exactly.
- `packages/core/package.json` — `name: "@driftless-ai/core"`, same metadata pattern. README should mention both packages.
- `packages/cli/src/index.ts` — CLI entry point with `main()`. Usage output shows: `driftless <command> [options]` with `init`, `--dry-run`, `--version`, `--help`. README usage section should mirror this.
- `packages/cli/src/prompts/init-prompts.ts` — Prompt flow: test glob → output dir → doc framework → capabilities → skills dir. README should show what the init wizard asks.
- `packages/core/src/index.ts` — Full public API surface. README API reference should document these exports.
- `packages/core/src/types.ts` — All type definitions. Key types for README: `DriftlessConfig`, `DocFramework`, `Capability`, `TestFramework`.
- `.github/workflows/ci.yml` — CI job name is "Test & Build". Branch protection status check must reference this name.
- `.github/workflows/release.yml` — Tag-triggered publish. README can link to this for transparency.
- `CHANGELOG.md` — v1.0.0 entry exists. README should link to it.
- `.nvmrc` — Node 22. README prerequisites should state Node ≥22.

## Constraints

- **PAT lacks admin scope** — `gh api` returns 403 for branch protection and rulesets endpoints. Must use browser automation (agent-browser) or document as manual step.
- **GitHub Sponsors enrollment unknown** — FUNDING.yml references `github: [domstepek]` but GitHub Sponsors must be enabled on the account first. Write the file regardless — it's harmless if Sponsors isn't active yet, and will activate automatically when enrollment completes.
- **npm scope is `@driftless-ai`** — All README references must use `@driftless-ai/cli` not `@driftless/cli` (S01 forward intelligence).
- **Node ≥22 required** — `.nvmrc` says 22, `engines` says `>=22.12.0`. README prerequisites must state this.
- **ESM-only** — Both packages output `.mjs`. This is fine for Node 22+ but worth noting in README for clarity.
- **Repo owner is `domstepek`** — GitHub URLs are `github.com/domstepek/driftless`. FUNDING.yml uses `domstepek`.
- **Author name for LICENSE** — "Dom Stepek" per package.json author field. License year: 2026.
- **CI job name** — "Test & Build" in ci.yml. Branch protection must reference this exact string for required status checks.

## Common Pitfalls

- **Badge URL encoding for scoped packages** — `@driftless-ai/cli` must be URL-encoded as `@driftless-ai%2Fcli` in shields.io URLs. Without encoding, the badge returns "not found".
- **FUNDING.yml without Sponsors enrollment** — The Sponsor button won't appear until GitHub Sponsors is enabled on the account. Don't block S03 on this — write the file, note it as a follow-up. The file is harmless when Sponsors isn't active.
- **Branch protection status check name mismatch** — The required status check must match the job name in ci.yml exactly ("Test & Build"), not the workflow name ("CI"). A mismatch silently never resolves, permanently blocking merges.
- **Issue template directory must include `config.yml`** — Without it, GitHub still shows "Open a blank issue" alongside templates. Add `blank_issues_enabled: false` to force template usage.
- **README install command for scoped packages** — `npx @driftless-ai/cli init` works but caches aggressively. Document `npx @driftless-ai/cli@latest init` as canonical invocation (per S01 forward intelligence on npx caching).
- **LICENSE file name** — GitHub's community profile checker expects `LICENSE` (no extension), not `LICENSE.md`. Some projects use `LICENSE.md` but the bare name gets auto-detected by GitHub for the license badge in the repo sidebar.

## Open Risks

- **Branch protection via browser automation** — Requires agent-browser to navigate GitHub Settings UI. This depends on authentication state (already logged in via `gh` auth) and GitHub UI stability. Fallback: document exact settings for user to configure manually. Low risk but adds a non-file-creation task.
- **GitHub Sponsors enrollment** — Account may need to apply for GitHub Sponsors. If there's a waitlist, the Sponsor button won't appear immediately. Not blocking — FUNDING.yml is written regardless.
- **README accuracy on first write** — The README documents a live product. If any CLI behavior changed between M001/M002 and now, the README could be inaccurate. Mitigation: verify key commands (`driftless --version`, `driftless --help`, `driftless init --dry-run`) before writing.
- **Topics API access** — Need to verify `PUT /repos/{owner}/{repo}/topics` works with the current PAT. If not, topics must also go through browser automation.

## Requirements Targeted

| Requirement | Role | What This Slice Must Prove |
|-------------|------|---------------------------|
| R019 — OSS community files | Primary owner | LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, issue templates, PR template all exist and follow standards |
| R020 — GitHub repo hygiene | Primary owner | Topics set, description confirmed, branch protection configured |
| R025 — Claude-first documented | Supporting | README clearly states Claude Code is the v1 agent harness with future harness support planned |

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| README generation | `dmccreary/claude-skills@readme-generator` (88 installs) | available — generic README generator, not needed for this targeted work |
| GitHub SEO/topics | `kostja94/marketing-skills@github-seo` (84 installs) | available — GitHub SEO optimization, may have useful topic suggestions |
| OSS repo setup | `~/.gsd/agent/skills/oss-repo-setup/` | in-progress (D016) — scratch files only, no usable content yet |
| Agent-browser | `~/.gsd/agent/skills/agent-browser/SKILL.md` | installed — needed for branch protection UI automation |

No skills worth installing — the work is standard file creation with one browser automation task. The agent-browser skill is already available for branch protection.

## Sources

- GitHub issue template YAML form schema supports `type: input`, `type: textarea`, `type: dropdown`, `type: checkboxes`, `type: markdown` (source: [GitHub docs — issue form syntax](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms))
- Contributor Covenant v2.1 is the current version, includes 4-tier enforcement guidelines (source: [contributor-covenant.org](https://www.contributor-covenant.org/version/2/1/code_of_conduct/))
- FUNDING.yml supports `github:`, `patreon:`, `open_collective:`, `ko_fi:`, `custom:` keys (source: [GitHub docs — displaying sponsor button](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository))
- GitHub rulesets API (`POST /repos/{owner}/{repo}/rulesets`) requires "Administration" write permission — current PAT lacks this scope (source: runtime 403 from `gh api`)
- Branch protection API (`PUT /repos/{owner}/{repo}/branches/{branch}/protection`) also returns 403 with current PAT (source: runtime 403 from `gh api`)
- shields.io npm badge for scoped packages requires URL encoding: `@driftless-ai%2Fcli` (source: [shields.io docs](https://shields.io/badges/npm-version))
- GitHub community profile checker expects bare `LICENSE` file (no extension) for automatic license detection (source: [GitHub docs — adding a license](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository))
