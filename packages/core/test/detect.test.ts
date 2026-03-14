import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectTestFramework, FRAMEWORK_CONFIG_MAP } from "../src/detect.js";

describe("detectTestFramework", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(resolve(tmpdir(), "driftless-detect-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("returns undefined for empty directory", async () => {
    const result = await detectTestFramework(tmpDir);
    expect(result).toBeUndefined();
  });

  it("detects playwright from playwright.config.ts", async () => {
    await writeFile(resolve(tmpDir, "playwright.config.ts"), "");
    const result = await detectTestFramework(tmpDir);
    expect(result).toBe("playwright");
  });

  it("detects cypress from cypress.config.js", async () => {
    await writeFile(resolve(tmpDir, "cypress.config.js"), "");
    const result = await detectTestFramework(tmpDir);
    expect(result).toBe("cypress");
  });

  it("detects testcafe from .testcaferc.json", async () => {
    await writeFile(resolve(tmpDir, ".testcaferc.json"), "");
    const result = await detectTestFramework(tmpDir);
    expect(result).toBe("testcafe");
  });

  it("detects detox from detox.config.js", async () => {
    await writeFile(resolve(tmpDir, "detox.config.js"), "");
    const result = await detectTestFramework(tmpDir);
    expect(result).toBe("detox");
  });

  it("detects webdriverio from wdio.conf.ts", async () => {
    await writeFile(resolve(tmpDir, "wdio.conf.ts"), "");
    const result = await detectTestFramework(tmpDir);
    expect(result).toBe("webdriverio");
  });

  it("detects nightwatch from nightwatch.json", async () => {
    await writeFile(resolve(tmpDir, "nightwatch.json"), "");
    const result = await detectTestFramework(tmpDir);
    expect(result).toBe("nightwatch");
  });

  it("returns playwright when both playwright and cypress configs exist (priority order)", async () => {
    await writeFile(resolve(tmpDir, "cypress.config.ts"), "");
    await writeFile(resolve(tmpDir, "playwright.config.ts"), "");
    const result = await detectTestFramework(tmpDir);
    expect(result).toBe("playwright");
  });
});

describe("FRAMEWORK_CONFIG_MAP", () => {
  it("covers exactly 6 frameworks", () => {
    expect(FRAMEWORK_CONFIG_MAP).toHaveLength(6);
  });

  it("has playwright as the first (highest priority) entry", () => {
    expect(FRAMEWORK_CONFIG_MAP[0]!.framework).toBe("playwright");
  });

  it("each entry has at least one config file", () => {
    for (const entry of FRAMEWORK_CONFIG_MAP) {
      expect(entry.configFiles.length).toBeGreaterThan(0);
    }
  });
});
