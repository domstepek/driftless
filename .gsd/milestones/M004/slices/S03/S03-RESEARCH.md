# S03: X/Twitter launch playbook — Research

**Date:** 2026-03-14

## Summary

S03 is a pure writing deliverable — no code, no deployments. The output is a standalone markdown file at `~/Desktop/driftless/m004-launch-playbook.md` containing a day-by-day X/Twitter launch strategy with pre-written tweet copy referencing actual driftless URLs, features, and install commands.

Research across multiple sources on OSS launch strategy, SWE engagement on X, and developer tool marketing converges on a few clear signals: **phased rollout beats big-bang** (teasers → launch thread → follow-up week → sustained), **Tue–Thu 9am–12pm ET** is the engagement window for SWE audiences, **1-2 hashtags max** per post (algorithm penalizes hashtag spam), and **before/after visuals dramatically increase engagement** (~150% boost for images, 34% more retweets). The driftless before/after (test file → generated doc) is the single strongest visual asset for the launch.

The playbook format should be a standalone markdown doc — not a spreadsheet, not a scheduling tool config. This is the most portable, reviewable, and executable format. The doc should be organized as a timeline (Day -3 through Day +14) with each entry containing: the tweet copy (ready to paste), timing, hashtag, media suggestions, and engagement instructions. A Mermaid diagram should visualize the overall timeline. The playbook should be tool-agnostic (copy-paste to any platform) but note Typefully as the recommended scheduling tool if automation is desired.

## Recommendation

**Write a phased 3-week playbook (pre-launch, launch day, follow-up) with 15-20 pre-written tweets.** Each tweet should be driftless-specific — actual URLs, actual install command, actual feature descriptions. No `[insert project name]` placeholders. Include a launch day thread (6-8 tweets) as the centerpiece, with standalone posts for pre-launch and follow-up phases.

**Structure the doc with these sections:**
1. Strategy overview with Mermaid timeline diagram
2. Pre-launch phase (Day -3 to Day -1): 3-4 teaser posts building curiosity
3. Launch day (Day 0): Full thread (6-8 tweets) + engagement playbook for first 2 hours
4. Follow-up week (Day +1 to Day +7): Daily posts covering different angles (use cases, framework support, before/after, GitHub Action, community)
5. Sustained phase (Day +8 to Day +14): 3-4 posts on deeper topics
6. Engagement strategy: reply templates, who to tag, communities to engage
7. Metrics & iteration guidance

**Key driftless angles to exploit in copy:**
- "Your e2e tests become training docs" — the one-liner
- Before/after visual (test code → generated doc) — screenshot from landing page
- `npx @driftless-ai/cli@latest init` — install command as CTA
- Six test frameworks supported — credibility breadth
- GitHub Actions auto-sync — ongoing value, not one-time generation
- "Docs can't drift" — the product name IS the tagline
- Claude Code powered — AI angle without being gimmicky
- Open source / MIT — trust signal

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Tweet scheduling | Typefully | Best developer-focused X scheduler. Thread composer, optimal time suggestions, analytics. But playbook is tool-agnostic — Typefully is optional. |
| OG image preview testing | opengraph.xyz or Twitter Card Validator | Verify link previews render correctly before including URLs in launch tweets. driftless already has OG meta tags (D061). |
| Thread formatting | Manual markdown in playbook | Pre-written copy in the playbook doc. No tool needed — copy-paste to X or any scheduler. |

## Existing Code and Patterns

- `apps/web/app/(home)/page.tsx` — Landing page with the exact hero copy ("Your e2e tests become training docs. Automatically."), install command (`npx @driftless-ai/cli@latest init`), before/after example (workspace.spec.ts → creating-a-workspace.md), and four feature descriptions. Tweet copy should mirror this messaging, not invent new positioning.
- `apps/web/app/layout.tsx` — Contains all OG/Twitter Card meta tags (19 total). The `og:description` and `twitter:description` are the canonical one-liner for link preview context.
- `README.md` — Source of truth for product description, CLI usage, config reference, "How It Works" section. Feature claims in tweets must match what's documented here.
- `apps/web/app/opengraph-image.tsx` — Dynamic 1200×630 OG image. When the landing page URL is shared on X, this image renders in the card. Verified working on the Vercel URL.
- Live URL: `https://driftless-six.vercel.app` — The actual deployed landing page. All tweet copy should link here (or `/docs` for docs-specific tweets).
- npm: `https://www.npmjs.com/package/@driftless-ai/cli` — Link for npm-specific tweets.
- GitHub: `https://github.com/driftless-ai/driftless` — Link for repo-focused tweets and star CTA.

## Constraints

- **Output path is fixed**: `~/Desktop/driftless/m004-launch-playbook.md` — per M004-CONTEXT.md, not in the repo.
- **Directory already exists**: `~/Desktop/driftless/` contains `pro-tier-features.md` from prior work.
- **No placeholders**: Every URL, install command, and feature reference must be real and accurate. Tweet copy is ready-to-post, not a template.
- **OG images reference driftless.dev**: The OG image URLs in meta tags reference `https://driftless.dev` (custom domain not mapped). Link previews work when sharing `driftless-six.vercel.app` directly (the `/opengraph-image` route works), but the meta tag URLs won't resolve from `driftless.dev`. The playbook should note this and recommend using the Vercel URL until custom domain is configured.
- **Single-person launch**: This is a solo maintainer launching an OSS tool, not a company with a marketing team. The playbook should be executable by one person in ~30 min/day.
- **Audience size unknown**: The maintainer's X following size and audience composition aren't known. The playbook should include defaults that work for small accounts and note adjustments for larger ones.

## Common Pitfalls

- **Generic template copy** — The biggest risk. AI-generated playbooks default to `[Your Tool Name]` placeholders and generic feature descriptions. Every tweet must reference actual driftless features, URLs, and the install command. The planning phase should specify exact copy, not instructions to "write about feature X."
- **Too many hashtags** — Research is clear: 1-2 hashtags per post maximum. The X algorithm deprioritizes hashtag-heavy posts. `#opensource` is the consistent one; rotate a second tag (`#devtools`, `#testing`, `#documentation`) per post.
- **Ignoring the first-hour window** — The X algorithm heavily weights engagement in the first 60 minutes. The playbook needs specific instructions for launch day: post thread, immediately engage with any replies, have 2-3 people ready to retweet/reply.
- **Thread that's too long** — Dev tool launch threads that perform well are 6-8 tweets. Beyond 10, drop-off is steep. Quality over length.
- **No visual content** — Text-only tweets get 50-60% less engagement than tweets with images. The before/after screenshot from the landing page is the key visual. Screenshots of the CLI output during `init` are a secondary visual asset.
- **Posting at wrong times** — SWE X activity peaks Tue–Thu 9am–12pm ET. Launching on a Friday or weekend wastes the initial momentum window.
- **No engagement plan** — Posting and walking away kills reach. The playbook must include specific engagement instructions: reply to every comment within 30 min, quote-retweet interesting responses, engage with relevant dev community posts before and after launch.
- **Broken link previews** — The OG image issue (driftless.dev not mapped) means link previews may show broken images. Test with Twitter Card Validator before launch day. Use Vercel URL or fix custom domain first.

## Open Risks

- **OG image broken on X** — Until `driftless.dev` custom domain is configured or OG URLs are updated to `driftless-six.vercel.app`, link preview images won't render when sharing the landing page on X. This directly impacts launch tweet quality. Recommend verifying with Twitter Card Validator before execution and updating OG URLs if needed.
- **Maintainer's X account reach** — If the account has few followers, organic reach will be limited regardless of content quality. The playbook should include tactics for amplification: tag relevant accounts (testing framework maintainers, AI/dev tool accounts), post in relevant quote-tweet chains, cross-post to other platforms (not in scope but noted as amplification).
- **Content fatigue risk** — 15-20 posts over 2 weeks about the same tool requires varied angles. If every post says "tests → docs," audience tunes out by day 3. The playbook should cycle through different angles: problem statement, before/after, framework support, GitHub Actions, use cases, behind-the-scenes.
- **Timing relative to M004 completion** — The playbook is written now but executed later. URLs and features described in tweets must still be accurate at execution time. The playbook should note any dependencies (e.g., "verify landing page is still live before Day 0").

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Social content creation | `coreyhaines31/marketingskills@social-content` (20.5K installs) | available — high install count but generic marketing, not OSS-specific |
| Social media marketing | `dengineproblem/agents-monorepo@social-media-marketing` (307 installs) | available — low installs, generic |
| Social media strategy | `frankxai/claude-skills-library@social-media-strategy` (38 installs) | available — already noted in M004-RESEARCH.md, very low installs |
| Social post creator | `eddiebe147/claude-settings@social-post-creator` (55 installs) | available — tweet composition, low installs |

**Recommendation:** None of these skills add meaningful value for this task. The playbook is a one-time writing deliverable with driftless-specific content. Generic social media skills would pull toward template copy, which is the exact pitfall to avoid. The research above provides sufficient tactical guidance. No skills needed.

## Sources

- SWE audiences on X are most active Tue–Thu, 9am–12pm ET; tech/SaaS developers peak 9–11am EST on weekdays (source: [Buffer](https://buffer.com), [Brandwatch](https://brandwatch.com), [Elementor](https://elementor.com))
- 1-2 hashtags per post optimal; overloading reduces reach; `#opensource` and `#devtools` are consistently high-signal for developer tools (source: [RiteTag](https://ritetag.com), [Hashtagmenow](https://hashtagmenow.com), [Dev.to](https://dev.to))
- X threads for dev tool announcements perform best at 6-8 tweets; hook tweet is critical; visuals every 3-4 tweets boost engagement ~150% (source: [Automateed](https://automateed.com), [CreatorEconomy](https://creatoreconomy.so), [ThreadCreator](https://threadcreator.app))
- Phased OSS launches (teasers → launch day → follow-up) outperform single-day "big bang" announcements; community engagement in first hour heavily weights algorithmic distribution (source: [Daily.dev](https://daily.dev), [OpenSource.com](https://opensource.com), [DF.pe](https://df.pe))
- Build-in-public transparency, before/after visuals, and install-command-as-CTA are proven patterns for developer tool adoption on X (source: [Mstone.ai](https://mstone.ai), [Aviator.co](https://aviator.co))
- Successful 2024-2025 OSS CLI tool launches (Cline, Crawl4AI) shared common patterns: solve a real pain point, show the result not the process, frictionless onboarding (source: [DigitalOcean](https://digitalocean.com), [Cline.bot](https://cline.bot))
- Typefully is the strongest developer-focused X scheduling tool; Buffer is broader but less dev-oriented; playbook should be tool-agnostic (source: M004-RESEARCH.md, confirmed by [Google Search])
- Images boost retweets by 34%; "Retweet" in copy outperforms "RT" by 23% (source: [Sprout Social](https://sproutsocial.com), [Hootsuite](https://hootsuite.com) via M004-RESEARCH.md)
