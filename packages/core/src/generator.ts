import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { minimatch } from "minimatch";
import { spawnAgent } from "./agent.js";
import { getAdapterPrompt } from "./adapters.js";
import type { DriftlessConfig, GenerateResult, ProgressCallback } from "./types.js";

/**
 * Options for the generateDocs orchestrator.
 */
export interface GenerateDocsOptions {
  /** Working directory for resolving relative paths (defaults to process.cwd()) */
  cwd?: string;
  /** Timeout per agent invocation in milliseconds (default: 120_000) */
  timeoutMs?: number;
  /** Progress callback for per-file events */
  onProgress?: ProgressCallback;
}

/**
 * Recursively collect all file paths under a directory.
 */
async function walkDir(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await walkDir(full)));
    } else if (entry.isFile()) {
      paths.push(full);
    }
  }
  return paths;
}

/**
 * Resolve glob patterns to actual file paths relative to cwd.
 * Supports `**` and `*` via minimatch.
 */
async function resolveGlobs(patterns: string[], cwd: string): Promise<string[]> {
  const allFiles = await walkDir(cwd);
  const matched = new Set<string>();

  for (const pattern of patterns) {
    for (const file of allFiles) {
      // Match against the path relative to cwd
      const rel = file.slice(cwd.length + 1);
      if (minimatch(rel, pattern)) {
        matched.add(file);
      }
    }
  }

  // Sort for deterministic processing order
  return [...matched].sort();
}

/**
 * Determine the output filename for a test file based on framework.
 * Strips the test file extension and applies the doc extension.
 */
function outputFilename(testFilePath: string, framework: DriftlessConfig["docFramework"]): string {
  const stem = basename(testFilePath, extname(testFilePath));
  // Strip common test suffixes for cleaner doc names
  const cleanStem = stem.replace(/\.(spec|test|e2e|cy)$/, "").replace(/-(spec|test|e2e)$/, "");
  const ext = framework === "plain-md" ? ".md" : ".mdx";
  return `${cleanStem}${ext}`;
}

/**
 * Generate documentation for all test files matching the config's glob patterns.
 *
 * For each matched file: reads content, spawns an agent with the framework adapter
 * prompt, and writes the generated doc to the output directory.
 *
 * Reports progress via optional callback and accumulates results into a
 * GenerateResult with per-file error details.
 */
export async function generateDocs(
  config: DriftlessConfig,
  options: GenerateDocsOptions = {},
): Promise<GenerateResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const timeoutMs = options.timeoutMs;
  const onProgress = options.onProgress;

  const result: GenerateResult = {
    filesGenerated: 0,
    filesErrored: 0,
    totalCostUsd: 0,
    errors: [],
    results: [],
  };

  // Resolve test file globs
  const files = await resolveGlobs(config.testPaths, cwd);
  if (files.length === 0) {
    return result;
  }

  // Ensure output directory exists
  const outputDir = resolve(cwd, config.outputDir);
  await mkdir(outputDir, { recursive: true });

  // Get framework-specific system prompt
  const systemPrompt = getAdapterPrompt(config.docFramework);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relFile = file.slice(cwd.length + 1);

    onProgress?.({
      type: "start",
      file: relFile,
      index: i + 1,
      total: files.length,
    });

    try {
      const fileContent = await readFile(file, "utf-8");
      const userPrompt = `Generate a user-facing training document from this end-to-end test file. The test file content is provided via stdin.`;

      const agentResult = await spawnAgent({
        fileContent,
        systemPrompt,
        userPrompt,
        ...(timeoutMs !== undefined ? { timeoutMs } : {}),
      });

      result.results.push({ file: relFile, result: agentResult });
      result.totalCostUsd += agentResult.costUsd;

      if (!agentResult.success) {
        result.filesErrored++;
        result.errors.push({
          file: relFile,
          error: agentResult.error ?? "unknown error",
        });
        onProgress?.({
          type: "error",
          file: relFile,
          index: i + 1,
          total: files.length,
          error: agentResult.error,
        });
        continue;
      }

      // Write the generated doc
      const outName = outputFilename(file, config.docFramework);
      const outPath = join(outputDir, outName);
      await writeFile(outPath, agentResult.content, "utf-8");

      result.filesGenerated++;
      onProgress?.({
        type: "complete",
        file: relFile,
        index: i + 1,
        total: files.length,
      });
    } catch (err) {
      result.filesErrored++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      result.errors.push({ file: relFile, error: errorMsg });
      onProgress?.({
        type: "error",
        file: relFile,
        index: i + 1,
        total: files.length,
        error: errorMsg,
      });
    }
  }

  return result;
}
