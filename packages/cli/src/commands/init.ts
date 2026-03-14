import { join, resolve } from "node:path";
import * as p from "@clack/prompts";
import {
  configExists,
  configPath,
  DebugLogger,
  detectTestFramework,
  FileTransaction,
  generateDocs,
  installSkills,
  outputFilename,
  resolveGlobs,
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
 *
 * Wraps all filesystem mutations in a FileTransaction for rollback on failure.
 * Writes a structured debug log to `.driftless/debug.log` on every run.
 * Supports `--dry-run` to preview planned changes without writing.
 */
export async function initCommand(options: InitOptions): Promise<void> {
  p.intro("driftless init");

  const cwd = resolve(options.cwd);
  const logger = new DebugLogger();
  const debugLogPath = join(cwd, ".driftless", "debug.log");

  // Detect test framework
  const detectedFramework = await detectTestFramework(cwd);
  logger.log("detect", { framework: detectedFramework ?? null });

  if (detectedFramework) {
    p.log.info(`Detected test framework: ${detectedFramework}`);
  } else {
    p.log.info("No test framework detected — you can configure paths manually.");
  }

  // Gather config via interactive prompts
  const config = await gatherConfig({ detectedFramework });
  logger.log("config", config);

  // Check for existing config
  if (await configExists(cwd)) {
    const overwrite = await p.confirm({
      message: ".driftless.json already exists. Overwrite?",
    });

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Init cancelled — existing config preserved.");
      process.exit(0);
    }
  }

  // --- Dry-run branch: preview planned changes without writing ---
  if (options.dryRun) {
    logger.log("dry-run", { mode: "preview" });

    // Resolve test file globs
    let matchedFiles: string[] = [];
    try {
      matchedFiles = await resolveGlobs(config.testPaths, cwd);
    } catch {
      // Directory may not exist yet for walkDir — that's fine for dry-run
    }

    // Compute output filenames
    const outputDir = config.outputDir;
    const plannedDocs = matchedFiles.map((f) => {
      const rel = f.slice(cwd.length + 1);
      return join(outputDir, outputFilename(rel, config.docFramework));
    });

    // Compute skill install paths
    const skillPaths = config.capabilities.map((cap) => join(config.skillsDir, cap, "SKILL.md"));

    // Render preview
    p.log.info("Config file: .driftless.json");

    if (matchedFiles.length > 0) {
      p.log.info(`Test files found (${matchedFiles.length}):`);
      for (const f of matchedFiles) {
        p.log.message(`  ${f.slice(cwd.length + 1)}`);
      }
    } else {
      p.log.info("0 test files found matching configured patterns.");
    }

    if (plannedDocs.length > 0) {
      p.log.info(`Docs that would be generated (${plannedDocs.length}):`);
      for (const d of plannedDocs) {
        p.log.message(`  ${d}`);
      }
    }

    if (skillPaths.length > 0) {
      p.log.info(`Skills that would be installed (${skillPaths.length}):`);
      for (const s of skillPaths) {
        p.log.message(`  ${s}`);
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
    const summaryLines = lines.filter(Boolean).join("\n");
    p.note(summaryLines, "Dry run preview");
    p.outro("No files were written.");
    return;
  }

  // --- Real execution: transaction-wrapped writes ---
  const transaction = new FileTransaction();

  try {
    // Create .driftless directory
    await transaction.mkdir(join(cwd, ".driftless"));

    // Write config file via transaction (replaces atomic writeConfig)
    const cfgPath = configPath(cwd);
    await transaction.writeFile(cfgPath, JSON.stringify(config, null, 2) + "\n");

    // Run doc generation when capability is enabled
    let genResult: GenerateResult | undefined;
    if (config.capabilities.includes("doc-generator")) {
      const s = p.spinner();
      s.start("Generating docs…");

      const onProgress = (event: ProgressEvent): void => {
        const label = event.file.split("/").pop() ?? event.file;
        s.message(`Generating docs… ${label} (${event.index}/${event.total})`);
      };

      try {
        genResult = await generateDocs(config, {
          cwd,
          onProgress,
        });

        // Register generated files with the transaction
        const outputDir = resolve(cwd, config.outputDir);
        await transaction.mkdir(outputDir);
        for (const filePath of genResult.filesWritten) {
          transaction.track(filePath, "file");
        }

        // Log each file result
        for (const r of genResult.results) {
          logger.log("generate", {
            file: r.file,
            stderr: r.result.stderr,
            durationMs: r.result.durationMs,
            costUsd: r.result.costUsd,
            exitCode: r.result.exitCode,
            success: r.result.success,
          });
        }

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
        throw err;
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
      skillsResult = await installSkills(config, { cwd });

      // Register skill files and directories with the transaction
      const baseSkillDir = join(cwd, config.skillsDir);
      await transaction.mkdir(baseSkillDir);
      for (const capability of skillsResult.installed) {
        const skillDir = join(baseSkillDir, capability);
        await transaction.mkdir(skillDir);
        transaction.track(join(skillDir, "SKILL.md"), "file");
      }

      logger.log("skills", {
        installed: skillsResult.installed,
        skillsDir: skillsResult.skillsDir,
      });

      if (skillsResult.installed.length > 0) {
        p.log.info(
          `Installed ${skillsResult.installed.length} skill${skillsResult.installed.length === 1 ? "" : "s"}: ${skillsResult.installed.join(", ")}`,
        );
      }
    }

    // Flush debug log before commit
    logger.log("complete", { success: true });
    await logger.flush(debugLogPath);

    // Commit — clears tracking so rollback is a no-op
    transaction.commit();

    // Summary
    const lines = [
      `Test paths:     ${config.testPaths.join(", ")}`,
      `Output dir:     ${config.outputDir}`,
      `Doc framework:  ${config.docFramework}`,
      `Capabilities:   ${config.capabilities.join(", ")}`,
      `Skills dir:     ${config.skillsDir}`,
      config.testFramework ? `Test framework: ${config.testFramework}` : "",
    ];

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

    if (skillsResult && skillsResult.installed.length > 0) {
      lines.push("");
      lines.push(`Skills installed: ${skillsResult.installed.join(", ")}`);
    }

    const summaryLines = lines.filter(Boolean).join("\n");
    p.note(summaryLines, ".driftless.json");
    p.outro("Config written. Run `driftless generate` to create docs.");
  } catch (err) {
    // Log error and flush debug log before rollback
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    logger.log("error", { message, stack });
    await logger.flush(debugLogPath);

    // Rollback all tracked files except the debug log
    const rolledBack = await transaction.rollback([debugLogPath]);
    logger.log("rollback", { cleaned: rolledBack });

    throw err;
  }
}
