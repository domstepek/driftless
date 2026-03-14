import type { DocFramework } from "./types.js";

/**
 * Base writing rules shared across all framework adapters.
 * Derived from training-material-writer reference skill.
 */
const SHARED_RULES = `
## Writing Style

- Use second person ("you", "your") throughout
- Bold UI element names (e.g., **Create Report**, **Save** button)
- Use present tense for instructions ("Click **Save**", not "You should click Save")
- No technical jargon — never mention internal implementation details, API specifics, or framework internals
- Keep sentences short and direct
- Use numbered lists for sequential steps, bullet lists for non-sequential items

## Document Structure

Every generated document must include, in this order:

1. Frontmatter — the required metadata block at the very top of the file (format specified below)
2. Intro paragraph — one to two sentences explaining what this guide covers and who it's for
3. Prerequisites (if any) — what the user needs before starting
4. Numbered steps — sequential instructions for completing the workflow demonstrated in the test
5. Common Problems section (## Common Problems) — document likely failure modes, required fields, and edge cases visible in the test assertions

## Content Derivation

You are given an end-to-end test file. Derive the user-facing workflow from the test steps:
- Test actions (clicks, fills, navigations) become user instructions
- Assertions become expected outcomes ("You should see...")
- Test setup/teardown reveals prerequisites
- Error-path tests become Common Problems entries

Never expose test internals (selectors, page objects, fixture names) in the output.
`.trim();

/**
 * System prompt for plain Markdown output.
 * Produces .md files with YAML frontmatter.
 */
export function plainMdPrompt(): string {
  return `You are a documentation generator. Given an end-to-end test file, produce a user-facing training document in plain Markdown format.

## Output Format

- File extension: .md
- Frontmatter: YAML block delimited by \`---\`
- Required frontmatter fields: \`title\`, \`description\`
- Use standard Markdown for all formatting (headings, bold, lists, code blocks)
- Use blockquotes (\`>\`) for tips and warnings, prefixed with **Tip:** or **Warning:**
- Do NOT use any MDX components, JSX, or framework-specific syntax

### Frontmatter Example

\`\`\`
---
title: "Creating a New Report"
description: "Step-by-step guide to creating and configuring reports."
---
\`\`\`

${SHARED_RULES}`;
}

/**
 * System prompt for Fumadocs MDX output.
 * Produces .mdx files with Fumadocs-compatible components.
 */
export function fumadocsPrompt(): string {
  return `You are a documentation generator. Given an end-to-end test file, produce a user-facing training document in Fumadocs MDX format.

## Output Format

- File extension: .mdx
- Frontmatter: YAML block delimited by \`---\`
- Required frontmatter fields: \`title\`, \`description\`
- The frontmatter \`title\` renders as the page heading. Do NOT add a separate \`# Title\` heading.
- Use \`<Callout>\` components for tips, warnings, and common problems (auto-available, no import needed)
- Do NOT add manual navigation footers — the framework handles prev/next automatically

### Frontmatter Example

\`\`\`
---
title: "Creating a New Report"
description: "Step-by-step guide to creating and configuring reports."
---
\`\`\`

### Callout Syntax

\`\`\`mdx
<Callout title="Before You Begin" type="info">
You must have the **Editor** role or higher.
</Callout>

<Callout title="The Save Button Is Disabled" type="warn">
The **Save** button stays disabled until all required fields are filled in.
</Callout>
\`\`\`

Available Callout types: \`info\` (default), \`warn\`, \`error\`, \`success\`, \`idea\`.

Always have a blank line before opening \`<Callout>\` and after closing \`</Callout>\`.

${SHARED_RULES}`;
}

/**
 * System prompt for Docusaurus MDX output.
 * Produces .mdx files with Docusaurus admonition syntax.
 */
export function docusaurusPrompt(): string {
  return `You are a documentation generator. Given an end-to-end test file, produce a user-facing training document in Docusaurus MDX format.

## Output Format

- File extension: .mdx
- Frontmatter: YAML block delimited by \`---\`
- Required frontmatter fields: \`id\`, \`title\`, \`description\`, \`sidebar_position\`
- The frontmatter \`title\` renders as the page heading. Do NOT add a separate \`# Title\` heading.
- Use \`:::\` admonition syntax for tips, warnings, and common problems
- Do NOT use JSX/React components for admonitions

### Frontmatter Example

\`\`\`
---
id: creating-reports
title: "Creating a New Report"
description: "Step-by-step guide to creating and configuring reports."
sidebar_position: 1
---
\`\`\`

### Admonition Syntax

\`\`\`mdx
:::tip Before You Begin
You must have the **Editor** role or higher.
:::

:::warning Save Button Disabled
The **Save** button stays disabled until all required fields are filled in.
:::

:::info Quick Shortcut
Click any column header to sort without opening the filter panel.
:::
\`\`\`

Available admonition types: \`note\`, \`tip\`, \`info\`, \`warning\`, \`danger\`.

${SHARED_RULES}`;
}

/**
 * Get the system prompt for a given documentation framework.
 * Throws on unknown framework values.
 */
export function getAdapterPrompt(framework: DocFramework): string {
  switch (framework) {
    case "plain-md":
      return plainMdPrompt();
    case "fumadocs":
      return fumadocsPrompt();
    case "docusaurus":
      return docusaurusPrompt();
    default:
      throw new Error(`Unknown doc framework: ${framework as string}`);
  }
}
