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
 * How test files are grouped when generating documentation.
 * "per-file" produces one doc per test file.
 */
export type DocGrouping = "per-file";

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
  /** How test files map to generated docs (default: "per-file") */
  docGrouping?: DocGrouping;
}

/**
 * Result of a single agent invocation (one test file → one doc).
 */
export interface AgentResult {
  /** Whether the agent completed successfully */
  success: boolean;
  /** Generated document content (empty string on failure) */
  content: string;
  /** API cost in USD for this invocation (0 on failure) */
  costUsd: number;
  /** Error message if the invocation failed */
  error?: string;
  /** Wall-clock duration in milliseconds */
  durationMs: number;
  /** Raw stderr output from the agent process */
  stderr: string;
  /** Process exit code (null if killed by signal or spawn error) */
  exitCode: number | null;
}

/**
 * Per-file error entry in a generation run.
 */
export interface GenerateFileError {
  /** Path to the test file that failed */
  file: string;
  /** Error description */
  error: string;
}

/**
 * Aggregated result of a full documentation generation run.
 */
export interface GenerateResult {
  /** Number of doc files successfully written */
  filesGenerated: number;
  /** Number of test files that failed generation */
  filesErrored: number;
  /** Total API cost in USD across all invocations */
  totalCostUsd: number;
  /** Per-file error details */
  errors: GenerateFileError[];
  /** Per-file agent results (in processing order) */
  results: Array<{ file: string; result: AgentResult }>;
  /** Absolute paths of doc files successfully written during this run */
  filesWritten: string[];
}

/**
 * Progress event emitted during doc generation.
 */
export interface ProgressEvent {
  /** Event type */
  type: "start" | "complete" | "error";
  /** Test file being processed */
  file: string;
  /** 1-based index of the current file */
  index: number;
  /** Total number of files to process */
  total: number;
  /** Error message (present only for "error" events) */
  error?: string;
}

/**
 * Callback invoked with progress events during generation.
 */
export type ProgressCallback = (event: ProgressEvent) => void;

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
