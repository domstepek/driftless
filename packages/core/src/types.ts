/**
 * Supported documentation framework targets.
 * Determines output format and structure during generation.
 */
export type DocFramework = "plain-md" | "fumadocs" | "docusaurus";

/**
 * Top-level configuration for a driftless project.
 * Typically read from a config file at the project root.
 */
export interface DriftlessConfig {
  /** Glob patterns for test files to analyze */
  testPaths: string[];
  /** Directory where generated documentation is written */
  outputDir: string;
  /** Target documentation framework */
  docFramework: DocFramework;
  /** Feature capabilities enabled for this project */
  capabilities: string[];
  /** Directory containing skill definition files */
  skillsDir: string;
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
