# S03: X/Twitter launch playbook

**Goal:** A standalone, ready-to-execute launch playbook exists at `~/Desktop/driftless/m004-launch-playbook.md` with pre-written tweet copy referencing actual driftless URLs, features, and install commands.
**Demo:** Open the playbook, pick any tweet, paste it into X — it's ready to post with no edits. The Mermaid diagram renders a clear 3-week timeline. All URLs resolve.

## Must-Haves

- Playbook file exists at `~/Desktop/driftless/m004-launch-playbook.md`
- Strategy overview with Mermaid timeline diagram (Day -3 through Day +14)
- Pre-launch phase (Day -3 to Day -1): 3-4 teaser posts
- Launch day (Day 0): thread of 6-8 tweets + first-2-hours engagement playbook
- Follow-up week (Day +1 to Day +7): daily posts covering varied angles
- Sustained phase (Day +8 to Day +14): 3-4 deeper-topic posts
- Engagement strategy section with reply templates and amplification tactics
- Every tweet references real URLs (`https://driftless-six.vercel.app`, `/docs`, GitHub, npm), real install command (`npx @driftless-ai/cli@latest init`), and real features — zero `[placeholder]` patterns
- Timing recommendations based on SWE engagement research (Tue–Thu 9am–12pm ET)
- 1-2 hashtags per post max (`#opensource` primary, rotating second tag)
- Note about OG image URL issue (driftless.dev not mapped) with recommendation to verify via Twitter Card Validator before launch
- Executable by a solo maintainer in ~30 min/day

## Verification

- `test -f ~/Desktop/driftless/m004-launch-playbook.md` → exit 0
- `grep -c 'driftless-six.vercel.app' ~/Desktop/driftless/m004-launch-playbook.md` → ≥5 references
- `grep -c 'npx @driftless-ai/cli@latest init' ~/Desktop/driftless/m004-launch-playbook.md` → ≥3 references
- `grep -c 'github.com/driftless-ai/driftless' ~/Desktop/driftless/m004-launch-playbook.md` → ≥2 references
- `grep -c 'mermaid' ~/Desktop/driftless/m004-launch-playbook.md` → ≥1 (Mermaid diagram present)
- `grep -cE '\[insert|YOUR_|PLACEHOLDER|\[your' ~/Desktop/driftless/m004-launch-playbook.md` → 0 (no placeholders)
- Content review: launch thread is 6-8 tweets, total post count is 15-20, angles are varied (not repetitive)
- `grep -cE '\[insert|YOUR_|PLACEHOLDER|\[your' ~/Desktop/driftless/m004-launch-playbook.md` → 0 (placeholder contamination check — diagnostic/failure-path verification)

## Tasks

- [x] **T01: Write the complete launch playbook** `est:45m`
  - Why: This is the entire slice — a single writing deliverable with no code dependencies
  - Files: `~/Desktop/driftless/m004-launch-playbook.md`
  - Do: Write the full playbook using S03-RESEARCH.md guidance. Mirror landing page messaging (hero: "Your e2e tests become training docs. Automatically.", features: framework agnostic, always in sync, composable capabilities, multiple doc targets). Structure as: strategy overview with Mermaid timeline → pre-launch teasers → launch day thread + engagement playbook → follow-up week → sustained phase → engagement strategy → metrics guidance. Every tweet is paste-ready with real URLs and features. Include OG image caveat. Keep solo-maintainer-friendly.
  - Verify: `test -f ~/Desktop/driftless/m004-launch-playbook.md && ! grep -qE '\[insert|YOUR_|PLACEHOLDER|\[your' ~/Desktop/driftless/m004-launch-playbook.md && echo "PASS"`
  - Done when: File exists with all 7 sections, 15-20 pre-written tweets, Mermaid diagram, zero placeholders, all URLs real

## Observability / Diagnostics

This is a pure writing deliverable — no runtime code. Diagnostic surfaces are file-based:

- **Playbook completeness:** `grep -c` checks against URL patterns, install commands, and placeholder patterns confirm content integrity without reading the full file.
- **Placeholder contamination:** `grep -cE '\[insert|YOUR_|PLACEHOLDER|\[your'` returns 0 for clean output. Any non-zero result indicates unfinished copy.
- **Mermaid diagram validity:** Presence of ` ```mermaid ` block can be verified by grep. Rendering correctness requires a Mermaid-capable viewer (GitHub, VS Code preview).
- **Failure state:** If the playbook is partially written (e.g. agent context exhaustion mid-task), the file exists but verification checks fail — the non-zero grep counts and missing sections make the gap visible.

## Files Likely Touched

- `~/Desktop/driftless/m004-launch-playbook.md`
