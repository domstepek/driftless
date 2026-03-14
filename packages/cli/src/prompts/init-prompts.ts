import * as p from "@clack/prompts";
import type { Capability, DriftlessConfig, DocFramework, TestFramework } from "@driftless/core";

/**
 * Default test glob per detected framework.
 */
const DEFAULT_GLOBS: Record<string, string> = {
  playwright: "tests/**/*.spec.ts",
  cypress: "cypress/e2e/**/*.cy.{ts,js}",
  testcafe: "tests/**/*.test.{ts,js}",
  detox: "e2e/**/*.test.{ts,js}",
  webdriverio: "test/**/*.test.{ts,js}",
  nightwatch: "tests/**/*.{ts,js}",
};

const FALLBACK_GLOB = "tests/**/*.test.{ts,js}";

interface GatherConfigOptions {
  detectedFramework?: TestFramework;
}

/**
 * Runs the interactive prompt flow to assemble a DriftlessConfig.
 * Uses @clack/prompts group() for structured multi-step input.
 */
export async function gatherConfig(options: GatherConfigOptions = {}): Promise<DriftlessConfig> {
  const defaultGlob =
    (options.detectedFramework && DEFAULT_GLOBS[options.detectedFramework]) || FALLBACK_GLOB;

  const result = await p.group(
    {
      testPaths: () =>
        p.text({
          message: "Test file glob pattern",
          placeholder: defaultGlob,
          defaultValue: defaultGlob,
          validate: (v) => (v.trim().length === 0 ? "Test path is required" : undefined),
        }),

      outputDir: () =>
        p.text({
          message: "Output directory for generated docs",
          placeholder: "docs/training",
          defaultValue: "docs/training",
        }),

      docFramework: () =>
        p.select<Array<{ value: DocFramework; label: string }>, DocFramework>({
          message: "Documentation framework",
          options: [
            { value: "plain-md", label: "Plain Markdown" },
            { value: "fumadocs", label: "Fumadocs" },
            { value: "docusaurus", label: "Docusaurus" },
          ],
        }),

      capabilities: () =>
        p.multiselect<Array<{ value: Capability; label: string }>, Capability>({
          message: "Capabilities to enable",
          options: [
            { value: "doc-generator", label: "Doc Generator" },
            { value: "e2e-writer", label: "E2E Writer" },
          ],
          initialValues: ["doc-generator", "e2e-writer"],
          required: true,
        }),

      skillsDir: () =>
        p.text({
          message: "Skills directory",
          placeholder: ".skills",
          defaultValue: ".skills",
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    },
  );

  return {
    testPaths: [result.testPaths],
    outputDir: result.outputDir,
    docFramework: result.docFramework,
    capabilities: result.capabilities,
    skillsDir: result.skillsDir,
    testFramework: options.detectedFramework,
    agentHarness: "claude-code",
  };
}
