import { mkdtemp, readdir, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentResult, DriftlessConfig, ProgressEvent } from "../src/types.js";
import { generateDocs } from "../src/generator.js";

// Mock the agent module
vi.mock("../src/agent.js", () => ({
  spawnAgent: vi.fn(),
}));

import { spawnAgent } from "../src/agent.js";
const mockSpawnAgent = vi.mocked(spawnAgent);

function makeConfig(overrides: Partial<DriftlessConfig> = {}): DriftlessConfig {
  return {
    testPaths: ["tests/**/*.spec.ts"],
    outputDir: "docs",
    docFramework: "plain-md",
    capabilities: ["doc-generator"],
    skillsDir: ".skills",
    agentHarness: "claude-code",
    ...overrides,
  };
}

function successResult(content: string, cost = 0.01): AgentResult {
  return {
    success: true,
    content,
    costUsd: cost,
    durationMs: 500,
    stderr: "",
    exitCode: 0,
  };
}

function errorResult(error: string): AgentResult {
  return {
    success: false,
    content: "",
    costUsd: 0,
    error,
    durationMs: 100,
    stderr: "some stderr",
    exitCode: 1,
  };
}

describe("generateDocs", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(resolve(tmpdir(), "driftless-gen-"));
    mockSpawnAgent.mockReset();
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("generates docs for matched test files", async () => {
    // Create test files
    const testsDir = join(tmpDir, "tests");
    await mkdir(testsDir, { recursive: true });
    await writeFile(join(testsDir, "login.spec.ts"), 'test("login", () => {})');
    await writeFile(join(testsDir, "signup.spec.ts"), 'test("signup", () => {})');

    mockSpawnAgent
      .mockResolvedValueOnce(successResult("# Login Guide\n\nLogin docs."))
      .mockResolvedValueOnce(successResult("# Signup Guide\n\nSignup docs.", 0.02));

    const config = makeConfig({ outputDir: "docs" });
    const result = await generateDocs(config, { cwd: tmpDir });

    expect(result.filesGenerated).toBe(2);
    expect(result.filesErrored).toBe(0);
    expect(result.totalCostUsd).toBeCloseTo(0.03);
    expect(result.errors).toHaveLength(0);
    expect(result.results).toHaveLength(2);

    // Verify output files
    const docsDir = join(tmpDir, "docs");
    const files = await readdir(docsDir);
    expect(files.sort()).toEqual(["login.md", "signup.md"]);

    const loginDoc = await readFile(join(docsDir, "login.md"), "utf-8");
    expect(loginDoc).toBe("# Login Guide\n\nLogin docs.");
  });

  it("creates output directory if it doesn't exist", async () => {
    const testsDir = join(tmpDir, "tests");
    await mkdir(testsDir, { recursive: true });
    await writeFile(join(testsDir, "demo.spec.ts"), "test content");

    mockSpawnAgent.mockResolvedValueOnce(successResult("doc content"));

    const config = makeConfig({ outputDir: "nested/deep/docs" });
    await generateDocs(config, { cwd: tmpDir });

    const docsDir = join(tmpDir, "nested/deep/docs");
    const files = await readdir(docsDir);
    expect(files).toContain("demo.md");
  });

  it("writes .mdx files for fumadocs framework", async () => {
    const testsDir = join(tmpDir, "tests");
    await mkdir(testsDir, { recursive: true });
    await writeFile(join(testsDir, "feature.spec.ts"), "test content");

    mockSpawnAgent.mockResolvedValueOnce(successResult("mdx content"));

    const config = makeConfig({ docFramework: "fumadocs" });
    const result = await generateDocs(config, { cwd: tmpDir });

    expect(result.filesGenerated).toBe(1);
    const docsDir = join(tmpDir, "docs");
    const files = await readdir(docsDir);
    expect(files).toContain("feature.mdx");
  });

  it("returns zero-count result for empty glob match", async () => {
    // No test files exist
    const config = makeConfig({ testPaths: ["nonexistent/**/*.spec.ts"] });
    const result = await generateDocs(config, { cwd: tmpDir });

    expect(result.filesGenerated).toBe(0);
    expect(result.filesErrored).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.results).toHaveLength(0);
    expect(mockSpawnAgent).not.toHaveBeenCalled();
  });

  it("accumulates errors for failed files and continues", async () => {
    const testsDir = join(tmpDir, "tests");
    await mkdir(testsDir, { recursive: true });
    await writeFile(join(testsDir, "good.spec.ts"), "test content");
    await writeFile(join(testsDir, "bad.spec.ts"), "test content");
    await writeFile(join(testsDir, "also-good.spec.ts"), "test content");

    mockSpawnAgent
      .mockResolvedValueOnce(successResult("good doc")) // also-good (sorted first)
      .mockResolvedValueOnce(errorResult("timeout")) // bad
      .mockResolvedValueOnce(successResult("good doc 2")); // good

    const config = makeConfig();
    const result = await generateDocs(config, { cwd: tmpDir });

    expect(result.filesGenerated).toBe(2);
    expect(result.filesErrored).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe("timeout");
    expect(result.results).toHaveLength(3);
  });

  it("calls progress callback with start/complete/error events", async () => {
    const testsDir = join(tmpDir, "tests");
    await mkdir(testsDir, { recursive: true });
    await writeFile(join(testsDir, "one.spec.ts"), "test content");
    await writeFile(join(testsDir, "two.spec.ts"), "test content");

    mockSpawnAgent
      .mockResolvedValueOnce(successResult("doc one"))
      .mockResolvedValueOnce(errorResult("failed"));

    const events: ProgressEvent[] = [];
    const config = makeConfig();
    await generateDocs(config, {
      cwd: tmpDir,
      onProgress: (e) => events.push(e),
    });

    // 2 files → 4 events (start + complete/error for each)
    expect(events).toHaveLength(4);

    // First file: start + complete
    expect(events[0].type).toBe("start");
    expect(events[0].index).toBe(1);
    expect(events[0].total).toBe(2);
    expect(events[1].type).toBe("complete");
    expect(events[1].index).toBe(1);

    // Second file: start + error
    expect(events[2].type).toBe("start");
    expect(events[2].index).toBe(2);
    expect(events[3].type).toBe("error");
    expect(events[3].error).toBe("failed");
  });

  it("strips common test suffixes from output filenames", async () => {
    const testsDir = join(tmpDir, "tests");
    await mkdir(testsDir, { recursive: true });
    await writeFile(join(testsDir, "login.spec.ts"), "test content");
    await writeFile(join(testsDir, "signup.test.ts"), "test content");
    await writeFile(join(testsDir, "checkout.e2e.ts"), "test content");

    mockSpawnAgent
      .mockResolvedValueOnce(successResult("doc 1"))
      .mockResolvedValueOnce(successResult("doc 2"))
      .mockResolvedValueOnce(successResult("doc 3"));

    const config = makeConfig({ testPaths: ["tests/**/*.ts"] });
    await generateDocs(config, { cwd: tmpDir });

    const docsDir = join(tmpDir, "docs");
    const files = (await readdir(docsDir)).sort();
    expect(files).toEqual(["checkout.md", "login.md", "signup.md"]);
  });

  it("handles multiple glob patterns", async () => {
    const e2eDir = join(tmpDir, "e2e");
    const integDir = join(tmpDir, "integration");
    await mkdir(e2eDir, { recursive: true });
    await mkdir(integDir, { recursive: true });
    await writeFile(join(e2eDir, "flow.spec.ts"), "test");
    await writeFile(join(integDir, "api.test.ts"), "test");

    mockSpawnAgent
      .mockResolvedValueOnce(successResult("e2e doc"))
      .mockResolvedValueOnce(successResult("integ doc"));

    const config = makeConfig({
      testPaths: ["e2e/**/*.spec.ts", "integration/**/*.test.ts"],
    });
    const result = await generateDocs(config, { cwd: tmpDir });

    expect(result.filesGenerated).toBe(2);
  });
});
