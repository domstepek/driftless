import type { PackageManager } from "./types.js";
import type { DriftlessConfig } from "./types.js";

/**
 * Detect the active package manager by parsing `npm_config_user_agent`.
 *
 * Format: `<pm>/<version> node/<version> <os> <arch>`
 * Falls back to `config.packageManager` if the env var is missing or
 * unrecognized, then to `"npm"` as the final default.
 */
export function detectPackageManager(
  config?: Pick<DriftlessConfig, "packageManager">,
): PackageManager {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    const firstToken = userAgent.split("/")[0];
    if (
      firstToken === "npm" ||
      firstToken === "pnpm" ||
      firstToken === "yarn" ||
      firstToken === "bun"
    ) {
      return firstToken;
    }
  }
  return config?.packageManager ?? "npm";
}

/**
 * Return the full shell command to globally install a package via the given PM.
 */
export function getGlobalInstallCommand(pm: PackageManager, pkg: string): string {
  switch (pm) {
    case "npm":
      return `npm install -g ${pkg}`;
    case "pnpm":
      return `pnpm install -g ${pkg}`;
    case "yarn":
      return `yarn global add ${pkg}`;
    case "bun":
      return `bun install -g ${pkg}`;
  }
}

/**
 * Detect whether the current process was launched via `npx`.
 *
 * Heuristic: check `npm_execpath` for `npx-cli` or `_` env var for `npx`.
 */
export function isNpxContext(): boolean {
  const execPath = process.env.npm_execpath ?? "";
  if (execPath.includes("npx-cli")) return true;
  const underscore = process.env._ ?? "";
  if (underscore.includes("npx")) return true;
  return false;
}
