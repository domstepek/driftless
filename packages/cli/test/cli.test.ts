import { describe, expect, it, vi, beforeEach } from "vitest";

// main() auto-invokes on import, so console.log will fire during module load.
// We spy before importing and track all calls.
const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

// Dynamic import so the spy is in place before main() runs
const { main } = await import("../src/index.js");

describe("CLI entry point", () => {
  beforeEach(() => {
    logSpy.mockClear();
  });

  it("main() prints version string to stdout", () => {
    main();
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]?.[0]).toMatch(/^driftless v\d+\.\d+\.\d+/);
  });

  it("version matches package.json", () => {
    main();
    expect(logSpy.mock.calls[0]?.[0]).toBe("driftless v0.0.0");
  });
});
