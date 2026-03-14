# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | arch | Agent harness | Claude Code CLI only (headless mode) | Simplest integration, no API key management in driftless, well-documented headless/print mode | Yes — when adding other harnesses (R028) |
| D002 | M001 | arch | Toolchain | Vite+ (`vp`) as unified toolchain | One tool replaces turborepo + tsup + vitest + biome/eslint/prettier. Rust-based performance. Manages pnpm + node. | No |
| D003 | M001 | arch | Monorepo structure | pnpm workspaces with packages/ and apps/ dirs | Clean separation: packages/cli, packages/core, packages/action, apps/web, apps/docs | No |
| D004 | M001 | convention | Module format | ESM-first with CJS compat where needed | Modern standard, TypeScript strict mode | No |
| D005 | M001 | convention | CLI prompts library | @clack/prompts | Vercel-style UX, polished interactive prompts, cancellation handling | Yes — if UX requirements change |
| D006 | M001 | convention | Doc output default | Plain markdown with YAML frontmatter | Widely supported by docs frameworks. Framework-specific adapters (fumadocs MDX, docusaurus MDX) available as options. | No |
| D007 | M001 | arch | E2E test interpretation | Agent-driven (no custom parsers) | Claude Code interprets any test framework. Framework-agnostic by design — no maintenance burden of parser per framework. | No |
| D008 | M001 | scope | v1 boundary | E2E tests ↔ training docs only | Sharp product boundary. Broader doc automation (API docs, README gen) deferred to future milestones. The constraint is the feature. | Yes — when pursuing R029 |
| D009 | M001 | convention | Config file | .driftless.json in target repo root | Persists all init choices. Bridge between CLI and GitHub Actions. | No |
| D010 | M001 | convention | Skill install location | .skills/ in target repo (user-configurable) | Default location matches emerging convention. User can override during init. | Yes — if community feedback suggests different default |
| D011 | M001 | arch | Init failure handling | Rollback + debug log | Fail-clean: no partial state. .driftless/debug.log for issue reporting. Init is idempotent. | No |
| D012 | M002 | arch | GitHub Action inference | anthropics/claude-code-action@v1 | Standard maintained integration. No custom API wiring. Requires ANTHROPIC_API_KEY in user's repo secrets. | Yes — when adding other harnesses |
| D013 | M002 | arch | Capability modularity | Independent composable modules | E2e test writer and doc generator are independent. User picks one or both. Actions respect this choice via .driftless.json. | No |
| D014 | project | convention | Web search tool | google_search (not search-the-web/search_and_read) | User preference. Note in PROJECT.md and agents config. | No |
| D015 | project | convention | GitHub UI operations | agent-browser native skill | For repo settings, topics, branch protection, etc. | No |
| D016 | project | scope | OSS skill learning | Incremental during execution | Build ~/.gsd/agent/skills/oss-repo-setup/ from real experience shipping driftless, not front-loaded research. | No |
