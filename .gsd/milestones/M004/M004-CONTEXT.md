# M004: Product Launch — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning (after M003 completes)

## Project Description

M004 is the go-to-market milestone. It builds the public-facing surfaces that drive adoption: a polished Vercel landing page, a fumadocs documentation site, and a researched day-by-day X/Twitter launch playbook targeting SWE communities.

## Why This Milestone

The tool is built (M001), automated (M002), and published (M003). Now it needs users. Open source tools die in obscurity without a front door (landing page), self-documentation (docs site), and a launch strategy (social media). M004 is the bridge from "working tool" to "adopted tool."

## User-Visible Outcome

### When this milestone is complete, the user can:

- Visit a polished landing page that explains what driftless does, shows examples, and links to docs/GitHub
- Read comprehensive documentation on installation, configuration, usage, and troubleshooting
- The maintainer has a researched, actionable day-by-day playbook for launching on X/Twitter

### Entry point / environment

- Entry point: Landing page URL (Vercel), docs site URL, X/Twitter
- Environment: web browser, X/Twitter
- Live dependencies involved: Vercel (hosting), fumadocs (docs framework), X/Twitter (social)

## Completion Class

- Contract complete means: landing page deployed on Vercel, docs site deployed, playbook document written
- Integration complete means: landing page links to docs, docs link to GitHub, all cross-references work
- Operational complete means: Vercel deploys on push, docs site builds correctly

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Landing page is live on a Vercel URL, loads correctly, and clearly communicates what driftless does
- Docs site covers: quick start, full init walkthrough, GitHub Action setup, configuration reference, troubleshooting
- Launch playbook is a complete, actionable document with day-by-day X/Twitter posts, timing, hashtags, and engagement strategy
- The playbook format and content were informed by google_search research on SWE community engagement on X

## Risks and Unknowns

- **Landing page design quality** — needs to look professional and communicate value quickly. Use frontend-design skill.
- **Docs completeness** — writing docs for a tool that generates docs is meta. Need to cover edge cases users will hit.
- **Launch strategy effectiveness** — social media marketing is outside core engineering competency. Research-driven approach mitigates this.

## Existing Codebase / Prior Art

- M001-M003 deliverables: the complete working, published tool
- Fumadocs adapter from M001 — dogfooding opportunity (driftless docs built with a framework driftless supports)
- `training-material-writer` skill — the writing style guide (second person, bold UI elements, short sentences) is a good reference for driftless's own docs

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R021 — Vercel landing/marketing page
- R022 — Fumadocs documentation site for driftless
- R023 — X/Twitter product launch playbook
- R024 — Launch playbook informed by web research on SWE engagement

## Scope

### In Scope

- Vercel landing/marketing page (design + deploy)
- Fumadocs documentation site (content + deploy)
- X/Twitter launch playbook (researched, day-by-day, actionable)
- google_search research during planning for: playbook format (spreadsheet, doc, tool), optimal post structure for SWE engagement on X, timing strategies, hashtag research, OSS launch case studies

### Out of Scope / Non-Goals

- Paid advertising
- Non-X social platforms (LinkedIn, Reddit, HN — may be natural extensions but not in M004 scope)
- Video content / demos (may be added organically but not a requirement)

## Technical Constraints

- Landing page: Vercel deployment, React or Next.js
- Docs site: fumadocs framework (dogfooding R022)
- Playbook: format TBD during M004 planning based on google_search research — could be markdown, spreadsheet, or a specific tool
- Use frontend-design skill for landing page (load `~/.gsd/agent/skills/frontend-design/SKILL.md`)

## Integration Points

- **Vercel** — landing page and docs site hosting
- **fumadocs** — docs framework
- **GitHub repo** — linked from landing page and docs
- **npm registry** — install instructions reference npm
- **X/Twitter** — launch platform

## Open Questions

- Custom domain for landing page? Or just `driftless.vercel.app` for v1?
- Should docs site be a subdomain (`docs.driftless.dev`) or subpath (`driftless.dev/docs`)?
- Playbook format — will research during M004 planning: spreadsheet with dates/times/copy? Markdown doc? A tool like Buffer or Typefully?
- Should the launch be a single day "big bang" or a phased rollout (teasers → launch → follow-up)?
