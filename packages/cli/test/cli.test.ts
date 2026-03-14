import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the init command module to prevent actual prompt execution during CLI routing tests
vi.mock("../src/commands/init.js", () => ({
  initCommand: vi.fn().mockResolvedValue(undefined),
}));

const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// Dynamic import so the spy is in place before main() auto-invokes
const { main } = await import("../src/index.js");

describe("CLI entry point", () => {
  beforeEach(() => {
    logSpy.mockClear();
    errorSpy.mockClear();
    process.exitCode = undefined;
  });

  it("--version prints version string to stdout", async () => {
    await main(["--version"]);
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]?.[0]).toMatch(/^driftless v\d+\.\d+\.\d+/);
  });

  it("-V prints version string to stdout", async () => {
    await main(["-V"]);
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]?.[0]).toBe("driftless v1.0.0");
  });

  it("--help prints usage text", async () => {
    await main(["--help"]);
    expect(logSpy).toHaveBeenCalledOnce();
    const output = logSpy.mock.calls[0]?.[0] as string;
    expect(output).toContain("init");
    expect(output).toContain("--dry-run");
    expect(output).toContain("--version");
    expect(output).toContain("--help");
  });

  it("-h prints usage text", async () => {
    await main(["-h"]);
    expect(logSpy).toHaveBeenCalledOnce();
    const output = logSpy.mock.calls[0]?.[0] as string;
    expect(output).toContain("Usage:");
  });

  it("no args prints usage text", async () => {
    await main([]);
    expect(logSpy).toHaveBeenCalledOnce();
    const output = logSpy.mock.calls[0]?.[0] as string;
    expect(output).toContain("Usage:");
  });

  it("unknown command prints error and usage to stderr/stdout", async () => {
    await main(["bogus"]);
    expect(errorSpy).toHaveBeenCalledWith("Unknown command: bogus");
    expect(logSpy).toHaveBeenCalledOnce(); // usage text
    expect(process.exitCode).toBe(1);
  });

  it("init routes to initCommand with default options", async () => {
    const { initCommand } = await import("../src/commands/init.js");
    await main(["init"]);
    expect(initCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: false,
        verbose: false,
      }),
    );
  });

  it("init --dry-run threads dryRun flag", async () => {
    const { initCommand } = await import("../src/commands/init.js");
    vi.mocked(initCommand).mockClear();
    await main(["init", "--dry-run"]);
    expect(initCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: true,
      }),
    );
  });
});
