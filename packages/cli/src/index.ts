#!/usr/bin/env node
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

/**
 * CLI entry point. Prints version to stdout.
 */
export function main(): void {
  console.log(`driftless v${pkg.version}`);
}

main();
