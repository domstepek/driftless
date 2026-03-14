import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { spawnAgent, type SpawnAgentOptions } from "../src/agent.js";

// Mock child_process.spawn
vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

import { spawn } from "node:child_process";
const mockSpawn = vi.mocked(spawn);

/**
 * Create a fake ChildProcess-like object for testing.
 */
function createFakeProc() {
  const proc = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
    stdin: { write: ReturnType<typeof vi.fn>; end: ReturnType<typeof vi.fn> };
    kill: ReturnType<typeof vi.fn>;
    pid: number;
  };
  proc.stdout = new EventEmitter();
  proc.stderr = new EventEmitter();
  proc.stdin = { write: vi.fn(), end: vi.fn() };
  proc.kill = vi.fn();
  proc.pid = 12345;
  return proc;
}

const defaultOpts: SpawnAgentOptions = {
  fileContent: "test('example', () => {});",
  systemPrompt: "You are a doc generator.",
  userPrompt: "Generate docs from this test.",
};

describe("spawnAgent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSpawn.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns successful result with parsed JSON content and cost", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent(defaultOpts);

    // Simulate Claude Code response
    const response = JSON.stringify({
      result: "# Generated Doc\n\nSome content.",
      total_cost_usd: 0.015,
      is_error: false,
    });
    proc.stdout.emit("data", Buffer.from(response));
    proc.emit("close", 0);

    const result = await promise;

    expect(result.success).toBe(true);
    expect(result.content).toBe("# Generated Doc\n\nSome content.");
    expect(result.costUsd).toBe(0.015);
    expect(result.exitCode).toBe(0);
    expect(result.error).toBeUndefined();
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.stderr).toBe("");

    // Verify stdin was piped
    expect(proc.stdin.write).toHaveBeenCalledWith(defaultOpts.fileContent);
    expect(proc.stdin.end).toHaveBeenCalled();

    // Verify spawn args
    expect(mockSpawn).toHaveBeenCalledWith(
      "claude",
      expect.arrayContaining([
        "-p",
        "--output-format",
        "json",
        "--no-session-persistence",
        "--tools",
        "",
        "--append-system-prompt",
      ]),
      expect.objectContaining({ stdio: ["pipe", "pipe", "pipe"] }),
    );
  });

  it("returns error result on non-zero exit code", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent(defaultOpts);

    proc.stderr.emit("data", Buffer.from("Error: authentication failed"));
    proc.emit("close", 1);

    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.error).toBe("non-zero exit: code 1");
    expect(result.stderr).toContain("authentication failed");
    expect(result.exitCode).toBe(1);
    expect(result.content).toBe("");
  });

  it("returns error result on timeout with SIGTERM", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent({ ...defaultOpts, timeoutMs: 1000 });

    // Advance past timeout
    await vi.advanceTimersByTimeAsync(1000);

    expect(proc.kill).toHaveBeenCalledWith("SIGTERM");

    // Process exits after being killed
    proc.emit("close", null);

    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.error).toContain("timed out");
    expect(result.error).toContain("1000ms");
  });

  it("escalates to SIGKILL after grace period on timeout", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent({ ...defaultOpts, timeoutMs: 1000 });

    // Advance past timeout
    await vi.advanceTimersByTimeAsync(1000);
    expect(proc.kill).toHaveBeenCalledWith("SIGTERM");

    // Advance past grace period without process exiting
    await vi.advanceTimersByTimeAsync(5000);
    expect(proc.kill).toHaveBeenCalledWith("SIGKILL");

    // Process finally exits
    proc.emit("close", null);

    const result = await promise;
    expect(result.success).toBe(false);
    expect(result.error).toContain("timed out");
  });

  it("returns error result on spawn error (ENOENT for missing binary)", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent(defaultOpts);

    // Emit ENOENT error (claude binary not found)
    const err = new Error("spawn claude ENOENT") as NodeJS.ErrnoException;
    err.code = "ENOENT";
    proc.emit("error", err);

    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.error).toContain("spawn error");
    expect(result.error).toContain("ENOENT");
    expect(result.exitCode).toBeNull();
  });

  it("returns error result on invalid JSON in stdout", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent(defaultOpts);

    proc.stdout.emit("data", Buffer.from("not valid json {broken"));
    proc.emit("close", 0);

    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.error).toContain("invalid JSON in stdout");
    expect(result.error).toContain("not valid json");
    expect(result.exitCode).toBe(0);
  });

  it("returns error result on partial JSON from interrupted output", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent(defaultOpts);

    proc.stdout.emit("data", Buffer.from('{"result": "partial'));
    proc.emit("close", 0);

    const result = await promise;

    expect(result.success).toBe(false);
    expect(result.error).toContain("invalid JSON");
  });

  it("handles response with missing result field gracefully", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent(defaultOpts);

    proc.stdout.emit("data", Buffer.from(JSON.stringify({ is_error: false })));
    proc.emit("close", 0);

    const result = await promise;

    // Valid JSON but no result field → success with empty content
    expect(result.success).toBe(true);
    expect(result.content).toBe("");
    expect(result.costUsd).toBe(0);
  });

  it("collects chunked stdout correctly", async () => {
    const proc = createFakeProc();
    mockSpawn.mockReturnValue(proc as never);

    const promise = spawnAgent(defaultOpts);

    // Send response in multiple chunks
    const response = JSON.stringify({ result: "hello world", total_cost_usd: 0.02 });
    const mid = Math.floor(response.length / 2);
    proc.stdout.emit("data", Buffer.from(response.slice(0, mid)));
    proc.stdout.emit("data", Buffer.from(response.slice(mid)));
    proc.emit("close", 0);

    const result = await promise;

    expect(result.success).toBe(true);
    expect(result.content).toBe("hello world");
    expect(result.costUsd).toBe(0.02);
  });
});
