import { readFile, rename, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DriftlessConfig } from "./types.js";

const CONFIG_FILENAME = ".driftless.json";
const TEMP_FILENAME = ".driftless.tmp.json";

/**
 * Resolve the path to `.driftless.json` in the given directory.
 */
export function configPath(cwd: string): string {
  return join(cwd, CONFIG_FILENAME);
}

/**
 * Check whether `.driftless.json` exists in the given directory.
 */
export async function configExists(cwd: string): Promise<boolean> {
  try {
    await stat(configPath(cwd));
    return true;
  } catch {
    return false;
  }
}

/**
 * Write a DriftlessConfig to `.driftless.json` using atomic write
 * (write to temp file, then rename). JSON is formatted with 2-space indent.
 */
export async function writeConfig(cwd: string, config: DriftlessConfig): Promise<void> {
  const tmpPath = join(cwd, TEMP_FILENAME);
  const finalPath = configPath(cwd);
  const json = JSON.stringify(config, null, 2) + "\n";
  await writeFile(tmpPath, json, "utf-8");
  await rename(tmpPath, finalPath);
}

/**
 * Read and parse `.driftless.json` from the given directory.
 * Throws with a descriptive message if the file is missing or contains invalid JSON.
 */
export async function readConfig(cwd: string): Promise<DriftlessConfig> {
  const filePath = configPath(cwd);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    throw new Error(`Config file not found: ${filePath}`, { cause: err });
  }
  try {
    return JSON.parse(raw) as DriftlessConfig;
  } catch (err) {
    throw new Error(`Invalid JSON in config file: ${filePath}`, { cause: err });
  }
}
