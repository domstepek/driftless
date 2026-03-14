import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DriftlessConfig } from "./types.js";

// ---------------------------------------------------------------------------
// Workflow installer types
// ---------------------------------------------------------------------------

/**
 * Options for the workflow installer.
 */
export interface InstallWorkflowsOptions {
  /** Working directory for resolving relative paths (defaults to process.cwd()) */
  cwd?: string;
  /** If true, skip writing files (for dry-run mode) */
  dryRun?: boolean;
}

/**
 * Result of a workflow installation run.
 */
export interface InstallWorkflowsResult {
  /** Filenames of workflows that were written to disk */
  installed: string[];
  /** Target directory where workflows were installed */
  workflowsDir: string;
}

// ---------------------------------------------------------------------------
// Shared YAML-fragment helpers (internal, structured for S02 reuse)
// ---------------------------------------------------------------------------

/**
 * GitHub Actions permissions block for workflows that need to
 * write PR comments, push commits, and authenticate via OIDC.
 */
export function permissionsBlock(): string {
  return [
    "    permissions:",
    "      contents: write",
    "      pull-requests: write",
    "      id-token: write",
  ].join("\n");
}

/**
 * Job-level `if` condition that prevents the workflow from running
 * when triggered by a bot (infinite loop prevention).
 *
 * GitHub Actions exposes `github.actor` — bot accounts end with `[bot]`.
 */
export function botLoopCondition(): string {
  return "    if: >-\n      !endsWith(github.actor, '[bot]')";
}

/**
 * Step that detects fork PRs and skips with an annotation.
 * Fork PRs cannot access repo secrets, so claude-code-action would fail.
 */
export function forkDetectionStep(): string {
  return [
    "      - name: Skip fork PRs",
    "        if: github.event.pull_request.head.repo.fork == true",
    "        run: |",
    '          echo "::notice::Skipping driftless: fork PRs cannot access secrets."',
    "          exit 0",
  ].join("\n");
}

/**
 * Step that checks for the ANTHROPIC_API_KEY secret and exits
 * gracefully with an annotation when it is missing.
 */
export function apiKeyCheckStep(): string {
  return [
    "      - name: Check for API key",
    "        if: github.event.pull_request.head.repo.fork != true",
    "        env:",
    "          HAS_KEY: ${{ secrets.ANTHROPIC_API_KEY != '' }}",
    "        run: |",
    '          if [ "$HAS_KEY" != "true" ]; then',
    '            echo "::warning::ANTHROPIC_API_KEY secret is not set. Skipping driftless doc update."',
    "            exit 0",
    "          fi",
  ].join("\n");
}

/**
 * Checkout step that targets the PR branch (not the merge commit)
 * so that claude-code-action can push follow-up commits.
 */
export function checkoutStep(): string {
  return [
    "      - name: Checkout PR branch",
    "        if: github.event.pull_request.head.repo.fork != true",
    "        uses: actions/checkout@v4",
    "        with:",
    "          ref: ${{ github.event.pull_request.head.ref }}",
    "          fetch-depth: 0",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Staleness detection prompt
// ---------------------------------------------------------------------------

/**
 * Builds the staleness detection prompt that instructs Claude
 * to read the PR diff, reason about affected features, find stale docs,
 * and update them using the installed skill file.
 */
function stalenessPrompt(config: DriftlessConfig): string {
  const testPathsList = config.testPaths.map((p) => `\`${p}\``).join(", ");

  // The prompt is a multi-line string embedded in YAML as a block scalar.
  // We use `|` style to preserve newlines.
  return `|
            You are a documentation maintenance agent for a project managed by driftless.

            ## Context

            This project's configuration is in \`.driftless.json\` at the repo root.
            - Documentation output directory: \`${config.outputDir}/\`
            - Test file patterns: ${testPathsList}
            - Skill definitions directory: \`${config.skillsDir}/\`

            ## Your Task

            1. **Read the PR diff** — run \`git diff HEAD~1\` to see what changed in this pull request.

            2. **Identify affected features** — from the diff, determine which user-facing features or workflows were modified. Look at:
               - Changed test files (new assertions, modified flows, renamed steps)
               - Changed application code (new routes, modified components, updated API endpoints)
               - Changed configuration (feature flags, permissions, environment variables)

            3. **Find potentially stale docs** — scan the documentation directory \`${config.outputDir}/\` for files that cover the affected features. A doc is stale if:
               - It describes a workflow whose steps have changed
               - It references UI elements, labels, or flows that were renamed or removed
               - It is missing coverage for newly added features visible in the diff
               - Its prerequisites or "Common Problems" section no longer matches the current behavior

            4. **Update stale docs** — for each stale document:
               - Read the doc-generator skill at \`${config.skillsDir}/doc-generator/SKILL.md\` for formatting rules and writing conventions
               - Re-read the relevant test file(s) to understand the current workflow
               - Update the document to accurately reflect the current behavior
               - Preserve the existing document structure (frontmatter, headings, section order)
               - Do NOT regenerate from scratch — make targeted updates to stale sections

            5. **Post a summary** — after updating, leave a PR comment summarizing:
               - Which docs were updated and why
               - Which features from the diff were already accurately documented (no changes needed)
               - Any features that appear to lack documentation entirely (flagged for future generation)

            ## Rules

            - Only update docs that are genuinely stale relative to THIS PR's changes
            - Do not modify docs unrelated to the PR diff
            - Follow the writing style and format conventions in the skill file exactly
            - If no docs are stale, post a comment confirming the documentation is up to date`;
}

// ---------------------------------------------------------------------------
// Doc-update workflow template
// ---------------------------------------------------------------------------

/**
 * Produces a complete GitHub Actions workflow YAML string for the
 * driftless doc-update workflow. The workflow triggers on pull requests,
 * uses claude-code-action@v1 to detect stale documentation, and handles
 * operational edges (fork PRs, missing API key, infinite loop prevention).
 *
 * @throws {Error} If required config fields are missing or empty
 */
export function docUpdateWorkflowTemplate(config: DriftlessConfig): string {
  if (!config.outputDir) {
    throw new Error(
      "docUpdateWorkflowTemplate: config.outputDir is required but was empty or missing",
    );
  }
  if (!config.skillsDir) {
    throw new Error(
      "docUpdateWorkflowTemplate: config.skillsDir is required but was empty or missing",
    );
  }
  if (!config.testPaths || config.testPaths.length === 0) {
    throw new Error(
      "docUpdateWorkflowTemplate: config.testPaths is required but was empty or missing",
    );
  }

  const prompt = stalenessPrompt(config);

  return `name: Driftless Doc Update
on:
  pull_request:

jobs:
  update-docs:
${botLoopCondition()}
    runs-on: ubuntu-latest
${permissionsBlock()}
    steps:
${forkDetectionStep()}

${apiKeyCheckStep()}

${checkoutStep()}

      - name: Update stale documentation
        if: github.event.pull_request.head.repo.fork != true
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          prompt: ${prompt}
          claude_args: "--allowedTools bash,read,write,edit"
`;
}

// ---------------------------------------------------------------------------
// Capability → workflow filename mapping
// ---------------------------------------------------------------------------

/** Map from capability name to the workflow filename it produces. */
const WORKFLOW_TEMPLATES: Record<
  string,
  { filename: string; template: (config: DriftlessConfig) => string }
> = {
  "doc-generator": {
    filename: "driftless-doc-update.yml",
    template: docUpdateWorkflowTemplate,
  },
};

// ---------------------------------------------------------------------------
// Workflow installer
// ---------------------------------------------------------------------------

/**
 * Install GitHub Actions workflow files based on the capabilities selected
 * in config. Creates `.github/workflows/{workflow}.yml` for each capability
 * that has a matching workflow template.
 *
 * Follows the same pattern as `installSkills`:
 *   config in, options (cwd, dryRun) → result with installed list.
 *
 * @throws {Error} If a workflow template throws (invalid config)
 */
export async function installWorkflows(
  config: DriftlessConfig,
  options: InstallWorkflowsOptions = {},
): Promise<InstallWorkflowsResult> {
  const cwd = options.cwd ?? process.cwd();
  const workflowsDir = join(".github", "workflows");
  const absWorkflowsDir = join(cwd, workflowsDir);

  const result: InstallWorkflowsResult = {
    installed: [],
    workflowsDir,
  };

  if (options.dryRun) {
    return result;
  }

  for (const capability of config.capabilities) {
    const entry = WORKFLOW_TEMPLATES[capability];
    if (!entry) {
      // No workflow for this capability — skip
      continue;
    }

    const content = entry.template(config);
    await mkdir(absWorkflowsDir, { recursive: true });
    await writeFile(join(absWorkflowsDir, entry.filename), content, "utf-8");
    result.installed.push(entry.filename);
  }

  return result;
}
