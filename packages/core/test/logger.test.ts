import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DebugLogger } from "../src/logger.js";

describe("DebugLogger", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(resolve(tmpdir(), "driftless-log-"));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("log() accumulates entries with timestamps", () => {
    const logger = new DebugLogger();

    logger.log("detect", { frameworks: ["playwright"] });
    logger.log("config", { path: "driftless.config.json" });

    expect(logger.entries).toHaveLength(2);
    expect(logger.entries[0].phase).toBe("detect");
    expect(logger.entries[0].data).toEqual({ frameworks: ["playwright"] });
    expect(logger.entries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(logger.entries[1].phase).toBe("config");
  });

  it("flush() writes JSON file to disk", async () => {
    const logger = new DebugLogger();
    logger.log("test", { value: 42 });

    const logPath = join(tmpDir, "debug.log");
    await logger.flush(logPath);

    const content = JSON.parse(await readFile(logPath, "utf-8"));
    expect(content).toHaveLength(1);
    expect(content[0].phase).toBe("test");
    expect(content[0].data).toEqual({ value: 42 });
    expect(content[0].timestamp).toBeDefined();
  });

  it("flush() creates parent directory if missing", async () => {
    const logger = new DebugLogger();
    logger.log("init", {});

    const logPath = join(tmpDir, "nested", "deep", "debug.log");
    await logger.flush(logPath);

    const content = JSON.parse(await readFile(logPath, "utf-8"));
    expect(content).toHaveLength(1);
  });

  it("flush() catches write errors and warns instead of throwing", async () => {
    const logger = new DebugLogger();
    logger.log("test", {});

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Use a path that will fail: write to a file inside a "file" (not a directory)
    const blockingFile = join(tmpDir, "blocker");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(blockingFile, "not a directory", "utf-8");
    const impossiblePath = join(blockingFile, "sub", "debug.log");

    // Should not throw
    await expect(logger.flush(impossiblePath)).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("DebugLogger: failed to write"));

    warnSpy.mockRestore();
  });

  it("entries getter returns accumulated entries", () => {
    const logger = new DebugLogger();
    expect(logger.entries).toHaveLength(0);

    logger.log("a", 1);
    logger.log("b", 2);

    const entries = logger.entries;
    expect(entries).toHaveLength(2);
    expect(entries[0].phase).toBe("a");
    expect(entries[1].phase).toBe("b");
  });
});
