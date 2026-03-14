import { describe, expect, it } from "vitest";
import type { DocFramework, DriftlessConfig, InitOptions } from "../src/index.js";

describe("core type exports", () => {
  it("DocFramework accepts valid framework values", () => {
    const frameworks: DocFramework[] = ["plain-md", "fumadocs", "docusaurus"];
    expect(frameworks).toHaveLength(3);
    expect(frameworks).toContain("plain-md");
    expect(frameworks).toContain("fumadocs");
    expect(frameworks).toContain("docusaurus");
  });

  it("DriftlessConfig shape is constructable", () => {
    const config: DriftlessConfig = {
      testPaths: ["tests/**/*.test.ts"],
      outputDir: "docs",
      docFramework: "plain-md",
      capabilities: ["snapshot"],
      skillsDir: "skills",
    };
    expect(config.testPaths).toHaveLength(1);
    expect(config.outputDir).toBe("docs");
    expect(config.docFramework).toBe("plain-md");
    expect(config.capabilities).toContain("snapshot");
    expect(config.skillsDir).toBe("skills");
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
