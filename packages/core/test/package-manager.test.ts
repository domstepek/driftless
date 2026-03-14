import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectPackageManager, getGlobalInstallCommand, isNpxContext } from "../src/package-manager.js";

describe("package-manager module", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.npm_config_user_agent;
    delete process.env.npm_execpath;
    delete process.env._;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("detectPackageManager", () => {
    it("detects npm from user agent", () => {
      process.env.npm_config_user_agent = "npm/10.2.0 node/22.12.0 darwin arm64";
      expect(detectPackageManager()).toBe("npm");
    });

    it("detects pnpm from user agent", () => {
      process.env.npm_config_user_agent = "pnpm/10.6.2 npm/? node/22.12.0 darwin arm64";
      expect(detectPackageManager()).toBe("pnpm");
    });

    it("detects yarn from user agent", () => {
      process.env.npm_config_user_agent = "yarn/4.1.0 npm/? node/22.12.0 darwin arm64";
      expect(detectPackageManager()).toBe("yarn");
    });

    it("detects bun from user agent", () => {
      process.env.npm_config_user_agent = "bun/1.2.0 node/22.12.0 darwin arm64";
      expect(detectPackageManager()).toBe("bun");
    });

    it("falls back to config.packageManager when user agent is missing", () => {
      expect(detectPackageManager({ packageManager: "yarn" })).toBe("yarn");
    });

    it("falls back to config.packageManager when user agent is unrecognized", () => {
      process.env.npm_config_user_agent = "deno/1.40.0 node/22.12.0";
      expect(detectPackageManager({ packageManager: "pnpm" })).toBe("pnpm");
    });

    it("falls back to npm when no user agent and no config", () => {
      expect(detectPackageManager()).toBe("npm");
    });

    it("falls back to npm when no user agent and config has no packageManager", () => {
      expect(detectPackageManager({})).toBe("npm");
    });
  });

  describe("getGlobalInstallCommand", () => {
    it("returns npm install -g command", () => {
      expect(getGlobalInstallCommand("npm", "@driftless-ai/cli@latest")).toBe(
        "npm install -g @driftless-ai/cli@latest",
      );
    });

    it("returns pnpm install -g command", () => {
      expect(getGlobalInstallCommand("pnpm", "@driftless-ai/cli@latest")).toBe(
        "pnpm install -g @driftless-ai/cli@latest",
      );
    });

    it("returns yarn global add command", () => {
      expect(getGlobalInstallCommand("yarn", "@driftless-ai/cli@latest")).toBe(
        "yarn global add @driftless-ai/cli@latest",
      );
    });

    it("returns bun install -g command", () => {
      expect(getGlobalInstallCommand("bun", "@driftless-ai/cli@latest")).toBe(
        "bun install -g @driftless-ai/cli@latest",
      );
    });
  });

  describe("isNpxContext", () => {
    it("returns true when npm_execpath contains npx-cli", () => {
      process.env.npm_execpath = "/usr/lib/node_modules/npm/bin/npx-cli.js";
      expect(isNpxContext()).toBe(true);
    });

    it("returns true when _ contains npx", () => {
      process.env._ = "/usr/local/bin/npx";
      expect(isNpxContext()).toBe(true);
    });

    it("returns false when neither env var indicates npx", () => {
      process.env.npm_execpath = "/usr/lib/node_modules/npm/bin/npm-cli.js";
      process.env._ = "/usr/local/bin/node";
      expect(isNpxContext()).toBe(false);
    });

    it("returns false when env vars are missing", () => {
      expect(isNpxContext()).toBe(false);
    });
  });
});
