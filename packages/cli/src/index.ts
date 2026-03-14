#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

/**
 * Run the auto-update check if config exists and autoUpdate is enabled.
 * Silently swallows all errors — must never block the user's command.
 */
async function tryAutoUpdate(): Promise<void> {
  try {
    const { configExists, readConfig, performUpdate } = await import("@driftless-ai/core");
    if (!(await configExists(process.cwd()))) return;
    const config = await readConfig(process.cwd());
    if (config.autoUpdate !== true) return;
    await performUpdate({
      currentVersion: pkg.version,
      config: { packageManager: config.packageManager },
    });
  } catch {
    // Intentionally swallowed — auto-update must never prevent CLI operation
  }
}

function printUsage(): void {
  console.log(`driftless — generate training docs from your test suite

Usage: driftless <command> [options]

Commands:
  init          Initialize a new .driftless.json config

Options:
  --dry-run     Show what would be created without writing files
  --version     Print version
  --help        Show this help message`);
}

/**
 * CLI entry point. Parses process.argv and routes to commands.
 */
export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  const args = new Set(argv);

  if (args.has("--version") || args.has("-V")) {
    console.log(`driftless v${pkg.version}`);
    return;
  }

  if (args.has("--help") || args.has("-h")) {
    printUsage();
    return;
  }

  // Auto-update check: after fast-path exits, before command routing
  await tryAutoUpdate();

  const command = argv.find((a) => !a.startsWith("-"));

  if (command === "init") {
    const dryRun = args.has("--dry-run");
    const { initCommand } = await import("./commands/init.js");
    await initCommand({
      dryRun,
      verbose: false,
      cwd: process.cwd(),
    });
    return;
  }

  if (!command) {
    printUsage();
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exitCode = 1;
}

main();
