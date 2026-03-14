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

export { generateDocs, type GenerateDocsOptions } from "./generator.js";

export {
  docGeneratorTemplate,
  e2eWriterTemplate,
  installSkills,
  type InstallSkillsOptions,
  type InstallSkillsResult,
} from "./skills.js";
