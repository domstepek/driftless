import { mkdtemp, readFile, rm, stat, writeFile as fsWriteFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { DriftlessConfig, GenerateResult, InitOptions } from "@driftless-ai/core";

// Mock @clack/prompts
const mockSpinner = {
  start: vi.fn(),
  stop: vi.fn(),
  message: vi.fn(),
};
vi.mock("@clack/prompts", () => ({
  group: vi.fn(),
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  spinner: vi.fn(() => mockSpinner),
  log: {
    info: vi.fn(),
    message: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
}));

// Mock @driftless-ai/core — spread actual to keep FileTransaction, DebugLogger, configPath real
vi.mock("@driftless-ai/core", async () => {
  const actual = await vi.importActual<typeof import("@driftless-ai/core")>("@driftless-ai/core");
  return {
    ...actual,
    detectTestFramework: vi.fn(),
    configExists: vi.fn().mockResolvedValue(false),
    getWorkflowFilenames: actual.getWorkflowFilenames,
    generateDocs: vi.fn().mockResolvedValue({
      filesGenerated: 2,
      filesErrored: 0,
      totalCostUsd: 0.05,
      errors: [],
      results: [],
      filesWritten: [],
    }),
    installSkills: vi.fn().mockResolvedValue({
      installed: ["doc-generator", "e2e-writer"],
      skillsDir: ".skills",
    }),
    installWorkflows: vi.fn().mockResolvedValue({
      installed: ["driftless-doc-update.yml"],
      workflowsDir: ".github/workflows",
    }),
  };
});

import * as p from "@clack/prompts";
import { detectTestFramework, configExists, generateDocs, installSkills, installWorkflows } from "@driftless-ai/core";
import { gatherConfig } from "../src/prompts/init-prompts.js";
import { initCommand } from "../src/commands/init.js";

const mockGroup = vi.mocked(p.group);
const mockDetect = vi.mocked(detectTestFramework);
const mockConfigExists = vi.mocked(configExists);
const mockConfirm = vi.mocked(p.confirm);
const mockIsCancel = vi.mocked(p.isCancel);
const mockGenerateDocs = vi.mocked(generateDocs);
const mockInstallSkills = vi.mocked(installSkills);
const mockInstallWorkflows = vi.mocked(installWorkflows);

const defaultGroupResult = {
  testPaths: "tests/**/*.spec.ts",
  outputDir: "docs/training",
  docFramework: "plain-md" as const,
  capabilities: ["doc-generator", "e2e-writer"] as const,
  skillsDir: ".skills",
};

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

describe("gatherConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroup.mockResolvedValue(defaultGroupResult);
  });

  it("produces correct DriftlessConfig from prompt responses", async () => {
    const config = await gatherConfig({ detectedFramework: "playwright" });

    expect(config).toEqual<DriftlessConfig>({
      testPaths: ["tests/**/*.spec.ts"],
      outputDir: "docs/training",
      docFramework: "plain-md",
      capabilities: ["doc-generator", "e2e-writer"],
      skillsDir: ".skills",
      testFramework: "playwright",
      agentHarness: "claude-code",
    });
  });

  it("returns undefined testFramework when none detected", async () => {
    const config = await gatherConfig({});
    expect(config.testFramework).toBeUndefined();
  });

  it("calls group() with onCancel handler", async () => {
    await gatherConfig({});
    expect(mockGroup).toHaveBeenCalledOnce();
    const [, groupOptions] = mockGroup.mock.calls[0]!;
    expect(groupOptions).toHaveProperty("onCancel");
  });
});

describe("initCommand", () => {
  let tmpDir: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    tmpDir = await mkdtemp(resolve(tmpdir(), "driftless-init-"));
    mockDetect.mockResolvedValue("playwright");
    mockGroup.mockResolvedValue(defaultGroupResult);
    mockConfigExists.mockResolvedValue(false);
    mockIsCancel.mockReturnValue(false);
    mockGenerateDocs.mockResolvedValue({
      filesGenerated: 2,
      filesErrored: 0,
      totalCostUsd: 0.05,
      errors: [],
      results: [],
      filesWritten: [],
    });
    mockInstallSkills.mockResolvedValue({
      installed: ["doc-generator", "e2e-writer"],
      skillsDir: ".skills",
    });
    mockInstallWorkflows.mockResolvedValue({
      installed: ["driftless-doc-update.yml"],
      workflowsDir: ".github/workflows",
    });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  function makeOptions(overrides: Partial<InitOptions> = {}): InitOptions {
    return {
      dryRun: false,
      verbose: false,
      cwd: tmpDir,
      ...overrides,
    };
  }

  it("calls detect → gather in order and writes config", async () => {
    const callOrder: string[] = [];
    mockDetect.mockImplementation(async () => {
      callOrder.push("detect");
      return "playwright";
    });
    mockGroup.mockImplementation(async () => {
      callOrder.push("gather");
      return defaultGroupResult;
    });

    await initCommand(makeOptions());

    expect(callOrder).toEqual(["detect", "gather"]);
    expect(p.intro).toHaveBeenCalledWith("driftless init");
    expect(p.outro).toHaveBeenCalled();

    // Config file written via transaction
    const cfgPath = join(tmpDir, ".driftless.json");
    expect(await pathExists(cfgPath)).toBe(true);
    const written = JSON.parse(await readFile(cfgPath, "utf-8"));
    expect(written.testPaths).toEqual(["tests/**/*.spec.ts"]);
  });

  it("logs detection result when framework found", async () => {
    mockDetect.mockResolvedValue("cypress");
    await initCommand(makeOptions());
    expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining("cypress"));
  });

  it("logs info when no framework detected", async () => {
    mockDetect.mockResolvedValue(undefined);
    await initCommand(makeOptions());
    expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining("No test framework detected"));
  });

  it("prompts for overwrite when config exists", async () => {
    mockConfigExists.mockResolvedValue(true);
    mockConfirm.mockResolvedValue(true);

    await initCommand(makeOptions());

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Overwrite"),
      }),
    );
    // Config should have been written
    const cfgPath = join(tmpDir, ".driftless.json");
    expect(await pathExists(cfgPath)).toBe(true);
  });

  it("exits when user declines overwrite", async () => {
    mockConfigExists.mockResolvedValue(true);
    mockConfirm.mockResolvedValue(false);

    const exitError = new Error("process.exit");
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw exitError;
    });

    await expect(initCommand(makeOptions())).rejects.toThrow("process.exit");

    expect(exitSpy).toHaveBeenCalledWith(0);
    exitSpy.mockRestore();
  });

  it("exits when user cancels overwrite prompt", async () => {
    mockConfigExists.mockResolvedValue(true);
    mockIsCancel.mockReturnValue(true);
    mockConfirm.mockResolvedValue(Symbol("cancel"));

    const exitError = new Error("process.exit");
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw exitError;
    });

    await expect(initCommand(makeOptions())).rejects.toThrow("process.exit");

    expect(exitSpy).toHaveBeenCalledWith(0);
    exitSpy.mockRestore();
  });

  it("shows summary note after writing", async () => {
    await initCommand(makeOptions());
    expect(p.note).toHaveBeenCalledWith(expect.stringContaining("Test paths"), ".driftless.json");
  });

  // --- Dry-run tests ---

  describe("dry-run", () => {
    it("does not write any files in dry-run mode", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(await pathExists(join(tmpDir, ".driftless.json"))).toBe(false);
      expect(await pathExists(join(tmpDir, ".driftless"))).toBe(false);
      expect(mockGenerateDocs).not.toHaveBeenCalled();
      expect(mockInstallSkills).not.toHaveBeenCalled();
    });

    it("shows config file in preview", async () => {
      await initCommand(makeOptions({ dryRun: true }));
      expect(p.log.info).toHaveBeenCalledWith("Config file: .driftless.json");
    });

    it("lists matched test files in preview", async () => {
      // Create test files matching the glob
      const testsDir = join(tmpDir, "tests");
      await mkdir(testsDir, { recursive: true });
      await fsWriteFile(join(testsDir, "login.spec.ts"), "test", "utf-8");
      await fsWriteFile(join(testsDir, "signup.spec.ts"), "test", "utf-8");

      await initCommand(makeOptions({ dryRun: true }));

      expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining("Test files found (2)"));
      expect(p.log.message).toHaveBeenCalledWith(expect.stringContaining("login.spec.ts"));
      expect(p.log.message).toHaveBeenCalledWith(expect.stringContaining("signup.spec.ts"));
    });

    it("shows planned output doc filenames", async () => {
      const testsDir = join(tmpDir, "tests");
      await mkdir(testsDir, { recursive: true });
      await fsWriteFile(join(testsDir, "login.spec.ts"), "test", "utf-8");

      await initCommand(makeOptions({ dryRun: true }));

      expect(p.log.info).toHaveBeenCalledWith(
        expect.stringContaining("Docs that would be generated"),
      );
      expect(p.log.message).toHaveBeenCalledWith(expect.stringContaining("login.md"));
    });

    it("shows skill install paths in preview", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(p.log.info).toHaveBeenCalledWith(
        expect.stringContaining("Skills that would be installed"),
      );
      expect(p.log.message).toHaveBeenCalledWith(expect.stringContaining("doc-generator/SKILL.md"));
      expect(p.log.message).toHaveBeenCalledWith(expect.stringContaining("e2e-writer/SKILL.md"));
    });

    it("shows graceful message when no test files match", async () => {
      // No test files exist in tmpDir
      await initCommand(makeOptions({ dryRun: true }));

      expect(p.log.info).toHaveBeenCalledWith("0 test files found matching configured patterns.");
    });

    it("shows dry run note with config summary", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(p.note).toHaveBeenCalledWith(expect.stringContaining("Test paths"), "Dry run preview");
      expect(p.outro).toHaveBeenCalledWith("No files were written.");
    });
  });

  // --- Debug log tests ---

  describe("debug log", () => {
    it("writes debug log on successful run", async () => {
      await initCommand(makeOptions());

      const debugLogPath = join(tmpDir, ".driftless", "debug.log");
      expect(await pathExists(debugLogPath)).toBe(true);

      const entries = JSON.parse(await readFile(debugLogPath, "utf-8"));
      const phases = entries.map((e: { phase: string }) => e.phase);
      expect(phases).toContain("detect");
      expect(phases).toContain("config");
      expect(phases).toContain("complete");
    });

    it("writes debug log with generate entries when docs are generated", async () => {
      mockGenerateDocs.mockResolvedValue({
        filesGenerated: 1,
        filesErrored: 0,
        totalCostUsd: 0.03,
        errors: [],
        results: [
          {
            file: "tests/login.spec.ts",
            result: {
              content: "doc",
              stderr: "",
              durationMs: 500,
              costUsd: 0.03,
              exitCode: 0,
              success: true,
            },
          },
        ],
        filesWritten: [join(tmpDir, "docs/training/login.md")],
      });

      await initCommand(makeOptions());

      const debugLogPath = join(tmpDir, ".driftless", "debug.log");
      const entries = JSON.parse(await readFile(debugLogPath, "utf-8"));
      const phases = entries.map((e: { phase: string }) => e.phase);
      expect(phases).toContain("generate");
    });

    it("writes debug log with skills entry", async () => {
      await initCommand(makeOptions());

      const debugLogPath = join(tmpDir, ".driftless", "debug.log");
      const entries = JSON.parse(await readFile(debugLogPath, "utf-8"));
      const phases = entries.map((e: { phase: string }) => e.phase);
      expect(phases).toContain("skills");
    });

    it("writes debug log on failure with error entry", async () => {
      mockGenerateDocs.mockRejectedValue(new Error("agent spawn failed"));

      await expect(initCommand(makeOptions())).rejects.toThrow("agent spawn failed");

      const debugLogPath = join(tmpDir, ".driftless", "debug.log");
      expect(await pathExists(debugLogPath)).toBe(true);

      const entries = JSON.parse(await readFile(debugLogPath, "utf-8"));
      const phases = entries.map((e: { phase: string }) => e.phase);
      expect(phases).toContain("error");

      const errorEntry = entries.find((e: { phase: string }) => e.phase === "error");
      expect(errorEntry.data.message).toBe("agent spawn failed");
    });
  });

  // --- Rollback tests ---

  describe("rollback on failure", () => {
    it("removes created files on error but preserves debug log", async () => {
      mockGenerateDocs.mockRejectedValue(new Error("generation blew up"));

      await expect(initCommand(makeOptions())).rejects.toThrow("generation blew up");

      // Config should be rolled back
      const cfgPath = join(tmpDir, ".driftless.json");
      expect(await pathExists(cfgPath)).toBe(false);

      // Debug log should be preserved
      const debugLogPath = join(tmpDir, ".driftless", "debug.log");
      expect(await pathExists(debugLogPath)).toBe(true);
    });

    it("does not delete pre-existing config on rollback", async () => {
      // Create config before init runs
      const cfgPath = join(tmpDir, ".driftless.json");
      await fsWriteFile(cfgPath, '{"existing": true}', "utf-8");

      // configExists returns true, user confirms overwrite
      mockConfigExists.mockResolvedValue(true);
      mockConfirm.mockResolvedValue(true);
      mockGenerateDocs.mockRejectedValue(new Error("generation blew up"));

      await expect(initCommand(makeOptions())).rejects.toThrow("generation blew up");

      // Pre-existing config should survive rollback (overwritten content stays,
      // but file isn't deleted because it pre-existed)
      expect(await pathExists(cfgPath)).toBe(true);
    });
  });

  // --- Doc generation tests ---

  describe("doc generation", () => {
    const successResult: GenerateResult = {
      filesGenerated: 3,
      filesErrored: 0,
      totalCostUsd: 0.12,
      errors: [],
      results: [],
      filesWritten: [],
    };

    const partialResult: GenerateResult = {
      filesGenerated: 1,
      filesErrored: 2,
      totalCostUsd: 0.04,
      errors: [
        { file: "tests/a.spec.ts", error: "timed out" },
        { file: "tests/b.spec.ts", error: "non-zero exit" },
      ],
      results: [],
      filesWritten: [],
    };

    const allFailedResult: GenerateResult = {
      filesGenerated: 0,
      filesErrored: 3,
      totalCostUsd: 0,
      errors: [
        { file: "tests/a.spec.ts", error: "timed out" },
        { file: "tests/b.spec.ts", error: "non-zero exit" },
        { file: "tests/c.spec.ts", error: "spawn error" },
      ],
      results: [],
      filesWritten: [],
    };

    it("calls generateDocs with correct config when doc-generator in capabilities", async () => {
      mockGenerateDocs.mockResolvedValue(successResult);
      await initCommand(makeOptions());

      expect(mockGenerateDocs).toHaveBeenCalledOnce();
      expect(mockGenerateDocs).toHaveBeenCalledWith(
        expect.objectContaining({
          capabilities: expect.arrayContaining(["doc-generator"]),
        }),
        expect.objectContaining({
          cwd: tmpDir,
          onProgress: expect.any(Function),
        }),
      );
      expect(mockSpinner.start).toHaveBeenCalledWith("Generating docs…");
      expect(mockSpinner.stop).toHaveBeenCalledWith("Generated 3 docs.");
    });

    it("does not call generateDocs when doc-generator not in capabilities", async () => {
      mockGroup.mockResolvedValue({
        ...defaultGroupResult,
        capabilities: ["e2e-writer"] as const,
      });

      await initCommand(makeOptions());

      expect(mockGenerateDocs).not.toHaveBeenCalled();
      expect(mockSpinner.start).not.toHaveBeenCalled();
    });

    it("does not call generateDocs in dry-run mode", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(mockGenerateDocs).not.toHaveBeenCalled();
    });

    it("shows error spinner and warnings when generation has failures", async () => {
      mockGenerateDocs.mockResolvedValue(allFailedResult);
      await initCommand(makeOptions());

      expect(mockSpinner.stop).toHaveBeenCalledWith(
        "Doc generation failed — all files errored.",
        1,
      );
      expect(p.log.warn).toHaveBeenCalledTimes(3);
      expect(p.log.warn).toHaveBeenCalledWith(expect.stringContaining("tests/a.spec.ts"));
    });

    it("shows partial success spinner when some files fail", async () => {
      mockGenerateDocs.mockResolvedValue(partialResult);
      await initCommand(makeOptions());

      expect(mockSpinner.stop).toHaveBeenCalledWith(expect.stringContaining("1 ok, 2 failed"), 1);
      expect(p.log.warn).toHaveBeenCalledTimes(2);
    });

    it("includes generation stats in summary note", async () => {
      mockGenerateDocs.mockResolvedValue(successResult);
      await initCommand(makeOptions());

      expect(p.note).toHaveBeenCalledWith(
        expect.stringContaining("Docs generated: 3"),
        ".driftless.json",
      );
      expect(p.note).toHaveBeenCalledWith(expect.stringContaining("$0.1200"), ".driftless.json");
    });
  });

  // --- Skill installation tests ---

  describe("skill installation", () => {
    it("calls installSkills when capabilities present", async () => {
      await initCommand(makeOptions());

      expect(mockInstallSkills).toHaveBeenCalledOnce();
      expect(mockInstallSkills).toHaveBeenCalledWith(
        expect.objectContaining({ capabilities: expect.arrayContaining(["doc-generator"]) }),
        expect.objectContaining({ cwd: tmpDir }),
      );
    });

    it("skips skill installation in dry-run mode", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(mockInstallSkills).not.toHaveBeenCalled();
    });

    it("skips skill installation when capabilities array is empty", async () => {
      mockGroup.mockResolvedValue({
        ...defaultGroupResult,
        capabilities: [] as const,
      });

      await initCommand(makeOptions());

      expect(mockInstallSkills).not.toHaveBeenCalled();
    });

    it("includes installed skills in summary note", async () => {
      mockInstallSkills.mockResolvedValue({
        installed: ["doc-generator"],
        skillsDir: ".skills",
      });

      await initCommand(makeOptions());

      expect(p.note).toHaveBeenCalledWith(
        expect.stringContaining("Skills installed: doc-generator"),
        ".driftless.json",
      );
    });
  });

  // --- Workflow scaffolding tests ---

  describe("workflow scaffolding", () => {
    it("calls installWorkflows when capabilities present", async () => {
      await initCommand(makeOptions());

      expect(mockInstallWorkflows).toHaveBeenCalledOnce();
      expect(mockInstallWorkflows).toHaveBeenCalledWith(
        expect.objectContaining({ capabilities: expect.arrayContaining(["doc-generator"]) }),
        expect.objectContaining({ cwd: tmpDir }),
      );
    });

    it("skips workflow installation in dry-run mode", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(mockInstallWorkflows).not.toHaveBeenCalled();
    });

    it("skips workflow installation when capabilities array is empty", async () => {
      mockGroup.mockResolvedValue({
        ...defaultGroupResult,
        capabilities: [] as const,
      });

      await initCommand(makeOptions());

      expect(mockInstallWorkflows).not.toHaveBeenCalled();
    });

    it("includes workflow info in summary note", async () => {
      await initCommand(makeOptions());

      expect(p.note).toHaveBeenCalledWith(
        expect.stringContaining("Workflows scaffolded: driftless-doc-update.yml"),
        ".driftless.json",
      );
    });

    it("does not include workflows in summary when none installed", async () => {
      mockInstallWorkflows.mockResolvedValue({
        installed: [],
        workflowsDir: ".github/workflows",
      });

      await initCommand(makeOptions());

      expect(p.note).toHaveBeenCalledWith(
        expect.not.stringContaining("Workflows scaffolded"),
        ".driftless.json",
      );
    });

    it("writes debug log with workflows phase entry", async () => {
      await initCommand(makeOptions());

      const debugLogPath = join(tmpDir, ".driftless", "debug.log");
      const entries = JSON.parse(await readFile(debugLogPath, "utf-8"));
      const phases = entries.map((e: { phase: string }) => e.phase);
      expect(phases).toContain("workflows");

      const workflowEntry = entries.find((e: { phase: string }) => e.phase === "workflows");
      expect(workflowEntry.data.installed).toEqual(["driftless-doc-update.yml"]);
      expect(workflowEntry.data.workflowsDir).toBe(".github/workflows");
    });

    it("shows workflow paths in dry-run preview", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(p.log.info).toHaveBeenCalledWith(
        expect.stringContaining("Workflows that would be scaffolded"),
      );
      expect(p.log.message).toHaveBeenCalledWith(
        expect.stringContaining("driftless-doc-update.yml"),
      );
    });

    it("does not show workflow paths in dry-run when no capabilities have workflows", async () => {
      mockGroup.mockResolvedValue({
        ...defaultGroupResult,
        capabilities: [] as unknown as readonly ["doc-generator", "e2e-writer"],
      });

      await initCommand(makeOptions({ dryRun: true }));

      // Should NOT have the workflows preview
      const infoCalls = vi.mocked(p.log.info).mock.calls.map((c) => c[0]);
      expect(infoCalls.every((msg) => !msg.includes("Workflows that would be scaffolded"))).toBe(
        true,
      );
    });

    it("shows test-gen workflow in dry-run when e2e-writer is the only capability", async () => {
      mockGroup.mockResolvedValue({
        ...defaultGroupResult,
        capabilities: ["e2e-writer"] as const,
      });

      await initCommand(makeOptions({ dryRun: true }));

      expect(p.log.info).toHaveBeenCalledWith(
        expect.stringContaining("Workflows that would be scaffolded"),
      );
      expect(p.log.message).toHaveBeenCalledWith(
        expect.stringContaining("driftless-test-gen.yml"),
      );
    });

    it("shows both workflows in dry-run when both capabilities are selected", async () => {
      mockGroup.mockResolvedValue({
        ...defaultGroupResult,
        capabilities: ["doc-generator", "e2e-writer"] as const,
      });

      await initCommand(makeOptions({ dryRun: true }));

      expect(p.log.info).toHaveBeenCalledWith(
        expect.stringContaining("Workflows that would be scaffolded"),
      );
      const messageCalls = vi.mocked(p.log.message).mock.calls.map((c) => c[0]);
      expect(messageCalls.some((msg) => msg.includes("driftless-doc-update.yml"))).toBe(true);
      expect(messageCalls.some((msg) => msg.includes("driftless-test-gen.yml"))).toBe(true);
    });

    it("registers workflow files with transaction for rollback", async () => {
      // Make installWorkflows write a real file so we can verify it exists
      mockInstallWorkflows.mockImplementation(async (_config, opts) => {
        const cwd = opts?.cwd ?? process.cwd();
        const workflowsDir = join(cwd, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });
        await fsWriteFile(
          join(workflowsDir, "driftless-doc-update.yml"),
          "name: test",
          "utf-8",
        );
        return {
          installed: ["driftless-doc-update.yml"],
          workflowsDir: ".github/workflows",
        };
      });

      await initCommand(makeOptions());

      const workflowPath = join(tmpDir, ".github", "workflows", "driftless-doc-update.yml");
      expect(await pathExists(workflowPath)).toBe(true);
      expect(await pathExists(join(tmpDir, ".github", "workflows"))).toBe(true);
    });
  });
});
