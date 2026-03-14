import { describe, expect, it } from "vitest";
import type {
  Capability,
  DocFramework,
  DriftlessConfig,
  InitOptions,
  TestFramework,
} from "../src/index.js";

describe("core type exports", () => {
  it("DocFramework accepts valid framework values", () => {
    const frameworks: DocFramework[] = ["plain-md", "fumadocs", "docusaurus"];
    expect(frameworks).toHaveLength(3);
    expect(frameworks).toContain("plain-md");
    expect(frameworks).toContain("fumadocs");
    expect(frameworks).toContain("docusaurus");
  });

  it("Capability accepts valid capability values", () => {
    const caps: Capability[] = ["doc-generator", "e2e-writer"];
    expect(caps).toHaveLength(2);
    expect(caps).toContain("doc-generator");
    expect(caps).toContain("e2e-writer");
  });

  it("TestFramework accepts valid framework values", () => {
    const frameworks: TestFramework[] = [
      "playwright",
      "cypress",
      "testcafe",
      "detox",
      "webdriverio",
      "nightwatch",
      "other",
    ];
    expect(frameworks).toHaveLength(7);
  });

  it("DriftlessConfig shape is constructable", () => {
    const config: DriftlessConfig = {
      testPaths: ["tests/**/*.test.ts"],
      outputDir: "docs",
      docFramework: "plain-md",
      capabilities: ["doc-generator"],
      skillsDir: "skills",
      agentHarness: "claude-code",
    };
    expect(config.testPaths).toHaveLength(1);
    expect(config.outputDir).toBe("docs");
    expect(config.docFramework).toBe("plain-md");
    expect(config.capabilities).toContain("doc-generator");
    expect(config.skillsDir).toBe("skills");
    expect(config.agentHarness).toBe("claude-code");
  });

  it("DriftlessConfig accepts optional fields", () => {
    const config: DriftlessConfig = {
      $schema: "https://example.com/schema.json",
      testPaths: [],
      outputDir: "out",
      docFramework: "fumadocs",
      capabilities: ["e2e-writer"],
      skillsDir: ".skills",
      testFramework: "playwright",
      agentHarness: "claude-code",
    };
    expect(config.$schema).toBe("https://example.com/schema.json");
    expect(config.testFramework).toBe("playwright");
  });

  it("InitOptions shape is constructable", () => {
    const opts: InitOptions = {
      dryRun: true,
      verbose: false,
      cwd: "/tmp",
    };
    expect(opts.dryRun).toBe(true);
    expect(opts.verbose).toBe(false);
    expect(opts.cwd).toBe("/tmp");
  });
});
