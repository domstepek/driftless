import * as p from "@clack/prompts";
import {
  configExists,
  detectTestFramework,
  generateDocs,
  installSkills,
  writeConfig,
} from "@driftless/core";
import type {
  GenerateResult,
  InitOptions,
  InstallSkillsResult,
  ProgressEvent,
} from "@driftless/core";
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

  // Run doc generation when capability is enabled
  let genResult: GenerateResult | undefined;
  if (config.capabilities.includes("doc-generator")) {
    if (options.dryRun) {
      p.log.info("Dry run — doc generation would run but was skipped.");
    } else {
      const s = p.spinner();
      s.start("Generating docs…");

      const onProgress = (event: ProgressEvent): void => {
        const label = event.file.split("/").pop() ?? event.file;
        s.message(`Generating docs… ${label} (${event.index}/${event.total})`);
      };

      try {
        genResult = await generateDocs(config, {
          cwd: options.cwd,
          onProgress,
        });

        if (genResult.filesErrored > 0 && genResult.filesGenerated === 0) {
          s.stop("Doc generation failed — all files errored.", 1);
        } else if (genResult.filesErrored > 0) {
          s.stop(
            `Docs generated with errors (${genResult.filesGenerated} ok, ${genResult.filesErrored} failed).`,
            1,
          );
        } else {
          s.stop(
            `Generated ${genResult.filesGenerated} doc${genResult.filesGenerated === 1 ? "" : "s"}.`,
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        s.stop(`Doc generation failed: ${msg}`, 1);
      }
    }
  }

  // Report per-file generation errors as warnings
  if (genResult?.errors.length) {
    for (const e of genResult.errors) {
      p.log.warn(`Generation failed for ${e.file}: ${e.error}`);
    }
  }

  // Install skill files for selected capabilities
  let skillsResult: InstallSkillsResult | undefined;
  if (config.capabilities.length > 0) {
    if (options.dryRun) {
      p.log.info("Dry run — skills would be installed but were skipped.");
    } else {
      skillsResult = await installSkills(config, { cwd: options.cwd });
      if (skillsResult.installed.length > 0) {
        p.log.info(
          `Installed ${skillsResult.installed.length} skill${skillsResult.installed.length === 1 ? "" : "s"}: ${skillsResult.installed.join(", ")}`,
        );
      }
    }
  }

  // Summary
  const lines = [
    `Test paths:     ${config.testPaths.join(", ")}`,
    `Output dir:     ${config.outputDir}`,
    `Doc framework:  ${config.docFramework}`,
    `Capabilities:   ${config.capabilities.join(", ")}`,
    `Skills dir:     ${config.skillsDir}`,
    config.testFramework ? `Test framework: ${config.testFramework}` : "",
  ];

  // Append generation stats when generation was run
  if (genResult) {
    lines.push("");
    lines.push(`Docs generated: ${genResult.filesGenerated}`);
    if (genResult.filesErrored > 0) {
      lines.push(`Docs errored:   ${genResult.filesErrored}`);
    }
    if (genResult.totalCostUsd > 0) {
      lines.push(`Total cost:     $${genResult.totalCostUsd.toFixed(4)}`);
    }
  }

  // Append skills install info
  if (skillsResult && skillsResult.installed.length > 0) {
    lines.push("");
    lines.push(`Skills installed: ${skillsResult.installed.join(", ")}`);
  }

  const summaryLines = lines.filter(Boolean).join("\n");

  p.note(summaryLines, options.dryRun ? "Dry run preview" : ".driftless.json");
  p.outro(
    options.dryRun
      ? "No files were written."
      : "Config written. Run `driftless generate` to create docs.",
  );
}
