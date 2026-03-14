import * as p from "@clack/prompts";
import { configExists, detectTestFramework, writeConfig } from "@driftless/core";
import type { InitOptions } from "@driftless/core";
import { gatherConfig } from "../prompts/init-prompts.js";

/**
 * The `driftless init` command.
 * Detects test framework → runs interactive prompts → writes .driftless.json.
 */
export async function initCommand(options: InitOptions): Promise<void> {
  p.intro("driftless init");

  // Detect test framework
  const detectedFramework = await detectTestFramework(options.cwd);
  if (detectedFramework) {
    p.log.info(`Detected test framework: ${detectedFramework}`);
  } else {
    p.log.info("No test framework detected — you can configure paths manually.");
  }

  // Gather config via interactive prompts
  const config = await gatherConfig({ detectedFramework });

  // Check for existing config
  if (await configExists(options.cwd)) {
    const overwrite = await p.confirm({
      message: ".driftless.json already exists. Overwrite?",
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Init cancelled — existing config preserved.");
      process.exit(0);
    }
  }

  // Write config (or dry-run)
  if (options.dryRun) {
    p.log.info("Dry run — config that would be written:");
    p.log.message(JSON.stringify(config, null, 2));
  } else {
    await writeConfig(options.cwd, config);
  }

  // Summary
  const lines = [
    `Test paths:     ${config.testPaths.join(", ")}`,
    `Output dir:     ${config.outputDir}`,
    `Doc framework:  ${config.docFramework}`,
    `Capabilities:   ${config.capabilities.join(", ")}`,
    `Skills dir:     ${config.skillsDir}`,
    config.testFramework ? `Test framework: ${config.testFramework}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  p.note(lines, options.dryRun ? "Dry run preview" : ".driftless.json");
  p.outro(
    options.dryRun
      ? "No files were written."
      : "Config written. Run `driftless generate` to create docs.",
  );
}
