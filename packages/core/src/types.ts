/**
 * Supported documentation framework targets.
 * Determines output format and structure during generation.
 */
export type DocFramework = "plain-md" | "fumadocs" | "docusaurus";

/**
 * Feature capabilities that can be enabled for a project.
 */
export type Capability = "doc-generator" | "e2e-writer";

/**
 * Supported end-to-end test frameworks for detection and config.
 */
export type TestFramework =
  | "playwright"
  | "cypress"
  | "testcafe"
  | "detox"
  | "webdriverio"
  | "nightwatch"
  | "other";

/**
 * Top-level configuration for a driftless project.
 * Typically read from a config file at the project root.
 */
export interface DriftlessConfig {
  /** Optional JSON schema URL for editor support */
  $schema?: string;
  /** Glob patterns for test files to analyze */
  testPaths: string[];
  /** Directory where generated documentation is written */
  outputDir: string;
  /** Target documentation framework */
  docFramework: DocFramework;
  /** Feature capabilities enabled for this project */
  capabilities: Capability[];
  /** Directory containing skill definition files */
  skillsDir: string;
  /** Detected or user-specified test framework */
  testFramework?: TestFramework;
  /** Agent harness used to run driftless (v1: claude-code only) */
  agentHarness: "claude-code";
}

/**
 * Options passed to the `init` command.
 */
export interface InitOptions {
  /** If true, show what would be created without writing files */
  dryRun: boolean;
  /** Enable verbose logging output */
  verbose: boolean;
  /** Working directory to initialize in (defaults to process.cwd()) */
  cwd: string;
}
