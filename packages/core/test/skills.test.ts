import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { tmpdir } from "node:os";
import { rmSync } from "node:fs";
import type { DriftlessConfig } from "../src/types.js";
import { docGeneratorTemplate, e2eWriterTemplate, installSkills } from "../src/skills.js";

function makeConfig(overrides: Partial<DriftlessConfig> = {}): DriftlessConfig {
  return {
    testPaths: ["tests/**/*.spec.ts"],
    outputDir: "docs/training",
    docFramework: "plain-md",
    capabilities: ["doc-generator", "e2e-writer"],
    skillsDir: ".skills",
    testFramework: "playwright",
    agentHarness: "claude-code",
    ...overrides,
  };
}

describe("docGeneratorTemplate", () => {
  it("returns content with YAML frontmatter", () => {
    const content = docGeneratorTemplate(makeConfig());
    expect(content).toMatch(/^---\nname: doc-generator/);
    expect(content).toContain("description:");
  });

  it("includes real outputDir path", () => {
    const content = docGeneratorTemplate(makeConfig({ outputDir: "my-docs/output" }));
    expect(content).toContain("`my-docs/output/`");
  });

  it("includes real testPaths", () => {
    const content = docGeneratorTemplate(
      makeConfig({ testPaths: ["e2e/**/*.test.ts", "integration/**/*.spec.ts"] }),
    );
    expect(content).toContain("`e2e/**/*.test.ts`");
    expect(content).toContain("`integration/**/*.spec.ts`");
  });

  it("uses blockquote syntax for plain-md framework", () => {
    const content = docGeneratorTemplate(makeConfig({ docFramework: "plain-md" }));
    expect(content).toContain("> **Tip:**");
    expect(content).toContain("> **Warning:**");
    expect(content).toContain("`.md`");
    expect(content).not.toContain("<Callout");
    expect(content).not.toContain(":::");
  });

  it("uses Callout syntax for fumadocs framework", () => {
    const content = docGeneratorTemplate(makeConfig({ docFramework: "fumadocs" }));
    expect(content).toContain("<Callout");
    expect(content).toContain("</Callout>");
    expect(content).toContain('type="info"');
    expect(content).toContain("`.mdx`");
    expect(content).not.toContain(":::");
  });

  it("uses admonition syntax for docusaurus framework", () => {
    const content = docGeneratorTemplate(makeConfig({ docFramework: "docusaurus" }));
    expect(content).toContain(":::tip");
    expect(content).toContain(":::warning");
    expect(content).toContain("`.mdx`");
    expect(content).not.toContain("<Callout");
  });

  it("contains no leftover {{placeholder}} strings", () => {
    for (const fw of ["plain-md", "fumadocs", "docusaurus"] as const) {
      const content = docGeneratorTemplate(makeConfig({ docFramework: fw }));
      expect(content).not.toMatch(/\{\{.*?\}\}/);
    }
  });

  it("includes content derivation rules from reference skill", () => {
    const content = docGeneratorTemplate(makeConfig());
    expect(content).toContain("Test actions (clicks, fills, navigations) become user instructions");
    expect(content).toContain("Common Problems");
  });
});

describe("e2eWriterTemplate", () => {
  it("returns content with YAML frontmatter", () => {
    const content = e2eWriterTemplate(makeConfig());
    expect(content).toMatch(/^---\nname: e2e-writer/);
    expect(content).toContain("description:");
  });

  it("includes real testPaths", () => {
    const content = e2eWriterTemplate(makeConfig({ testPaths: ["cypress/e2e/**/*.cy.ts"] }));
    expect(content).toContain("`cypress/e2e/**/*.cy.ts`");
  });

  it("includes test framework name", () => {
    const content = e2eWriterTemplate(makeConfig({ testFramework: "cypress" }));
    expect(content).toContain("**cypress**");
  });

  it("handles undefined test framework gracefully", () => {
    const content = e2eWriterTemplate(makeConfig({ testFramework: undefined }));
    expect(content).toContain("**your test framework**");
  });

  it("includes outputDir for cross-referencing docs", () => {
    const content = e2eWriterTemplate(makeConfig({ outputDir: "docs/guides" }));
    expect(content).toContain("`docs/guides/`");
  });

  it("contains no leftover {{placeholder}} strings", () => {
    const content = e2eWriterTemplate(makeConfig());
    expect(content).not.toMatch(/\{\{.*?\}\}/);
  });

  it("covers test isolation and assertion patterns", () => {
    const content = e2eWriterTemplate(makeConfig());
    expect(content).toContain("Test Isolation");
    expect(content).toContain("Assertion Patterns");
  });
});

describe("installSkills", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(
      tmpdir(),
      `driftless-skills-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes doc-generator SKILL.md to correct directory", async () => {
    const config = makeConfig({ capabilities: ["doc-generator"] });
    const result = await installSkills(config, { cwd: tmpDir });

    const skillPath = join(tmpDir, ".skills", "doc-generator", "SKILL.md");
    expect(existsSync(skillPath)).toBe(true);
    expect(result.installed).toEqual(["doc-generator"]);
  });

  it("writes e2e-writer SKILL.md to correct directory", async () => {
    const config = makeConfig({ capabilities: ["e2e-writer"] });
    const result = await installSkills(config, { cwd: tmpDir });

    const skillPath = join(tmpDir, ".skills", "e2e-writer", "SKILL.md");
    expect(existsSync(skillPath)).toBe(true);
    expect(result.installed).toEqual(["e2e-writer"]);
  });

  it("installs both skills when both capabilities selected", async () => {
    const config = makeConfig({ capabilities: ["doc-generator", "e2e-writer"] });
    const result = await installSkills(config, { cwd: tmpDir });

    expect(result.installed).toEqual(["doc-generator", "e2e-writer"]);
    expect(existsSync(join(tmpDir, ".skills", "doc-generator", "SKILL.md"))).toBe(true);
    expect(existsSync(join(tmpDir, ".skills", "e2e-writer", "SKILL.md"))).toBe(true);
  });

  it("creates no directories when capabilities array is empty", async () => {
    const config = makeConfig({ capabilities: [] });
    const result = await installSkills(config, { cwd: tmpDir });

    expect(result.installed).toEqual([]);
    expect(existsSync(join(tmpDir, ".skills"))).toBe(false);
  });

  it("only installs selected capabilities", async () => {
    const config = makeConfig({ capabilities: ["e2e-writer"] });
    const result = await installSkills(config, { cwd: tmpDir });

    expect(result.installed).toEqual(["e2e-writer"]);
    expect(existsSync(join(tmpDir, ".skills", "doc-generator"))).toBe(false);
    expect(existsSync(join(tmpDir, ".skills", "e2e-writer", "SKILL.md"))).toBe(true);
  });

  it("overwrites existing skill files", async () => {
    const config = makeConfig({ capabilities: ["doc-generator"] });
    const skillDir = join(tmpDir, ".skills", "doc-generator");
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(join(skillDir, "SKILL.md"), "old content", "utf-8");

    await installSkills(config, { cwd: tmpDir });

    const content = readFileSync(join(skillDir, "SKILL.md"), "utf-8");
    expect(content).not.toBe("old content");
    expect(content).toContain("name: doc-generator");
  });

  it("creates nested directories for custom skillsDir", async () => {
    const config = makeConfig({ capabilities: ["doc-generator"], skillsDir: ".agents/skills" });
    const result = await installSkills(config, { cwd: tmpDir });

    const skillPath = join(tmpDir, ".agents", "skills", "doc-generator", "SKILL.md");
    expect(existsSync(skillPath)).toBe(true);
    expect(result.skillsDir).toBe(".agents/skills");
  });

  it("returns empty installed array in dry-run mode", async () => {
    const config = makeConfig({ capabilities: ["doc-generator", "e2e-writer"] });
    const result = await installSkills(config, { cwd: tmpDir, dryRun: true });

    expect(result.installed).toEqual([]);
    expect(existsSync(join(tmpDir, ".skills"))).toBe(false);
  });

  it("silently skips unknown capabilities", async () => {
    const config = makeConfig({
      capabilities: ["doc-generator", "unknown-skill" as "doc-generator"],
    });
    const result = await installSkills(config, { cwd: tmpDir });

    expect(result.installed).toEqual(["doc-generator"]);
  });

  it("installed skill content has no leftover template placeholders", async () => {
    const config = makeConfig({ capabilities: ["doc-generator", "e2e-writer"] });
    await installSkills(config, { cwd: tmpDir });

    for (const skill of ["doc-generator", "e2e-writer"]) {
      const content = readFileSync(join(tmpDir, ".skills", skill, "SKILL.md"), "utf-8");
      expect(content).not.toMatch(/\{\{.*?\}\}/);
    }
  });
});
