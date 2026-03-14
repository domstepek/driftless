import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import type { DriftlessConfig } from "../src/types.js";
import { docUpdateWorkflowTemplate, testGenWorkflowTemplate } from "../src/workflows.js";

function makeConfig(overrides: Partial<DriftlessConfig> = {}): DriftlessConfig {
  return {
    testPaths: ["tests/**/*.spec.ts"],
    outputDir: "docs/training",
    docFramework: "plain-md",
    capabilities: ["doc-generator"],
    skillsDir: ".skills",
    testFramework: "playwright",
    agentHarness: "claude-code",
    ...overrides,
  };
}

describe("docUpdateWorkflowTemplate", () => {
  // -----------------------------------------------------------------------
  // YAML structure
  // -----------------------------------------------------------------------

  it("returns a string that parses as valid YAML", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    const parsed = parseYaml(yaml);
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });

  it("has required top-level keys: name, on, jobs", () => {
    const parsed = parseYaml(docUpdateWorkflowTemplate(makeConfig()));
    expect(parsed).toHaveProperty("name");
    expect(parsed).toHaveProperty("on");
    expect(parsed).toHaveProperty("jobs");
  });

  it("workflow name is Driftless Doc Update", () => {
    const parsed = parseYaml(docUpdateWorkflowTemplate(makeConfig()));
    expect(parsed.name).toBe("Driftless Doc Update");
  });

  // -----------------------------------------------------------------------
  // Trigger
  // -----------------------------------------------------------------------

  it("contains pull_request trigger", () => {
    const parsed = parseYaml(docUpdateWorkflowTemplate(makeConfig()));
    expect(parsed.on).toHaveProperty("pull_request");
  });

  // -----------------------------------------------------------------------
  // Permissions
  // -----------------------------------------------------------------------

  it("permissions include contents: write", () => {
    const parsed = parseYaml(docUpdateWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["update-docs"];
    expect(job.permissions.contents).toBe("write");
  });

  it("permissions include pull-requests: write", () => {
    const parsed = parseYaml(docUpdateWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["update-docs"];
    expect(job.permissions["pull-requests"]).toBe("write");
  });

  it("permissions include id-token: write", () => {
    const parsed = parseYaml(docUpdateWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["update-docs"];
    expect(job.permissions["id-token"]).toBe("write");
  });

  // -----------------------------------------------------------------------
  // Bot-loop prevention
  // -----------------------------------------------------------------------

  it("job has if condition preventing bot-authored triggers", () => {
    const parsed = parseYaml(docUpdateWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["update-docs"];
    expect(job.if).toContain("endsWith(github.actor, '[bot]')");
  });

  // -----------------------------------------------------------------------
  // Checkout step
  // -----------------------------------------------------------------------

  it("checkout step uses PR branch ref, not merge commit", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("ref: ${{ github.event.pull_request.head.ref }}");
  });

  it("checkout step uses actions/checkout@v4", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("uses: actions/checkout@v4");
  });

  // -----------------------------------------------------------------------
  // Fork detection
  // -----------------------------------------------------------------------

  it("fork detection step is present", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("Skip fork PRs");
    expect(yaml).toContain("github.event.pull_request.head.repo.fork == true");
  });

  it("fork detection outputs an annotation", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("::notice::");
    expect(yaml).toContain("fork PRs cannot access secrets");
  });

  // -----------------------------------------------------------------------
  // API key check
  // -----------------------------------------------------------------------

  it("API key check step is present", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("Check for API key");
    expect(yaml).toContain("ANTHROPIC_API_KEY");
  });

  it("API key check outputs a warning annotation when missing", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("::warning::");
    expect(yaml).toContain("ANTHROPIC_API_KEY secret is not set");
  });

  // -----------------------------------------------------------------------
  // claude-code-action step
  // -----------------------------------------------------------------------

  it("claude-code-action@v1 step is present", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("uses: anthropics/claude-code-action@v1");
  });

  it("claude-code-action step has anthropic_api_key input", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}");
  });

  // -----------------------------------------------------------------------
  // Staleness detection prompt content
  // -----------------------------------------------------------------------

  it("prompt instructs Claude to read git diff", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("git diff");
  });

  it("prompt instructs reasoning about affected features", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("Identify affected features");
  });

  it("prompt instructs finding stale docs", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("Find potentially stale docs");
  });

  it("prompt instructs updating using skill file", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain("doc-generator skill");
    expect(yaml).toContain("SKILL.md");
  });

  it("prompt references .driftless.json", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    expect(yaml).toContain(".driftless.json");
  });

  it("prompt references config.skillsDir path", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig({ skillsDir: ".my-skills" }));
    expect(yaml).toContain(".my-skills/");
  });

  // -----------------------------------------------------------------------
  // Config parameterization
  // -----------------------------------------------------------------------

  it("prompt includes outputDir from config", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig({ outputDir: "custom-docs/output" }));
    expect(yaml).toContain("custom-docs/output/");
  });

  it("prompt includes skillsDir from config", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig({ skillsDir: ".agents/skills" }));
    expect(yaml).toContain(".agents/skills/");
  });

  it("prompt includes testPaths from config", () => {
    const yaml = docUpdateWorkflowTemplate(
      makeConfig({ testPaths: ["e2e/**/*.test.ts", "integration/**/*.cy.ts"] }),
    );
    expect(yaml).toContain("e2e/**/*.test.ts");
    expect(yaml).toContain("integration/**/*.cy.ts");
  });

  it("different config values produce different output", () => {
    const yaml1 = docUpdateWorkflowTemplate(
      makeConfig({ outputDir: "docs/alpha", skillsDir: ".skills-a" }),
    );
    const yaml2 = docUpdateWorkflowTemplate(
      makeConfig({ outputDir: "docs/beta", skillsDir: ".skills-b" }),
    );
    expect(yaml1).not.toBe(yaml2);
    expect(yaml1).toContain("docs/alpha/");
    expect(yaml2).toContain("docs/beta/");
    expect(yaml1).toContain(".skills-a/");
    expect(yaml2).toContain(".skills-b/");
  });

  // -----------------------------------------------------------------------
  // Error handling (failure-path / observability)
  // -----------------------------------------------------------------------

  it("throws descriptive error when outputDir is empty", () => {
    expect(() => docUpdateWorkflowTemplate(makeConfig({ outputDir: "" }))).toThrow(
      /outputDir.*required/,
    );
  });

  it("throws descriptive error when skillsDir is empty", () => {
    expect(() => docUpdateWorkflowTemplate(makeConfig({ skillsDir: "" }))).toThrow(
      /skillsDir.*required/,
    );
  });

  it("throws descriptive error when testPaths is empty array", () => {
    expect(() => docUpdateWorkflowTemplate(makeConfig({ testPaths: [] }))).toThrow(
      /testPaths.*required/,
    );
  });

  // -----------------------------------------------------------------------
  // No leftover template artifacts
  // -----------------------------------------------------------------------

  it("contains no leftover {{placeholder}} strings (excluding GitHub Actions expressions)", () => {
    const yaml = docUpdateWorkflowTemplate(makeConfig());
    // Strip ${{ ... }} GitHub Actions expressions before checking for leftover placeholders
    const stripped = yaml.replace(/\$\{\{.*?\}\}/g, "");
    expect(stripped).not.toMatch(/\{\{.*?\}\}/);
  });
});

describe("testGenWorkflowTemplate", () => {
  // -----------------------------------------------------------------------
  // YAML structure
  // -----------------------------------------------------------------------

  it("returns a string that parses as valid YAML", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    const parsed = parseYaml(yaml);
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });

  it("has required top-level keys: name, on, jobs", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    expect(parsed).toHaveProperty("name");
    expect(parsed).toHaveProperty("on");
    expect(parsed).toHaveProperty("jobs");
  });

  it("workflow name is Driftless Test Generation", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    expect(parsed.name).toBe("Driftless Test Generation");
  });

  // -----------------------------------------------------------------------
  // Job name
  // -----------------------------------------------------------------------

  it("job name is generate-tests", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    expect(parsed.jobs).toHaveProperty("generate-tests");
  });

  // -----------------------------------------------------------------------
  // Trigger
  // -----------------------------------------------------------------------

  it("contains pull_request trigger", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    expect(parsed.on).toHaveProperty("pull_request");
  });

  // -----------------------------------------------------------------------
  // Permissions
  // -----------------------------------------------------------------------

  it("permissions include contents: write", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["generate-tests"];
    expect(job.permissions.contents).toBe("write");
  });

  it("permissions include pull-requests: write", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["generate-tests"];
    expect(job.permissions["pull-requests"]).toBe("write");
  });

  it("permissions include id-token: write", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["generate-tests"];
    expect(job.permissions["id-token"]).toBe("write");
  });

  // -----------------------------------------------------------------------
  // Bot-loop prevention
  // -----------------------------------------------------------------------

  it("job has if condition preventing bot-authored triggers", () => {
    const parsed = parseYaml(testGenWorkflowTemplate(makeConfig()));
    const job = parsed.jobs["generate-tests"];
    expect(job.if).toContain("endsWith(github.actor, '[bot]')");
  });

  // -----------------------------------------------------------------------
  // Checkout step
  // -----------------------------------------------------------------------

  it("checkout step uses PR branch ref, not merge commit", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("ref: ${{ github.event.pull_request.head.ref }}");
  });

  it("checkout step uses actions/checkout@v4", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("uses: actions/checkout@v4");
  });

  it("checkout step uses fetch-depth: 0", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("fetch-depth: 0");
  });

  // -----------------------------------------------------------------------
  // Fork detection
  // -----------------------------------------------------------------------

  it("fork detection step is present", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("Skip fork PRs");
    expect(yaml).toContain("github.event.pull_request.head.repo.fork == true");
  });

  it("fork detection outputs an annotation", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("::notice::");
    expect(yaml).toContain("fork PRs cannot access secrets");
  });

  // -----------------------------------------------------------------------
  // API key check
  // -----------------------------------------------------------------------

  it("API key check step is present", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("Check for API key");
    expect(yaml).toContain("ANTHROPIC_API_KEY");
  });

  it("API key check outputs a warning annotation when missing", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("::warning::");
  });

  // -----------------------------------------------------------------------
  // claude-code-action step
  // -----------------------------------------------------------------------

  it("claude-code-action@v1 step is present", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("uses: anthropics/claude-code-action@v1");
  });

  it("claude-code-action step has anthropic_api_key input", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}");
  });

  it("claude-code-action step has allowed_tools argument", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("--allowedTools bash,read,write,edit");
  });

  // -----------------------------------------------------------------------
  // Test-generation prompt content
  // -----------------------------------------------------------------------

  it("prompt references e2e-writer skill path", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("e2e-writer/SKILL.md");
    expect(yaml).toContain(".skills/e2e-writer/SKILL.md");
  });

  it("prompt mentions new flow detection", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("new user-facing flows");
  });

  it("prompt mentions git diff", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("git diff");
  });

  it("prompt mentions test generation", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("Generate missing e2e tests");
  });

  it("prompt includes heuristics for new vs modified flows", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("New route/page file");
    expect(yaml).toContain("likely a new flow");
  });

  it("prompt instructs erring toward suggesting tests", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain("err toward suggesting tests");
  });

  it("prompt references .driftless.json", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    expect(yaml).toContain(".driftless.json");
  });

  // -----------------------------------------------------------------------
  // Config parameterization
  // -----------------------------------------------------------------------

  it("prompt includes outputDir from config", () => {
    const yaml = testGenWorkflowTemplate(makeConfig({ outputDir: "custom-docs/output" }));
    expect(yaml).toContain("custom-docs/output/");
  });

  it("prompt includes skillsDir from config", () => {
    const yaml = testGenWorkflowTemplate(makeConfig({ skillsDir: ".agents/skills" }));
    expect(yaml).toContain(".agents/skills/");
  });

  it("prompt includes testPaths from config", () => {
    const yaml = testGenWorkflowTemplate(
      makeConfig({ testPaths: ["e2e/**/*.test.ts", "integration/**/*.cy.ts"] }),
    );
    expect(yaml).toContain("e2e/**/*.test.ts");
    expect(yaml).toContain("integration/**/*.cy.ts");
  });

  it("different config values produce different output", () => {
    const yaml1 = testGenWorkflowTemplate(
      makeConfig({ outputDir: "docs/alpha", skillsDir: ".skills-a" }),
    );
    const yaml2 = testGenWorkflowTemplate(
      makeConfig({ outputDir: "docs/beta", skillsDir: ".skills-b" }),
    );
    expect(yaml1).not.toBe(yaml2);
    expect(yaml1).toContain("docs/alpha/");
    expect(yaml2).toContain("docs/beta/");
    expect(yaml1).toContain(".skills-a/");
    expect(yaml2).toContain(".skills-b/");
  });

  it("skillsDir path appears in e2e-writer skill reference", () => {
    const yaml = testGenWorkflowTemplate(makeConfig({ skillsDir: ".my-skills" }));
    expect(yaml).toContain(".my-skills/e2e-writer/SKILL.md");
  });

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it("throws descriptive error when outputDir is empty", () => {
    expect(() => testGenWorkflowTemplate(makeConfig({ outputDir: "" }))).toThrow(
      /outputDir.*required/,
    );
  });

  it("throws descriptive error when skillsDir is empty", () => {
    expect(() => testGenWorkflowTemplate(makeConfig({ skillsDir: "" }))).toThrow(
      /skillsDir.*required/,
    );
  });

  it("throws descriptive error when testPaths is empty array", () => {
    expect(() => testGenWorkflowTemplate(makeConfig({ testPaths: [] }))).toThrow(
      /testPaths.*required/,
    );
  });

  // -----------------------------------------------------------------------
  // No leftover template artifacts
  // -----------------------------------------------------------------------

  it("contains no leftover {{placeholder}} strings (excluding GitHub Actions expressions)", () => {
    const yaml = testGenWorkflowTemplate(makeConfig());
    // Strip ${{ ... }} GitHub Actions expressions before checking for leftover placeholders
    const stripped = yaml.replace(/\$\{\{.*?\}\}/g, "");
    expect(stripped).not.toMatch(/\{\{.*?\}\}/);
  });
});
