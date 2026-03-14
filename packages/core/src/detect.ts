import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { TestFramework } from "./types.js";

/**
 * Config file map for test framework auto-detection.
 * Ordered by detection priority (Playwright first — most common).
 * Exported so tests and agents can inspect coverage.
 */
export const FRAMEWORK_CONFIG_MAP: ReadonlyArray<{
  framework: TestFramework;
  configFiles: readonly string[];
}> = [
  {
    framework: "playwright",
    configFiles: ["playwright.config.ts", "playwright.config.js", "playwright.config.mjs"],
  },
  {
    framework: "cypress",
    configFiles: [
      "cypress.config.ts",
      "cypress.config.js",
      "cypress.config.mjs",
      "cypress.config.cjs",
    ],
  },
  {
    framework: "testcafe",
    configFiles: [".testcaferc.json", ".testcaferc.js"],
  },
  {
    framework: "detox",
    configFiles: ["detox.config.js", "detox.config.ts", ".detoxrc.js", ".detoxrc.json"],
  },
  {
    framework: "webdriverio",
    configFiles: ["wdio.conf.ts", "wdio.conf.js"],
  },
  {
    framework: "nightwatch",
    configFiles: ["nightwatch.conf.ts", "nightwatch.conf.js", "nightwatch.json"],
  },
] as const;

/**
 * Detect the test framework in use by scanning for known config files.
 * Returns the first matching framework in priority order, or `undefined` if none found.
 */
export async function detectTestFramework(cwd: string): Promise<TestFramework | undefined> {
  for (const { framework, configFiles } of FRAMEWORK_CONFIG_MAP) {
    for (const file of configFiles) {
      try {
        await stat(join(cwd, file));
        return framework;
      } catch {
        // File doesn't exist — continue scanning
      }
    }
  }
  return undefined;
}
