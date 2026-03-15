import { execSync } from "node:child_process";
import type { DriftlessConfig } from "./types.js";
import { detectPackageManager, getGlobalInstallCommand, isNpxContext } from "./package-manager.js";

/** Result of a version check against the npm registry. */
export interface UpdateCheckResult {
  /** Currently installed version */
  current: string;
  /** Latest version on the registry (equals current on error) */
  latest: string;
  /** Whether the registry version is strictly newer */
  isNewer: boolean;
  /** Whether the update crosses a major version boundary */
  isMajor: boolean;
}

/**
 * Split a semver string `"x.y.z"` into numeric `[major, minor, patch]`.
 * Returns `[0, 0, 0]` on malformed input.
 */
function parseSemver(v: string): [number, number, number] {
  const parts = v.split(".");
  if (parts.length !== 3) return [0, 0, 0];
  const nums = parts.map(Number);
  if (nums.some(Number.isNaN)) return [0, 0, 0];
  return nums as [number, number, number];
}

/**
 * Return true if `latest` is strictly newer than `current` by semver comparison.
 */
function isNewerVersion(latest: string, current: string): boolean {
  const [lMaj, lMin, lPatch] = parseSemver(latest);
  const [cMaj, cMin, cPatch] = parseSemver(current);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPatch > cPatch;
}

/**
 * Check the npm registry for a newer version of `@driftless-ai/cli`.
 *
 * Uses a 5-second `AbortController` timeout. On any error (network, parse, non-200),
 * returns a safe default with `isNewer: false` so callers never need to handle exceptions.
 */
export async function checkForUpdate(
  currentVersion: string,
  _options?: { registryUrl?: string },
): Promise<UpdateCheckResult> {
  const safeResult: UpdateCheckResult = {
    current: currentVersion,
    latest: currentVersion,
    isNewer: false,
    isMajor: false,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = _options?.registryUrl ?? "https://registry.npmjs.org/@driftless-ai/cli/latest";
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return safeResult;

    const data = (await response.json()) as { version?: string };
    const latest = data.version;
    if (typeof latest !== "string") return safeResult;

    const newer = isNewerVersion(latest, currentVersion);
    const [lMaj] = parseSemver(latest);
    const [cMaj] = parseSemver(currentVersion);

    return {
      current: currentVersion,
      latest,
      isNewer: newer,
      isMajor: lMaj > cMaj,
    };
  } catch {
    return safeResult;
  }
}

/** Options for the `performUpdate` orchestration function. */
export interface PerformUpdateOptions {
  /** Current CLI version (from package.json) */
  currentVersion: string;
  /** Driftless config (optional — may not exist yet) */
  config?: Pick<DriftlessConfig, "packageManager">;
  /** Override registry URL for testing */
  registryUrl?: string;
}

/**
 * Orchestrate the full auto-update flow:
 * 1. Skip in CI environments
 * 2. Check the registry for a newer version
 * 3. If running via npx, write a notification to stderr (don't install)
 * 4. If a major version jump, warn on stderr
 * 5. Detect the package manager and run the global install command
 * 6. On failure, write a hint to stderr
 *
 * Never throws. All error paths are caught and skipped silently or with a hint.
 */
export async function performUpdate(
  options: PerformUpdateOptions,
): Promise<UpdateCheckResult | null> {
  // Skip in CI environments
  if (process.env.CI) return null;

  const check = await checkForUpdate(options.currentVersion, {
    registryUrl: options.registryUrl,
  });

  if (!check.isNewer) return check;

  // npx context: notify, don't install
  if (isNpxContext()) {
    process.stderr.write(
      `\nA newer version of @driftless-ai/cli is available: ${check.latest} (current: ${check.current})\n` +
        `Run: npm install -g @driftless-ai/cli@latest\n\n`,
    );
    return check;
  }

  // Major version warning
  if (check.isMajor) {
    process.stderr.write(
      `⚠ Updating from v${check.current} to v${check.latest} — this is a major version change.\n`,
    );
  }

  // Detect PM and install
  const pm = detectPackageManager(options.config);
  const cmd = getGlobalInstallCommand(pm, "@driftless-ai/cli@latest");

  try {
    execSync(cmd, { stdio: "pipe" });
  } catch {
    process.stderr.write(`Auto-update failed — run \`${cmd}\` manually.\n`);
  }

  return check;
}
