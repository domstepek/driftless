import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkForUpdate, performUpdate } from "../src/auto-update.js";

// Mock child_process.execSync
vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

import { execSync } from "node:child_process";

describe("auto-update module", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.CI;
    delete process.env.npm_config_user_agent;
    delete process.env.npm_execpath;
    delete process.env._;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("checkForUpdate", () => {
    it("returns isNewer: true when registry has a newer version", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: "2.0.0" }),
        }),
      );

      const result = await checkForUpdate("1.0.0");
      expect(result).toEqual({
        current: "1.0.0",
        latest: "2.0.0",
        isNewer: true,
        isMajor: true,
      });
    });

    it("returns isNewer: false when versions are the same", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: "1.0.0" }),
        }),
      );

      const result = await checkForUpdate("1.0.0");
      expect(result.isNewer).toBe(false);
      expect(result.isMajor).toBe(false);
    });

    it("returns isNewer: false when current is newer (edge case)", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: "1.0.0" }),
        }),
      );

      const result = await checkForUpdate("2.0.0");
      expect(result.isNewer).toBe(false);
    });

    it("detects minor version bump without major flag", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: "1.2.0" }),
        }),
      );

      const result = await checkForUpdate("1.1.0");
      expect(result.isNewer).toBe(true);
      expect(result.isMajor).toBe(false);
    });

    it("detects patch version bump", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version: "1.0.3" }),
        }),
      );

      const result = await checkForUpdate("1.0.2");
      expect(result.isNewer).toBe(true);
      expect(result.isMajor).toBe(false);
    });

    it("returns safe default on network timeout", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")),
      );

      const result = await checkForUpdate("1.0.0");
      expect(result).toEqual({
        current: "1.0.0",
        latest: "1.0.0",
        isNewer: false,
        isMajor: false,
      });
    });

    it("returns safe default on HTTP 404", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 404 }),
      );

      const result = await checkForUpdate("1.0.0");
      expect(result.isNewer).toBe(false);
      expect(result.latest).toBe("1.0.0");
    });

    it("returns safe default on malformed JSON", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ name: "@driftless-ai/cli" }),
        }),
      );

      const result = await checkForUpdate("1.0.0");
      expect(result.isNewer).toBe(false);
    });

    it("returns safe default when json() throws", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.reject(new Error("invalid json")),
        }),
      );

      const result = await checkForUpdate("1.0.0");
      expect(result.isNewer).toBe(false);
    });
  });

  describe("performUpdate", () => {
    function stubFetch(version: string) {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ version }),
        }),
      );
    }

    it("skips in CI environments", async () => {
      process.env.CI = "true";
      stubFetch("2.0.0");

      const result = await performUpdate({ currentVersion: "1.0.0" });
      expect(result).toBeNull();
    });

    it("returns check result when no update is available", async () => {
      stubFetch("1.0.0");

      const result = await performUpdate({ currentVersion: "1.0.0" });
      expect(result).not.toBeNull();
      expect(result!.isNewer).toBe(false);
    });

    it("notifies on stderr in npx context instead of installing", async () => {
      process.env.npm_execpath = "/usr/lib/node_modules/npm/bin/npx-cli.js";
      stubFetch("2.0.0");
      const stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);

      const result = await performUpdate({ currentVersion: "1.0.0" });
      expect(result!.isNewer).toBe(true);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("newer version"));
      expect(execSync).not.toHaveBeenCalled();
    });

    it("warns on stderr for major version jump", async () => {
      stubFetch("2.0.0");
      const stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);

      await performUpdate({ currentVersion: "1.0.0" });

      const calls = stderrSpy.mock.calls.map(c => c[0] as string);
      expect(calls.some(c => c.includes("major version change"))).toBe(true);
    });

    it("executes global install command on update", async () => {
      process.env.npm_config_user_agent = "pnpm/10.6.2 npm/? node/22.12.0";
      stubFetch("1.1.0");
      vi.spyOn(process.stderr, "write").mockReturnValue(true);

      await performUpdate({ currentVersion: "1.0.0" });

      expect(execSync).toHaveBeenCalledWith("pnpm install -g @driftless-ai/cli@latest", { stdio: "pipe" });
    });

    it("writes hint to stderr on execSync failure (permission error)", async () => {
      stubFetch("1.1.0");
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("EACCES: permission denied");
      });
      const stderrSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);

      const result = await performUpdate({ currentVersion: "1.0.0" });

      expect(result!.isNewer).toBe(true);
      const calls = stderrSpy.mock.calls.map(c => c[0] as string);
      expect(calls.some(c => c.includes("Auto-update failed"))).toBe(true);
    });

    it("uses config packageManager when user agent is missing", async () => {
      stubFetch("1.1.0");
      vi.spyOn(process.stderr, "write").mockReturnValue(true);

      await performUpdate({
        currentVersion: "1.0.0",
        config: { packageManager: "yarn" },
      });

      expect(execSync).toHaveBeenCalledWith("yarn global add @driftless-ai/cli@latest", { stdio: "pipe" });
    });

    it("defaults to npm when no user agent or config", async () => {
      stubFetch("1.1.0");
      vi.spyOn(process.stderr, "write").mockReturnValue(true);

      await performUpdate({ currentVersion: "1.0.0" });

      expect(execSync).toHaveBeenCalledWith("npm install -g @driftless-ai/cli@latest", { stdio: "pipe" });
    });
  });
});
