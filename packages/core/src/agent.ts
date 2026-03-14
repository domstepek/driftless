import { spawn, type ChildProcess } from "node:child_process";
import type { AgentResult } from "./types.js";

/**
 * Options for spawning a Claude Code agent.
 */
export interface SpawnAgentOptions {
  /** Test file content to pipe via stdin */
  fileContent: string;
  /** System prompt with format/structure instructions */
  systemPrompt: string;
  /** User prompt describing what to generate */
  userPrompt: string;
  /** Timeout in milliseconds (default: 120_000) */
  timeoutMs?: number;
}

/**
 * Spawn Claude Code in headless mode to generate a doc from a test file.
 *
 * Pipes `fileContent` to stdin and passes `systemPrompt` via --append-system-prompt.
 * Returns a structured AgentResult with content, cost, timing, and error info.
 *
 * The process is killed with SIGTERM after `timeoutMs`, escalating to SIGKILL
 * after a 5-second grace period.
 */
export async function spawnAgent(options: SpawnAgentOptions): Promise<AgentResult> {
  const { fileContent, systemPrompt, userPrompt, timeoutMs = 120_000 } = options;
  const startTime = Date.now();

  return new Promise<AgentResult>((resolve) => {
    let proc: ChildProcess;
    let stdoutBuf = "";
    let stderrBuf = "";
    let settled = false;
    let timedOut = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let killId: ReturnType<typeof setTimeout> | undefined;

    const settle = (result: AgentResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      clearTimeout(killId);
      resolve(result);
    };

    try {
      proc = spawn(
        "claude",
        [
          "-p",
          userPrompt,
          "--output-format",
          "json",
          "--no-session-persistence",
          "--tools",
          "",
          "--append-system-prompt",
          systemPrompt,
        ],
        {
          stdio: ["pipe", "pipe", "pipe"],
          env: { ...process.env },
        },
      );
    } catch (err) {
      settle({
        success: false,
        content: "",
        costUsd: 0,
        error: `spawn error: ${err instanceof Error ? err.message : String(err)}`,
        durationMs: Date.now() - startTime,
        stderr: "",
        exitCode: null,
      });
      return;
    }

    proc.stdout?.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString();
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderrBuf += chunk.toString();
    });

    proc.on("error", (err: Error) => {
      settle({
        success: false,
        content: "",
        costUsd: 0,
        error: `spawn error: ${err.message}`,
        durationMs: Date.now() - startTime,
        stderr: stderrBuf,
        exitCode: null,
      });
    });

    proc.on("close", (code: number | null) => {
      const durationMs = Date.now() - startTime;

      // If we timed out, report that regardless of exit code
      if (timedOut) {
        settle({
          success: false,
          content: "",
          costUsd: 0,
          error: `timed out after ${timeoutMs}ms`,
          durationMs,
          stderr: stderrBuf,
          exitCode: code,
        });
        return;
      }

      if (code !== 0) {
        settle({
          success: false,
          content: "",
          costUsd: 0,
          error: `non-zero exit: code ${code}`,
          durationMs,
          stderr: stderrBuf,
          exitCode: code,
        });
        return;
      }

      // Parse the JSON response from Claude Code
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(stdoutBuf);
      } catch {
        const snippet = stdoutBuf.slice(0, 200);
        settle({
          success: false,
          content: "",
          costUsd: 0,
          error: `invalid JSON in stdout: ${snippet}`,
          durationMs,
          stderr: stderrBuf,
          exitCode: code,
        });
        return;
      }

      const content = typeof parsed.result === "string" ? parsed.result : "";
      const costUsd = typeof parsed.total_cost_usd === "number" ? parsed.total_cost_usd : 0;

      settle({
        success: true,
        content,
        costUsd,
        durationMs,
        stderr: stderrBuf,
        exitCode: code,
      });
    });

    // Pipe test file content to stdin
    proc.stdin?.write(fileContent);
    proc.stdin?.end();

    // Timeout: SIGTERM first, SIGKILL after 5s grace
    timeoutId = setTimeout(() => {
      if (settled) return;
      timedOut = true;
      proc.kill("SIGTERM");
      killId = setTimeout(() => {
        if (settled) return;
        try {
          proc.kill("SIGKILL");
        } catch {
          /* already dead */
        }
      }, 5_000);
    }, timeoutMs);
  });
}
