import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DriftlessConfig } from "../src/types.js";
import { configExists, configPath, readConfig, writeConfig } from "../src/config.js";

const sampleConfig: DriftlessConfig = {
  testPaths: ["tests/**/*.spec.ts"],
  outputDir: "docs/training",
  docFramework: "plain-md",
  capabilities: ["doc-generator", "e2e-writer"],
  skillsDir: ".skills",
  testFramework: "playwright",
  agentHarness: "claude-code",
};

describe("config module", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(resolve(tmpdir(), "driftless-config-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe("configPath", () => {
    it("resolves to .driftless.json in the given directory", () => {
      expect(configPath("/some/project")).toBe(resolve("/some/project", ".driftless.json"));
    });
  });

  describe("configExists", () => {
    it("returns false for empty directory", async () => {
      expect(await configExists(tmpDir)).toBe(false);
    });

    it("returns true after writeConfig", async () => {
      await writeConfig(tmpDir, sampleConfig);
      expect(await configExists(tmpDir)).toBe(true);
    });
  });

  describe("writeConfig / readConfig round-trip", () => {
    it("round-trips config faithfully", async () => {
      await writeConfig(tmpDir, sampleConfig);
      const loaded = await readConfig(tmpDir);
      expect(loaded).toEqual(sampleConfig);
    });

    it("produces formatted JSON with 2-space indent", async () => {
      await writeConfig(tmpDir, sampleConfig);
      const { readFile } = await import("node:fs/promises");
      const raw = await readFile(configPath(tmpDir), "utf-8");
      // Check that it's indented (not a single-line blob)
      expect(raw).toContain("\n  ");
      // Check trailing newline
      expect(raw.endsWith("\n")).toBe(true);
    });

    it("cleans up temp file after atomic write", async () => {
      await writeConfig(tmpDir, sampleConfig);
      const files = await readdir(tmpDir);
      expect(files).toContain(".driftless.json");
      expect(files).not.toContain(".driftless.tmp.json");
    });
  });

  describe("readConfig errors", () => {
    it("throws descriptive error on missing file", async () => {
      await expect(readConfig(tmpDir)).rejects.toThrow(/Config file not found/);
      await expect(readConfig(tmpDir)).rejects.toThrow(tmpDir);
    });

    it("throws descriptive error on invalid JSON", async () => {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(configPath(tmpDir), "not { valid json", "utf-8");
      await expect(readConfig(tmpDir)).rejects.toThrow(/Invalid JSON in config file/);
    });
  });
});
