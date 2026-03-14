export type {
  AgentResult,
  Capability,
  DocFramework,
  DocGrouping,
  DriftlessConfig,
  GenerateFileError,
  GenerateResult,
  InitOptions,
  ProgressCallback,
  ProgressEvent,
  TestFramework,
} from "./types.js";

export { configExists, configPath, readConfig, writeConfig } from "./config.js";

export { detectTestFramework, FRAMEWORK_CONFIG_MAP } from "./detect.js";

export { spawnAgent, type SpawnAgentOptions } from "./agent.js";

export { docusaurusPrompt, fumadocsPrompt, getAdapterPrompt, plainMdPrompt } from "./adapters.js";

export {
  generateDocs,
  type GenerateDocsOptions,
  outputFilename,
  resolveGlobs,
} from "./generator.js";

export {
  docGeneratorTemplate,
  e2eWriterTemplate,
  installSkills,
  type InstallSkillsOptions,
  type InstallSkillsResult,
} from "./skills.js";

export { docUpdateWorkflowTemplate, getWorkflowFilenames, testGenWorkflowTemplate, WORKFLOW_TEMPLATES } from "./workflows.js";

export {
  installWorkflows,
  type InstallWorkflowsOptions,
  type InstallWorkflowsResult,
} from "./workflows.js";

export { FileTransaction } from "./transaction.js";

export { DebugLogger, type DebugEntry } from "./logger.js";
