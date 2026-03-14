import { describe, expect, it, vi, beforeEach } from "vitest";
import type { DriftlessConfig, InitOptions } from "@driftless/core";

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

// Mock @driftless/core
vi.mock("@driftless/core", async () => {
  const actual = await vi.importActual<typeof import("@driftless/core")>("@driftless/core");
  return {
    ...actual,
    detectTestFramework: vi.fn(),
    writeConfig: vi.fn().mockResolvedValue(undefined),
    configExists: vi.fn().mockResolvedValue(false),
    generateDocs: vi.fn().mockResolvedValue({
      filesGenerated: 2,
      filesErrored: 0,
      totalCostUsd: 0.05,
      errors: [],
      results: [],
    }),
    installSkills: vi.fn().mockResolvedValue({
      installed: ["doc-generator", "e2e-writer"],
      skillsDir: ".skills",
    }),
  };
});

import * as p from "@clack/prompts";
import {
  detectTestFramework,
  writeConfig,
  configExists,
  generateDocs,
  installSkills,
} from "@driftless/core";
import type { GenerateResult } from "@driftless/core";
import { gatherConfig } from "../src/prompts/init-prompts.js";
import { initCommand } from "../src/commands/init.js";

const mockGroup = vi.mocked(p.group);
const mockDetect = vi.mocked(detectTestFramework);
const mockWriteConfig = vi.mocked(writeConfig);
const mockConfigExists = vi.mocked(configExists);
const mockConfirm = vi.mocked(p.confirm);
const mockIsCancel = vi.mocked(p.isCancel);
const mockGenerateDocs = vi.mocked(generateDocs);
const mockInstallSkills = vi.mocked(installSkills);

const defaultGroupResult = {
  testPaths: "tests/**/*.spec.ts",
  outputDir: "docs/training",
  docFramework: "plain-md" as const,
  capabilities: ["doc-generator", "e2e-writer"] as const,
  skillsDir: ".skills",
};

function makeOptions(overrides: Partial<InitOptions> = {}): InitOptions {
  return {
    dryRun: false,
    verbose: false,
    cwd: "/tmp/test-project",
    ...overrides,
  };
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockDetect.mockResolvedValue("playwright");
    mockGroup.mockResolvedValue(defaultGroupResult);
    mockConfigExists.mockResolvedValue(false);
    mockWriteConfig.mockResolvedValue(undefined);
    mockGenerateDocs.mockResolvedValue({
      filesGenerated: 2,
      filesErrored: 0,
      totalCostUsd: 0.05,
      errors: [],
      results: [],
    });
    mockInstallSkills.mockResolvedValue({
      installed: ["doc-generator", "e2e-writer"],
      skillsDir: ".skills",
    });
  });

  it("calls detect → gather → write in order", async () => {
    const callOrder: string[] = [];
    mockDetect.mockImplementation(async () => {
      callOrder.push("detect");
      return "playwright";
    });
    mockGroup.mockImplementation(async () => {
      callOrder.push("gather");
      return defaultGroupResult;
    });
    mockWriteConfig.mockImplementation(async () => {
      callOrder.push("write");
    });

    await initCommand(makeOptions());

    expect(callOrder).toEqual(["detect", "gather", "write"]);
    expect(p.intro).toHaveBeenCalledWith("driftless init");
    expect(p.outro).toHaveBeenCalled();
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
    expect(mockWriteConfig).toHaveBeenCalled();
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
    expect(mockWriteConfig).not.toHaveBeenCalled();
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
    expect(mockWriteConfig).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it("skips write in dry-run mode", async () => {
    await initCommand(makeOptions({ dryRun: true }));

    expect(mockWriteConfig).not.toHaveBeenCalled();
    expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining("Dry run"));
    expect(p.log.message).toHaveBeenCalled();
  });

  it("shows summary note after writing", async () => {
    await initCommand(makeOptions());
    expect(p.note).toHaveBeenCalledWith(expect.stringContaining("Test paths"), ".driftless.json");
  });

  describe("doc generation", () => {
    const successResult: GenerateResult = {
      filesGenerated: 3,
      filesErrored: 0,
      totalCostUsd: 0.12,
      errors: [],
      results: [],
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
          cwd: "/tmp/test-project",
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
      expect(p.log.info).toHaveBeenCalledWith(
        expect.stringContaining("doc generation would run but was skipped"),
      );
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

  describe("skill installation", () => {
    it("calls installSkills after config write when capabilities present", async () => {
      const callOrder: string[] = [];
      mockWriteConfig.mockImplementation(async () => {
        callOrder.push("write");
      });
      mockInstallSkills.mockImplementation(async () => {
        callOrder.push("skills");
        return { installed: ["doc-generator", "e2e-writer"], skillsDir: ".skills" };
      });

      await initCommand(makeOptions());

      expect(mockInstallSkills).toHaveBeenCalledOnce();
      expect(mockInstallSkills).toHaveBeenCalledWith(
        expect.objectContaining({ capabilities: expect.arrayContaining(["doc-generator"]) }),
        expect.objectContaining({ cwd: "/tmp/test-project" }),
      );
      // Skills install happens after config write
      expect(callOrder.indexOf("write")).toBeLessThan(callOrder.indexOf("skills"));
    });

    it("skips skill installation in dry-run mode", async () => {
      await initCommand(makeOptions({ dryRun: true }));

      expect(mockInstallSkills).not.toHaveBeenCalled();
      expect(p.log.info).toHaveBeenCalledWith(
        expect.stringContaining("skills would be installed but were skipped"),
      );
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
});
