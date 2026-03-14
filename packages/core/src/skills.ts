import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DriftlessConfig } from "./types.js";

/**
 * Options for the skill installer.
 */
export interface InstallSkillsOptions {
  /** Working directory for resolving relative paths (defaults to process.cwd()) */
  cwd?: string;
  /** If true, skip writing files (for dry-run mode) */
  dryRun?: boolean;
}

/**
 * Result of a skill installation run.
 */
export interface InstallSkillsResult {
  /** Names of skills that were written to disk */
  installed: string[];
  /** Target directory where skills were installed */
  skillsDir: string;
}

// ---------------------------------------------------------------------------
// Template: doc-generator
// ---------------------------------------------------------------------------

/**
 * Produces a complete SKILL.md for the doc-generator skill,
 * parameterized with real config values from the user's project.
 */
export function docGeneratorTemplate(config: DriftlessConfig): string {
  const ext = config.docFramework === "plain-md" ? ".md" : ".mdx";
  const testPathsList = config.testPaths.map((p) => `\`${p}\``).join(", ");
  const calloutSection = calloutSyntaxBlock(config.docFramework);

  return `---
name: doc-generator
user_invocable: true
prompt: "Generate user-facing documentation from test files. Arguments: $ARGUMENTS"
description: Creates end-user training documents derived from e2e test files. Triggers when asked to generate docs, write training materials, create user guides, or produce documentation from tests.
---

# Doc Generator

Creates end-user training documents by reading e2e test files and producing clear, step-by-step guides.

## Target Audience

- **Primary:** End users who interact with the application daily (non-technical staff)
- **Secondary:** Power users and support personnel who help others

Users should never need to understand technical internals to follow a generated document.

## File Location and Conventions

Generated documents are written to \`${config.outputDir}/\` using \`${ext}\` files.

Source test files are matched from: ${testPathsList}

## Content Sources (Priority Order)

Derive user-facing behavior from the codebase in this priority:

1. **E2E tests** — most reliable source of actual user workflows
2. **Page objects** — map UI elements and interactions
3. **Page components** — understand page layout and available actions
4. **Reusable components** — understand shared UI patterns
5. **Custom hooks** — understand data flow and state behavior
6. **Constants files** — understand dropdown options, default values, labels

Never expose these technical sources in the training material itself.

## Required Document Structure

Every generated document must include:

1. **Frontmatter** — required metadata block at the top of the file (format specified below)
2. **Intro paragraph** — one to two sentences explaining what this guide covers and who it's for
3. **Prerequisites** (if any) — what the user needs before starting
4. **Numbered steps** — sequential instructions for completing the workflow demonstrated in the test
5. **Common Problems section** (\`## Common Problems\`) — document likely failure modes, required fields, and edge cases visible in the test assertions

## Output Format

- File extension: \`${ext}\`
- Frontmatter: YAML block delimited by \`---\`
- Required frontmatter fields: \`title\`, \`description\`

${calloutSection}

## Writing Style

- Use second person ("you", "your") throughout
- Bold UI element names (e.g., **Create Report**, **Save** button)
- Use present tense for instructions ("Click **Save**", not "You should click Save")
- No technical jargon — never mention internal implementation details, API specifics, or framework internals
- Keep sentences short and direct
- Use numbered lists for sequential steps, bullet lists for non-sequential items

## Content Derivation

You are given an end-to-end test file. Derive the user-facing workflow from the test steps:

- Test actions (clicks, fills, navigations) become user instructions
- Assertions become expected outcomes ("You should see...")
- Test setup/teardown reveals prerequisites
- Error-path tests become Common Problems entries

Never expose test internals (selectors, page objects, fixture names) in the output.

## Workflow

1. Read the test file provided as input.
2. Identify the user-facing workflow being tested.
3. Produce a complete document following the Required Document Structure above.
4. Write the document to \`${config.outputDir}/\` with a clean slug filename.
`;
}

/**
 * Returns the callout/admonition syntax section for the given doc framework.
 */
function calloutSyntaxBlock(framework: DriftlessConfig["docFramework"]): string {
  switch (framework) {
    case "plain-md":
      return `### Callout Syntax

Use blockquotes for tips, warnings, and common problems:

\`\`\`md
> **Tip:** You can click any column header to sort without opening the filter panel.

> **Warning:** The **Save** button stays disabled until all required fields are filled in.
\`\`\`

Prefix blockquotes with **Tip:**, **Warning:**, or **Note:** to indicate severity.`;

    case "fumadocs":
      return `### Callout Syntax

Use \`<Callout>\` components for tips, warnings, and common problems (auto-available, no import needed):

\`\`\`mdx
<Callout title="Before You Begin" type="info">
You must have the **Editor** role or higher.
</Callout>

<Callout title="The Save Button Is Disabled" type="warn">
The **Save** button stays disabled until all required fields are filled in.
</Callout>
\`\`\`

Available Callout types: \`info\` (default), \`warn\`, \`error\`, \`success\`, \`idea\`.

Always have a blank line before opening \`<Callout>\` and after closing \`</Callout>\`.`;

    case "docusaurus":
      return `### Admonition Syntax

Use \`:::\` admonition syntax for tips, warnings, and common problems:

\`\`\`mdx
:::tip Before You Begin
You must have the **Editor** role or higher.
:::

:::warning Save Button Disabled
The **Save** button stays disabled until all required fields are filled in.
:::
\`\`\`

Available admonition types: \`note\`, \`tip\`, \`info\`, \`warning\`, \`danger\`.`;

    default:
      throw new Error(`Unknown doc framework: ${framework as string}`);
  }
}

// ---------------------------------------------------------------------------
// Template: e2e-writer
// ---------------------------------------------------------------------------

/**
 * Produces a complete SKILL.md for the e2e-writer skill,
 * parameterized with real config values from the user's project.
 */
export function e2eWriterTemplate(config: DriftlessConfig): string {
  const testPathsList = config.testPaths.map((p) => `\`${p}\``).join(", ");
  const frameworkName = config.testFramework ?? "your test framework";

  return `---
name: e2e-writer
user_invocable: true
prompt: "Write or update e2e tests. Arguments: $ARGUMENTS"
description: Creates or updates end-to-end test files that verify user-facing workflows. Triggers when asked to write tests, add e2e coverage, create test cases, or update existing test files.
---

# E2E Test Writer

Creates and updates end-to-end tests that verify user-facing workflows described in the project's documentation.

## Test Framework

This project uses **${frameworkName}** for e2e testing.

## File Location and Conventions

Test files live in paths matching: ${testPathsList}

### Naming

- Use descriptive filenames that reflect the workflow being tested (e.g., \`create-report.spec.ts\`, \`login-flow.spec.ts\`)
- Keep filenames lowercase with hyphens separating words
- Use the \`.spec.ts\` extension unless the project convention differs

### Organization

- One test file per user-facing workflow or feature area
- Group related assertions within a single \`describe\` block
- Use clear test names that describe the expected user outcome, not the implementation

## Writing Tests

### Before Writing

1. Read existing test files in the test paths above to understand project conventions.
2. If documentation exists in \`${config.outputDir}/\`, read the relevant doc to understand the user workflow.
3. Identify the page objects or helpers already available — reuse them instead of duplicating selectors.

### Test Structure

Each test file should include:

1. **Setup** — navigate to the starting page, create required preconditions
2. **Actions** — perform the user workflow step by step
3. **Assertions** — verify visible outcomes the user would expect
4. **Cleanup** — tear down any data created during the test (if applicable)

### Assertion Patterns

- Assert on **visible text and UI state**, not internal data structures
- Prefer assertions that match what the user sees: "button is disabled", "error message appears", "row is added to the table"
- Include at least one negative test (error state, validation failure) per workflow
- Test the Common Problems documented in the corresponding training material, if available

### Test Isolation

- Each test should be independent — no shared state between test files
- Use fresh data or fixtures for each test run
- Clean up after the test to avoid polluting other tests

## Workflow

1. Identify the user-facing workflow to test.
2. Check for existing documentation in \`${config.outputDir}/\` to understand expected behavior.
3. Read existing tests to match project conventions (patterns, helpers, selectors).
4. Write the test following the structure above.
5. Run the test locally to verify it passes.
`;
}

// ---------------------------------------------------------------------------
// Installer
// ---------------------------------------------------------------------------

/** Map from capability name to its template function. */
const SKILL_TEMPLATES: Record<string, (config: DriftlessConfig) => string> = {
  "doc-generator": docGeneratorTemplate,
  "e2e-writer": e2eWriterTemplate,
};

/**
 * Install skill files to disk based on the capabilities selected in config.
 *
 * Creates `{cwd}/{config.skillsDir}/{skill-name}/SKILL.md` for each
 * selected capability that has a matching template.
 */
export async function installSkills(
  config: DriftlessConfig,
  options: InstallSkillsOptions = {},
): Promise<InstallSkillsResult> {
  const cwd = options.cwd ?? process.cwd();
  const baseDir = join(cwd, config.skillsDir);

  const result: InstallSkillsResult = {
    installed: [],
    skillsDir: config.skillsDir,
  };

  if (options.dryRun) {
    return result;
  }

  for (const capability of config.capabilities) {
    const templateFn = SKILL_TEMPLATES[capability];
    if (!templateFn) {
      // Unknown capability — skip silently, caller can diff to detect
      continue;
    }

    const content = templateFn(config);
    const skillDir = join(baseDir, capability);
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), content, "utf-8");
    result.installed.push(capability);
  }

  return result;
}
