import { describe, expect, it, vi, beforeEach } from "vitest";
import type { DriftlessConfig, InitOptions } from "@driftless/core";

// Mock @clack/prompts
vi.mock("@clack/prompts", () => ({
  group: vi.fn(),
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
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
  };
});

import * as p from "@clack/prompts";
import { detectTestFramework, writeConfig, configExists } from "@driftless/core";
import { gatherConfig } from "../src/prompts/init-prompts.js";
import { initCommand } from "../src/commands/init.js";

const mockGroup = vi.mocked(p.group);
const mockDetect = vi.mocked(detectTestFramework);
const mockWriteConfig = vi.mocked(writeConfig);
const mockConfigExists = vi.mocked(configExists);
const mockConfirm = vi.mocked(p.confirm);
const mockIsCancel = vi.mocked(p.isCancel);

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
});
